import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Eye, Upload, Palette, Check, ArrowRight,
  Heart, Star, Flame, Sparkles, X, Mail, Bell
} from 'lucide-react'
import { getHomepageConfig, getProducts, getProductRating } from '../lib/supabase'



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

          // Map featured product IDs to actual product objects from db
          if (config.featured_product_ids && config.featured_product_ids.length > 0 && dbProducts && dbProducts.length > 0) {
            const featured = dbProducts.filter(p => config.featured_product_ids.includes(p.id))
            const mappedFeatured = featured.map(p => ({
              ...p,
              imageFront: p.images?.[0] || p.image || '/images/Regular-T.png',
              imageBack: p.images?.[1] || p.image || '/images/Regular-T.png',
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
              imageFront: p.images?.[0] || p.image || '/images/Regular-T.png',
              imageBack: p.images?.[1] || p.image || '/images/Regular-T.png',
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

  // Curtain / Phase Sequence Choreography
  const [phase, setPhase] = useState('0')
  const [isRevealed, setIsRevealed] = useState(false)
  const [showShopBtn, setShowShopBtn] = useState(false)

  const [offset, setOffset] = useState(0)
  const [direction, setDirection] = useState('next')
  const [isSliding, setIsSliding] = useState(false)
  const [prevOffset, setPrevOffset] = useState(0)

  const { setCartOpen } = useCart()

  const slideTo = (dir) => {
    if (isSliding) return
    setIsSliding(true)
    setDirection(dir)
    setPrevOffset(offset)

    const newOffset = dir === 'next'
      ? (offset + 1) % heroImages.length
      : (offset - 1 + heroImages.length) % heroImages.length

    setOffset(newOffset)

    setTimeout(() => {
      setIsSliding(false)
    }, 760) // SLIDE_DUR + 80
  }

  // Touch Swipe Support
  const touchX = useRef(0)
  const handleTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 48) slideTo(dx < 0 ? 'next' : 'prev')
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') slideTo('prev')
      if (e.key === 'ArrowRight') slideTo('next')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [offset, isSliding])

  // Sequence choreography
  useEffect(() => {
    const timers = []

    timers.push(setTimeout(() => setPhase('1'), 150))
    timers.push(setTimeout(() => setPhase('2'), 650))
    timers.push(setTimeout(() => setPhase('3'), 1150))
    timers.push(setTimeout(() => setPhase('4'), 1750))
    timers.push(setTimeout(() => setIsRevealed(true), 2250))
    timers.push(setTimeout(() => setPhase('5'), 3100))
    timers.push(setTimeout(() => setShowShopBtn(true), 3400))

    return () => timers.forEach(clearTimeout)
  }, [])

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

      {/* Premium Hero Stage Section */}
      <div className={`stage phase-${phase} ${isRevealed ? 'stage-reveal' : ''}`} id="stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* CSS Styles injection */}
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --ink: #0a0a0a;
            --paper: #fbfaf8;
            --gold: #c9a96a;
            --grey-line: rgba(255,255,255,0.14);
            --grey-line-dark: rgba(10,10,10,0.12);
            --ease: cubic-bezier(.22,1,.36,1);
          }

          .stage {
            width: 100vw;
            height: 60vh;
            min-height: 400px;
            overflow: hidden;
            position: relative;
            background: var(--ink);
          }

          @media (min-width: 768px) {
            .stage {
              height: 100vh;
              min-height: 700px;
            }
          }

          .backdrop-hero {
            position: absolute; inset: 0;
            background: var(--ink);
            background-image: url('/images/banner.webp');
            background-size: cover;
            background-position: center;
            z-index: 0;
          }
          .backdrop-hero::after {
            content: '';
            position: absolute; inset: 0;
            background: rgba(5,4,3,0.60);
          }
          .curtain-hero {
            position: absolute;
            left: 0; right: 0; bottom: 0;
            height: 0%;
            background: rgba(248, 246, 242, 0.28);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 1;
            transition: height 1.4s var(--ease);
          }
          .stage-reveal .curtain-hero { height: 100%; }

          header.hero-header {
            position: absolute; top: 0; left: 0; right: 0;
            height: clamp(72px, 9vh, 96px);
            display: flex; align-items: center; justify-content: space-between;
            gap: clamp(16px, 2vw, 40px);
            padding: 0 clamp(28px, 3.2vw, 64px);
            z-index: 50;
            background: transparent;
            border-bottom: 1px solid transparent;
            transition: background .7s var(--ease), border-color .7s var(--ease), box-shadow .7s var(--ease);
          }
          .stage-reveal header.hero-header {
            background: #ffffff;
            border-bottom: 1px solid rgba(0,0,0,0.09);
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          }

          .logo-hero {
            display: flex; align-items: center; gap: clamp(10px, 1vw, 16px);
            font-family: Georgia, 'Times New Roman', serif;
            letter-spacing: .08em;
            font-weight: 600;
            font-size: clamp(18px, 2vw, 28px);
            font-style: italic;
            color: #f3f1ec;
            text-transform: uppercase;
            opacity: 0;
            transform: translateY(-6px);
            animation: fadeDown-hero .7s var(--ease) .15s forwards;
            transition: color .5s var(--ease);
            white-space: nowrap;
            flex-shrink: 0;
            text-decoration: none;
          }
          .stage-reveal .logo-hero { color: #0e0c0a; }
          .logo-img-hero {
            height: clamp(48px, 5vw, 72px);
            width: auto;
            object-fit: contain;
            display: block;
            flex-shrink: 0;
          }

          .nav-links-hero {
            list-style: none; margin: 0; padding: 0;
            display: flex; align-items: center;
            gap: clamp(16px, 2.2vw, 36px);
            flex: 1; justify-content: center;
            opacity: 0; pointer-events: none;
            transition: opacity .7s var(--ease) .15s;
          }
          .stage-reveal .nav-links-hero { opacity: 1; pointer-events: auto; }
          .nav-links-hero a {
            font-size: clamp(11px, .9vw, 14px);
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            color: #1a1816;
            text-decoration: none;
            white-space: nowrap;
            position: relative; padding-bottom: 3px;
            opacity: .75;
            transition: opacity .2s ease, color .2s ease;
          }
          .nav-links-hero a::after {
            content: ''; position: absolute; bottom: 0; left: 0; right: 0;
            height: 1.5px; background: #0e0c0a;
            transform: scaleX(0); transform-origin: center;
            transition: transform .3s var(--ease);
          }
          .nav-links-hero a:hover { opacity: 1; }
          .nav-links-hero a:hover::after { transform: scaleX(1); }

          .navicons-hero {
            display: flex; align-items: center; gap: 12px;
            opacity: 0;
            transform: translateY(-6px);
            animation: fadeDown-hero .7s var(--ease) .3s forwards;
            flex-shrink: 0;
          }
          .icon-btn-hero {
            width: clamp(38px, 2.6vw, 48px); height: clamp(38px, 2.6vw, 48px); border-radius: 50%;
            border: 1px solid var(--grey-line);
            display: flex; align-items: center; justify-content: center;
            color: #eee;
            background: rgba(255,255,255,.02);
            flex-shrink: 0;
            transition: background .2s var(--ease), border-color .3s var(--ease), color .3s var(--ease);
            cursor: pointer;
          }
          .stage-reveal .icon-btn-hero {
            border-color: rgba(0,0,0,.14);
            color: #111;
            background: rgba(0,0,0,.04);
          }
          .icon-btn-hero svg { width: 18px; height: 18px; }
          .contact-pill-hero {
            display: flex; align-items: center; gap: 10px;
            background: #111; color: #f3f1ec;
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 999px;
            padding: 9px 24px 9px 9px;
            font-size: clamp(12px, 1vw, 15px);
            letter-spacing: .04em;
            flex-shrink: 0;
            text-decoration: none;
          }
          .contact-pill-hero .dot-hero {
            width: clamp(26px, 1.9vw, 32px); height: clamp(26px, 1.9vw, 32px); border-radius: 50%;
            background: var(--gold);
            display: flex; align-items: center; justify-content: center;
            color: #1a1a1a;
          }
          .contact-pill-hero .dot-hero svg { width: 13px; height: 13px; }

          .deck-hero {
            position: absolute;
            left: 0; right: 0;
            top: clamp(60px, 8vh, 80px);
            bottom: clamp(16px, 3vh, 40px);
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 0 clamp(20px, 3.2vw, 64px);
          }

          @media (min-width: 768px) {
            .deck-hero {
              top: clamp(90px, 11vh, 120px);
            }
          }

          .card-hero {
            position: relative;
            border-radius: 18px;
            overflow: hidden;
            background: #ffffff;
            flex: 1 1 0;
            max-width: 340px;
            opacity: 0;
            transform: translateY(26px) scale(.94);
            box-shadow: 0 25px 50px -20px rgba(0,0,0,.55);
            transition:
              height 1.3s var(--ease),
              max-height 1.3s var(--ease),
              flex-basis 1s var(--ease),
              box-shadow .6s var(--ease),
              border-radius 1.3s var(--ease),
              background-color 1.3s var(--ease);
          }

          /* phase 0: hidden */
          .card-hero { height: 0; max-height: 0; }

          /* phase 1 (mobile default) */
          .phase-1 .card-hero[data-pos="2"],
          .phase-2 .card-hero[data-pos="2"],
          .phase-3 .card-hero[data-pos="2"],
          .phase-4 .card-hero[data-pos="2"],
          .phase-5 .card-hero[data-pos="2"] {
            opacity: 1; transform: translateY(0) scale(1);
            height: clamp(170px, 30vh, 260px); max-height: 260px;
          }

          /* phase 2 (mobile default) */
          .phase-2 .card-hero[data-pos="1"],
          .phase-2 .card-hero[data-pos="3"],
          .phase-3 .card-hero[data-pos="1"],
          .phase-3 .card-hero[data-pos="3"],
          .phase-4 .card-hero[data-pos="1"],
          .phase-4 .card-hero[data-pos="3"],
          .phase-5 .card-hero[data-pos="1"],
          .phase-5 .card-hero[data-pos="3"] {
            opacity: 1; transform: scale(.98);
            height: clamp(130px, 24vh, 210px); max-height: 210px;
          }

          /* phase 3 (mobile default) */
          .phase-3 .card-hero[data-pos="0"],
          .phase-3 .card-hero[data-pos="4"],
          .phase-4 .card-hero[data-pos="0"],
          .phase-4 .card-hero[data-pos="4"],
          .phase-5 .card-hero[data-pos="0"],
          .phase-5 .card-hero[data-pos="4"] {
            opacity: 1; transform: scale(.95);
            height: clamp(110px, 20vh, 180px); max-height: 180px;
          }

          /* Desktop Responsive Adjustments (min-width: 768px) */
          @media (min-width: 768px) {
            .phase-1 .card-hero[data-pos="2"],
            .phase-2 .card-hero[data-pos="2"],
            .phase-3 .card-hero[data-pos="2"],
            .phase-4 .card-hero[data-pos="2"],
            .phase-5 .card-hero[data-pos="2"] {
              height: clamp(320px, 48vh, 580px); max-height: 580px;
            }
            .phase-2 .card-hero[data-pos="1"],
            .phase-2 .card-hero[data-pos="3"],
            .phase-3 .card-hero[data-pos="1"],
            .phase-3 .card-hero[data-pos="3"],
            .phase-4 .card-hero[data-pos="1"],
            .phase-4 .card-hero[data-pos="3"],
            .phase-5 .card-hero[data-pos="1"],
            .phase-5 .card-hero[data-pos="3"] {
              height: clamp(240px, 38vh, 460px); max-height: 460px;
            }
            .phase-3 .card-hero[data-pos="0"],
            .phase-3 .card-hero[data-pos="4"],
            .phase-4 .card-hero[data-pos="0"],
            .phase-4 .card-hero[data-pos="4"],
            .phase-5 .card-hero[data-pos="0"],
            .phase-5 .card-hero[data-pos="4"] {
              height: clamp(180px, 28vh, 340px); max-height: 340px;
            }

            /* phase 4 & 5 grow on desktop */
            .phase-4 .card-hero[data-pos="2"],
            .phase-5 .card-hero[data-pos="2"] {
              height: clamp(400px, 68vh, 820px); max-height: 820px;
            }
            .phase-4 .card-hero[data-pos="1"],
            .phase-4 .card-hero[data-pos="3"],
            .phase-5 .card-hero[data-pos="1"],
            .phase-5 .card-hero[data-pos="3"] {
              height: clamp(300px, 52vh, 640px); max-height: 640px;
            }
            .phase-4 .card-hero[data-pos="0"],
            .phase-4 .card-hero[data-pos="4"],
            .phase-5 .card-hero[data-pos="0"],
            .phase-5 .card-hero[data-pos="4"] {
              height: clamp(280px, 46vh, 570px); max-height: 570px;
            }
          }

          /* phase 5 details */
          .phase-5 .card-hero {
            background: transparent;
            box-shadow: none;
            border-radius: 0;
          }

          .nav-arrow-hero {
            position: absolute;
            top: calc(50% + 20px); transform: translateY(-50%);
            z-index: 40;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.93);
            box-shadow: 0 6px 24px rgba(0, 0, 0, .22);
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: #161513;
            opacity: 0; pointer-events: none;
            transition: opacity .45s var(--ease), background .2s ease, box-shadow .2s ease;
          }
          .nav-arrow-hero svg { width: 14px; height: 14px; }
          .nav-arrow-prev-hero { left: 8px; }
          .nav-arrow-next-hero { right: 8px; }
          .nav-arrow-hero:hover { background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,.3); }

          .shop-btn-hero {
            position: absolute;
            bottom: 12px; left: 50%; transform: translateX(-50%);
            background: #CCFF00; color: #0B0B0B;
            border: 1px solid #CCFF00; border-radius: 999px;
            padding: 8px 18px;
            font-size: 9.5px;
            font-weight: 700;
            letter-spacing: .14em;
            text-transform: uppercase;
            cursor: pointer;
            font-family: inherit;
            z-index: 25;
            box-shadow: 0 10px 28px -8px rgba(204, 255, 0, .35);
            opacity: 0;
            transition: opacity .6s var(--ease), background .2s ease, transform .2s ease, box-shadow .2s ease;
            white-space: nowrap;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .shop-btn-hero:hover { 
            background: #bceb00; 
            transform: translateX(-50%) translateY(-2px); 
            box-shadow: 0 14px 40px -6px rgba(204, 255, 0, 0.5);
          }

          @media (min-width: 768px) {
            .nav-arrow-hero {
              width: clamp(42px, 3.4vw, 58px);
              height: clamp(42px, 3.4vw, 58px);
              top: calc(50% + 35px);
            }
            .nav-arrow-hero svg { width: clamp(16px, 1.4vw, 22px); height: clamp(16px, 1.4vw, 22px); }
            .nav-arrow-prev-hero { left: clamp(16px, 2.2vw, 36px); }
            .nav-arrow-next-hero { right: clamp(16px, 2.2vw, 36px); }
            .shop-btn-hero {
              padding: 14px 38px;
              font-size: clamp(12px, 1vw, 14px);
              gap: 8px;
              box-shadow: 0 12px 36px -8px rgba(204, 255, 0, .35);
            }
          }
          
          .phase-4 .nav-arrow-hero,
          .phase-5 .nav-arrow-hero { opacity: 1; pointer-events: auto; }

          @keyframes fadeDown-hero { to { opacity: 1; transform: translateY(0); } }

        ` }} />

        <div className="backdrop-hero" style={{ backgroundImage: heroBgBanner ? `url(${heroBgBanner})` : undefined }}></div>
        <div className="curtain-hero"></div>



        <div className="deck-hero" id="deck">
          {[0, 1, 2, 3, 4].map((i) => {
            const currentImg = heroImages[(i + offset) % heroImages.length]
            const prevImg = heroImages[(i + prevOffset) % heroImages.length]

            return (
              <div key={i} className={`card-hero ${i === 0 || i === 4 ? 'hidden md:block' : ''}`} data-pos={i}>
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={`${currentImg}-${i}`}
                    src={currentImg}
                    custom={direction}
                    variants={{
                      enter: (dir) => ({
                        x: dir === 'next' ? '100%' : '-100%',
                      }),
                      center: {
                        x: 0,
                      },
                      exit: (dir) => ({
                        x: dir === 'next' ? '-100%' : '100%',
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'tween', duration: 0.68, ease: [0.4, 0, 0.2, 1] }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: '-1%',
                      width: '102%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top'
                    }}
                  />
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <button className="nav-arrow-hero nav-arrow-prev-hero" id="prevBtn" aria-label="Previous" onClick={() => slideTo('prev')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button className="nav-arrow-hero nav-arrow-next-hero" id="nextBtn" aria-label="Next" onClick={() => slideTo('next')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>

        <Link
          to="/shop"
          className="shop-btn-hero"
          id="shopBtn"
          style={{
            opacity: showShopBtn ? 1 : 0,
            pointerEvents: showShopBtn ? 'auto' : 'none'
          }}
        >
          <span>Shop Collection</span>
        </Link>

      </div>

      {/* Infinite Scrolling Marquee */}
      <div className="bg-dark text-primary border-y border-dark py-4 overflow-hidden relative z-20 select-none">
        <div className="flex whitespace-nowrap animate-marquee-left font-display text-[10px] md:text-sm font-black uppercase tracking-[0.25em]">
          <span>LIMITED DROP • NO RESTOCK • PREMIUM FABRIC • FOR THE WIN • LIMITED DROP • NO RESTOCK • PREMIUM FABRIC • FOR THE WIN • </span>
          <span>LIMITED DROP • NO RESTOCK • PREMIUM FABRIC • FOR THE WIN • LIMITED DROP • NO RESTOCK • PREMIUM FABRIC • FOR THE WIN • </span>
        </div>
      </div>

      {/* Featured Collection Grid */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 py-14 sm:py-24 border-b border-neutral-200/60 z-10 relative"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent/10 border border-accent/20 text-accent font-mono uppercase tracking-[0.25em] text-[9px] md:text-[10px] font-black rounded-lg mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" /> CATALOG SERIES 01
            </span>
            <h2 className="font-display text-[28px] md:text-4xl lg:text-5xl uppercase font-black text-dark tracking-tight leading-none mt-1">
              FEATURED <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">COLLECTION</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {featuredProducts.map((product, pi) => {
            const prodSizes = Array.isArray(product.sizes)
              ? product.sizes
              : (product.sizes ? String(product.sizes).split(',').map(s => s.trim()) : [])
            const prodColors = Array.isArray(product.colors)
              ? product.colors
              : (product.colors ? String(product.colors).split(',').map(c => c.trim()) : [])
            const colorMap = { Black: '#161616', White: '#FAFAFA', Charcoal: '#4A4A4A', Lime: '#A3E635', Beige: '#E6D3B3', Cream: '#F5F2E9' }
            const prodImage = product.imageFront || product.image || '/images/Regular-T.png'

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: pi * 0.06, ease: 'easeOut' }}
                className="bg-white border border-[#E8E5DC] rounded-2xl sm:rounded-3xl overflow-hidden hover:border-dark/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between group/card"
              >
                {/* Image area */}
                <Link to={`/product/${product.id}`} className="relative aspect-[4/5] bg-[#F5F3EC] overflow-hidden block">
                  <img
                    src={prodImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover/card:scale-105"
                    style={{
                      opacity: activeFeaturedImageIndexes[product.id] === 1 ? 0 : 1
                    }}
                    onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                  />
                  {product.imageBack && (
                    <img
                      src={product.imageBack}
                      alt={`${product.name} Back`}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover/card:scale-105"
                      style={{
                        opacity: activeFeaturedImageIndexes[product.id] === 1 ? 1 : 0
                      }}
                      onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                    />
                  )}

                  {/* Tag badge */}
                  {product.tag && (
                    <span className={`absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest font-black px-2.5 py-1.5 rounded-lg shadow-sm ${String(product.tag).includes('OFF') || String(product.tag).includes('Sale') ? 'bg-accent text-dark' : 'bg-dark text-[#D6FF40]'
                      }`}>
                      {product.tag}
                    </span>
                  )}

                  {/* Rating badge */}
                  <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-dark border border-white/60 flex items-center gap-1 shadow-sm z-10">
                    <Star className="w-3 h-3 fill-accent text-accent shrink-0" />
                    <span>{getProductRating(product.name) ? getProductRating(product.name).toFixed(1) : '0.0'}</span>
                  </div>

                  {/* Wishlist button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleWishlist({ ...product, image: prodImage })
                      toast.success(
                        isInWishlist(product.id) ? 'Removed from wishlist.' : 'Added to wishlist!',
                        { style: { background: '#161616', color: '#FAF9F6' } }
                      )
                    }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md border border-white/60 flex items-center justify-center hover:scale-110 transition-all cursor-pointer shadow-sm"
                    title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(product.id) ? 'fill-accent text-accent' : 'text-dark/50'}`} />
                  </button>

                  {/* Sold out overlay */}
                  {product.available === false && (
                    <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-dark text-[#D6FF40] px-3 py-1.5 rounded-lg text-[9px] uppercase font-mono tracking-widest font-black shadow-md">SOLD OUT</span>
                    </div>
                  )}
                </Link>

                {/* Info area */}
                <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between bg-neutral-50/30 border-t border-[#E8E5DC]">
                  <div>
                    {/* Category Label */}
                    <div className="text-[8px] md:text-[9px] font-mono text-dark/30 uppercase tracking-widest mb-1.5 font-bold">
                      {product.category || 'Tee Design'}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-3 mb-3 w-full">
                      <h3 className="font-display text-xs sm:text-sm lg:text-base font-black uppercase text-dark tracking-wide leading-snug flex-1 min-w-0">{product.name}</h3>
                      <div className="flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-1 shrink-0 mt-1 sm:mt-0">
                        <span className="text-[12px] sm:text-sm font-mono font-black text-dark bg-[#D6FF40] px-1.5 py-0.5 rounded-sm">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-[10px] sm:text-[11px] line-through font-mono mt-0 sm:mt-1" style={{ color: '#aaa' }}>₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Color swatches */}
                    {prodColors.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1.5 mb-4">
                        {prodColors.slice(0, 6).map((col, ci) => {
                          const cName = col.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                          const hexMatch = col.match(/#([0-9a-fA-F]{3,6})/)
                          const bg = hexMatch ? `#${hexMatch[1]}` : (colorMap[cName] || '#ccc')
                          return (
                            <span
                              key={ci}
                              title={cName}
                              style={{ backgroundColor: bg }}
                              className="w-5 h-5 rounded-full border border-black/10 shrink-0 inline-block hover:scale-110 transition-transform cursor-pointer"
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-2 min-h-[38px] sm:min-h-[42px]">
                    {selectingSizeForFeatured === product.id ? (
                      <div className="space-y-2 text-center animate-fadeIn">
                        <span className="text-[10px] text-dark/40 font-mono uppercase tracking-widest block font-bold">SELECT SIZE</span>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {prodSizes.map(sz => (
                            <button
                              key={sz}
                              onClick={() => {
                                addToCart({ ...product, image: prodImage }, sz)
                                toast.success(`${product.name} [Size ${sz}] added to bag!`, {
                                  style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
                                })
                                setSelectingSizeForFeatured(null)
                              }}
                              className="h-8 w-8 border border-dark/20 text-dark hover:bg-dark hover:text-[#D6FF40] hover:border-dark transition-all text-[12px] font-mono font-black rounded-lg cursor-pointer bg-white"
                            >
                              {sz}
                            </button>
                          ))}
                          <button
                            onClick={() => setSelectingSizeForFeatured(null)}
                            className="h-8 w-8 border border-red-200 text-red-500 hover:bg-red-50 transition-all text-[12px] font-mono font-bold rounded-lg cursor-pointer bg-white"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : product.available === false ? (
                      <button
                        disabled
                        className="w-full h-10 px-4 bg-neutral-100 text-dark/30 text-[12px] font-mono font-bold uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 border border-neutral-200/50"
                      >
                        SOLD OUT
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (prodSizes.length === 0) {
                            addToCart({ ...product, image: prodImage }, 'M')
                            toast.success(`${product.name} added to bag!`, {
                              style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
                            })
                          } else {
                            setSelectingSizeForFeatured(product.id)
                          }
                        }}
                        className="w-full h-9 sm:h-10 px-3 bg-dark text-[#D6FF40] hover:bg-accent hover:text-dark transition-all duration-300 text-[10px] sm:text-[12px] font-mono font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm hover:shadow-[0_8px_20px_rgba(214,255,64,0.2)]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ADD TO BAG
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Infinite Moving Marquee Ticker Stripe 2 (Reverse movement) */}
      <div className="bg-primary text-dark border-y border-dark py-4 overflow-hidden relative z-20 select-none">
        <div className="flex whitespace-nowrap animate-marquee-right font-display text-[9px] md:text-xs font-black uppercase tracking-[0.3em]">
          <span>PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • CUSTOM DTF PRINTING LABORATORY • PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • </span>
          <span>PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • CUSTOM DTF PRINTING LABORATORY • PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • </span>
        </div>
      </div>

      {/* Sale Section */}
      {saleProducts && saleProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="py-12 sm:py-24 border-b border-neutral-200/60 z-10 relative"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent/10 border border-accent/20 text-accent font-mono uppercase tracking-[0.25em] text-[9px] md:text-[10px] font-black rounded-lg mb-3 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-accent animate-pulse" /> EXCLUSIVE OFFERS
                </span>
                <h2 className="font-display text-[28px] md:text-4xl lg:text-5xl uppercase font-black text-dark tracking-tight leading-none mt-1">
                  SALE <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">ARCHIVE</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {saleProducts.map((product, pi) => {
                const prodSizes = Array.isArray(product.sizes)
                  ? product.sizes
                  : (product.sizes ? String(product.sizes).split(',').map(s => s.trim()) : [])
                const prodColors = Array.isArray(product.colors)
                  ? product.colors
                  : (product.colors ? String(product.colors).split(',').map(c => c.trim()) : [])
                const colorMap = { Black: '#161616', White: '#FAFAFA', Charcoal: '#4A4A4A', Lime: '#A3E635', Beige: '#E6D3B3', Cream: '#F5F2E9' }
                const prodImage = product.imageFront || product.image || '/images/Regular-T.png'
                const discountTagText = `-${product.discountPercent}% OFF`

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: pi * 0.06, ease: 'easeOut' }}
                    className="bg-white border border-[#E8E5DC] rounded-2xl sm:rounded-3xl overflow-hidden hover:border-dark/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between group/card"
                  >
                    {/* Image area */}
                    <Link to={`/product/${product.id}`} className="relative aspect-[4/5] bg-[#F5F3EC] overflow-hidden block">
                      <img
                        src={prodImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover/card:scale-105"
                        style={{
                          opacity: activeFeaturedImageIndexes[product.id] === 1 ? 0 : 1
                        }}
                        onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                      />
                      {product.imageBack && (
                        <img
                          src={product.imageBack}
                          alt={`${product.name} Back`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover/card:scale-105"
                          style={{
                            opacity: activeFeaturedImageIndexes[product.id] === 1 ? 1 : 0
                          }}
                          onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                        />
                      )}

                      {/* Tag badge */}
                      <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest font-black px-2.5 py-1.5 rounded-lg shadow-sm bg-accent text-dark">
                        {discountTagText}
                      </span>

                      {/* Rating badge */}
                      <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-dark border border-white/60 flex items-center gap-1 shadow-sm z-10">
                        <Star className="w-3 h-3 fill-accent text-accent shrink-0" />
                        <span>{getProductRating(product.name) ? getProductRating(product.name).toFixed(1) : '0.0'}</span>
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleWishlist({ ...product, image: prodImage })
                          toast.success(
                            isInWishlist(product.id) ? 'Removed from wishlist.' : 'Added to wishlist!',
                            { style: { background: '#161616', color: '#FAF9F6' } }
                          )
                        }}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md border border-white/60 flex items-center justify-center hover:scale-110 transition-all cursor-pointer shadow-sm"
                        title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(product.id) ? 'fill-accent text-accent' : 'text-dark/50'}`} />
                      </button>

                      {/* Sold out overlay */}
                      {product.available === false && (
                        <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-dark text-[#D6FF40] px-3 py-1.5 rounded-lg text-[9px] uppercase font-mono tracking-widest font-black shadow-md">SOLD OUT</span>
                        </div>
                      )}
                    </Link>

                    {/* Info area */}
                    <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between bg-neutral-50/30 border-t border-[#E8E5DC]">
                      <div>
                        {/* Category Label */}
                        <div className="text-[8px] md:text-[9px] font-mono text-dark/30 uppercase tracking-widest mb-1.5 font-bold">
                          {product.category || 'Tee Design'}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-3 mb-3 w-full">
                          <h3 className="font-display text-xs sm:text-sm lg:text-base font-black uppercase text-dark tracking-wide leading-snug flex-1 min-w-0">{product.name}</h3>
                          <div className="flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-1 shrink-0 mt-1 sm:mt-0">
                            <span className="text-[12px] sm:text-sm font-mono font-black text-dark bg-[#D6FF40] px-1.5 py-0.5 rounded-sm">₹{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-[10px] sm:text-[11px] line-through font-mono mt-0 sm:mt-1" style={{ color: '#aaa' }}>₹{product.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        {/* Color swatches */}
                        {prodColors.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1.5 mb-4">
                            {prodColors.slice(0, 6).map((col, ci) => {
                              const cName = col.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                              const hexMatch = col.match(/#([0-9a-fA-F]{3,6})/)
                              const bg = hexMatch ? `#${hexMatch[1]}` : (colorMap[cName] || '#ccc')
                              return (
                                <span
                                  key={ci}
                                  title={cName}
                                  style={{ backgroundColor: bg }}
                                  className="w-5 h-5 rounded-full border border-black/10 shrink-0 inline-block hover:scale-110 transition-transform cursor-pointer"
                                />
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mt-2 min-h-[38px] sm:min-h-[42px]">
                        {selectingSizeForFeatured === product.id ? (
                          <div className="space-y-2 text-center animate-fadeIn">
                            <span className="text-[10px] text-dark/40 font-mono uppercase tracking-widest block font-bold">SELECT SIZE</span>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {prodSizes.map(sz => (
                                <button
                                  key={sz}
                                  onClick={() => {
                                    addToCart({ ...product, image: prodImage }, sz)
                                    toast.success(`${product.name} [Size ${sz}] added to bag!`, {
                                      style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
                                    })
                                    setSelectingSizeForFeatured(null)
                                  }}
                                  className="h-8 w-8 border border-dark/20 text-dark hover:bg-dark hover:text-[#D6FF40] hover:border-dark transition-all text-[12px] font-mono font-black rounded-lg cursor-pointer bg-white"
                                >
                                  {sz}
                                </button>
                              ))}
                              <button
                                onClick={() => setSelectingSizeForFeatured(null)}
                                className="h-8 w-8 border border-red-200 text-red-500 hover:bg-red-50 transition-all text-[12px] font-mono font-bold rounded-lg cursor-pointer bg-white"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : product.available === false ? (
                          <button
                            disabled
                            className="w-full h-10 px-4 bg-neutral-100 text-dark/30 text-[12px] font-mono font-bold uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 border border-neutral-200/50"
                          >
                            SOLD OUT
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (prodSizes.length === 0) {
                                addToCart({ ...product, image: prodImage }, 'M')
                                toast.success(`${product.name} added to bag!`, {
                                  style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
                                })
                              } else {
                                setSelectingSizeForFeatured(product.id)
                              }
                            }}
                            className="w-full h-9 sm:h-10 px-3 bg-dark text-[#D6FF40] hover:bg-accent hover:text-dark transition-all duration-300 text-[10px] sm:text-[12px] font-mono font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm hover:shadow-[0_8px_20px_rgba(214,255,64,0.2)]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ADD TO BAG
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.section>
      )}

      {/* DTF Customization Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 py-10 sm:py-14 border-b border-neutral-200/60 z-10 relative"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent/10 border border-accent/20 text-accent font-mono uppercase tracking-[0.25em] text-[9px] md:text-[10px] font-black rounded-lg mb-3 shadow-xs">
              <Palette className="w-3.5 h-3.5 text-accent animate-pulse" /> FTW CUSTOMIZER STUDIO
            </span>
            <h2 className="font-display text-[28px] md:text-4xl lg:text-5xl uppercase font-black text-dark tracking-tight leading-none mt-1">
              CUSTOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">DROP</span>
            </h2>
            <p className="text-[12px] sm:text-sm text-dark/50 max-w-lg mt-4 leading-relaxed font-sans">
              Upload any artwork and build your premium streetwear design in real-time. No minimum order.
            </p>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center text-center">

          {/* Steps */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full mt-4">
            {[
              { step: '01', icon: ShoppingBag, title: 'CHOOSE BLANK & COLOR', desc: 'Pick your blank t-shirt and choose your favorite color.' },
              { step: '02', icon: Upload, title: 'UPLOAD & ADD TEXT', desc: 'Upload your design image and write custom text on the canvas.' },
              { step: '03', icon: Palette, title: 'SAVE & SELECT SIZE', desc: 'Save your design and select your size and quantity.' },
              { step: '04', icon: Check, title: 'PRINT & SHIP', desc: 'We print your custom order with premium DTF and ship it to you.' }
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-md border border-[#E8E5DC] rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-6 text-left group hover:border-accent hover:shadow-[0_20px_50px_rgba(214,255,64,0.12)] hover:-translate-y-1.5 transition-all duration-500 cursor-default flex flex-col justify-between relative overflow-hidden min-h-[165px] sm:min-h-[190px]"
              >
                {/* Subtle highlight gradient border at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-5">
                    <div className="p-2 sm:p-3 bg-[#F5F3EC] text-dark rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-dark group-hover:text-[#D6FF40] group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                      <s.icon className="w-4 h-4 sm:w-5 h-5" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-widest text-dark/40 bg-neutral-100/80 border border-neutral-200/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full group-hover:bg-accent/15 group-hover:text-accent group-hover:border-accent/25 transition-all duration-300">
                      STEP {s.step}
                    </span>
                  </div>
                  <h4 className="font-display text-xs sm:text-sm font-black uppercase tracking-wide text-dark mb-1 sm:mb-2.5 group-hover:text-accent transition-colors duration-300">
                    {s.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-dark/50 group-hover:text-dark/70 font-sans leading-relaxed transition-colors duration-300">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Launch Customizer Action Button */}
          <div className="relative z-10 w-full mt-10 flex flex-col items-center justify-center">
            <Link
              to="/customizer"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault()
                  toast.error("Please login to access the customizer!", {
                    id: 'auth-required-home-dtf',
                    style: { background: '#161616', color: '#FAF9F6' }
                  })
                  navigate('/auth?redirect=/customizer')
                }
              }}
              className="w-fit px-6 sm:px-8 py-3.5 sm:py-4 bg-dark text-[#D6FF40] hover:bg-accent hover:text-dark transition-all duration-300 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(214,255,64,0.25)] flex items-center justify-center gap-2 cursor-pointer border-none text-center decoration-none"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
              Launch Customizer Studio
            </Link>
            <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
              <span className="text-[9px] text-dark/40 font-mono uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span> No minimum order
              </span>
              <span className="text-[9px] text-dark/40 font-mono uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span> High-density DTF print
              </span>
              <span className="text-[9px] text-dark/40 font-mono uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span> Ships in 7–10 days
              </span>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section
        id="coming-soon"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 py-14 md:py-24 z-10 relative"
      >
        <div className="bg-[#050505] text-cream rounded-[32px] overflow-hidden relative py-12 md:py-20 px-6 sm:px-12 lg:px-16 w-full">
          {/* Futuristic technical lines & radial neon glows */}
          <div className="absolute inset-0 bg-grid-white/[0.012] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(204,255,0,0.06),transparent_60%)] pointer-events-none" />
          <div className="absolute -top-48 -right-48 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-48 -left-48 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

          {/* Technical top border line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-12 md:gap-16 items-center">

              {/* Info & Countdown Column (Left) */}
              <div className="md:col-span-6 text-left flex flex-col justify-center w-full">
                {/* Micro-badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary font-mono uppercase tracking-[0.25em] text-[9px] font-black rounded-lg mb-6 w-fit shadow-[0_0_15px_rgba(204,255,0,0.05)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {comingSoonSubtitle || 'NEXT DROP • SNEAK PEEK'}
                </div>

                {/* Title */}
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase font-black tracking-tight leading-none mb-4">
                  {comingSoonTitle}
                </h2>

                {/* Description */}
                <p className="text-cream/60 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8 max-w-lg font-sans">
                  {comingSoonDescription || "An exclusive collection engineered with ultra-heavyweight cotton, distressed vintage details, and industrial utility graphics. Highly limited edition drop."}
                </p>


                {/* Countdown timer or Live Badge */}
                {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
                  <div className="flex flex-col gap-3 mb-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2.5 bg-primary text-dark px-7 py-4 rounded-xl text-xs font-mono font-black uppercase tracking-widest w-fit shadow-[0_12px_40px_-8px_rgba(204,255,0,0.4)] border border-primary/30 select-none"
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                      </span>
                      🔥 Collection Now Live!
                    </motion.div>
                    <span className="text-[10px] text-cream/40 font-mono uppercase tracking-widest block ml-1">
                      Released: {new Date(countdownTarget).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* The Grid Countdown */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 font-sans text-center max-w-xl w-full mb-2 sm:mb-8">
                      {[
                        { val: timeLeft.days, label: 'DAYS' },
                        { val: timeLeft.hours, label: 'HOURS' },
                        { val: timeLeft.minutes, label: 'MINS' },
                        { val: timeLeft.seconds, label: 'SECS' }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -6, scale: 1.05 }}
                          className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-2 sm:p-5 rounded-xl sm:rounded-2xl shadow-[0_12px_40px_rgba(204,255,0,0.03)] relative overflow-hidden group transition-all duration-500 hover:border-primary/50 hover:shadow-[0_15px_45px_rgba(204,255,0,0.12)]"
                        >
                          {/* Tech target corner crosshairs */}
                          <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-primary/60 transition-colors" />
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-white/20 group-hover:border-primary/60 transition-colors" />
                          <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-white/20 group-hover:border-primary/60 transition-colors" />
                          <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-white/20 group-hover:border-primary/60 transition-colors" />

                          {/* CRT Scanline & Radar Sweep Deco */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent pointer-events-none" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-xl opacity-80" />

                          {/* Animated sliding ticker digit container */}
                          <div className="flex justify-center items-center text-2xl xs:text-3xl sm:text-5xl font-black text-primary font-mono leading-none mb-2 h-[1.2em] overflow-hidden select-none drop-shadow-[0_0_15px_rgba(204,255,0,0.45)]">
                            {String(item.val).padStart(2, '0').split('').map((char, charIdx) => (
                              <div key={charIdx} className="relative w-[0.82em] h-[1.2em] overflow-hidden inline-block">
                                <AnimatePresence mode="popLayout">
                                  <motion.span
                                    key={char}
                                    initial={{ y: '100%', opacity: 0, filter: 'blur(4px)' }}
                                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ y: '-100%', opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                                    className="absolute inset-0 flex justify-center items-center"
                                  >
                                    {char}
                                  </motion.span>
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>

                          <span className="text-[8.5px] text-cream/45 uppercase tracking-[0.18em] font-black font-mono group-hover:text-primary transition-colors">{item.label}</span>
                        </motion.div>
                      ))}
                    </div>

                  </>
                )}

                {/* Notify signup form or Shop Now button (Desktop Only) */}
                <div className="hidden md:block">
                  {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
                    <Link
                      to="/shop"
                      className="w-full max-w-sm py-4 bg-primary text-dark hover:bg-white hover:text-dark transition-all duration-300 font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none text-center decoration-none"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Shop Live Collection
                    </Link>
                  ) : !notified ? (
                    <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                      <div className="relative flex-grow">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
                        <input
                          type="email"
                          required
                          placeholder="Enter email for drop alert"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-cream focus:border-primary focus:outline-none text-xs sm:text-sm font-sans transition-all placeholder:text-cream/30 focus:bg-white/[0.05]"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        className="px-6 py-3.5 bg-primary text-dark font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:text-dark transition-all duration-300 flex items-center justify-center gap-2 font-mono shrink-0 border-none cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notify Me</span>
                      </motion.button>
                    </form>
                  ) : (
                    <div className="bg-white/[0.02] border border-primary/20 max-w-md p-4 rounded-xl text-left text-xs font-mono text-primary flex items-center gap-3">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      <span>EARLY ACCESS RESERVED. WE'LL EMAIL YOU.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Preview Images Column (Right) */}
              <div className="md:col-span-6 flex flex-col gap-6 items-center w-full">
                {/* Main Viewport Container */}
                <div className="aspect-[4/4.7] w-full max-w-md bg-white/[0.01] border border-white/10 rounded-3xl overflow-hidden relative shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] group hover:shadow-[0_0_40px_rgba(204,255,0,0.06)] transition-all duration-500">

                  {/* Outer Tech Brackets Decals */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/60 pointer-events-none z-20" />
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/60 pointer-events-none z-20" />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/60 pointer-events-none z-20" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/60 pointer-events-none z-20" />

                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent top-0 animate-[scan_3s_ease-in-out_infinite] z-20 pointer-events-none opacity-40" />

                  <style dangerouslySetInnerHTML={{
                    __html: `
                      @keyframes scan {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}} />

                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeSneakPeek}
                      src={comingSoonImages[activeSneakPeek]?.url || '/images/Regular-T.png'}
                      alt={comingSoonImages[activeSneakPeek]?.label || 'Teaser'}
                      initial={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  </AnimatePresence>

                  {/* Deep Shadow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none z-10" />

                  {/* Floating Info Tag */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl flex items-center justify-between z-20">
                    <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-cream">
                      {comingSoonImages[activeSneakPeek]?.label || 'UNRELEASED PRODUCT'}
                    </span>
                    <span className="text-[9px] font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md font-black">
                      SNEAK PEEK
                    </span>
                  </div>
                </div>

                {/* Interactive Thumbnails grid */}
                <div className="grid grid-cols-3 gap-3.5 w-full max-w-md">
                  {comingSoonImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSneakPeek(idx)}
                      className={`aspect-[4/4.7] rounded-2xl overflow-hidden border-2 text-left relative transition-all cursor-pointer ${activeSneakPeek === idx
                        ? 'border-primary scale-[0.98] shadow-[0_0_20px_rgba(204,255,0,0.25)]'
                        : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                        }`}
                    >
                      <img src={img.url || '/images/Regular-T.png'} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/35 hover:bg-transparent transition-colors" />
                      {/* Tech index marker on thumbnail */}
                      <span className="absolute bottom-1.5 left-2 text-[7px] font-mono text-white/60 bg-black/70 px-1 rounded-sm">
                        0{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Notify signup form or Shop Now button (Mobile Only) */}
                <div className="md:hidden w-full max-w-md mt-6">
                  {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
                    <Link
                      to="/shop"
                      className="w-full py-4 bg-primary text-dark hover:bg-white hover:text-dark transition-all duration-300 font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none text-center decoration-none"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Shop Live Collection
                    </Link>
                  ) : !notified ? (
                    <form onSubmit={handleNotifyMe} className="flex flex-row gap-2 w-full">
                      <div className="relative flex-grow">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
                        <input
                          type="email"
                          required
                          placeholder="Enter email for alert"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-cream focus:border-primary focus:outline-none text-xs font-sans transition-all placeholder:text-cream/30 focus:bg-white/[0.05]"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        className="px-4 py-3.5 bg-primary text-dark font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl hover:bg-white hover:text-dark transition-all duration-300 flex items-center justify-center gap-1.5 font-mono shrink-0 border-none cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notify</span>
                      </motion.button>
                    </form>
                  ) : (
                    <div className="bg-white/[0.02] border border-primary/20 w-full p-4 rounded-xl text-left text-xs font-mono text-primary flex items-center gap-3">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      <span>EARLY ACCESS RESERVED. WE'LL EMAIL YOU.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.section>

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
