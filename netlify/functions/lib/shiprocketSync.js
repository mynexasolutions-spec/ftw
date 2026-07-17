// Fallback address string parser
function parseAddressString(addressStr) {
  const details = {
    address: addressStr || '',
    apartment: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001'
  }

  if (!addressStr) return details

  // Try to find a 6-digit zip code
  const zipMatch = addressStr.match(/(\d{6})/)
  if (zipMatch) {
    details.zip = zipMatch[1]
  }

  // Strip ZIP and trailing separator
  let cleanStr = addressStr.replace(/\s*-\s*\d{6}\s*$/, '').trim()
  cleanStr = cleanStr.replace(/\s*\d{6}\s*$/, '').trim()

  const parts = cleanStr.split(',').map(p => p.trim())
  if (parts.length >= 2) {
    details.state = parts[parts.length - 1]
    details.city = parts[parts.length - 2]
    details.address = parts.slice(0, parts.length - 2).join(', ') || parts[0]
  } else if (parts.length === 1) {
    details.address = parts[0]
  }

  return details
}

// Date formatter for Shiprocket: YYYY-MM-DD HH:MM
function formatShiprocketDate(dateStr) {
  try {
    const d = new Date(dateStr)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (e) {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 12:00`
  }
}

// Creates a Shiprocket adhoc shipment for an order and writes the result back
// to Supabase. Never throws — callers can await this from order-creation/payment
// paths without risking a Shiprocket outage turning into a failed order.
export async function syncOrderToShiprocket(supabase, order) {
  try {
    const shiprocketEmail = process.env.SHIPROCKET_EMAIL
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary'

    if (!shiprocketEmail || !shiprocketPassword) {
      throw new Error('Shiprocket credentials (SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD) are not configured.')
    }

    // 1. Prepare customer and address details (using structured JSON or fallback parser)
    let addr = order.shipping_address_details
    if (!addr || !addr.city || !addr.state || !addr.zip) {
      addr = parseAddressString(order.address)
    }

    // Split customer name into first and last name for Shiprocket
    const nameParts = (order.customer_name || 'Customer').trim().split(/\s+/)
    const firstName = nameParts[0] || 'Customer'
    const lastName = nameParts.slice(1).join(' ') || 'Streetwear'

    // Determine payment method for Shiprocket (Prepaid vs COD)
    const isCOD = order.payment_method?.toUpperCase() === 'COD' ||
                  order.payment_status?.toLowerCase().includes('cod')
    const paymentMethod = isCOD ? 'COD' : 'Prepaid'

    // Format order date for Shiprocket: YYYY-MM-DD HH:MM
    const orderDateFormatted = formatShiprocketDate(order.created_at)

    // Map items list to Shiprocket schema
    const orderItems = (order.items || []).map((item, idx) => {
      // Build a SKU if missing
      const cleanSku = item.sku ||
                       (item.id ? item.id.split('-')[0] : `FTW-ITEM-${idx}`) +
                       (item.size ? `-${item.size}` : '')

      return {
        name: item.name || 'FTW Streetwear Product',
        sku: cleanSku,
        units: parseInt(item.qty || 1, 10),
        selling_price: parseFloat(item.price || 0),
        discount: 0,
        tax: 0,
        hsn: ''
      }
    })

    if (orderItems.length === 0) {
      throw new Error('Order does not contain any items.')
    }

    // 2. Authenticate with Shiprocket API
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

    // 3. Construct adhoc order creation payload
    const shiprocketPayload = {
      order_id: order.id,
      order_date: orderDateFormatted,
      pickup_location: pickupLocation,
      channel_id: '',
      comment: `FTW Order ID: ${order.id} | payment: ${order.payment_method}`,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: addr.address,
      billing_address_2: addr.apartment || '',
      billing_city: addr.city,
      billing_pincode: addr.zip,
      billing_state: addr.state,
      billing_country: 'India',
      billing_email: order.email || 'care@forthewin.in',
      billing_phone: order.phone || '9999999999',
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: paymentMethod,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_differ_charges: 0,
      sub_total: parseFloat(order.total),
      length: Number(order.package_length) || 15,
      breadth: Number(order.package_breadth) || 15,
      height: Number(order.package_height) || 5,
      weight: Number(order.package_weight) || 0.5
    }

    // 4. Send payload to Shiprocket API
    const syncRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shiprocketPayload)
    })

    const syncData = await syncRes.json()

    if (!syncRes.ok || syncData.status_code === 0 || syncData.errors) {
      const errMsg = syncData.errors
        ? JSON.stringify(syncData.errors)
        : (syncData.message || 'Shiprocket API error.')
      throw new Error(errMsg)
    }

    // Extract identifiers from Shiprocket response
    const srOrderId = syncData.order_id
    const srShipmentId = syncData.shipment_id
    const srAwbCode = syncData.awb_code || ''

    if (!srOrderId || !srShipmentId) {
      throw new Error(`Order synced but Shiprocket returned invalid response identifiers. Response: ${JSON.stringify(syncData)}`)
    }

    // 5. Update order status and fields in Supabase
    const { error: dbUpdateErr } = await supabase
      .from('orders')
      .update({
        shiprocket_order_id: String(srOrderId),
        shiprocket_shipment_id: String(srShipmentId),
        shiprocket_awb_code: srAwbCode,
        shiprocket_status: 'Synced',
        shiprocket_sync_error: null,
        status: order.status === 'Pending' ? 'Processing' : order.status
      })
      .eq('id', order.id)

    if (dbUpdateErr) {
      throw new Error(`Shiprocket synced but database update failed: ${dbUpdateErr.message}`)
    }

    return {
      success: true,
      shiprocket_order_id: srOrderId,
      shiprocket_shipment_id: srShipmentId,
      shiprocket_awb_code: srAwbCode
    }
  } catch (err) {
    console.error('Shiprocket sync exception:', err.message)

    // Save sync error to the database for debugging — never let this throw either.
    try {
      await supabase
        .from('orders')
        .update({ shiprocket_sync_error: err.message })
        .eq('id', order.id)
    } catch (saveErr) {
      console.error('Failed to log sync error to Supabase:', saveErr.message)
    }

    return { success: false, error: err.message || 'Failed to sync with Shiprocket.' }
  }
}
