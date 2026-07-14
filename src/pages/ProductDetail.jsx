import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Heart, ShoppingBag, Flame, Sparkles, RefreshCw, Info, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, X, Star, ShieldCheck, Truck, Check, ShieldAlert, Clock, Zap, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProducts, getApprovedReviews } from '../lib/supabase'
import Loader from '../components/Loader'

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
  const [thumbStartIndex, setThumbStartIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Black')
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('fabric') // 'fabric', 'wash', 'shipping'

  const [reviewsList, setReviewsList] = useState([])
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(4)
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
          let colorsArr = Array.isArray(found.colors) ? found.colors : (found.colors ? found.colors.split(',').map(c => c.trim()) : ['Black', 'White'])
          const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';

          if (found.default_color) {
            const defClean = found.default_color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase();
            const matchedIndex = colorsArr.findIndex(c => cleanColor(c) === defClean);
            if (matchedIndex > -1) {
              const [matchedColor] = colorsArr.splice(matchedIndex, 1);
              colorsArr = [matchedColor, ...colorsArr];
            }
          }
          const imagesArr = Array.isArray(found.images) && found.images.length > 0 ? found.images : (found.image ? [found.image] : [])

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
          if (colorsArr.length > 0) setSelectedColor(initialColor)
        } else {
          const fallback = PRODUCTS_DB[id]
          if (fallback) {
            let colorsArr = [...fallback.colors]
            const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';
            if (fallback.default_color) {
              const defClean = fallback.default_color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase();
              const matchedIndex = colorsArr.findIndex(c => cleanColor(c) === defClean);
              if (matchedIndex > -1) {
                const [matchedColor] = colorsArr.splice(matchedIndex, 1);
                colorsArr = [matchedColor, ...colorsArr];
              }
            }
            resolvedProduct = {
              ...fallback,
              colors: colorsArr
            }
            setProduct(resolvedProduct)
            if (fallback.sizes.length > 0) setSelectedSize(fallback.sizes[0])
            let initialColor = colorsArr[0]
            if (colorsArr.length > 0) setSelectedColor(initialColor)
          }
        }

        // Load recommended products from real list. If database list is empty, fallback to PRODUCTS_DB.
        const sourceList = list && list.length > 0 ? list : Object.values(PRODUCTS_DB)
        const filtered = sourceList.filter(p => String(p.id) !== String(id))
        const recs = filtered.map(foundItem => {
          const sizesArr = Array.isArray(foundItem.sizes) ? foundItem.sizes : (foundItem.sizes ? foundItem.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'])
          const colorsArr = Array.isArray(foundItem.colors) ? foundItem.colors : (foundItem.colors ? foundItem.colors.split(',').map(c => c.trim()) : ['Black', 'White'])
          const imagesArr = Array.isArray(foundItem.images) && foundItem.images.length > 0 ? foundItem.images : (foundItem.image ? [foundItem.image] : [])
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
          const prodReviews = allReviews.filter(r => {
            if (!r.product_name || !resolvedProduct.name) return false
            const rNameClean = r.product_name.toLowerCase().trim()
            const pNameClean = resolvedProduct.name.toLowerCase().trim()
            return rNameClean === pNameClean || rNameClean.includes(pNameClean) || pNameClean.includes(rNameClean)
          })
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

  useEffect(() => {
    if (!product) return;

    const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';

    const colorVariantForImages = (product.variants || []).find(
      v => cleanColor(v.color) === cleanColor(selectedColor) && v.images && v.images.length > 0
    );

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

    const filteredProductImages = (product.images || []).filter(img => !otherColorsMappedImages.has(getUrlId(img)));
    const firstVariantWithImages = (product.variants || []).find(v => v.images && v.images.length > 0) || {};

    const displayImages = (colorVariantForImages && colorVariantForImages.images && colorVariantForImages.images.length > 0)
      ? colorVariantForImages.images
      : (filteredProductImages.length > 0 ? filteredProductImages : (product.images && product.images.length > 0 ? product.images : (firstVariantWithImages.images || [])));

    let imagesToRender = displayImages || [];
    if (product && !product.is_combo) {
      imagesToRender = imagesToRender.filter(img => !img.toLowerCase().includes('combo'));
    }
    const safeActiveImageIdx = activeImageIdx < imagesToRender.length ? activeImageIdx : 0;

    if (imagesToRender.length <= 5) {
      setThumbStartIndex(0)
      return
    }
    if (safeActiveImageIdx < thumbStartIndex) {
      setThumbStartIndex(safeActiveImageIdx)
    } else if (safeActiveImageIdx >= thumbStartIndex + 5) {
      setThumbStartIndex(safeActiveImageIdx - 4)
    }
  }, [product, selectedColor, activeImageIdx, thumbStartIndex])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center font-mono">
        <Loader size="medium" className="mb-3" />
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
      : (product.originalPrice ? Number(product.originalPrice) : null));

  const displayStock = matchingVariant && matchingVariant.stock !== undefined && matchingVariant.stock !== null && matchingVariant.stock !== ''
    ? Number(matchingVariant.stock)
    : (product.variants && product.variants.some(v => cleanColor(v.color) === cleanColor(selectedColor))
      ? 0 // If color variants exist, but not for this specific size, default to 0 (out of stock)
      : (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0));

  const displayImages = (colorVariantForImages && colorVariantForImages.images && colorVariantForImages.images.length > 0)
    ? colorVariantForImages.images
    : (filteredProductImages.length > 0 ? filteredProductImages : (product.images && product.images.length > 0 ? product.images : (firstVariantWithImages.images || [])));

  // Ensure activeImageIdx is valid for current set of images
  let imagesToRender = displayImages || [];
  if (product && !product.is_combo) {
    imagesToRender = imagesToRender.filter(img => !img.toLowerCase().includes('combo'));
  }
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
    let finalColor = selectedColor
    if (product.is_combo && product.colors && product.colors.length === 2) {
      const c1 = product.colors[0].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
      const c2 = product.colors[1].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
      finalColor = `${c1} + ${c2}`
    }
    addToCart(resolvedProduct, selectedSize, finalColor)
    toast.success(`Added ${product.name} [Size ${selectedSize} / Color ${finalColor}] to bag!`, {
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
    let finalColor = selectedColor
    if (product.is_combo && product.colors && product.colors.length === 2) {
      const c1 = product.colors[0].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
      const c2 = product.colors[1].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
      finalColor = `${c1} + ${c2}`
    }
    addToCart(resolvedProduct, selectedSize, finalColor, true)
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 py-8 font-sans text-dark relative z-10"
      >
        {/* Editorial Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-[11.5px] font-mono tracking-widest uppercase text-dark/40 select-none">
          <Link to="/" className="hover:text-purple-600 hover:underline transition-colors duration-200 font-bold">HOME</Link>
          <ChevronRight className="w-3 h-3 text-dark/25" />
          <Link to="/shop" className="hover:text-purple-600 hover:underline transition-colors duration-200 font-bold">SHOP</Link>
          <ChevronRight className="w-3 h-3 text-dark/25" />
          <span className="text-purple-600 font-black">{product.name}</span>
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

                <AnimatePresence mode="wait">
                  {imagesToRender[safeActiveImageIdx] ? (
                    <motion.img
                      key={safeActiveImageIdx}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      src={imagesToRender[safeActiveImageIdx]}
                      alt={product.name}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`w-full h-full cursor-zoom-in ${safeActiveImageIdx === 2 ? 'object-contain bg-white p-4' : 'object-cover'
                        }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-xs font-bold text-dark/30 uppercase">
                      No Image Available
                    </div>
                  )}
                </AnimatePresence>
                {/* Custom Hover Zoom overlay lens panel */}
                <div
                  className="absolute inset-0 pointer-events-none border border-cream3/40 hidden md:block"
                  style={zoomStyle}
                />

                {/* Absolute watermark tag */}
                {product.tag && (
                  <span className="absolute bottom-4 left-4 bg-dark text-primary text-[10px] font-sans tracking-widest uppercase px-3 py-2 rounded-lg shadow-md font-black z-20">
                    {product.tag}
                  </span>
                )}
              </div>
            </div>

            {/* Alternate Thumbnail selector strip */}
            {imagesToRender.length > 1 && (
              <div className="flex flex-row md:flex-col gap-3 shrink-0 justify-start items-center">
                {/* Previous / Up Button */}
                {imagesToRender.length > 5 && (
                  <button
                    onClick={() => {
                      setActiveImageIdx(prev => Math.max(0, prev - 1))
                    }}
                    disabled={safeActiveImageIdx === 0}
                    className={`p-1.5 rounded-lg border transition-all ${safeActiveImageIdx === 0
                      ? 'opacity-40 cursor-not-allowed border-neutral-200 text-neutral-400'
                      : 'border-dark hover:bg-dark hover:text-cream cursor-pointer text-dark bg-white shadow-xs'
                      }`}
                  >
                    <ChevronLeft className="w-4 h-4 md:hidden" />
                    <ChevronUp className="w-4 h-4 hidden md:block" />
                  </button>
                )}

                {/* Thumbnails */}
                <div className="flex flex-row md:flex-col gap-3 shrink-0 justify-start">
                  {imagesToRender.map((img, idx) => {
                    const isVisible = imagesToRender.length <= 5 || (idx >= thumbStartIndex && idx < thumbStartIndex + 5);
                    if (!isVisible) return null;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-14 sm:w-20 aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all bg-cream3 ${safeActiveImageIdx === idx ? 'border-[#8B5CF6] border-[3px] scale-105 shadow-md' : 'border-neutral-200 hover:border-dark/30'
                          }`}
                      >
                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next / Down Button */}
                {imagesToRender.length > 5 && (
                  <button
                    onClick={() => {
                      setActiveImageIdx(prev => Math.min(imagesToRender.length - 1, prev + 1))
                    }}
                    disabled={safeActiveImageIdx >= imagesToRender.length - 1}
                    className={`p-1.5 rounded-lg border transition-all ${safeActiveImageIdx >= imagesToRender.length - 1
                      ? 'opacity-40 cursor-not-allowed border-neutral-200 text-neutral-400'
                      : 'border-dark hover:bg-dark hover:text-cream cursor-pointer text-dark bg-white shadow-xs'
                      }`}
                  >
                    <ChevronRight className="w-4 h-4 md:hidden" />
                    <ChevronDown className="w-4 h-4 hidden md:block" />
                  </button>
                )}
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
                  <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-3">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    <span>SOLD OUT / OUT OF STOCK</span>
                  </div>
                ) : displayStock <= 8 ? (
                  <div className="inline-flex items-center gap-1.5 text-accent bg-accent/5 border border-accent/15 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-3 animate-pulse">
                    <Flame className="w-3.5 h-3.5 fill-accent animate-bounce" />
                    <span>LIMIT ALERT: ONLY {displayStock} PIECES LEFT</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-3">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>IN STOCK: {displayStock} PIECES AVAILABLE</span>
                  </div>
                )
              ) : (
                <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider mb-3">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IN STOCK</span>
                </div>
              )}             {/* Title & Ratings */}
              <div className="space-y-1.5">
                <span className="text-[14px] font-mono uppercase tracking-[0.25em] text-[#8B5CF6] font-black block">{product.category || 'ORIGINAL CATALOG SERIES'}</span>
                <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-black text-dark tracking-tight leading-none">{product.name}</h1>

                <div className="flex items-center gap-2 font-mono text-[11.5px] font-bold">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>{avgRating}</span>
                  </div>
                  <span className="text-dark/20">|</span>
                  <span className="text-dark/50">{totalReviews} Verified Review{totalReviews !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="border-y border-[#E8E5DC]/80 py-2 my-3">
                <div>
                  <span className="text-xs text-dark font-mono uppercase block font-black">RETAIL PRICE</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-dark">₹{displayPrice}</span>
                    {displayOriginalPrice && (
                      <>
                        <span className="text-base sm:text-lg line-through font-mono text-dark/45">₹{displayOriginalPrice}</span>
                        <span className="text-xs font-mono font-black text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg uppercase">
                          {Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-dark/80 text-sm sm:text-[14.5px] leading-relaxed mb-4 font-sans font-bold">{product.description}</p>
              {/* Color selector */}
              {product.colors && product.colors.length > 1 && (
                <div className="mb-3">
                  <span className="text-[11px] text-dark/65 uppercase tracking-widest font-mono font-black block mb-1.5">
                    Choose Color Variant {product.is_combo && <span className="text-purple-600 text-[10px] lowercase font-sans font-bold tracking-normal"> (to preview shirt color)</span>}
                  </span>
                  <div className="flex gap-3 items-center">
                    <div className="flex gap-2 items-center">
                      {product.colors.map((color, idx) => {
                        const hex = resolveColorHex(color);
                        const isActive = selectedColor === color;
                        const isLightColor = hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#fdf6e2' || hex.toLowerCase() === '#faf9f6' || hex.toLowerCase() === '#e1d9c1'

                        return (
                          <div key={color} className="flex items-center">
                            {product.is_combo && idx > 0 && (
                              <span className="text-dark/45 font-sans text-xs font-black mx-1.5">+</span>
                            )}
                            <motion.button
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedColor(color)
                                setActiveImageIdx(0)
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center relative ${isActive
                                ? 'ring-2 ring-offset-2 ring-purple-600 border-transparent scale-110 shadow-md'
                                : 'border-neutral-200 hover:border-neutral-400 hover:scale-105'
                                }`}
                              style={{ backgroundColor: hex }}
                              title={color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}
                            >
                              {isActive && (
                                <span className={`w-2 h-2 rounded-full shadow-xs ${isLightColor ? 'bg-dark' : 'bg-white'
                                  }`} />
                              )}
                            </motion.button>
                          </div>
                        )
                      })}
                    </div>
                    <span className="text-[10px] font-sans text-purple-600 font-black tracking-widest uppercase ml-2 bg-purple-500/5 border border-purple-500/10 px-3 py-1.5 rounded-lg shadow-2xs select-none">
                      {selectedColor.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}
                    </span>
                  </div>

                  {/* Combo Variant Information Banner */}
                  {product.is_combo ? (
                    product.colors && product.colors.length === 2 ? (() => {
                      const c1 = product.colors[0].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                      const c2 = product.colors[1].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                      return (
                        <div className="mt-3 bg-purple-500/5 border border-purple-550/15 p-2.5 rounded-xl flex items-center gap-2 select-none animate-fade-in">
                          <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center shrink-0 text-white">
                            <Info className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-[11px] text-dark/80 font-bold font-sans leading-tight">
                            <span className="text-purple-700 font-extrabold uppercase text-[10px]">Combo Pack Confirmed:</span> You will receive both <span className="text-purple-750 font-extrabold underline decoration-purple-500">{c1}</span> and <span className="text-purple-750 font-extrabold underline decoration-purple-500">{c2}</span> T-shirts included in this combo.
                          </p>
                        </div>
                      )
                    })() : selectedColor && (selectedColor.includes('+') || selectedColor.includes('/') || selectedColor.toLowerCase().includes('and') || selectedColor.toLowerCase().includes('&')) ? (
                      <div className="mt-3 bg-purple-500/5 border border-purple-550/15 p-2.5 rounded-xl flex items-center gap-2 select-none animate-fade-in">
                        <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center shrink-0 text-white">
                          <Info className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-[11px] text-dark/80 font-bold font-sans leading-tight">
                          <span className="text-purple-700 font-extrabold uppercase text-[10px]">Combo Pack Confirmed:</span> You will receive both <span className="text-purple-750 font-extrabold underline decoration-purple-500">{selectedColor.split(/\s*(?:\+|\/|and|&)\s*/i)[0]}</span> and <span className="text-purple-750 font-extrabold underline decoration-purple-500">{selectedColor.split(/\s*(?:\+|\/|and|&)\s*/i)[1] || 'Second'}</span> T-shirts.
                        </p>
                      </div>
                    ) : null
                  ) : (selectedColor && (selectedColor.includes('+') || selectedColor.includes('/') || selectedColor.toLowerCase().includes('and') || selectedColor.toLowerCase().includes('&'))) ? (
                    <div className="mt-3 bg-purple-500/5 border border-purple-550/15 p-2.5 rounded-xl flex items-center gap-2 select-none animate-fade-in">
                      <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center shrink-0 text-white">
                        <Info className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-[11px] text-dark/80 font-bold font-sans leading-tight">
                        <span className="text-purple-700 font-extrabold uppercase text-[10px]">Combo Pack Confirmed:</span> You will receive both <span className="text-purple-750 font-extrabold underline decoration-purple-500">{selectedColor.split(/\s*(?:\+|\/|and|&)\s*/i)[0]}</span> and <span className="text-purple-750 font-extrabold underline decoration-purple-500">{selectedColor.split(/\s*(?:\+|\/|and|&)\s*/i)[1] || 'Second'}</span> T-shirts.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Sizes selector */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1.5">
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
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-12 py-3 border text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${selectedSize === sz
                        ? 'bg-dark border-dark text-primary shadow-md hover:shadow-glow-primary'
                        : 'border-neutral-200 text-dark bg-cream hover:bg-neutral-100 hover:border-dark/30'
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
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBuyNow}
                      className="w-full sm:flex-1 py-4 bg-primary text-dark hover:bg-dark hover:text-cream border border-dark hover:border-transparent transition-all duration-300 font-mono font-black text-[13.5px] uppercase tracking-widest rounded-2xl shadow-sm hover:shadow-glow-primary whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-current animate-pulse" />
                      Buy Now
                    </motion.button>

                    <div className="flex gap-3 flex-1 w-full sm:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleAddToBag}
                        className="flex-grow py-4 bg-dark text-cream hover:bg-primary hover:text-dark transition-all duration-300 font-mono font-black text-[13.5px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 border-none shadow-md hover:shadow-glow-primary"
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

            {/* Customization Feature Promo Banner */}
            {product.customizable && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  borderColor: [
                    "rgba(139, 92, 246, 0.2)",
                    "rgba(214, 255, 64, 0.45)",
                    "rgba(99, 102, 241, 0.4)",
                    "rgba(139, 92, 246, 0.2)"
                  ],
                  boxShadow: [
                    "0 0 4px rgba(139, 92, 246, 0.05)",
                    "0 0 16px rgba(139, 92, 246, 0.35)",
                    "0 0 16px rgba(214, 255, 64, 0.25)",
                    "0 0 4px rgba(139, 92, 246, 0.05)"
                  ]
                }}
                transition={{
                  duration: 0.4,
                  borderColor: { repeat: Infinity, duration: 4, ease: "linear" },
                  boxShadow: { repeat: Infinity, duration: 4, ease: "linear" }
                }}
                className="relative p-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-550/10 via-indigo-500/10 to-pink-500/5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden my-4 group"
              >
                <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-purple-500/15 blur-xl pointer-events-none" />
                <div className="flex items-start gap-2.5 relative z-10">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 1 }}
                    className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md"
                  >
                    <Palette className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="text-[9.5px] font-sans font-black uppercase tracking-wider text-purple-700 leading-tight">CUSTOM DESIGN LAB</h4>
                    <p className="text-[11.5px] text-dark/75 mt-0.5 leading-tight font-bold font-sans">
                      Customization available. Click to personalize.
                    </p>
                  </div>
                </div>
                <motion.button
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0px rgba(139, 92, 246, 0)",
                      "0 0 12px rgba(139, 92, 246, 0.5)",
                      "0 0 0px rgba(139, 92, 246, 0)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(139, 92, 246, 0.6)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/customizer', { state: { product } })}
                  className="px-3.5 py-1.5 bg-purple-600 text-white hover:bg-dark hover:text-[#D6FF40] transition-all font-sans font-black text-[8.5px] uppercase tracking-widest rounded-lg border-none cursor-pointer shrink-0 relative z-10 whitespace-nowrap self-start sm:self-auto"
                >
                  CUSTOMIZE HERE
                </motion.button>
              </motion.div>
            )}

            {/* Premium Tabbed details */}
            <div className="bg-gradient-to-br from-[#FAF9F6] to-white border border-[#E8E5DC] rounded-[24px] shadow-xs overflow-hidden my-6">
              {/* Tab headers */}
              <div className="flex bg-[#FAF9F6] border-b border-[#E8E5DC]/80 p-1.5 gap-1.5">
                <button
                  onClick={() => setActiveTab('fabric')}
                  className={`flex-1 py-2.5 text-center text-[11.5px] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === 'fabric' ? 'bg-dark text-primary shadow-xs' : 'text-dark/50 hover:bg-[#F3F2EE] hover:text-dark'}`}
                >
                  Fabric & Fit
                </button>
                <button
                  onClick={() => setActiveTab('wash')}
                  className={`flex-1 py-2.5 text-center text-[11.5px] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === 'wash' ? 'bg-dark text-primary shadow-xs' : 'text-dark/50 hover:bg-[#F3F2EE] hover:text-dark'}`}
                >
                  Care Details
                </button>
              </div>

              {/* Tab contents */}
              <div className="p-5 text-xs text-dark/85 leading-relaxed font-sans font-bold">
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
                </AnimatePresence>
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
                <span className="text-purple-600 font-mono uppercase tracking-[0.25em] text-[12.5px] font-black block mb-3">VERIFIABLE RATING STATS</span>
                <h2 className="font-display text-2xl sm:text-3xl uppercase font-black text-dark tracking-tight">CUSTOMER REVIEWS</h2>
              </div>

              <div className="bg-gradient-to-br from-[#FAF9F6] to-white border border-[#E8E5DC] p-6 sm:p-7 rounded-[24px] shadow-xs space-y-5">
                <div className="flex items-center gap-4 bg-white border border-[#E8E5DC]/70 p-4 rounded-2xl shadow-xs">
                  <div className="w-14 h-14 bg-purple-500/5 text-purple-600 border border-purple-500/10 rounded-2xl flex items-center justify-center text-3xl font-black font-mono shadow-inner shrink-0">
                    {avgRating}
                  </div>
                  <div>
                    <div className="flex text-amber-400 gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const filled = s <= Math.round(Number(avgRating))
                        return <Star key={s} className={`w-4 h-4 ${filled ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                      })}
                    </div>
                    <span className="text-[10px] text-dark/50 uppercase block mt-1 font-sans font-extrabold tracking-wider">Based on {totalReviews} verified rating{totalReviews !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3 pt-2 font-sans text-[11px]">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = getStarPercentage(stars)
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-12 shrink-0 font-bold text-dark/70 text-[10px] uppercase font-mono">{stars} Star{stars !== 1 ? 's' : ''}</span>
                        <div className="flex-grow h-2.5 bg-cream3 border border-[#E8E5DC]/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right font-black font-mono text-dark/80 text-[10px]">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Reviews List */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-6">
                {reviewsList.slice(0, visibleReviewsCount).map((rev) => {
                  const isMyReview = isCurrentUserReview(rev.name, rev.email, rev.user_id)
                  return (
                    <div 
                      key={rev.id} 
                      className="bg-white border border-[#E8E5DC] rounded-2xl p-5 sm:p-6 shadow-3xs hover:shadow-2xs transition-all duration-300 space-y-4 relative"
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3.5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Avatar initial */}
                          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-sans font-black text-sm uppercase shrink-0">
                            {rev.name ? rev.name.charAt(0) : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-[13.5px] font-black uppercase text-dark block leading-none">
                                {rev.name}
                                {isMyReview && <span className="text-purple-600 font-bold lowercase ml-1">(you)</span>}
                              </span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 font-black uppercase tracking-wider">
                                  Verified Buyer
                                </span>
                              )}
                              {rev.pending && (
                                <span className="text-amber-500 font-mono text-[10px] lowercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  pending approval
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-dark2/45 mt-1 block font-bold">{rev.date}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5 shrink-0 pt-1">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-gray-200 fill-gray-200" />
                          ))}
                        </div>
                      </div>

                      {/* Comment body */}
                      <div className="space-y-1.5 pl-0 md:pl-[54px] relative z-10">
                        <h4 className="font-mono text-[13.5px] font-black text-dark uppercase tracking-wider">{rev.title}</h4>
                        <p className="text-[13px] text-dark2/80 leading-relaxed font-sans font-bold italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  )
                })}

                {reviewsList.length > visibleReviewsCount && (
                  <div className="flex justify-center pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setVisibleReviewsCount(prev => prev + 4)}
                      className="px-8 py-3.5 bg-dark text-primary hover:bg-[#8B5CF6] hover:text-white border-none font-mono font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all cursor-pointer"
                    >
                      See More Reviews
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Drops Section */}
        <div className="border-t border-[#E8E5DC] mt-24 pt-16">
          <span className="text-purple-600 font-mono uppercase tracking-[0.25em] text-[12.5px] font-black block mb-3">SYNERGY CATALOG SUGGESTIONS</span>
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

                  <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden border-b border-purple-500/10 flex items-center justify-center">
                    {p.images && p.images[0] && p.images[0] !== '/images/1.1.jpeg' ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="text-xs font-bold font-sans text-dark/30 uppercase text-center px-4">No Image</div>
                    )}
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
                className="bg-gradient-to-br from-[#FAF9F6] to-white border border-[#E8E5DC] w-full max-w-lg p-7 sm:p-8 rounded-[28px] shadow-2xl relative z-10 font-sans"
              >
                <button
                  onClick={() => setSizeGuideOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F3F2EE] transition-all bg-transparent border-none cursor-pointer hover:scale-105"
                >
                  <X className="w-4 h-4 text-dark" />
                </button>

                <div className="border-b border-[#E8E5DC] pb-4 mb-5">
                  <span className="text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black block mb-1">FITMENT SYSTEM INFO</span>
                  <h3 className="font-display text-lg sm:text-xl font-black uppercase text-dark tracking-tight">FTW Streetwear Size Guide</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E8E5DC] text-[10px] text-dark/50 uppercase tracking-widest font-mono font-black">
                        <th className="pb-3">Size</th>
                        <th className="pb-3 text-center">Chest (Inches)</th>
                        <th className="pb-3 text-center">Length (Inches)</th>
                        <th className="pb-3 text-right">Fit Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DC]/60 font-sans font-bold text-dark/95">
                      {product.size_chart && Object.keys(product.size_chart).length > 0 ? (
                        Object.entries(product.size_chart).map(([sz, data]) => (
                          <tr key={sz} className="hover:bg-[#FAF9F6]/50 transition-colors">
                            <td className="py-3 font-mono text-sm font-black text-purple-600">{sz}</td>
                            <td className="py-3 text-center font-mono">{data.chest || '-'}</td>
                            <td className="py-3 text-center font-mono">{data.length || '-'}</td>
                            <td className="py-3 text-right">
                              <span className="inline-block text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-600 border border-purple-500/10 font-bold">
                                {data.fit || '-'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="hover:bg-[#FAF9F6]/50 transition-colors">
                            <td className="py-3 font-mono text-sm font-black text-purple-600">S</td>
                            <td className="py-3 text-center font-mono">40"</td>
                            <td className="py-3 text-center font-mono">27.5"</td>
                            <td className="py-3 text-right">
                              <span className="inline-block text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-600 border border-purple-500/10 font-bold">
                                Relaxed
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F6]/50 transition-colors">
                            <td className="py-3 font-mono text-sm font-black text-purple-600">M</td>
                            <td className="py-3 text-center font-mono">42"</td>
                            <td className="py-3 text-center font-mono">28.5"</td>
                            <td className="py-3 text-right">
                              <span className="inline-block text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-600 border border-purple-500/10 font-bold">
                                Oversized
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F6]/50 transition-colors">
                            <td className="py-3 font-mono text-sm font-black text-purple-600">L</td>
                            <td className="py-3 text-center font-mono">44"</td>
                            <td className="py-3 text-center font-mono">29.5"</td>
                            <td className="py-3 text-right">
                              <span className="inline-block text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-600 border border-purple-500/10 font-bold">
                                Heavy Oversized
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F6]/50 transition-colors">
                            <td className="py-3 font-mono text-sm font-black text-purple-600">XL</td>
                            <td className="py-3 text-center font-mono">46"</td>
                            <td className="py-3 text-center font-mono">30.5"</td>
                            <td className="py-3 text-right">
                              <span className="inline-block text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-600 border border-purple-500/10 font-bold">
                                Boxy Drop
                              </span>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-cream/75 border border-[#E8E5DC] rounded-2xl text-[10px] text-dark/65 leading-relaxed font-sans font-bold mt-6">
                  * Note: {product.size_guide || 'FTW designs are intentionally cut drop-shoulder and oversized. Buy one size smaller for regular/standard fits.'}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
