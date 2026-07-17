import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getSupabaseAdmin, decrementStockForItems } from './lib/orderHelpers.js'

export const handler = async (event) => {
  // CORS Preflight headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    }
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_secret || !key_id) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Razorpay keys are not configured.' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body.' }),
    }
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing signature verification parameters.' }),
    }
  }

  try {
    // 1. Verify the HMAC signature
    const text = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ verified: false, error: 'Signature verification failed.' }),
      }
    }

    const supabase = getSupabaseAdmin()

    // 2. Fetch our own order record — this holds the server-computed total from create-order.js
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (fetchErr) throw new Error(`Supabase fetch error: ${fetchErr.message}`)
    if (!order) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ verified: false, error: `Order ${orderId} not found.` }),
      }
    }

    if (order.payment_status?.startsWith('Paid')) {
      // Already finalized (e.g. webhook beat us to it) — nothing more to do.
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ verified: true, message: 'Payment already confirmed.' }),
      }
    }

    // 3. Cross-check the actual captured payment against Razorpay's own records —
    // this is what stops a cheap/mismatched payment from being accepted as this order's payment.
    const razorpay = new Razorpay({ key_id, key_secret })
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    const isCaptured = payment.captured === true || payment.status === 'captured'
    const amountMatches = payment.amount === order.total * 100
    const orderMatches = payment.order_id === razorpay_order_id

    if (!isCaptured || !amountMatches || !orderMatches) {
      console.warn(`Payment verification mismatch for order ${orderId}: captured=${payment.captured}, amount=${payment.amount} vs expected=${order.total * 100}, order_id=${payment.order_id}`)
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ verified: false, error: 'Payment amount/status could not be verified.' }),
      }
    }

    // 4. Finalize: mark paid and release stock now that payment is confirmed.
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ payment_status: `Paid - Razorpay ID: ${razorpay_payment_id}` })
      .eq('id', orderId)

    if (updateErr) throw new Error(`Failed to update order status: ${updateErr.message}`)

    await decrementStockForItems(supabase, order.items || [])

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ verified: true, message: 'Payment verified successfully.' }),
    }
  } catch (err) {
    console.error('Razorpay verification error:', err)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to verify payment signature.' }),
    }
  }
}
