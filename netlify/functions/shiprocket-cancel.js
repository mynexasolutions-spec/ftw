import { createClient } from '@supabase/supabase-js'

export const handler = async (event) => {
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

  const { orderId } = body
  if (!orderId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Order ID is required.' }),
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Supabase configuration is missing on server.' }),
    }
  }

  const shiprocketEmail = process.env.SHIPROCKET_EMAIL
  const shiprocketPassword = process.env.SHIPROCKET_PASSWORD

  if (!shiprocketEmail || !shiprocketPassword) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Shiprocket credentials (SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD) are not configured.' }),
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
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

    // Nothing to cancel in Shiprocket if it was never synced
    if (!order.shiprocket_order_id) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: 'Order was not synced to Shiprocket. Nothing to cancel.' }),
      }
    }

    // Authenticate with Shiprocket API
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: shiprocketEmail, password: shiprocketPassword })
    })

    if (!authRes.ok) {
      const authErrText = await authRes.text()
      throw new Error(`Shiprocket auth failed: ${authErrText || authRes.statusText}`)
    }

    const authData = await authRes.json()
    const token = authData.token
    if (!token) {
      throw new Error('Shiprocket authentication returned no token.')
    }

    // Cancel the order in Shiprocket
    const cancelRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ids: [Number(order.shiprocket_order_id)] })
    })

    const cancelData = await cancelRes.json()

    if (!cancelRes.ok || cancelData.status_code === 0 || cancelData.errors) {
      const errMsg = cancelData.errors
        ? JSON.stringify(cancelData.errors)
        : (cancelData.message || 'Shiprocket cancel API error.')
      throw new Error(errMsg)
    }

    const { error: dbUpdateErr } = await supabase
      .from('orders')
      .update({
        shiprocket_status: 'Cancelled',
        shiprocket_sync_error: null
      })
      .eq('id', order.id)

    if (dbUpdateErr) {
      throw new Error(`Shiprocket order cancelled but database update failed: ${dbUpdateErr.message}`)
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: cancelData.message || 'Shiprocket order cancelled.' })
    }

  } catch (err) {
    console.error('Shiprocket cancel exception:', err.message)

    // Save the failure reason so the admin can see it, without blocking the storefront cancellation
    try {
      await supabase
        .from('orders')
        .update({ shiprocket_sync_error: `Cancel failed: ${err.message}` })
        .eq('id', orderId)
    } catch (saveErr) {
      console.error('Failed to log cancel error to Supabase:', saveErr.message)
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Failed to cancel Shiprocket order.' }),
    }
  }
}
