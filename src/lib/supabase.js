import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── PRODUCTS API ────────────────────────────────────────────────────────────
export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase products fetch failed:", err.message)
    throw err
  }
}

function sanitizeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
    category: product.category,
    subcategory: product.subcategory,
    collection: product.collection,
    brand: product.brand,
    weight: product.weight,
    image: product.image,
    images: product.images,
    available: product.available,
    tag: product.tag,
    description: product.description,
    sizes: product.sizes,
    colors: product.colors,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    fabric_info: product.fabric_info,
    washing_instructions: product.washing_instructions,
    size_guide: product.size_guide,
    size_chart: product.size_chart,
    variants: product.variants || [],
    default_color: product.default_color
  }
}

export async function insertProduct(product) {
  const newProduct = {
    ...product,
    id: product.id || `ftw-${Date.now()}`,
    created_at: new Date().toISOString()
  }

  try {
    const sanitized = sanitizeProduct(newProduct)
    const { data, error } = await supabase
      .from('products')
      .insert([sanitized])
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase product insertion failed:", err.message)
    throw err
  }
}

export async function updateProduct(productId, product) {
  try {
    const sanitized = sanitizeProduct({ ...product, id: productId })
    const { data, error } = await supabase
      .from('products')
      .update(sanitized)
      .eq('id', productId)
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase product update failed:", err.message)
    throw err
  }
}

export async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    if (error) throw error
    return true
  } catch (err) {
    console.error("Supabase product deletion failed:", err.message)
    throw err
  }
}

export async function decrementProductStock(productId, quantityToSubtract, size, color) {
  try {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock, variants')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError
    if (!product) return

    const updates = {}
    const currentStock = product.stock || 0
    updates.stock = Math.max(0, currentStock - quantityToSubtract)

    if (Array.isArray(product.variants) && product.variants.length > 0 && size && color) {
      const cleanedColor = color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
      const updatedVariants = product.variants.map(v => {
        const cleanedVColor = v.color ? v.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim() : ''
        if (cleanedVColor === cleanedColor && v.size === size) {
          const vStock = v.stock !== undefined ? v.stock : 0
          return {
            ...v,
            stock: Math.max(0, vStock - quantityToSubtract)
          }
        }
        return v
      })
      updates.variants = updatedVariants
    }

    const { error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)

    if (updateError) throw updateError
  } catch (err) {
    console.error(`Failed to decrement stock for product ${productId}:`, err.message)
    throw err
  }
}

// ─── ORDERS API ──────────────────────────────────────────────────────────────
export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase orders fetch failed:", err.message)
    throw err
  }
}

export async function insertOrder(order) {
  const newOrder = {
    ...order,
    id: order.id || `FTW-${Math.floor(100000 + Math.random() * 900000)}`,
    status: order.status || 'Pending',
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase order insertion failed:", err.message)
    throw err
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    if (error) throw error
    return true
  } catch (err) {
    console.error("Supabase order status update failed:", err.message)
    throw err
  }
}

// ─── USERS API ───────────────────────────────────────────────────────────────
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase users fetch failed:", err.message)
    return []
  }
}

// ─── INQUIRIES API ────────────────────────────────────────────────────────────
export async function getInquiries() {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase inquiries fetch failed:", err.message)
    throw err
  }
}

export async function insertInquiry(inquiry) {
  const newInquiry = {
    ...inquiry,
    id: inquiry.id || `inq-${Date.now()}`,
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([newInquiry])
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase inquiry insertion failed:", err.message)
    throw err
  }
}

export async function deleteInquiry(id) {
  try {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  } catch (err) {
    console.error("Supabase inquiry deletion failed:", err.message)
    throw err
  }
}

// ─── CATEGORIES API ───────────────────────────────────────────────────────────
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase categories fetch failed:", err.message)
    throw err
  }
}

