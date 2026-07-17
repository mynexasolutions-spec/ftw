import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration is missing on server.')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function getVerifiedUser(event) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing on server.')
  }

  const authHeader = event.headers['authorization'] || event.headers['Authorization']
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

export function generateOrderId() {
  return `FTW-${Math.floor(100000 + Math.random() * 900000)}`
}

const CUSTOM_ZONE_KEYS = ['front', 'back', 'left_sleeve', 'right_sleeve']

export async function getCustomizerPricing(supabase) {
  const { data, error } = await supabase
    .from('customizer_mockups')
    .select('pricing_settings')
    .eq('name', '__pricing__')
    .maybeSingle()
  if (error) throw new Error(`Failed to load customizer pricing: ${error.message}`)

  const p = data?.pricing_settings || {}
  return {
    blankPrice: p.customizer_blank_price !== undefined ? Number(p.customizer_blank_price) : 380,
    zonePrices: {
      front: p.customizer_print_cost_front !== undefined ? Number(p.customizer_print_cost_front) : 99,
      back: p.customizer_print_cost_back !== undefined ? Number(p.customizer_print_cost_back) : 99,
      left_sleeve: p.customizer_print_cost_left_sleeve !== undefined ? Number(p.customizer_print_cost_left_sleeve) : 99,
      right_sleeve: p.customizer_print_cost_right_sleeve !== undefined ? Number(p.customizer_print_cost_right_sleeve) : 99,
    }
  }
}

export function computeCustomItemPrice(canvasElements, customizerPricing) {
  const elements = canvasElements || {}
  let subtotal = customizerPricing.blankPrice
  for (const zone of CUSTOM_ZONE_KEYS) {
    if (Array.isArray(elements[zone]) && elements[zone].length > 0) {
      subtotal += customizerPricing.zonePrices[zone] || 0
    }
  }
  return subtotal
}

export async function getStoreShippingSettings(supabase) {
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'global_settings')
    .maybeSingle()
  if (error) throw new Error(`Failed to load store settings: ${error.message}`)

  const v = data?.value || {}
  return {
    shippingThreshold: v.shipping_threshold !== undefined ? Number(v.shipping_threshold) : 1499,
    shippingFlatRate: v.shipping_flat_rate !== undefined ? Number(v.shipping_flat_rate) : 99,
  }
}

export async function getActiveCoupon(supabase, code) {
  if (!code) return null
  const cleanCode = String(code).trim().toUpperCase()
  if (!cleanCode) return null

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('active', true)
    .maybeSingle()
  if (error) throw new Error(`Failed to load coupon: ${error.message}`)
  return data || null
}

function cleanColorLabel(color) {
  return (color || '').replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
}

// Recomputes each item's true price server-side and returns the priced items
// plus a running subtotal. Throws on any invalid/unavailable item so the
// caller can fail the whole order rather than silently under-charging.
export async function priceCartItems(supabase, items, customizerPricing) {
  const standardIds = [...new Set(
    items.filter(i => !i.designId && !i.customDesign).map(i => i.id)
  )]

  let productsById = {}
  if (standardIds.length > 0) {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, stock, variants, image')
      .in('id', standardIds)
    if (error) throw new Error(`Failed to load products: ${error.message}`)
    productsById = Object.fromEntries((products || []).map(p => [p.id, p]))
  }

  let subtotal = 0
  const pricedItems = []

  for (const item of items) {
    const qty = Math.max(1, Math.floor(Number(item.qty) || 1))
    const isCustom = Boolean(item.designId || item.customDesign)

    if (isCustom) {
      const canvasElements = item.customDesign?.canvas_elements
      if (!canvasElements || typeof canvasElements !== 'object') {
        throw new Error(`Custom item "${item.name || item.id}" is missing design data.`)
      }
      const unitPrice = computeCustomItemPrice(canvasElements, customizerPricing)
      subtotal += unitPrice * qty
      pricedItems.push({ ...item, qty, price: unitPrice })
      continue
    }

    const product = productsById[item.id]
    if (!product) {
      throw new Error(`Product "${item.id}" not found or no longer available.`)
    }

    const cleanedColor = cleanColorLabel(item.color)
    const variants = Array.isArray(product.variants) ? product.variants : []

    const matchingVariant = variants.find(v => cleanColorLabel(v.color) === cleanedColor && v.size === item.size)
    const colorVariantWithPrice = variants.find(v => cleanColorLabel(v.color) === cleanedColor && v.price !== undefined && v.price !== null && v.price !== '')
    const firstVariantWithPrice = variants.find(v => v.price !== undefined && v.price !== null && v.price !== '')

    // Mirrors ProductDetail.jsx's displayPrice fallback chain so server pricing
    // matches what the customer actually saw: exact size+color variant price,
    // then any same-color variant price, then the base product price, then any variant price.
    let unitPrice
    if (matchingVariant && matchingVariant.price !== undefined && matchingVariant.price !== null && matchingVariant.price !== '') {
      unitPrice = Number(matchingVariant.price)
    } else if (colorVariantWithPrice) {
      unitPrice = Number(colorVariantWithPrice.price)
    } else if (product.price !== undefined && product.price !== null && product.price !== 0) {
      unitPrice = Number(product.price)
    } else {
      unitPrice = Number(firstVariantWithPrice?.price || 0)
    }

    let availableStock = product.stock || 0
    if (matchingVariant) {
      availableStock = matchingVariant.stock !== undefined ? matchingVariant.stock : availableStock
    }
    if (availableStock < qty) {
      throw new Error(`Insufficient stock for "${product.name}" (${item.size || ''} ${item.color || ''}).`)
    }

    subtotal += unitPrice * qty
    pricedItems.push({ ...item, qty, price: unitPrice })
  }

  return { pricedItems, subtotal }
}

export async function decrementStockForItems(supabase, items) {
  for (const item of items) {
    if (item.designId || item.customDesign) continue // custom items aren't tied to product stock
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock, variants')
        .eq('id', item.id)
        .maybeSingle()
      if (fetchError || !product) continue

      const updates = {}
      updates.stock = Math.max(0, (product.stock || 0) - item.qty)

      if (Array.isArray(product.variants) && product.variants.length > 0 && item.size && item.color) {
        const cleanedColor = cleanColorLabel(item.color)
        updates.variants = product.variants.map(v => {
          const cleanedVColor = cleanColorLabel(v.color)
          if (cleanedVColor === cleanedColor && v.size === item.size) {
            const vStock = v.stock !== undefined ? v.stock : 0
            return { ...v, stock: Math.max(0, vStock - item.qty) }
          }
          return v
        })
      }

      await supabase.from('products').update(updates).eq('id', item.id)
    } catch (err) {
      console.error(`Failed to decrement stock for ${item.id}:`, err.message)
    }
  }
}
