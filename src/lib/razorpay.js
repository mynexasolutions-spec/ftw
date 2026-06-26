/**
 * loadRazorpayScript
 * Dynamically loads the Razorpay checkout.js from CDN.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * createRazorpayOrder
 * Calls the Netlify serverless function to create an order via Razorpay API.
 * The secret key never leaves the server.
 *
 * @param {number} amountPaise - Total in paise (₹1 = 100 paise)
 * @param {string} receipt - Optional receipt ID
 * @param {object} notes - Optional notes object
 * @returns {Promise<{ orderId, amount, currency }>}
 */
export async function createRazorpayOrder(amountPaise, receipt = '', notes = {}) {
  const res = await fetch('/api/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create order.')
  }

  return res.json() // { orderId, amount, currency }
}

/**
 * openRazorpayCheckout
 * 1. Loads checkout.js
 * 2. Creates a server-side order (via Netlify function)
 * 3. Opens the Razorpay checkout modal with the returned orderId
 *
 * @param {object} opts
 */
export async function openRazorpayCheckout({
  keyId,
  amount,           // in paise
  currency = 'INR',
  name,
  description,
  image,
  prefill = {},
  notes = {},
  theme = {},
  onSuccess,
  onDismiss,
}) {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    alert('Razorpay SDK failed to load. Please check your internet connection.')
    return
  }

  // Step 1: Create order server-side
  let order
  try {
    order = await createRazorpayOrder(amount, `ftw_${Date.now()}`, notes)
  } catch (err) {
    alert(`Payment Error: ${err.message}`)
    return
  }

  // Step 2: Open modal with the real order_id
  const options = {
    key: keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,       // Required for proper verification
    name,
    description,
    image,
    prefill,
    notes,
    theme,
    handler: function (response) {
      // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) onSuccess(response)
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss()
      },
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}