export async function insertCategory(category) {
  const newCat = {
    ...category,
    id: category.id || `cat-${Date.now()}`,
    slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    sort_order: category.sort_order !== undefined ? Number(category.sort_order) : 0,
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([newCat])
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase category insertion failed:", err.message)
    throw err
  }
}

export async function deleteCategory(categoryId) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
    if (error) throw error
    return true
  } catch (err) {
    console.error("Supabase category deletion failed:", err.message)
    throw err
  }
}

export async function updateCategory(categoryId, categoryUpdates) {
  try {
    const { error } = await supabase
      .from('categories')
      .update(categoryUpdates)
      .eq('id', categoryId)
    if (error) throw error
    return true
  } catch (err) {
    console.error("Supabase category update failed:", err.message)
    throw err
  }
}

// Pre-cached ratings database lookup
let ratingsCache = {};

export async function preloadRatingsCache() {
  try {
    const reviews = await getApprovedReviews();
    const cache = {};
    reviews.forEach(r => {
      if (!cache[r.product_name]) cache[r.product_name] = [];
      cache[r.product_name].push(r.rating);
    });
    ratingsCache = cache;
  } catch (e) {
    console.error("Failed to build ratings cache:", e);
  }
}

export function getProductRating(productName) {
  const ratings = ratingsCache[productName];
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, r) => sum + r, 0);
  return Number((total / ratings.length).toFixed(1));
}

// ─── NEW DB ENDPOINTS: COUPONS, REVIEWS, SETTINGS ───────────────────────────

export async function getCoupons() {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase getCoupons error:", err.message);
    throw err
  }
}

