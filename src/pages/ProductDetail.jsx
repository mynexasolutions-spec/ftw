import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Heart, ShoppingBag, Flame, Sparkles, RefreshCw, Info, ChevronRight, X, Star, ShieldCheck, Truck, Check, ShieldAlert, Clock, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProducts, getApprovedReviews } from '../lib/supabase'

const COLOR_MAP = {
  'black': '#0F0F0F',
  'white': '#FFFFFF',
  'off-white': '#FAF9F6',
  'cream': '#FDF6E2',
  'beige': '#E1D9C1',
  'sand': '#D2C4A8',
  'charcoal': '#3E3E3E',
  'navy': '#1A2536',
  'olive': '#4D5844',
  'acid olive': '#595C43',
  'lime': '#CCFF00',
  'cyber blue': '#00E5FF',
  'acid purple': '#583F72',
  'dusty rose': '#DCAE96',
  'rose': '#E8A5A5',
  'pastel lavender': '#D8B4F8',
  'lavender': '#E6E6FA',
  'sage green': '#9CAF88',
  'sage': '#9CAF88',
  'peach': '#FFDAB9',
  'pink': '#FFC0CB',
  'brown': '#8B4513',
  'maroon': '#800000',
  'burgundy': '#800020',
  'terracotta': '#E2725B',
  'rust': '#B7410E',
  'teal': '#008080',
  'mint': '#98FF98',
  'lilac': '#C8A2C8'
}

