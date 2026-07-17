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
 * openRazorpayCheckout
 * Opens the Razorpay checkout modal using an order already created server-side
 * (via /api/create-order, which computes the trusted amount). This function
 * never talks to our backend itself — it only drives the Razorpay widget.
 *
 * @param {object} opts
 */
export async function openRazorpayCheckout({
  keyId,
  razorpayOrderId, // order id returned by /api/create-order
  amount,          // in paise, returned by /api/create-order
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

  const options = {
    key: keyId,
    amount,
    currency,
    order_id: razorpayOrderId,       // Required for proper verification
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
