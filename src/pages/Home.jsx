import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Eye, Upload, Palette, Check, ArrowRight,
  Heart, Star, Flame, Sparkles, X, Mail, Bell, Gamepad2, Zap, Swords, Target, Trophy, Laptop, Crown
} from 'lucide-react'
import { getHomepageConfig, getProducts, getProductRating, getProductReviewCount } from '../lib/supabase'
import Hero from '../components/Hero'
import FeaturedCollection from '../components/FeaturedCollection'
import SaleArchive from '../components/SaleArchive'
import CustomDropSection from '../components/CustomDropSection'
import NextDropSection from '../components/NextDropSection'



// Static fallback featured products
const DEFAULT_FEATURED_PRODUCTS = [
  {
    id: 'default-1',
    name: 'Vanguard Core Classic Tee',
    price: 1499,
    tag: 'DROP 01',
    imageFront: '/images/1.1.jpeg',
    imageBack: '/images/1.1.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    available: true,
    details: 'Screen Print • 240 GSM Heavy Cotton'
  },
  {
    id: 'default-2',
    name: 'Cyber Sigil Reflective Tee',
    price: 1699,
    tag: 'NEW',
    imageFront: '/images/2.1.jpeg',
    imageBack: '/images/2.1.jpeg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    available: true,
    details: 'Reflective Overlay • 260 GSM French Terry'
  },
  {
    id: 'default-3',
    name: 'Minimalist Debossed Monogram',
    price: 1899,
    tag: 'LIMITED',
    imageFront: '/images/4.1.jpeg',
    imageBack: '/images/4.1.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream'],
    available: true,
    details: 'Debossed Rubber Logo • 240 GSM Compact Cotton'
  },
]

// Static fallback coming soon images
const DEFAULT_COMING_SOON_IMAGES = [
  { url: '/images/1.1.jpeg', label: 'Vanguard Alpha Oversized Hoodie' },
  { url: '/images/2.1.jpeg', label: 'Sigil Cyberpunk Cargo Pants' },
  { url: '/images/4.1.jpeg', label: 'Debossed Satori Shadow Tee' },
]

// Technical specification selector mapping
const getTechSpecs = (label) => {
  const specs = {
    'Vanguard Alpha Oversized Hoodie': {
      gsm: '380 GSM',
      fabric: '100% French Terry Cotton',
      color: 'Matte Obsidian Black',
      details: 'Dual-lined hood, drop shoulder, raw edge detail'
    },
    'Sigil Cyberpunk Cargo Pants': {
      gsm: '280 GSM',
      fabric: 'Twill / Ripstop Blend',
      color: 'Acid Wash Charcoal',
      details: '8-pocket utility layout, adjustable strap system'
    },
    'Debossed Satori Shadow Tee': {
      gsm: '260 GSM',
      fabric: 'Premium Compact Cotton',
      color: 'Aura Off-White',
      details: 'High-density debossed branding, silicon wash treatment'
    }
  }
  return specs[label] || {
    gsm: '260 GSM',
    fabric: '100% Heavyweight Cotton',
    color: 'Streetwear Dye Wash',
    details: 'Custom silhouette fit, screen printed graphics'
  }
}



