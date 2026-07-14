import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

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

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase keys missing in webhook context.')
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Database environment missing.' }),
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

    // If order is unpaid or pending, update it to Paid
    if (order.status?.toLowerCase() === 'unpaid') {
      const rzpPaymentId = payment.id || 'N/A'
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: `Paid - Webhook Verified (ID: ${rzpPaymentId})` })
        .eq('id', dbOrderId)

      if (updateErr) {
        console.error('Error updating order status in webhook:', updateErr)
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to update order status.' }),
        }
      }

      console.log(`Order ${dbOrderId} successfully marked as PAID via Razorpay webhook.`)
    } else {
      console.log(`Order ${dbOrderId} status is already '${order.status}'. No updates needed.`)
    }
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ received: true }),
  }
}
