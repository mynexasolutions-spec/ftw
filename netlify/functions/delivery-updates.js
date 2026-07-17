import { createClient } from '@supabase/supabase-js'

export const handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight options request
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

  // Verify the request actually came from Shiprocket using the secret configured
  // in the Shiprocket webhook panel (sent back on every call as 'x-api-key').
  const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Webhook verification failed: SHIPROCKET_WEBHOOK_SECRET not configured.')
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Webhook secret is not configured.' }),
    }
  }

  const incomingSecret = event.headers['x-api-key']
  if (!incomingSecret || incomingSecret !== webhookSecret) {
    console.warn('Webhook verification: missing or invalid x-api-key header.')
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid webhook credentials.' }),
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

  // Shiprocket webhook payload has shipment/order IDs and tracking details
  const { 
    order_id: srOrderId, 
    shipment_id: srShipmentId, 
    awb: awbCode,
    current_status: currentStatus,
    courier_name: courierName
  } = body

  if (!srOrderId && !srShipmentId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Order ID or Shipment ID is required.' }),
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Database credentials missing on server.' }),
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Find the corresponding order in Supabase
    // We match on shiprocket_order_id or shiprocket_shipment_id
    let query = supabase.from('orders').select('*')
    
    if (srOrderId) {
      query = query.eq('shiprocket_order_id', String(srOrderId))
    } else {
      query = query.eq('shiprocket_shipment_id', String(srShipmentId))
    }

    const { data: order, error: fetchErr } = await query.maybeSingle()

    if (fetchErr) throw new Error(`Supabase fetch failed: ${fetchErr.message}`)
    
    if (!order) {
      console.warn(`Webhook received for Order ID ${srOrderId} / Shipment ID ${srShipmentId} but no matching store order was found.`)
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ received: true, message: 'Order not found. No action taken.' })
      }
    }

    // 2. Map Shiprocket tracking status to our storefront order status
    let newStorefrontStatus = order.status
    const statusNormalized = (currentStatus || '').toLowerCase().trim()

    if (statusNormalized.includes('delivered')) {
      newStorefrontStatus = 'Delivered'
    } else if (
      statusNormalized.includes('shipped') || 
      statusNormalized.includes('transit') || 
      statusNormalized.includes('dispatched') ||
      statusNormalized.includes('out for delivery') ||
      statusNormalized.includes('reached')
    ) {
      newStorefrontStatus = 'Shipped'
    } else if (statusNormalized.includes('cancelled')) {
      newStorefrontStatus = 'Cancelled'
    }

    // 3. Update status in database
    const updates = {
      shiprocket_status: currentStatus || 'Updated via Webhook',
      status: newStorefrontStatus
    }

    // Capture AWB code and Courier name if provided in webhook scan details
    if (awbCode) {
      updates.shiprocket_awb_code = awbCode
    }
    if (courierName) {
      updates.shiprocket_courier = courierName
    }

    const { error: dbUpdateErr } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)

    if (dbUpdateErr) throw new Error(`Supabase update failed: ${dbUpdateErr.message}`)

    console.log(`Successfully updated order ${order.id} status to ${newStorefrontStatus} (Shiprocket status: ${currentStatus})`)

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: `Order ${order.id} status updated to ${newStorefrontStatus}.` 
      })
    }

  } catch (err) {
    console.error('Webhook processing error:', err.message)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Webhook processing failed.' }),
    }
  }
}
