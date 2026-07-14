import crypto from 'crypto'

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

  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_secret) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Razorpay secret key is not configured.' }),
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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing signature verification parameters.' }),
    }
  }

  try {
    const text = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ verified: true, message: 'Payment signature verified successfully.' }),
      }
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ verified: false, error: 'Signature verification failed.' }),
      }
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
