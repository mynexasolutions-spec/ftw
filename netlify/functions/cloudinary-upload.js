import { v2 as cloudinary } from 'cloudinary'

export const handler = async (event) => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET

  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  if (!cloud_name || !api_key || !api_secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Cloudinary credentials not configured' })
    }
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret
  })

  try {
    const { image, folder } = JSON.parse(event.body)
    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image data provided' })
      }
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: folder || 'ftw_products',
      resource_type: 'auto'
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ url: uploadResponse.secure_url })
    }
  } catch (err) {
    console.error('Cloudinary serverless upload error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Image upload failed' })
    }
  }
}
