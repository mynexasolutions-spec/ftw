import crypto from 'crypto'
import { getSupabaseAdmin, decrementStockForItems } from './lib/orderHelpers.js'

export const handler = async (event) => {
  // CORS headers
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Webhook verification failed: RAZORPAY_WEBHOOK_SECRET not configured.')
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Webhook secret is not configured.' }),
    }
  }

  // Verify Signature
  const signature = event.headers['x-razorpay-signature']
  if (!signature) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing x-razorpay-signature header.' }),
    }
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(event.body)
    .digest('hex')

  if (expectedSignature !== signature) {
    console.warn('Webhook verification: invalid signature signature mismatch.')
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Signature mismatch.' }),
    }
  }

  let payload
  try {
    payload = JSON.parse(event.body)
  } catch (err) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body.' }),
    }
  }

  const eventName = payload.event
  console.log(`Razorpay webhook event received: ${eventName}`)

  // Handle payment.captured or order.paid
  if (eventName === 'payment.captured' || eventName === 'order.paid') {
    const payment = payload.payload?.payment?.entity || {}
    const dbOrderId = payment.notes?.db_order_id

    if (!dbOrderId) {
      console.log('No db_order_id found in payment notes. Skipping.')
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ received: true, message: 'No action taken.' }),
      }
    }

    let supabase
    try {
      supabase = getSupabaseAdmin()
    } catch (err) {
      console.error('Supabase keys missing in webhook context.')
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Database environment missing.' }),
      }
    }

    // Retrieve order
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', dbOrderId)
      .maybeSingle()

    if (fetchErr) {
      console.error('Error fetching order from Supabase:', fetchErr)
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Failed to fetch order.' }),
      }
    }

    if (!order) {
      console.warn(`Order ${dbOrderId} not found in database. Ignoring.`)
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ received: true, message: 'Order not found.' }),
      }
    }

    // Only act if this order hasn't already been finalized (e.g. by razorpay-verify.js)
    if (!order.payment_status?.startsWith('Paid')) {
      const rzpPaymentId = payment.id || 'N/A'

      // Cross-check the captured amount against our own server-computed total
      // before trusting this event to mark the order paid.
      if (payment.amount !== order.total * 100) {
        console.warn(`Webhook amount mismatch for order ${dbOrderId}: got ${payment.amount}, expected ${order.total * 100}. Ignoring.`)
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ received: true, message: 'Amount mismatch, ignored.' }),
        }
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({ payment_status: `Paid - Razorpay ID: ${rzpPaymentId}` })
        .eq('id', dbOrderId)

      if (updateErr) {
        console.error('Error updating order status in webhook:', updateErr)
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to update order status.' }),
        }
      }

      await decrementStockForItems(supabase, order.items || [])

      console.log(`Order ${dbOrderId} successfully marked as PAID via Razorpay webhook.`)
    } else {
      console.log(`Order ${dbOrderId} payment_status is already '${order.payment_status}'. No updates needed.`)
    }
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ received: true }),
  }
}