export default function Home() {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Hero images
  const [heroImages, setHeroImages] = useState('')
  const [allProducts, setAllProducts] = useState([])

  const getProductForHeroImage = (item) => {
    if (!item) return null;
    let parsedItem = item;
    if (typeof item === 'string' && item.trim().startsWith('{')) {
      try { parsedItem = JSON.parse(item); } catch (e) { }
    }
    const assignedId = typeof parsedItem === 'object' ? parsedItem?.productId : null;

    // Only match if assignedId is explicitly set from Admin panel
    if (assignedId && allProducts && allProducts.length > 0) {
      return allProducts.find(p => p.id === assignedId) || null;
    }

    return null;
  }

  // Featured products
  const [featuredProducts, setFeaturedProducts] = useState(DEFAULT_FEATURED_PRODUCTS)
  const [activeFeaturedImageIndexes, setActiveFeaturedImageIndexes] = useState({})

  // Sale products
  const [saleProducts, setSaleProducts] = useState([])

  // Quick view
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [selectedSizes, setSelectedSizes] = useState({})
  const [selectingSizeForFeatured, setSelectingSizeForFeatured] = useState(null)

  // Notify
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notified, setNotified] = useState(false)

  // Active sneak peek image index
  const [activeSneakPeek, setActiveSneakPeek] = useState(0)

  // Countdown
  const [countdownTarget, setCountdownTarget] = useState('2025-12-31T00:00:00')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Coming soon data
  const [comingSoonTitle, setComingSoonTitle] = useState('SATORI SHADOW COLLECTION')
  const [comingSoonSubtitle, setComingSoonSubtitle] = useState('NEXT DROP • SNEAK PEEK')
  const [comingSoonDescription, setComingSoonDescription] = useState('')
  const [comingSoonImages, setComingSoonImages] = useState(DEFAULT_COMING_SOON_IMAGES)
  const [heroBgBanner, setHeroBgBanner] = useState('/images/banner.webp')
  const [heroBgBannerMobile, setHeroBgBannerMobile] = useState('')

  // Mouse coordinates tracking for subtle 3D parallax on Hero model
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 })

  const handleHeroMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5 // -0.5 to 0.5
    const y = (e.clientY - top) / height - 0.5
    setHeroMouse({ x, y })
  }

  const handleHeroMouseLeave = () => {
    setHeroMouse({ x: 0, y: 0 })
  }

  // Magnetic button hover states
  const [magnetPrimary, setMagnetPrimary] = useState({ x: 0, y: 0 })
  const [magnetSecondary, setMagnetSecondary] = useState({ x: 0, y: 0 })

  const handleMagnetPrimaryMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - (left + width / 2)
    const y = e.clientY - (top + height / 2)
    setMagnetPrimary({ x: x * 0.35, y: y * 0.35 })
  }

  const handleMagnetSecondaryMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - (left + width / 2)
    const y = e.clientY - (top + height / 2)
    setMagnetSecondary({ x: x * 0.35, y: y * 0.35 })
  }

  const handleMagnetLeave = () => {
    setMagnetPrimary({ x: 0, y: 0 })
    setMagnetSecondary({ x: 0, y: 0 })
  }

  // DTF Config state
  const CLIENT_PRESETS = {
    CN001: {
      name: 'Vanguard Core Classic',
      pdf: 'FTW_TS_CN001.pdf',
      color: 'Black',
      position: 'Front Center',
      technique: 'Cut & Sew + High-Density Screen Print',
      fabric: '240 GSM Heavy Cotton',
      content: '100% Cotton',
      preview: '/images/1.1.jpeg'
    },
    CN002: {
      name: 'Cyber Sigil Reflective',
      pdf: 'FTW_TS_CN002.pdf',
      color: 'Black',
      position: 'Front Center',
      technique: 'Screen Print + Reflective Neon Overlay',
      fabric: '260 GSM French Terry',
      content: '100% Cotton',
      preview: '/images/2.1.jpeg'
    },
    CN003: {
      name: 'Sunset Meditation Art',
      pdf: 'FTW_TS_CN003.pdf',
      color: 'Cream',
      position: 'Large Back',
      technique: 'Screen Print + Puff Print Art',
      fabric: '220 GSM French Terry',
      content: '100% Cotton',
      preview: '/images/design_cn003.png'
    },
    CN004: {
      name: 'Minimalist Debossed Monogram',
      pdf: 'FTW_TS_CN004.pdf',
      color: 'Cream',
      position: 'Left Chest',
      technique: 'Debossed Rubber Logo',
      fabric: '240 GSM Soft Compact Cotton',
      content: '100% Cotton',
      preview: '/images/4.1.jpeg'
    },
    CN005: {
      name: 'Gaming Controller Lossless Art',
      pdf: 'FTW_TS_CN005.pdf',
      color: 'Cream',
      position: 'Large Back',
      technique: 'Cut & Sew + Screen Print + Puff Print + Contrast Neck Band',
      fabric: '220 GSM French Terry',
      content: '100% Cotton',
      preview: '/images/design_cn005.png'
    }
  }

  const [dtfSourceType, setDtfSourceType] = useState('custom')
  const [dtfColor, setDtfColor] = useState('Black')
  const [dtfSize, setDtfSize] = useState('M')
  const [dtfQty, setDtfQty] = useState(1)
  const [dtfUploadedFile, setDtfUploadedFile] = useState(null)
  const [dtfArtwork, setDtfArtwork] = useState('Front Center')
  const [dtfPreviewUrl, setDtfPreviewUrl] = useState(null)

  const baseDtfPrice = 1499
  const printDtfPrice = 500
  const totalDtfEstimate = (baseDtfPrice + printDtfPrice) * dtfQty

  // Live Timer & Dynamic Configuration Load Effect
  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        const [config, dbProducts] = await Promise.all([
          getHomepageConfig(),
          getProducts()
        ])

        if (dbProducts && dbProducts.length > 0) {
          setAllProducts(dbProducts)
        }

        if (config) {
          if (config.hero_images && config.hero_images.length > 0) {
            setHeroImages(config.hero_images)
          }
          setComingSoonTitle(config.coming_soon_title || 'SATORI SHADOW COLLECTION')
          setComingSoonSubtitle(config.coming_soon_subtitle || 'NEXT DROP SNEAK PEEK')
          setComingSoonDescription(config.coming_soon_description || '')
          if (config.coming_soon_countdown) {
            setCountdownTarget(config.coming_soon_countdown)
          }
          if (config.coming_soon_images && config.coming_soon_images.length > 0) {
            setComingSoonImages(config.coming_soon_images)
          }
          if (config.hero_bg_banner) {
            setHeroBgBanner(config.hero_bg_banner)
          }
          if (config.hero_bg_banner_mobile) {
            setHeroBgBannerMobile(config.hero_bg_banner_mobile)
          }

          // Helper to resolve display image (front)
          const getProductDisplayImage = (prod) => {
            if (!prod) return '/images/Regular-T.png';
            const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';
            const colorsArr = Array.isArray(prod.colors) ? prod.colors : (typeof prod.colors === 'string' ? prod.colors.split(',').map(c => c.trim()) : []);
            const defaultColorName = prod.default_color ? cleanColor(prod.default_color) : (colorsArr.length > 0 ? cleanColor(colorsArr[0]) : '');
            let resolvedVariants = prod.variants || [];
            if (typeof resolvedVariants === 'string') {
              try { resolvedVariants = JSON.parse(resolvedVariants); } catch (e) { resolvedVariants = []; }
            }
            const defaultVariant = Array.isArray(resolvedVariants) ? resolvedVariants.find(v => cleanColor(v.color) === defaultColorName && Array.isArray(v.images) && v.images.length > 0) : null;
            if (defaultVariant && defaultVariant.images[0]) return defaultVariant.images[0];
            if (prod.image) return prod.image;
            if (Array.isArray(prod.images) && prod.images.length > 0) return prod.images[0];
            return '/images/Regular-T.png';
          };

          // Helper to resolve second image (back)
          const getProductBackImage = (prod) => {
            if (!prod) return '/images/Regular-T.png';
            const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';
            const colorsArr = Array.isArray(prod.colors) ? prod.colors : (typeof prod.colors === 'string' ? prod.colors.split(',').map(c => c.trim()) : []);
            const defaultColorName = prod.default_color ? cleanColor(prod.default_color) : (colorsArr.length > 0 ? cleanColor(colorsArr[0]) : '');
            let resolvedVariants = prod.variants || [];
            if (typeof resolvedVariants === 'string') {
              try { resolvedVariants = JSON.parse(resolvedVariants); } catch (e) { resolvedVariants = []; }
            }
            const defaultVariant = Array.isArray(resolvedVariants) ? resolvedVariants.find(v => cleanColor(v.color) === defaultColorName && Array.isArray(v.images) && v.images.length > 0) : null;
            if (defaultVariant && defaultVariant.images.length > 1) return defaultVariant.images[1];
            if (Array.isArray(prod.images) && prod.images.length > 1) return prod.images[1];
            if (prod.image) return prod.image;
            return '/images/Regular-T.png';
          };

          // Map featured product IDs to actual product objects from db
          if (config.featured_product_ids && config.featured_product_ids.length > 0 && dbProducts && dbProducts.length > 0) {
            const featured = dbProducts.filter(p => config.featured_product_ids.includes(p.id))
            const mappedFeatured = featured.map(p => ({
              ...p,
              imageFront: getProductDisplayImage(p),
              imageBack: getProductBackImage(p),
              details: p.tag ? `${p.tag} • ${p.category}` : p.category
            }))
            if (mappedFeatured.length > 0) {
              setFeaturedProducts(mappedFeatured)
            }
          }

          // Map sale product IDs to actual product objects from db
          if (config.sale_product_ids && config.sale_product_ids.length > 0 && dbProducts && dbProducts.length > 0) {
            const sale = dbProducts.filter(p => config.sale_product_ids.includes(p.id))
            const mappedSale = sale.map(p => ({
              ...p,
              imageFront: getProductDisplayImage(p),
              imageBack: getProductBackImage(p),
              salePrice: p.price,
              originalPrice: p.originalPrice || Math.round(p.price * 1.3),
              discountPercent: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 30,
              color: p.colors?.[0] || 'Carbon Black'
            }))
            setSaleProducts(mappedSale)
          } else {
            setSaleProducts([])
          }
        }
      } catch (err) {
        console.error("Error loading homepage dynamic config:", err)
      }
    }

    loadHomepageData()
  }, [])

  // Live Timer Effect based on countdownTarget
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(countdownTarget) - +new Date()
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }
      setTimeLeft(newTimeLeft)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [countdownTarget])

  // Auto-advance sneak peek teaser images every 4 seconds
  useEffect(() => {
    if (!comingSoonImages || comingSoonImages.length <= 1) return
    const interval = setInterval(() => {
      setActiveSneakPeek((prev) => (prev + 1) % comingSoonImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [comingSoonImages])

  // Auto-rotate product images (front/back) every 4 seconds
  useEffect(() => {
    const products = [...(featuredProducts || []), ...(saleProducts || [])]
    if (products.length === 0) return
    const interval = setInterval(() => {
      setActiveFeaturedImageIndexes((prev) => {
        const next = { ...prev }
        products.forEach((p) => {
          if (p.imageBack) {
            next[p.id] = prev[p.id] === 1 ? 0 : 1
          }
        })
        return next
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [featuredProducts, saleProducts])

  const { setCartOpen } = useCart()

  const handleNotifyMe = (e) => {
    e.preventDefault()
    if (!notifyEmail) return
    setNotified(true)
    toast.success("Locked in! Stay alert for drop notices.", {
      icon: '⚡',
      style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
    })
    setNotifyEmail('')
  }

  const handleAddToCart = (product, isSale = false) => {
    const size = isSale ? product.sizes[0] : selectedSizes[product.id]
    const cartItem = {
      id: `${product.id}-${size}`,
      name: product.name,
      price: isSale ? product.salePrice : product.price,
      image: isSale ? product.imageFront : product.imageFront
    }
    addToCart(cartItem, size)
    toast.success(`Added ${product.name} [Size ${size}] to bag!`, {
      style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setDtfUploadedFile(file.name)
      setDtfPreviewUrl(URL.createObjectURL(file))
      toast.success(`Design "${file.name}" uploaded successfully!`, {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
    }
  }

  const handleOrderDtf = () => {
    if (dtfSourceType === 'custom' && !dtfUploadedFile) {
      toast.error("Please upload a design file first.", {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return
    }
    const isPreset = dtfSourceType !== 'custom'
    const preset = isPreset ? CLIENT_PRESETS[dtfSourceType] : null

    const customProduct = {
      id: isPreset ? `client-preset-${dtfSourceType}-${Date.now()}` : `custom-dtf-${Date.now()}`,
      name: isPreset
        ? `Client Design Preset (${preset.pdf})`
        : `Custom DTF Tee (${dtfColor} / ${dtfArtwork})`,
      price: baseDtfPrice + printDtfPrice,
      image: isPreset
        ? (dtfSourceType === 'CN003' || dtfSourceType === 'CN005' ? `/images/design_cn00${dtfSourceType === 'CN003' ? '3' : '5'}.png` : preset.preview)
        : (dtfColor === 'Black'
          ? '/images/1.1.jpeg'
          : '/images/2.1.jpeg')
    }
    for (let i = 0; i < dtfQty; i++) {
      addToCart(customProduct, dtfSize)
    }
    toast.success(
      isPreset
        ? `${dtfQty}x Client Design "${preset.pdf}" added to bag!`
        : `${dtfQty}x Custom DTF Print T-shirts added to bag!`,
      { style: { background: '#0B0B0B', color: '#FFFFFF' } }
    )
  }

  return (
    <div className="bg-cream text-dark min-h-screen relative overflow-hidden font-sans bg-grid-dots bg-grain">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(204,255,0,0.12),rgba(255,255,255,0))] pointer-events-none z-0" />

      {/* Large Decorative Gaming Backdrop Icons (10 scattered icons - far left & right sides) */}
      <div className="absolute right-[-8%] md:right-[2%] top-[12%] md:top-[20%] opacity-[0.3] md:opacity-[0.35] text-purple-600 pointer-events-none z-10 md:z-0">
        <Gamepad2 className="w-[100px] h-[100px] md:w-[160px] md:h-[160px] rotate-[15deg]" />
      </div>
      <div className="absolute left-[-8%] md:left-[2%] top-[22%] md:top-[27%] opacity-[0.3] md:opacity-[0.3] text-purple-600 pointer-events-none z-10 md:z-0">
        <Swords className="w-[90px] h-[90px] md:w-[140px] md:h-[140px] rotate-[-20deg]" />
      </div>
      <div className="absolute right-[-5%] md:right-[2%] top-[32%] md:top-[35%] opacity-[0.3] md:opacity-[0.32] text-purple-600 pointer-events-none z-10 md:z-0">
        <Target className="w-[95px] h-[95px] md:w-[150px] md:h-[150px] rotate-[35deg]" />
      </div>
      <div className="absolute left-[-8%] md:left-[2%] top-[42%] md:top-[43%] opacity-[0.3] md:opacity-[0.28] text-purple-600 pointer-events-none z-10 md:z-0">
        <Trophy className="w-[90px] h-[90px] md:w-[140px] md:h-[140px] rotate-[-10deg]" />
      </div>
      <div className="absolute right-[-5%] md:right-[2%] top-[52%] md:top-[50%] opacity-[0.3] md:opacity-[0.26] text-purple-600 pointer-events-none z-10 md:z-0">
        <Laptop className="w-[85px] h-[85px] md:w-[130px] md:h-[130px] rotate-[12deg]" />
      </div>
      <div className="absolute left-[-5%] md:left-[2%] top-[62%] md:top-[57%] opacity-[0.3] md:opacity-[0.28] text-purple-600 pointer-events-none z-10 md:z-0">
        <Crown className="w-[90px] h-[90px] md:w-[140px] md:h-[140px] rotate-[15deg]" />
      </div>
      <div className="absolute right-[-8%] md:right-[2%] top-[72%] md:top-[65%] opacity-[0.3] md:opacity-[0.3] text-purple-600 pointer-events-none z-10 md:z-0">
        <Flame className="w-[85px] h-[85px] md:w-[130px] md:h-[130px] rotate-[-15deg]" />
      </div>
      <div className="absolute left-[-5%] md:left-[2%] top-[82%] md:top-[73%] opacity-[0.3] md:opacity-[0.32] text-purple-600 pointer-events-none z-10 md:z-0">
        <Sparkles className="w-[90px] h-[90px] md:w-[140px] md:h-[140px] rotate-[25deg]" />
      </div>
      <div className="absolute right-[-8%] md:right-[2%] top-[92%] md:top-[80%] opacity-[0.3] md:opacity-[0.26] text-purple-600 pointer-events-none z-10 md:z-0">
        <Gamepad2 className="w-[95px] h-[95px] md:w-[150px] md:h-[150px] rotate-[-30deg]" />
      </div>
      <div className="absolute left-[-8%] md:left-[2%] top-[97%] md:top-[87%] opacity-[0.3] md:opacity-[0.22] text-purple-600 pointer-events-none z-10 md:z-0">
        <Swords className="w-[85px] h-[85px] md:w-[130px] md:h-[130px] rotate-[45deg]" />
      </div>

      {/* Premium Hero Stage Section */}
      <Hero heroImages={heroImages} heroBgBanner={heroBgBanner} heroBgBannerMobile={heroBgBannerMobile} allProducts={allProducts} />

      {/* Infinite Scrolling Marquee */}
      <div className="bg-[#0B0B0B] text-purple-400 border-y border-purple-500/20 py-4 overflow-hidden relative z-20 select-none shadow-[0_0_15px_rgba(124,58,237,0.15)]">
        <div className="flex whitespace-nowrap animate-marquee-left font-display text-[10px] md:text-sm font-black uppercase tracking-[0.25em]">
          <span>LEVEL UP YOUR STYLE • MISSION CONFIRMED • NO RESTOCK • ULTRA-SPEC COMBED COTTON • SYSTEM LOADED // 100% CONFIDENCE • LEVEL UP YOUR STYLE • MISSION CONFIRMED • NO RESTOCK • ULTRA-SPEC COMBED COTTON • SYSTEM LOADED // 100% CONFIDENCE • </span>
          <span>LEVEL UP YOUR STYLE • MISSION CONFIRMED • NO RESTOCK • ULTRA-SPEC COMBED COTTON • SYSTEM LOADED // 100% CONFIDENCE • LEVEL UP YOUR STYLE • MISSION CONFIRMED • NO RESTOCK • ULTRA-SPEC COMBED COTTON • SYSTEM LOADED // 100% CONFIDENCE • </span>
        </div>
      </div>
      <FeaturedCollection
        featuredProducts={featuredProducts}
        activeFeaturedImageIndexes={activeFeaturedImageIndexes}
        toggleWishlist={toggleWishlist}
        isInWishlist={isInWishlist}
        getProductRating={getProductRating}
        getProductReviewCount={getProductReviewCount}
        addToCart={addToCart}
        toast={toast}
      />


      {/* Infinite Moving Marquee Ticker Stripe 2 (Reverse movement) */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border-y border-indigo-500/30 py-4 overflow-hidden relative z-20 select-none shadow-[0_0_15px_rgba(99,102,241,0.15)]">
        <div className="flex whitespace-nowrap animate-marquee-right font-display text-[9px] md:text-xs font-black uppercase tracking-[0.3em]">
          <span>TELEMETRY ONLINE • CHIEF COMMAND: FTW DROP 01 • UNLOCKED ARCHIVE DEALS • SYSTEM_UP: 30%+ DISCOUNTS • TELEMETRY ONLINE • CHIEF COMMAND: FTW DROP 01 • UNLOCKED ARCHIVE DEALS • SYSTEM_UP: 30%+ DISCOUNTS • </span>
          <span>TELEMETRY ONLINE • CHIEF COMMAND: FTW DROP 01 • UNLOCKED ARCHIVE DEALS • SYSTEM_UP: 30%+ DISCOUNTS • TELEMETRY ONLINE • CHIEF COMMAND: FTW DROP 01 • UNLOCKED ARCHIVE DEALS • SYSTEM_UP: 30%+ DISCOUNTS • </span>
        </div>
      </div>

      {/* Sale Section */}
      {saleProducts && saleProducts.length > 0 && (
        <SaleArchive
          saleProducts={saleProducts}
          activeFeaturedImageIndexes={activeFeaturedImageIndexes}
          toggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist}
          getProductRating={getProductRating}
          getProductReviewCount={getProductReviewCount}
          addToCart={addToCart}
          toast={toast}
        />
      )}

      {/* Custom Drop Section */}
      <CustomDropSection user={user} toast={toast} navigate={navigate} />
      {/* Next Drop Section */}
      <NextDropSection
        comingSoonSubtitle={comingSoonSubtitle}
        comingSoonTitle={comingSoonTitle}
        comingSoonDescription={comingSoonDescription}
        timeLeft={timeLeft}
        countdownTarget={countdownTarget}
        notified={notified}
        handleNotifyMe={handleNotifyMe}
        notifyEmail={notifyEmail}
        setNotifyEmail={setNotifyEmail}
        activeSneakPeek={activeSneakPeek}
        setActiveSneakPeek={setActiveSneakPeek}
        comingSoonImages={comingSoonImages}
      />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setQuickViewProduct(null)} className="absolute inset-0 bg-dark/60 backdrop-blur-xs" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream border border-cream3 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:max-h-[unset] overflow-y-auto md:overflow-y-visible"
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 bg-cream border border-cream3 p-2 rounded-full hover:bg-cream3 cursor-pointer z-10"
            >
              <X className="w-4 h-4 text-dark" />
            </button>

            <div className="aspect-[4/5] bg-cream3 w-full">
              <img
                src={quickViewProduct.imageFront}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[9px] sm:text-[10px] text-accent font-sans uppercase tracking-widest block mb-1">CURRENT DROP 01</span>
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-dark mb-1 leading-tight">{quickViewProduct.name}</h3>
                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-2 sm:mb-3 text-[9px] sm:text-[10px] font-sans font-bold text-accent">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <span>{getProductRating(quickViewProduct.name)}</span>
                </div>
                <p className="text-sm sm:text-base font-bold font-sans text-dark mb-3 sm:mb-4">₹{quickViewProduct.price}</p>
                <p className="text-xs text-dark2/75 leading-relaxed mb-4 sm:mb-6">{quickViewProduct.description}</p>
                <p className="text-[9px] sm:text-[10px] text-dark2/45 font-sans mb-3 sm:mb-4">{quickViewProduct.details}</p>

                {/* Size list */}
                <div className="mb-4">
                  <span className="text-[8px] sm:text-[9px] text-dark2/45 uppercase tracking-widest font-sans font-bold block mb-2">Select Size</span>
                  <div className="flex gap-1.5">
                    {quickViewProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSizes(prev => ({ ...prev, [quickViewProduct.id]: sz }))}
                        className={`w-8 h-8 sm:w-9 sm:h-9 border text-[9px] sm:text-[10px] font-sans font-bold rounded flex items-center justify-center cursor-pointer ${selectedSizes[quickViewProduct.id] === sz ? 'bg-dark border-dark text-primary' : 'border-cream3 text-dark'
                          }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleAddToCart(quickViewProduct)
                  setQuickViewProduct(null)
                }}
                className="w-full py-3 sm:py-3.5 bg-dark text-cream hover:bg-accent hover:text-cream transition-colors font-sans font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl border-none cursor-pointer"
              >
                Add to bag
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