const resolveColorHex = (colorStr) => {
  if (!colorStr) return '#CCCCCC';
  const hexMatch = colorStr.match(/#([0-9a-fA-F]{3,6})/);
  if (hexMatch) return `#${hexMatch[1]}`;
  
  const clean = colorStr.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase();
  if (COLOR_MAP[clean]) return COLOR_MAP[clean];
  
  for (const key in COLOR_MAP) {
    if (clean.includes(key)) return COLOR_MAP[key];
  }
  return '#CCCCCC';
}

// Dummy T-shirt Database
const PRODUCTS_DB = {
  'ftw-sig-01': {
    id: 'ftw-sig-01',
    name: 'Signature Heavyweight Oversized Tee',
    price: 1899,
    stock: 8,
    description: 'Engineered with premium 280 GSM French Terry cotton. Designed with a perfect relaxed drop-shoulder silhouette, minimal high-density branding on chest, and high-frequency puff print artwork on back.',
    fabric: '280 GSM heavyweight French Terry. 100% luxury combed cotton. Breathable, pre-shrunk, bio-washed for ultimate softness.',
    washing: 'Machine wash cold inside out with like colors. Do not bleach. Tumble dry low or hang dry. Warm iron if needed, avoiding puff print decoration.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Cream', 'Charcoal', 'Navy', 'Olive'],
    images: [
      '/images/1.1.jpeg',
      '/images/1.2.jpeg',
      '/images/1.3.jpeg'
    ]
  },
  'ftw-cyber-02': {
    id: 'ftw-cyber-02',
    name: 'Cyber-Neon Oversized Tee',
    price: 1999,
    stock: 4,
    description: 'Bold statement apparel. Features reflective cyber-sigil typography across the chest that reacts to night flashes. Structured collar design that retains shape after endless washes.',
    fabric: '260 GSM high-density loopback cotton. 95% cotton, 5% elastane neck ribs.',
    washing: 'Hand wash recommended. Machine wash cold, delicate cycle. Wash inside out. Do not tumble dry to protect reflective elements.',
    sizes: ['M', 'L', 'XL'],
    colors: ['Black', 'Lime', 'White', 'Cyber Blue'],
    images: [
      '/images/2.1.jpeg',
      '/images/2.2.jpeg',
      '/images/2.3.jpeg'
    ]
  },
  'ftw-acid-03': {
    id: 'ftw-acid-03',
    name: 'Retro Acid-Wash Drop Tee',
    price: 2199,
    stock: 12,
    description: 'Individually dyed to create a unique vintage texture for each unit. Finished with distress-style hem lines and raw industrial aesthetics. Perfect for layered streetwear looks.',
    fabric: '300 GSM heavy-duty loopback cotton jersey. Custom oil-dyed and wash finished.',
    washing: 'Wash separately before wearing to avoid pigment bleed. Machine wash cold. Air dry only.',
    sizes: ['S', 'M', 'L'],
    colors: ['Charcoal', 'Acid Purple', 'Acid Olive', 'Sand'],
    images: [
      '/images/3.1.jpeg',
      '/images/3.2.jpeg',
      '/images/3.3.jpeg'
    ]
  },
  'ftw-box-04': {
    id: 'ftw-box-04',
    name: 'Minimalist Monogram Box Tee',
    price: 1799,
    stock: 6,
    description: 'Clean aesthetics with a luxury touch. High-density debossed rubber FTW box logo in centered alignment on the chest. Side slits at the hem for improved mobility and drape.',
    fabric: '240 GSM soft-combed compact jersey cotton. Premium structural recovery.',
    washing: 'Machine wash cold. Dry flat. Iron inside out on low heat settings.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Black', 'Navy', 'Off-White'],
    images: [
      '/images/4.1.jpeg',
      '/images/4.2.jpeg',
      '/images/4.3.jpeg'
    ]
  },
  'ftw-sale-01': {
    id: 'ftw-sale-01',
    name: 'Vanguard Drop-Shoulder Tee',
    price: 1299,
    stock: 5,
    description: 'Classic vanguard graphic collection item featuring our flagship drop-shoulder cuts.',
    fabric: '240 GSM single jersey premium cotton.',
    washing: 'Machine wash cold.',
    sizes: ['S', 'M'],
    colors: ['Black', 'White', 'Charcoal'],
    images: [
      '/images/1.1.jpeg',
      '/images/1.2.jpeg'
    ]
  },
  'ftw-sale-02': {
    id: 'ftw-sale-02',
    name: 'Core Logo Classic Fit Tee',
    price: 999,
    stock: 0,
    description: 'Classic fit premium drop series item.',
    fabric: '240 GSM single jersey cotton.',
    washing: 'Machine wash cold.',
    sizes: ['M', 'L'],
    colors: ['White', 'Black', 'Cream'],
    images: [
      '/images/2.1.jpeg',
      '/images/2.2.jpeg'
    ]
  }
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Black')
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('fabric') // 'fabric', 'wash', 'shipping'

  const [reviewsList, setReviewsList] = useState([])
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' })
  const [recommendedProducts, setRecommendedProducts] = useState([])

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const list = await getProducts()
        const found = list.find(p => p.id === id)
        let resolvedProduct = null
        if (found) {
          const sizesArr = Array.isArray(found.sizes) ? found.sizes : (found.sizes ? found.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'])
          const colorsArr = Array.isArray(found.colors) ? found.colors : (found.colors ? found.colors.split(',').map(c => c.trim()) : ['Black', 'White'])
          const imagesArr = Array.isArray(found.images) && found.images.length > 0 ? found.images : (found.image ? [found.image] : ['/images/1.1.jpeg'])

          resolvedProduct = {
            ...found,
            sizes: sizesArr,
            colors: colorsArr,
            images: imagesArr,
            description: found.description || 'Premium streetwear design crafted with ultimate attention to detail.',
            fabric: found.fabric_info || found.fabric || '280 GSM heavyweight French Terry. 100% combed cotton.',
            washing: found.washing_instructions || found.washing || 'Machine wash cold inside out with like colors. Do not bleach. Tumble dry low.',
            size_guide: found.size_guide || 'intentionally cut drop-shoulder and oversized. Buy one size smaller for regular fit.'
          }
          setProduct(resolvedProduct)
          if (sizesArr.length > 0) setSelectedSize(sizesArr[0])
          let initialColor = colorsArr[0]
          if (found.default_color) {
            const matched = colorsArr.find(c => c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim() === found.default_color)
            if (matched) initialColor = matched
          }
          if (colorsArr.length > 0) setSelectedColor(initialColor)
        } else {
          const fallback = PRODUCTS_DB[id]
          if (fallback) {
            resolvedProduct = fallback
            setProduct(fallback)
            if (fallback.sizes.length > 0) setSelectedSize(fallback.sizes[0])
            let initialColor = fallback.colors[0]
            if (fallback.default_color) {
              const matched = fallback.colors.find(c => c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim() === fallback.default_color)
              if (matched) initialColor = matched
            }
            if (fallback.colors.length > 0) setSelectedColor(initialColor)
          }
        }

        // Load recommended products from real list. If database list is empty, fallback to PRODUCTS_DB.
        const sourceList = list && list.length > 0 ? list : Object.values(PRODUCTS_DB)
        const filtered = sourceList.filter(p => String(p.id) !== String(id))
        const recs = filtered.map(foundItem => {
          const sizesArr = Array.isArray(foundItem.sizes) ? foundItem.sizes : (foundItem.sizes ? foundItem.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'])
          const colorsArr = Array.isArray(foundItem.colors) ? foundItem.colors : (foundItem.colors ? foundItem.colors.split(',').map(c => c.trim()) : ['Black', 'White'])
          const imagesArr = Array.isArray(foundItem.images) && foundItem.images.length > 0 ? foundItem.images : (foundItem.image ? [foundItem.image] : ['/images/1.1.jpeg'])
          return {
            ...foundItem,
            sizes: sizesArr,
            colors: colorsArr,
            images: imagesArr
          }
        })
        setRecommendedProducts(recs.slice(0, 3))

        if (resolvedProduct) {
          const allReviews = await getApprovedReviews()
          const prodReviews = allReviews.filter(r => r.product_name === resolvedProduct.name)
          const mappedReviews = prodReviews.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            user_id: r.user_id,
            rating: r.rating,
            date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            title: r.rating >= 4 ? "Absolutely Premium Quality" : "Verified Customer Review",
            comment: r.comment,
            verified: true
          }))
          setReviewsList(mappedReviews)
        }
      } catch (err) {
        console.error("Failed to load product detail:", err)
        const fallback = PRODUCTS_DB[id]
        if (fallback) {
          setProduct(fallback)
          if (fallback.sizes.length > 0) setSelectedSize(fallback.sizes[0])
          if (fallback.colors.length > 0) setSelectedColor(fallback.colors[0])
        }
        const fallbackRecs = Object.values(PRODUCTS_DB).filter(p => String(p.id) !== String(id)).slice(0, 3)
        setRecommendedProducts(fallbackRecs)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center font-mono">
        <span className="animate-spin w-8 h-8 border-4 border-dark border-t-transparent rounded-full inline-block mb-3" /><br />
        <p className="text-xs text-dark/50 uppercase tracking-widest">Retrieving product metrics...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center font-mono">
        <p className="text-sm text-dark/50 mb-8">Product reference not found.</p>
        <Link to="/shop" className="px-6 py-3 bg-dark text-cream text-xs uppercase font-bold rounded-xl hover:bg-primary hover:text-dark transition-all">Go To Shop</Link>
      </div>
    )
  }


  // Resolve active variant pricing & images
  const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';
  
  // Find exact size + color variant combination
  const matchingVariant = (product.variants || []).find(
    v => cleanColor(v.color) === cleanColor(selectedColor) && v.size === selectedSize
  );

  // Find any variant of the selected color that has overrides set
  const colorVariantWithPrice = (product.variants || []).find(
    v => cleanColor(v.color) === cleanColor(selectedColor) && v.price !== undefined && v.price !== null && v.price !== ''
  );

  const colorVariantWithOriginalPrice = (product.variants || []).find(
    v => cleanColor(v.color) === cleanColor(selectedColor) && v.originalPrice !== undefined && v.originalPrice !== null && v.originalPrice !== ''
  );

  // If size override doesn't exist, we can fallback to any variant matching the color to get the images,
  // since images are color-specific
  const colorVariantForImages = (product.variants || []).find(
    v => cleanColor(v.color) === cleanColor(selectedColor) && v.images && v.images.length > 0
  );

  // Get all image URLs that are mapped to OTHER colors in the variants list (match by filename segment to avoid URL parameter mismatches)
  const getUrlId = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const otherColorsMappedImages = (product.variants || [])
    .filter(v => cleanColor(v.color) !== cleanColor(selectedColor))
    .reduce((acc, v) => {
      if (Array.isArray(v.images)) {
        v.images.forEach(img => acc.add(getUrlId(img)));
      }
      return acc;
    }, new Set());

  // Filter global product images list to exclude images explicitly mapped to other colors
  const filteredProductImages = (product.images || []).filter(img => !otherColorsMappedImages.has(getUrlId(img)));

  // Fallbacks if global properties are empty (since configuration is exclusively color-wise)
  const firstVariantWithPrice = (product.variants || []).find(v => v.price !== undefined) || {};
  const firstVariantWithImages = (product.variants || []).find(v => v.images && v.images.length > 0) || {};

  const displayPrice = matchingVariant && matchingVariant.price !== undefined && matchingVariant.price !== null && matchingVariant.price !== ''
    ? Number(matchingVariant.price)
    : (colorVariantWithPrice && colorVariantWithPrice.price !== undefined && colorVariantWithPrice.price !== null && colorVariantWithPrice.price !== ''
        ? Number(colorVariantWithPrice.price)
        : (product.price !== undefined && product.price !== null && product.price !== 0 ? Number(product.price) : Number(firstVariantWithPrice.price || 0)));

  const displayOriginalPrice = matchingVariant && matchingVariant.originalPrice !== undefined && matchingVariant.originalPrice !== null && matchingVariant.originalPrice !== ''
    ? Number(matchingVariant.originalPrice)
    : (colorVariantWithOriginalPrice && colorVariantWithOriginalPrice.originalPrice !== undefined && colorVariantWithOriginalPrice.originalPrice !== null && colorVariantWithOriginalPrice.originalPrice !== ''
        ? Number(colorVariantWithOriginalPrice.originalPrice)
        : (product.originalPrice ? Number(product.originalPrice) : (firstVariantWithPrice.originalPrice ? Number(firstVariantWithPrice.originalPrice) : null)));

  const displayStock = matchingVariant && matchingVariant.stock !== undefined && matchingVariant.stock !== null && matchingVariant.stock !== ''
    ? Number(matchingVariant.stock)
    : (product.variants && product.variants.some(v => cleanColor(v.color) === cleanColor(selectedColor))
        ? 0 // If color variants exist, but not for this specific size, default to 0 (out of stock)
        : (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0));

  const displayImages = (colorVariantForImages && colorVariantForImages.images && colorVariantForImages.images.length > 0)
    ? colorVariantForImages.images
    : (filteredProductImages.length > 0 ? filteredProductImages : (product.images && product.images.length > 0 ? product.images : (firstVariantWithImages.images || ['/images/1.1.jpeg'])));

  // Ensure activeImageIdx is valid for current set of images
  const imagesToRender = displayImages || [];
  const safeActiveImageIdx = activeImageIdx < imagesToRender.length ? activeImageIdx : 0;

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imagesToRender[safeActiveImageIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: safeActiveImageIdx === 2 ? '150%' : '220%',
      backgroundColor: 'white'
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' })
  }

  const handleAddToBag = () => {
    const resolvedProduct = {
      ...product,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      stock: displayStock,
      image: imagesToRender[0] || product.image,
      images: imagesToRender
    }
    addToCart(resolvedProduct, selectedSize, selectedColor)
    toast.success(`Added ${product.name} [Size ${selectedSize} / Color ${selectedColor}] to bag!`, {
      style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
    })
  }

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login to proceed to express checkout!", {
        id: 'auth-required-buy-now',
        style: { background: '#161616', color: '#FAF9F6' }
      })
      navigate(`/auth?redirect=/product/${product.id}`)
      return
    }
    const resolvedProduct = {
      ...product,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      stock: displayStock,
      image: imagesToRender[0] || product.image,
      images: imagesToRender
    }
    addToCart(resolvedProduct, selectedSize, selectedColor, true)
    toast.loading("Initiating express secure checkout...", { duration: 1200 })
    setTimeout(() => {
      toast.dismiss()
      navigate('/checkout')
    }, 1200)
  }

  const totalReviews = reviewsList.length
  const avgRating = totalReviews > 0 
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0'

  // Calculate star counts
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviewsList.forEach(r => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++
    }
  })
  
  const getStarPercentage = (stars) => {
    if (totalReviews === 0) return 0
    return Math.round((starCounts[stars] / totalReviews) * 100)
  }

  const isCurrentUserReview = (reviewName, reviewEmail, reviewUserId) => {
    if (!user) return false
    if (reviewUserId && user.id) {
      return reviewUserId === user.id
    }
    if (reviewEmail && user.email) {
      return reviewEmail.toLowerCase() === user.email.toLowerCase()
    }
    const fullName = user.user_metadata?.full_name?.toLowerCase() || ''
    const emailPrefix = user.email?.split('@')[0]?.toLowerCase() || ''
    const revNameLower = reviewName?.toLowerCase() || ''
    
    return (
      (fullName && revNameLower === fullName) ||
      (emailPrefix && revNameLower === emailPrefix) ||
      (fullName && (revNameLower.includes(fullName) || fullName.includes(revNameLower)))
    )
  }

  const categoryStr = (product?.category || '').toLowerCase().replace(/[\s-_]+/g, ' ').trim()
  const tagStr = (product?.tag || '').toLowerCase().replace(/[\s-_]+/g, ' ').trim()
  const isComingSoon = product ? (categoryStr === 'coming soon' || tagStr === 'coming soon') : false

  return (
    <div className="bg-[#FAF9F6] text-[#161616] min-h-screen relative overflow-hidden font-sans bg-grain pb-20">

      {/* Gaming UI grid lines, scanlines, and glowing effects in light theme */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grain {
            background-image: 
              radial-gradient(rgba(139, 92, 246, 0.08) 1.2px, transparent 1.2px),
              radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
            background-size: 20px 20px, 100% 100%, 100% 100%;
          }

          /* Full subtle scanline overlay */
          .product-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.02) 2px,
              rgba(139,92,246,0.02) 4px
            );
          }

          /* Outer border wrapper for helpline card — darker gaming border */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.8), rgba(99,58,214,0.6), rgba(37,99,235,0.6));
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }

          /* HUD Card layout matching screenshot */
          .hud-product-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
          }
          .hud-product-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2.5px;
            background: linear-gradient(90deg, transparent, #8B5CF6 20%, #C084FC 50%, #6D28D9 80%, transparent);
            z-index: 5;
          }
          
          /* HUD corner ticks */
          .hud-corner { position: absolute; width: 12px; height: 12px; border-color: rgba(139,92,246,0.45); border-style: solid; z-index: 10; }
          .hud-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }

          /* Hex values for tech gaming vibe */
          .hud-hex { position: absolute; font-size: 7px; font-family: monospace; color: rgba(139,92,246,0.45); letter-spacing: 0.05em; font-weight: bold; z-index: 10; }
          .hud-hex-tl { top: 4px; left: 24px; }
          .hud-hex-tr { top: 4px; right: 24px; }

          .hud-detail-btn {
            background: linear-gradient(90deg, #7C3AED 0%, #9333EA 50%, #6D28D9 100%);
            color: #FFFFFF;
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 900;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-size: 11px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 28px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
            box-shadow: 0 4px 15px rgba(124,58,237,0.25);
            text-decoration: none;
          }
          .hud-detail-btn:hover {
            box-shadow: 0 8px 20px rgba(124,58,237,0.38);
          }
        `
      }} />

      <div className="product-scanlines" />

      {/* Decorative vertical texts */}
      <div className="absolute left-6 top-[30%] rotate-[-90deg] origin-left text-[9px] font-mono text-gray-400 tracking-[0.3em] uppercase select-none pointer-events-none">
        FTW // SECURED_SPEC // EQUIPMENT
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 py-8 font-sans text-dark relative z-10"
      >
        {/* Editorial Breadcrumbs */}
        <div className="flex items-center gap-2 mb-10 text-[10px] font-mono tracking-widest uppercase text-dark/40">
          <Link to="/" className="hover:text-dark transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3 text-dark/30" />
          <Link to="/shop" className="hover:text-dark transition-colors">SHOP</Link>
          <ChevronRight className="w-3 h-3 text-dark/30" />
          <span className="text-dark/80 font-bold">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-4">
          {/* Left Side: Images Grid/Showcase */}
          <div className="lg:col-span-6 flex flex-col md:flex-row-reverse gap-6">
          {/* Main Display Image wrapper */}
          <div className="flex-grow hud-card-border max-h-[650px]">
            <div className="hud-product-card aspect-[3.4/5] overflow-hidden select-none group">
              <div className="hud-corner hud-tl" />
              <div className="hud-corner hud-tr" />
              <div className="hud-corner hud-bl" />
              <div className="hud-corner hud-br" />

              <span className="hud-hex hud-hex-tl">ZOOM_VISUAL_LENS</span>
              <span className="hud-hex hud-hex-tr">0xFEED</span>

              <img
                src={imagesToRender[safeActiveImageIdx]}
                alt={product.name}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`w-full h-full cursor-zoom-in transition-all duration-300 ${safeActiveImageIdx === 2 ? 'object-contain bg-white p-4' : 'object-cover'
                  }`}
              />
              {/* Custom Hover Zoom overlay lens panel */}
              <div
                className="absolute inset-0 pointer-events-none border border-cream3/40 hidden md:block"
                style={zoomStyle}
              />

              {/* Absolute watermark tag */}
              {product.tag && (
                <span className="absolute bottom-4 left-4 bg-dark text-primary text-[8px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-lg shadow-sm font-black z-20">
                  {product.tag}
                </span>
              )}
            </div>
          </div>

          {/* Alternate Thumbnail selector strip */}
          {imagesToRender.length > 1 && (
            <div className="flex flex-row md:flex-col gap-4 shrink-0 justify-start">
              {imagesToRender.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 sm:w-20 aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all bg-cream3 ${safeActiveImageIdx === idx ? 'border-dark scale-105 shadow-md' : 'border-neutral-200 hover:border-dark/30'
                    }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Technical Specs & Add To Bag */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
          <div>
            {/* Stock panic alerts */}
            {isComingSoon ? (
              <div className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-6 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>COMING SOON / STOCK NOT CONFIRMED YET</span>
              </div>
            ) : displayStock !== undefined && displayStock !== null ? (
              displayStock === 0 ? (
                <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-6">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  <span>SOLD OUT / OUT OF STOCK</span>
                </div>
              ) : displayStock <= 8 ? (
                <div className="inline-flex items-center gap-1.5 text-accent bg-accent/5 border border-accent/15 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-6 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-accent animate-bounce" />
                  <span>LIMIT ALERT: ONLY {displayStock} PIECES LEFT</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-6">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IN STOCK: {displayStock} PIECES AVAILABLE</span>
                </div>
              )
            ) : (
              <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-6">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>IN STOCK</span>
              </div>
            )}             {/* Title & Ratings */}
            <div className="space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.25em] text-[#8B5CF6] font-black block">ORIGINAL CATALOG SERIES</span>
              <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-black text-dark tracking-tight leading-none">{product.name}</h1>

              <div className="flex items-center gap-2 font-mono text-[11.5px] font-bold">
                <div className="flex items-center text-purple-600">
                  <Star className="w-3.5 h-3.5 fill-purple-600 text-purple-600 mr-1" />
                  <span>{avgRating}</span>
                </div>
                <span className="text-dark/20">|</span>
                <span className="text-dark/50">{totalReviews} Verified Review{totalReviews !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="border-y border-[#E8E5DC] py-4 my-6">
              <div>
                <span className="text-[11px] text-dark font-mono uppercase block font-black">RETAIL PRICE</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-black font-mono text-dark">₹{displayPrice}</span>
                  {displayOriginalPrice && (
                    <>
                      <span className="text-sm line-through font-mono text-dark/45">₹{displayOriginalPrice}</span>
                      <span className="text-[10px] font-mono font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-lg uppercase">
                        {Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-dark/80 text-sm sm:text-[15px] leading-relaxed mb-8 font-sans font-bold">{product.description}</p>

            {/* Color selector */}
            {product.colors && (
              <div className="mb-6">
                <span className="text-[12px] text-dark uppercase tracking-widest font-mono font-black block mb-3">Choose Color Variant</span>
                <div className="flex gap-3 items-center">
                  {product.colors.map((color) => {
                    const hex = resolveColorHex(color);
                    const isActive = selectedColor === color;
                    const isLightColor = hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#fdf6e2' || hex.toLowerCase() === '#faf9f6' || hex.toLowerCase() === '#e1d9c1'

                    return (
                      <motion.button
                        key={color}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedColor(color)
                          setActiveImageIdx(0)
                        }}
                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center relative ${isActive
                          ? 'ring-2 ring-dark border-transparent scale-110 shadow-sm'
                          : 'border-neutral-300 hover:scale-105'
                          }`}
                        style={{ backgroundColor: hex }}
                        title={color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}
                      >
                        {isActive && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isLightColor ? 'bg-dark' : 'bg-white'
                            }`} />
                        )}
                      </motion.button>
                    )
                  })}
                  <span className="text-[11px] font-mono text-dark font-black tracking-wider uppercase ml-2 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                    {selectedColor.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}
                  </span>
                </div>
              </div>
            )}

            {/* Sizes selector */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] text-dark uppercase tracking-widest font-mono font-black">Choose Fit Size</span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[11px] text-purple-600 hover:text-dark transition-colors underline font-mono font-black"
                >
                  Size Details Chart
                </button>
              </div>
              <div className="flex gap-2">
                {product.sizes.map((sz) => (
                  <motion.button
                    key={sz}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-12 py-3 border text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${selectedSize === sz
                      ? 'bg-dark border-dark text-primary shadow-md'
                      : 'border-neutral-200 text-dark bg-cream hover:bg-neutral-100'
                      }`}
                  >
                    {sz}
                  </motion.button>
                ))}
              </div>
            </div>

            </div>

          {/* Checkout buttons strip */}
          <div className="space-y-3 pt-3 border-t border-cream3">
            {(() => {
              if (isComingSoon) {
                return (
                  <div className="space-y-4">
                    {/* Coming Soon Notice */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-sans">
                      <Clock className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-extrabold uppercase text-[10px] tracking-wider text-amber-900">Coming Soon Drop</p>
                        <p className="text-[11px] text-amber-800/85 mt-1 leading-relaxed">
                          This product is currently locked for drop preview. Once released, it will become available instantly in our <strong>New Arrivals</strong> section. Stay tuned!
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled
                        className="flex-grow py-4 bg-neutral-100 text-dark/30 font-mono font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 border border-neutral-200 cursor-not-allowed"
                      >
                        <ShoppingBag className="w-4 h-4 opacity-40" />
                        Locked
                      </button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          toggleWishlist({ ...product, image: imagesToRender[0] || product.image })
                          toast.success(
                            isInWishlist(product.id)
                              ? `${product.name} removed from wishlist.`
                              : `${product.name} added to wishlist!`,
                            { style: { background: '#161616', color: '#FAF9F6', fontFamily: "'Space Grotesk', sans-serif" } }
                          )
                        }}
                        className={`p-4 border rounded-2xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-xs ${isInWishlist(product.id)
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-neutral-200 text-dark bg-cream hover:bg-neutral-100'
                          }`}
                        title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={`w-5 h-5 transition-colors ${isInWishlist(product.id) ? 'fill-accent text-accent' : ''}`} />
                      </motion.button>
                    </div>

                    <button
                      disabled
                      className="w-full py-4 bg-neutral-100 text-dark/30 border border-neutral-200 font-mono font-black text-xs uppercase tracking-widest rounded-2xl cursor-not-allowed"
                    >
                      Not Yet Available
                    </button>
                  </div>
                )
              }

              const isOutOfStock = displayStock !== undefined && displayStock !== null && displayStock === 0
              if (isOutOfStock) {
                return (
                  <div className="flex gap-3 w-full">
                    <button
                      disabled
                      className="flex-grow py-4 bg-neutral-100 text-dark/30 border border-neutral-200 font-mono font-black text-xs uppercase tracking-widest rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 opacity-40" />
                      Sold Out
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        toggleWishlist({ ...product, image: imagesToRender[0] || product.image })
                        toast.success(
                          isInWishlist(product.id)
                            ? `${product.name} removed from wishlist.`
                            : `${product.name} added to wishlist!`,
                          { style: { background: '#161616', color: '#FAF9F6', fontFamily: "'Space Grotesk', sans-serif" } }
                        )
                      }}
                      className={`p-4 border rounded-2xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-xs shrink-0 ${isInWishlist(product.id)
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-neutral-200 text-dark bg-cream hover:bg-neutral-100'
                        }`}
                      title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-5 h-5 transition-colors ${isInWishlist(product.id) ? 'fill-accent text-accent' : ''}`} />
                    </motion.button>
                  </div>
                )
              }

              return (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleBuyNow}
                    className="w-full sm:flex-1 py-4 bg-primary text-dark hover:bg-dark hover:text-cream border border-dark hover:border-transparent transition-all duration-300 font-mono font-black text-xs uppercase tracking-widest rounded-2xl shadow-sm whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Buy Now
                  </motion.button>

                  <div className="flex gap-3 flex-1 w-full sm:w-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAddToBag}
                      className="flex-grow py-4 bg-dark text-cream hover:bg-primary hover:text-dark transition-all duration-300 font-mono font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 border-none shadow-md"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Bag
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        toggleWishlist({ ...product, image: imagesToRender[0] || product.image })
                        toast.success(
                          isInWishlist(product.id)
                            ? `${product.name} removed from wishlist.`
                            : `${product.name} added to wishlist!`,
                          { style: { background: '#161616', color: '#FAF9F6', fontFamily: "'Space Grotesk', sans-serif" } }
                        )
                      }}
                      className={`p-4 border rounded-2xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-xs shrink-0 ${isInWishlist(product.id)
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-neutral-200 text-dark bg-cream hover:bg-neutral-100'
                        }`}
                      title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-5 h-5 transition-colors ${isInWishlist(product.id) ? 'fill-accent text-accent' : ''}`} />
                    </motion.button>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Premium Tabbed details */}
          <div className="hud-card-border my-6">
            <div className="hud-product-card overflow-hidden">
              <div className="hud-corner hud-tl" />
              <div className="hud-corner hud-tr" />
              <div className="hud-corner hud-bl" />
              <div className="hud-corner hud-br" />
              
              {/* Tab headers */}
              <div className="flex border-b border-purple-500/10 font-mono text-[10px] uppercase font-bold text-dark bg-purple-500/5">
                <button
                  onClick={() => setActiveTab('fabric')}
                  className={`flex-1 py-3 text-center transition-all ${activeTab === 'fabric' ? 'bg-dark text-white' : 'hover:bg-purple-500/10 text-dark/70'}`}
                >
                  Fabric & Fit
                </button>
                <button
                  onClick={() => setActiveTab('wash')}
                  className={`flex-1 py-3 text-center transition-all ${activeTab === 'wash' ? 'bg-dark text-white' : 'hover:bg-purple-500/10 text-dark/70'}`}
                >
                  Care Details
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`flex-1 py-3 text-center transition-all ${activeTab === 'shipping' ? 'bg-dark text-white' : 'hover:bg-purple-500/10 text-dark/70'}`}
                >
                  Shipping
                </button>
              </div>

              {/* Tab contents */}
              <div className="p-5 text-xs text-dark/75 leading-relaxed font-mono">
                <AnimatePresence mode="wait">
                  {activeTab === 'fabric' && (
                    <motion.div
                      key="fabric"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-[10px] font-black text-dark uppercase block mb-1">Premium Fabric Specifications:</span>
                      {product.fabric}
                    </motion.div>
                  )}
                  {activeTab === 'wash' && (
                    <motion.div
                      key="wash"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-[10px] font-black text-dark uppercase block mb-1">Maintenance & Care Guide:</span>
                      {product.washing}
                    </motion.div>
                  )}
                  {activeTab === 'shipping' && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-[10px] font-black text-dark uppercase block mb-2">Delivery & Returns:</span>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-accent" /> <span>Free dispatch within 24-48 hours.</span></div>
                        <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-accent" /> <span>Secure tracked shipment across India.</span></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 border-t border-[#E8E5DC] pt-6 text-[9px] font-mono uppercase tracking-wider text-dark/50 mt-6">
            <div className="flex flex-col items-center text-center space-y-1.5 bg-white border border-[#E8E5DC] p-2.5 rounded-xl shadow-xs">
              <ShieldCheck className="w-4.5 h-4.5 text-purple-600" />
              <span className="font-bold text-dark text-[8px]">100% Combed Cotton</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1.5 bg-white border border-[#E8E5DC] p-2.5 rounded-xl shadow-xs">
              <RefreshCw className="w-4.5 h-4.5 text-purple-600" />
              <span className="font-bold text-dark text-[8px]">7-Day exchange</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1.5 bg-white border border-[#E8E5DC] p-2.5 rounded-xl shadow-xs">
              <Truck className="w-4.5 h-4.5 text-purple-600" />
              <span className="font-bold text-dark text-[8px]">Secure Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="border-t border-[#E8E5DC] mt-24 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Rating Breakdown */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <span className="text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black block mb-3">VERIFIABLE RATING STATS</span>
              <h2 className="font-display text-2xl sm:text-3xl uppercase font-black text-dark tracking-tight">CUSTOMER REVIEWS</h2>
            </div>

            <div className="hud-card-border">
              <div className="hud-product-card p-6 space-y-4">
                <div className="hud-corner hud-tl" />
                <div className="hud-corner hud-tr" />
                <div className="hud-corner hud-bl" />
                <div className="hud-corner hud-br" />

                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black font-mono text-dark">{avgRating}</span>
                  <div>
                    <div className="flex text-purple-600">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const filled = s <= Math.round(Number(avgRating))
                        return <Star key={s} className={`w-4 h-4 ${filled ? 'fill-purple-600 text-purple-600' : 'text-gray-200 fill-gray-200'}`} />
                      })}
                    </div>
                    <span className="text-[10px] font-mono text-dark2/45 uppercase block mt-0.5 font-bold">Based on {totalReviews} verified rating{totalReviews !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-2 pt-2 border-t border-purple-500/10 font-mono text-[9px] uppercase">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = getStarPercentage(stars)
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-8 shrink-0 font-bold">{stars} Star{stars !== 1 ? 's' : ''}</span>
                        <div className="flex-grow h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right font-black">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Reviews List */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-6">
               {reviewsList.map((rev) => {
                const isMyReview = isCurrentUserReview(rev.name, rev.email, rev.user_id)
                return (
                  <div key={rev.id} className="hud-card-border">
                    <div className="hud-product-card p-6 space-y-3 font-sans">
                      <div className="hud-corner hud-tl" />
                      <div className="hud-corner hud-tr" />
                      <div className="hud-corner hud-bl" />
                      <div className="hud-corner hud-br" />

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="font-mono text-xs font-black uppercase text-dark block leading-none">
                            {rev.name}
                            {isMyReview && <span className="text-purple-600 font-bold lowercase ml-1">(you)</span>}
                            {rev.pending && <span className="text-amber-500 font-mono text-[9px] lowercase ml-2 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">pending approval</span>}
                          </span>
                          <span className="text-[9px] font-mono text-dark/35 mt-1 block font-bold">{rev.date}</span>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex text-purple-600">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
                            ))}
                            {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 text-gray-200 fill-gray-200" />
                            ))}
                          </div>
                          {rev.verified && (
                            <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 mt-1 font-black uppercase tracking-wider">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 relative z-10">
                        <h4 className="font-mono text-xs font-black text-dark uppercase">{rev.title}</h4>
                        <p className="text-xs text-dark/70 leading-relaxed font-sans font-medium">{rev.comment}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Drops Section */}
      <div className="border-t border-[#E8E5DC] mt-24 pt-16">
        <span className="text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black block mb-3">SYNERGY CATALOG SUGGESTIONS</span>
        <h2 className="font-display text-2xl sm:text-3xl uppercase font-black text-dark mb-10 tracking-tight">RECOMMENDED DROPS</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendedProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="hud-card-border"
                onClick={() => {
                  navigate(`/product/${p.id}`)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <div className="hud-product-card cursor-pointer">
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />

                  <span className="hud-hex hud-hex-tl">SUGGESTION_REF</span>
                  <span className="hud-hex hud-hex-tr">0x{p.price.toString(16).toUpperCase()}</span>

                  <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden border-b border-purple-500/10">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                    />
                    <span className="absolute bottom-4 left-4 bg-dark text-primary text-[8px] font-mono tracking-widest uppercase px-2.5 py-1.5 rounded-lg shadow-sm z-20">
                      Unisex Cut
                    </span>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between bg-white relative z-10">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-sans text-sm font-bold uppercase text-dark tracking-tight leading-snug line-clamp-1 group-hover:text-accent transition-colors">{p.name}</h3>
                      <span className="text-sm font-mono font-bold text-dark shrink-0">₹{p.price}</span>
                    </div>
                    <p className="text-[9px] text-dark2/40 font-mono uppercase tracking-wider font-bold">VIEW DROP DETAILS</p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSizeGuideOpen(false)}
              className="absolute inset-0 bg-dark/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream border border-cream3 w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 font-sans"
            >
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-cream3 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4 text-dark" />
              </button>

              <h3 className="font-display text-base font-black uppercase text-dark mb-6">FTW Streetwear Size Guide</h3>
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark">
                      <th className="py-2 font-black uppercase">Size</th>
                      <th className="py-2 font-black uppercase">Chest (Inches)</th>
                      <th className="py-2 font-black uppercase">Length (Inches)</th>
                      <th className="py-2 font-black uppercase">Fit Profile</th>
                    </tr>
                  </thead>
                   <tbody className="divide-y divide-cream3">
                    {product.size_chart && Object.keys(product.size_chart).length > 0 ? (
                      Object.entries(product.size_chart).map(([sz, data]) => (
                        <tr key={sz}>
                          <td className="py-3 font-bold">{sz}</td>
                          <td className="py-3">{data.chest || '-'}</td>
                          <td className="py-3">{data.length || '-'}</td>
                          <td className="py-3 text-dark/60">{data.fit || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="py-3 font-bold">S</td>
                          <td className="py-3">40"</td>
                          <td className="py-3">27.5"</td>
                          <td className="py-3 text-dark/60">Relaxed</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold">M</td>
                          <td className="py-3">42"</td>
                          <td className="py-3">28.5"</td>
                          <td className="py-3 text-dark/60">Oversized</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold">L</td>
                          <td className="py-3">44"</td>
                          <td className="py-3">29.5"</td>
                          <td className="py-3 text-dark/60">Heavy Oversized</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold">XL</td>
                          <td className="py-3">46"</td>
                          <td className="py-3">30.5"</td>
                          <td className="py-3 text-dark/60">Boxy Drop</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-dark/50 leading-relaxed mt-6 font-mono">
                * Note: {product.size_guide || 'FTW designs are intentionally cut drop-shoulder and oversized. Buy one size smaller for regular/standard fits.'}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
)
}