export async function insertCoupon(coupon) {
  const newC = {
    ...coupon,
    id: coupon.id || `c-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert([newC])
      .select();
    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error("Supabase insertCoupon error:", err.message);
    throw err;
  }
}

export async function deleteCoupon(id) {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase deleteCoupon error:", err.message);
    throw err;
  }
}

export async function getReviews() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase getReviews error:", err.message);
    throw err
  }
}

export async function getApprovedReviews() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase getApprovedReviews error:", err.message);
    return []
  }
}

export async function insertReview(review) {
  const newR = {
    ...review,
    id: review.id || `r-${Date.now()}`,
    approved: review.approved ?? false,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([newR])
      .select();
    if (error) throw error;
    preloadRatingsCache();
    return data[0];
  } catch (err) {
    console.error("Supabase insertReview error:", err.message);
    throw err;
  }
}

export async function approveReview(id) {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ approved: true })
      .eq('id', id);
    if (error) throw error;
    preloadRatingsCache();
    return true;
  } catch (err) {
    console.error("Supabase approveReview error:", err.message);
    throw err;
  }
}

export async function deleteReview(id) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    if (error) throw error;
    preloadRatingsCache();
    return true;
  } catch (err) {
    console.error("Supabase deleteReview error:", err.message);
    throw err;
  }
}

export async function getStoreSettings() {
  const defaultSettings = {
    shipping_threshold: 1499,
    shipping_flat_rate: 99,
    enable_razorpay: true,
    enable_cod: true,
    store_address: 'FTW Streetwear Lab, Mumbai, IN',
    support_email: 'forthewinmail8@gmail.com',
    support_whatsapp: '+91 XXXXX XXXXX',
    support_instagram: 'ftw_streetwear',
    support_hours: 'MON – SAT: 10:00 AM – 7:00 PM IST',
    facebook_link: 'https://facebook.com'
  };

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'global_settings')
      .maybeSingle();
    if (error) throw error;
    
    // Ensure all default properties are merged in case some keys are missing from existing DB JSON
    const dbValue = data?.value || {};
    return {
      ...defaultSettings,
      ...dbValue
    };
  } catch (err) {
    console.error("Supabase getStoreSettings error:", err.message);
    return defaultSettings;
  }
}

export async function saveStoreSettings(settings) {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({ key: 'global_settings', value: settings, updated_at: new Date().toISOString() })
      .select();
    if (error) throw error;
    return data[0]?.value || settings;
  } catch (err) {
    console.error("Supabase saveStoreSettings error:", err.message);
    throw err;
  }
}

export async function getHomepageConfig() {
  const defaultHomepage = {
    hero_images: [
      '/images/img1.webp',
      '/images/img2.webp',
      '/images/img3.webp',
      '/images/img4.webp',
      '/images/img5.webp'
    ],
    featured_product_ids: ['ftw-sig-01', 'ftw-cyber-02', 'ftw-acid-03', 'ftw-box-04'],
    sale_product_ids: ['ftw-sale-01', 'ftw-sale-02'],
    coming_soon_title: '',
    coming_soon_subtitle: '',
    coming_soon_description: '',
    coming_soon_countdown: null,
    coming_soon_images: [],
    hero_bg_banner: '/images/banner.webp',
    hero_bg_banner_mobile: '/images/mobilebanner.webp'
  };

  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();
    if (error) throw error;
    if (!data) return defaultHomepage;
    return {
      hero_images: data.hero_images || defaultHomepage.hero_images,
      featured_product_ids: data.featured_product_ids || defaultHomepage.featured_product_ids,
      sale_product_ids: data.sale_product_ids || defaultHomepage.sale_product_ids,
      coming_soon_title: data.coming_soon_title || defaultHomepage.coming_soon_title,
      coming_soon_subtitle: data.coming_soon_subtitle || defaultHomepage.coming_soon_subtitle,
      coming_soon_description: data.coming_soon_description || defaultHomepage.coming_soon_description,
      coming_soon_countdown: data.coming_soon_countdown || defaultHomepage.coming_soon_countdown,
      coming_soon_images: Array.isArray(data.coming_soon_images) ? data.coming_soon_images : defaultHomepage.coming_soon_images,
      hero_bg_banner: data.hero_bg_banner || defaultHomepage.hero_bg_banner,
      hero_bg_banner_mobile: data.hero_bg_banner_mobile || defaultHomepage.hero_bg_banner_mobile
    };
  } catch (err) {
    console.error("Supabase getHomepageConfig error:", err.message);
    return defaultHomepage;
  }
}

export async function saveHomepageConfig(config) {
  try {
    const payload = {
      id: 'main',
      hero_images: config.hero_images,
      featured_product_ids: config.featured_product_ids,
      sale_product_ids: config.sale_product_ids,
      coming_soon_title: config.coming_soon_title,
      coming_soon_subtitle: config.coming_soon_subtitle,
      coming_soon_description: config.coming_soon_description,
      coming_soon_countdown: config.coming_soon_countdown,
      coming_soon_images: config.coming_soon_images,
      hero_bg_banner: config.hero_bg_banner,
      hero_bg_banner_mobile: config.hero_bg_banner_mobile,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('homepage_config')
      .upsert(payload)
      .select();
    if (error) throw error;
    return data[0] || config;
  } catch (err) {
    console.error("Supabase saveHomepageConfig error:", err.message);
    throw err;
  }
}

// Initial preload of ratings cache
preloadRatingsCache();

// ─── CUSTOM DESIGNS API ──────────────────────────────────────────────────────
export async function saveCustomDesign(design) {
  let targetId = design.id || `des-${Date.now()}`

  // Server/DB-side security safeguard: If this design is already associated with an order,
  // we must NEVER overwrite it, even if someone manually bypassed the read-only URL parameters.
  // We check the orders table for any placed orders containing this design ID.
  if (design.id) {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('items')

      const isOrdered = orders?.some(order =>
        order.items?.some(item => item.designId === design.id)
      )

      if (isOrdered) {
        targetId = `des-${Date.now()}`
      }
    } catch (e) {
      console.error("Failed to check order association for design:", e)
    }
  }

  const newDesign = {
    ...design,
    id: targetId,
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('custom_designs')
      .upsert([newDesign])
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase custom design save failed:", err.message)
    throw err
  }
}

export async function getUserCustomDesigns(userId) {
  try {
    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase user custom designs fetch failed:", err.message)
    throw err
  }
}

export async function getAdminCustomDesigns() {
  try {
    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase admin custom designs fetch failed:", err.message)
    throw err
  }
}

export async function getCustomDesign(id) {
  try {
    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("Supabase custom design fetch failed:", err.message)
    throw err
  }
}

export async function deleteCustomDesign(id) {
  try {
    const { error } = await supabase
      .from('custom_designs')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  } catch (err) {
    console.error("Supabase custom design deletion failed:", err.message)
    throw err
  }
}

export async function getCustomizerConfig() {
  try {
    const { data, error } = await supabase
      .from('customizer_mockups')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    const allRows = data || [];
    // Separate the special __pricing__ row from actual color rows
    const pricingRow = allRows.find(r => r.name === '__pricing__');
    const colors = allRows.filter(r => r.name !== '__pricing__');
    const pricing = pricingRow?.pricing_settings || {};
    return { colors, pricing };
  } catch (err) {
    console.error("Supabase getCustomizerConfig error:", err.message);
    return { colors: [], pricing: {} };
  }
}

export async function saveCustomizerConfig(config) {
  try {
    // 1. Fetch currently stored colors to identify which ones were deleted
    const { colors: existingColors } = await getCustomizerConfig();
    const existingNames = existingColors.map(c => c.name);
    const newNames = (config.colors || []).map(c => c.name);

    const namesToDelete = existingNames.filter(
      name => !newNames.includes(name) && name !== 'none' && name !== '__pricing__'
    );

    if (namesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('customizer_mockups')
        .delete()
        .in('name', namesToDelete);
      if (deleteError) throw deleteError;
    }

    // 2. Upsert pricing settings into dedicated __pricing__ row
    if (config.pricing) {
      const { error: pricingError } = await supabase
        .from('customizer_mockups')
        .upsert({
          name: '__pricing__',
          hex: '',
          mockups: {},
          pricing_settings: config.pricing,
          created_at: new Date(0).toISOString() // epoch ensures it sorts first
        }, { onConflict: 'name' });
      if (pricingError) throw pricingError;
    }

    // 3. Upsert colors
    if (config.colors && config.colors.length > 0) {
      const rowsToUpsert = config.colors.map((col, index) => ({
        name: col.name,
        hex: col.hex,
        mockups: col.mockups,
        created_at: new Date(Date.now() + index * 10).toISOString()
      }));

      const { data, error: upsertError } = await supabase
        .from('customizer_mockups')
        .upsert(rowsToUpsert, { onConflict: 'name' })
        .select();
      if (upsertError) throw upsertError;
      return { colors: data, pricing: config.pricing };
    }

    return { colors: [], pricing: config.pricing };
  } catch (err) {
    console.error("Supabase saveCustomizerConfig error:", err.message);
    throw err;
  }
}

// ─── BLOGS API ──────────────────────────────────────────────────────────────
export async function getBlogs(all = false) {
  try {
    let query = supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (!all) {
      query = query.eq('published', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Supabase blogs fetch failed:", err.message)
    throw err
  }
}

export async function getBlogBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.error(`Supabase blog fetch by slug (${slug}) failed:`, err.message)
    throw err
  }
}

export async function insertBlog(blog) {
  const newBlog = {
    ...blog,
    id: blog.id || `blog-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('blogs')
      .insert([newBlog])
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase blog insertion failed:", err.message)
    throw err
  }
}

export async function updateBlog(blogId, blog) {
  const updatedPayload = {
    ...blog,
    updated_at: new Date().toISOString()
  }
  try {
    const { data, error } = await supabase
      .from('blogs')
      .update(updatedPayload)
      .eq('id', blogId)
      .select()
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Supabase blog update failed:", err.message)
    throw err
  }
}

export async function deleteBlog(blogId) {
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogId)
    if (error) throw error
    return true
  } catch (err) {
    console.error("Supabase blog deletion failed:", err.message)
    throw err
  }
}
