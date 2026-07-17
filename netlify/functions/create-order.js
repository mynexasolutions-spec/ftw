import Razorpay from 'razorpay'
import {
  getSupabaseAdmin,
  getVerifiedUser,
  generateOrderId,
  getCustomizerPricing,
  getStoreShippingSettings,
  getActiveCoupon,
  priceCartItems,
  decrementStockForItems
} from './lib/orderHelpers.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON body.' }) }
  }

  const { customer, items, promoCode, paymentMethod } = body

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing customer info or cart items.' }) }
  }
  if (paymentMethod !== 'cod' && paymentMethod !== 'razorpay') {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid payment method.' }) }
  }
  const required = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zip']
  for (const key of required) {
    if (!customer[key] || String(customer[key]).trim() === '') {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: `Missing customer field: ${key}` }) }
    }
  }

  let user
  try {
    user = await getVerifiedUser(event)
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
  if (!user) {
    return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'You must be logged in to place an order.' }) }
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }

  try {
    const hasCustomItems = items.some(i => i.designId || i.customDesign)
    const customizerPricing = hasCustomItems ? await getCustomizerPricing(supabase) : null

    const { pricedItems, subtotal } = await priceCartItems(supabase, items, customizerPricing)

    const coupon = await getActiveCoupon(supabase, promoCode)
    const discountAmount = coupon
      ? (coupon.type === 'percent' ? subtotal * (Number(coupon.value) / 100) : Number(coupon.value))
      : 0

    const { shippingThreshold, shippingFlatRate } = await getStoreShippingSettings(supabase)
    const shippingFee = subtotal >= shippingThreshold ? 0 : shippingFlatRate

    const finalTotal = Math.max(0, Math.round(subtotal - discountAmount + shippingFee))
    const orderId = generateOrderId()

    const address = `${customer.address}, ${customer.apartment ? customer.apartment + ', ' : ''}${customer.city}, ${customer.state} - ${customer.zip}`

    const orderRow = {
      id: orderId,
      customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
      email: user.email,
      user_id: user.id,
      phone: customer.phone,
      address,
      shipping_address_details: {
        address: customer.address,
        apartment: customer.apartment || '',
        city: customer.city,
        state: customer.state,
        zip: customer.zip
      },
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'COD - Unpaid' : 'Unpaid',
      items: pricedItems,
      total: finalTotal,
      discount: Math.round(discountAmount),
      shipping: shippingFee,
      status: 'Pending',
      created_at: new Date().toISOString()
    }

    const { error: insertErr } = await supabase.from('orders').insert([orderRow])
    if (insertErr) throw new Error(`Failed to create order: ${insertErr.message}`)

    if (paymentMethod === 'cod') {
      await decrementStockForItems(supabase, pricedItems)
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, orderId })
      }
    }

    // Razorpay: create the real payment order for the server-computed amount.
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) {
      await supabase.from('orders').delete().eq('id', orderId)
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Razorpay is not configured on the server.' }) }
    }

    try {
      const razorpay = new Razorpay({ key_id, key_secret })
      const rzpOrder = await razorpay.orders.create({
        amount: finalTotal * 100,
        currency: 'INR',
        receipt: orderId,
        notes: { db_order_id: orderId }
      })

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          orderId,
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency
        })
      }
    } catch (rzpErr) {
      await supabase.from('orders').delete().eq('id', orderId)
      throw new Error(rzpErr.error?.description || rzpErr.message || 'Failed to create Razorpay order.')
    }

  } catch (err) {
    console.error('create-order error:', err.message)
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: err.message || 'Failed to create order.' }) }
  }
}
