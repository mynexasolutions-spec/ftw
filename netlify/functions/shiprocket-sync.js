import { getSupabaseAdmin } from './lib/orderHelpers.js'
import { syncOrderToShiprocket } from './lib/shiprocketSync.js'

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

  const { orderId, weight, length, breadth, height, volumetricWeight } = body
  if (!orderId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Order ID is required.' }),
    }
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }

  try {
    // 1. Fetch order details from Supabase
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
        body: JSON.stringify({ error: `Order ${orderId} not found in database.` }),
      }
    }

    if (order.shiprocket_order_id) {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Order ${orderId} is already synced to Shiprocket (Shiprocket Order ID: ${order.shiprocket_order_id}).` }),
      }
    }

    // 2. Persist admin-supplied package weight/dimensions onto the order, if provided
    const dimensionOverrides = {}
    if (weight !== undefined) dimensionOverrides.package_weight = Number(weight) || order.package_weight
    if (length !== undefined) dimensionOverrides.package_length = Number(length) || order.package_length
    if (breadth !== undefined) dimensionOverrides.package_breadth = Number(breadth) || order.package_breadth
    if (height !== undefined) dimensionOverrides.package_height = Number(height) || order.package_height
    if (volumetricWeight !== undefined) dimensionOverrides.package_volumetric_weight = Number(volumetricWeight) || order.package_volumetric_weight

    if (Object.keys(dimensionOverrides).length > 0) {
      const { error: dimUpdateErr } = await supabase
        .from('orders')
        .update(dimensionOverrides)
        .eq('id', orderId)
      if (dimUpdateErr) throw new Error(`Failed to save package dimensions: ${dimUpdateErr.message}`)
      Object.assign(order, dimensionOverrides)
    }

    // 3. Run the shared sync routine
    const result = await syncOrderToShiprocket(supabase, order)

    if (!result.success) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: result.error || 'Failed to sync with Shiprocket.' }),
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        shiprocket_order_id: result.shiprocket_order_id,
        shiprocket_shipment_id: result.shiprocket_shipment_id,
        shiprocket_awb_code: result.shiprocket_awb_code
      })
    }

  } catch (err) {
    console.error('Shiprocket sync exception:', err.message)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Failed to sync with Shiprocket.' }),
    }
  }
}
