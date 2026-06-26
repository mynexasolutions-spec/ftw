import Razorpay from 'razorpay'

export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Razorpay API keys are not configured.' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body.' }),
    }
  }

  const { amount, currency = 'INR', receipt, notes } = body

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid amount. Must be a number in paise (min ₹1 = 100 paise).' }),
    }
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret })

    const order = await razorpay.orders.create({
      amount,           // amount in paise
      currency,
      receipt: receipt || `ftw_${Date.now()}`,
      notes: notes || {},
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      }),
    }
  } catch (err) {
    console.error('Razorpay order creation error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.error?.description || 'Failed to create Razorpay order.' }),
    }
  }
}
