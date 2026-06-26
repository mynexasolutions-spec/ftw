import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Eye, Upload, Palette, Check, ArrowRight,
  Flame, Sparkles, Send, RefreshCw, X, ArrowUpRight, Package, Shirt
} from 'lucide-react'

// Dummy T-shirt Products (4 Featured Collection Products with Front/Back images for hover swap animation)
const FEATURED_PRODUCTS = [
  {
    id: 'ftw-sig-01',
    name: 'Signature Heavyweight Oversized Tee',
    price: 1899,
    description: 'Engineered with premium 280 GSM French Terry cotton. Designed with a perfect relaxed drop-shoulder silhouette, minimal high-density branding on chest, and high-frequency puff print artwork on back.',
    sizes: ['S', 'M', 'L', 'XL'],
    imageFront: '/images/1.1.jpeg',
    imageBack: '/images/1.2.jpeg',
    details: '280 GSM • 100% French Terry Cotton • Puff Graphic Back'
  },
  {
    id: 'ftw-cyber-02',
    name: 'Cyber-Neon Oversized Tee',
    price: 1999,
    description: 'Bold statement apparel. Features reflective cyber-sigil typography across the chest that reacts to night flashes. Structured collar design that retains shape after endless washes.',
    sizes: ['M', 'L', 'XL'],
    imageFront: '/images/2.1.jpeg',
    imageBack: '/images/2.2.jpeg',
    details: '260 GSM • Neon Cyber-Sigil Reflective Print'
  },
  {
    id: 'ftw-acid-03',
    name: 'Retro Acid-Wash Drop Tee',
    price: 2199,
    description: 'Individually dyed to create a unique vintage texture for each unit. Finished with distress-style hem lines and raw industrial aesthetics. Perfect for layered streetwear looks.',
    sizes: ['S', 'M', 'L'],
    imageFront: '/images/3.1.jpeg',
    imageBack: '/images/3.2.jpeg',
    details: '300 GSM Heavy Vintage Cotton • Distress Hem Details'
  },
  {
    id: 'ftw-box-04',
    name: 'Minimalist Monogram Box Tee',
    price: 1799,
    description: 'Clean aesthetics with a luxury touch. High-density debossed rubber FTW box logo in centered alignment on the chest. Side slits at the hem for improved mobility and drape.',
    sizes: ['S', 'M', 'L', 'XL'],
    imageFront: '/images/4.1.jpeg',
    imageBack: '/images/4.2.jpeg',
    details: '240 GSM Soft Compact Cotton • Debossed Rubber Logo'
  }
]

// Sale products dataset
const SALE_PRODUCTS = [
  {
    id: 'ftw-sale-01',
    name: 'Vanguard Drop-Shoulder Tee',
    originalPrice: 1899,
    salePrice: 1299,
    discountPercent: 31,
    imageFront: '/images/1.1.jpeg',
    imageBack: '/images/1.2.jpeg',
    sizes: ['S', 'M'],
    color: 'Carbon Black'
  },
  {
    id: 'ftw-sale-02',
    name: 'Core Logo Classic Fit Tee',
    originalPrice: 1599,
    salePrice: 999,
    discountPercent: 37,
    imageFront: '/images/2.1.jpeg',
    imageBack: '/images/2.2.jpeg',
    sizes: ['M', 'L'],
    color: 'Chalk White'
  }
]

// Animation variants
const revealMaskVariants = {
  hidden: { y: '102%' },
  visible: { y: 0, transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1] } }
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
}

export default function Home() {
  const { addToCart } = useCart()
  const [selectedSizes, setSelectedSizes] = useState({
    'ftw-sig-01': 'M', 'ftw-cyber-02': 'L', 'ftw-acid-03': 'M', 'ftw-box-04': 'S'
  })

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Countdown timer State
  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 12, minutes: 45, seconds: 30 })
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notified, setNotified] = useState(false)

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
  const [dtfColor, setDtfColor] = useState('Black')
  const [dtfSize, setDtfSize] = useState('M')
  const [dtfQty, setDtfQty] = useState(1)
  const [dtfUploadedFile, setDtfUploadedFile] = useState(null)
  const [dtfArtwork, setDtfArtwork] = useState('Front Center')

  const baseDtfPrice = 1499
  const printDtfPrice = 500
  const totalDtfEstimate = (baseDtfPrice + printDtfPrice) * dtfQty

  // Live Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        clearInterval(timer)
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Rotating images states
  const [activeIndex, setActiveIndex] = useState(0)

  const heroImages = [
    { src: '/images/1.2.jpeg', alt: 'FTW Signature Heavyweight Tee Showcase' },
    { src: '/images/2.2.jpeg', alt: 'FTW Cyber-Neon Oversized Tee Showcase' },
    { src: '/images/4.2.jpeg', alt: 'FTW Retro Acid-Wash Drop Tee Showcase' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 3)
    }, 4500)
    return () => clearInterval(timer)
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
      toast.success(`Design "${file.name}" uploaded successfully!`, {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
    }
  }

  const handleOrderDtf = () => {
    if (!dtfUploadedFile) {
      toast.error("Please upload a design file first.", {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return
    }
    const customProduct = {
      id: `custom-dtf-${Date.now()}`,
      name: `Custom DTF Tee (${dtfColor} / ${dtfArtwork})`,
      price: baseDtfPrice + printDtfPrice,
      image: dtfColor === 'Black'
        ? '/images/WhatsApp Image 2026-06-22 at 1.35.40 PM (1).jpeg'
        : '/images/WhatsApp Image 2026-06-22 at 1.35.42 PM (1).jpeg'
    }
    for (let i = 0; i < dtfQty; i++) {
      addToCart(customProduct, dtfSize)
    }
    toast.success(`${dtfQty}x Custom DTF Print T-shirts added to bag!`, {
      style: { background: '#0B0B0B', color: '#FFFFFF' }
    })
  }

  return (
    <div className="bg-cream text-dark min-h-screen relative overflow-hidden font-sans bg-grid-dots bg-grain">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(204,255,0,0.12),rgba(255,255,255,0))] pointer-events-none z-0" />

      {/* Hero Banner Section (Luxury Light Editorial Streetwear Layout) */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative min-h-[85vh] py-12 lg:py-16 flex items-center z-10 overflow-hidden bg-[#FAF9F6] text-dark border-b border-cream3"
      >
        {/* Soft, clean background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(204,255,0,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute left-10 top-1/4 w-72 h-72 bg-accent/3 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Typographical Area (Left Column) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-6 space-y-8 relative z-20"
            >
              {/* Premium Release Tag */}
              <div className="overflow-hidden h-fit">
                <motion.div
                  variants={revealMaskVariants}
                  className="inline-flex items-center gap-2 bg-dark text-primary px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  <span>LIMITED DROP 01 / ONLINE NOW</span>
                </motion.div>
              </div>

              {/* Sophisticated Editorial Headline */}
              <h1 className="font-display text-5xl sm:text-6xl md:text-[5.2rem] tracking-tighter leading-[0.85] uppercase font-black text-dark select-none">
                <div className="overflow-hidden h-fit">
                  <motion.div variants={revealMaskVariants}>STREETWEAR</motion.div>
                </div>
                <div className="overflow-hidden h-fit -mt-1 md:-mt-2">
                  <motion.div variants={revealMaskVariants} className="text-dark/45 font-light">REDEFINED</motion.div>
                </div>
                <div className="overflow-hidden h-fit -mt-2">
                  <motion.div
                    variants={revealMaskVariants}
                    className="text-accent italic relative inline-block transform -skew-x-6 text-6xl sm:text-7xl md:text-[6.5rem] tracking-tight leading-[0.8]"
                  >
                    FOR THE WIN.
                  </motion.div>
                </div>
              </h1>

              {/* Clean Paragraph */}
              <motion.p
                variants={fadeUpVariants}
                className="text-dark2/75 text-sm sm:text-base max-w-md leading-relaxed font-sans font-medium"
              >
                We blend luxury editorial aesthetics with structural heavyweight street design. Crafted with premium 280 GSM French Terry cotton.
              </motion.p>

              {/* Polished Tech Specs Row */}
              <motion.div
                variants={fadeUpVariants}
                className="grid grid-cols-2 gap-4 max-w-md pt-2 border-t border-cream3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark/5 flex items-center justify-center shrink-0">
                    <Shirt className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-dark uppercase tracking-wider font-mono">Premium Base</h4>
                    <p className="text-[9px] text-dark2/50 font-mono">280 GSM French Terry</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark/5 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-dark" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-dark uppercase tracking-wider font-mono">Graphic Detail</h4>
                    <p className="text-[9px] text-dark2/50 font-mono">3D Puff Printing</p>
                  </div>
                </div>
              </motion.div>

              {/* Clean CTAs */}
              <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-4 pt-4">
                <motion.div
                  onMouseMove={handleMagnetPrimaryMove}
                  onMouseLeave={handleMagnetLeave}
                  animate={{ x: magnetPrimary.x, y: magnetPrimary.y }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                >
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-dark text-cream hover:bg-primary hover:text-dark transition-all duration-300 font-bold uppercase tracking-widest text-xs rounded-full shadow-lg group border border-dark hover:border-primary"
                  >
                    Shop Catalog
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div
                  onMouseMove={handleMagnetSecondaryMove}
                  onMouseLeave={handleMagnetLeave}
                  animate={{ x: magnetSecondary.x, y: magnetSecondary.y }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                >
                  <a
                    href="#coming-soon"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-white border border-cream3 hover:border-dark text-dark font-bold uppercase tracking-widest text-xs rounded-full transition-all duration-300 shadow-sm"
                  >
                    View Lookbook
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Premium Editorial Showcase (Right Column) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[500px] w-full z-30">
              
              {/* Asymmetrical background card layers */}
              <div className="absolute w-[280px] sm:w-[320px] aspect-[3/4.2] border border-cream3 rounded-3xl transform rotate-[5deg] translate-x-3 translate-y-3 pointer-events-none z-0 bg-white/40 backdrop-blur-xs" />
              
              {/* Product Card Container with Hover Tilt */}
              <motion.div
                style={{
                  rotateX: heroMouse.y * -15,
                  rotateY: heroMouse.x * 15,
                  transformStyle: 'preserve-3d',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-[280px] sm:w-[320px] aspect-[3/4.2] bg-white border border-cream3 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative group z-10"
              >
                {/* Image Showcase Frame */}
                <div className="w-full h-full rounded-2xl overflow-hidden bg-cream3 relative flex items-center justify-center">
                  <motion.img
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    src={heroImages[activeIndex].src}
                    alt={heroImages[activeIndex].alt}
                    className="w-full h-full object-cover select-none"
                  />

                  {/* Glassmorphic Hotspots */}
                  <div className="absolute inset-0 z-30 pointer-events-auto">
                    {/* Hotspot 1 */}
                    <div className="absolute top-[28%] left-[40%] group/hotspot">
                      <span className="flex h-4 w-4 items-center justify-center relative cursor-pointer">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                      </span>
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md border border-cream3 text-dark px-3.5 py-2 rounded-lg text-[9px] font-mono uppercase tracking-wider whitespace-nowrap shadow-sm pointer-events-none opacity-0 group-hover/hotspot:opacity-100 transition-opacity duration-300">
                        Double-ribbed high collar
                      </div>
                    </div>

                    {/* Hotspot 2 */}
                    <div className="absolute bottom-[35%] right-[28%] group/hotspot">
                      <span className="flex h-4 w-4 items-center justify-center relative cursor-pointer">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-dark"></span>
                      </span>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md border border-cream3 text-dark px-3.5 py-2 rounded-lg text-[9px] font-mono uppercase tracking-wider whitespace-nowrap shadow-sm pointer-events-none opacity-0 group-hover/hotspot:opacity-100 transition-opacity duration-300">
                        Heavyweight 280 GSM Canvas
                      </div>
                    </div>
                  </div>

                  {/* Specs Badge */}
                  <div className="absolute bottom-4 left-4 bg-dark/95 text-cream border border-dark/5 px-3 py-1.5 rounded-lg text-[8px] font-mono flex items-center gap-2 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span>LIMITED DROP 01 // 100 UNITS ONLY</span>
                  </div>
                </div>
              </motion.div>

              {/* Clean Film Strip selector tabs */}
              <div className="flex gap-3 mt-6 relative z-40 bg-white/80 backdrop-blur-md p-2 rounded-full border border-cream3 shadow-sm">
                {heroImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-12 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                      activeIndex === idx ? 'border-dark scale-105 shadow-sm' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Infinite Scrolling Marquee */}
      <div className="bg-dark text-primary border-y border-dark py-4 overflow-hidden relative z-20 select-none">
        <div className="flex whitespace-nowrap animate-marquee-left font-display text-sm font-black uppercase tracking-[0.25em]">
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
        className="max-w-7xl mx-auto px-6 py-24 border-b border-cream3 z-10 relative"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-accent font-mono uppercase tracking-widest text-xs font-semibold block mb-2">// CATALOG SERIES 01</span>
            <h2 className="font-display text-4xl uppercase font-black text-dark">FEATURED COLLECTION</h2>
          </div>
          <span className="text-dark2/50 text-xs font-mono uppercase tracking-wider">Hover cards to preview back graphics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURED_PRODUCTS.map((product) => {
            const currentSize = selectedSizes[product.id]

            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="bg-cream border border-cream3 rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-500 flex flex-col justify-between group"
              >
                {/* Image Swap Hover Box */}
                <div className="relative aspect-[3/4] bg-cream3 overflow-hidden">
                  <img
                    src={product.imageFront}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src={product.imageBack}
                    alt={`${product.name} back print`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 scale-102 group-hover:scale-100"
                  />

                  {/* Actions Layer */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="bg-cream/90 hover:bg-dark hover:text-cream text-dark p-2.5 rounded-full border border-cream3/50 shadow-md transition-all flex items-center justify-center cursor-pointer"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="absolute bottom-4 left-4 bg-dark/75 text-primary text-[8px] font-mono tracking-widest uppercase px-3 py-1.5 rounded backdrop-blur-xs">
                    Unisex Fit
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-display text-sm font-black uppercase text-dark line-clamp-1">{product.name}</h3>
                      <span className="text-sm font-mono font-bold text-dark shrink-0">₹{product.price}</span>
                    </div>
                    <p className="text-[10px] text-dark2/45 font-mono mb-4">{product.details}</p>

                    {/* Sizing Toggles */}
                    <div className="mb-4">
                      <div className="flex gap-1.5">
                        {product.sizes.map((size) => (
                          <motion.button
                            key={size}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: size }))}
                            className={`w-9 py-1 border text-[10px] font-mono font-bold transition-all rounded ${currentSize === size
                              ? 'bg-dark border-dark text-primary'
                              : 'border-cream3 text-dark2 hover:bg-cream3'
                              }`}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[10px]">
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="py-3 border border-cream3 text-dark2 hover:bg-cream3 font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-1"
                    >
                      Specs
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product)}
                      className="py-3 bg-dark text-cream hover:bg-accent hover:text-cream font-black uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to bag
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Infinite Moving Marquee Ticker Stripe 2 (Reverse movement) */}
      <div className="bg-primary text-dark border-y border-dark py-4 overflow-hidden relative z-20 select-none">
        <div className="flex whitespace-nowrap animate-marquee-right font-display text-xs font-black uppercase tracking-[0.3em]">
          <span>PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • CUSTOM DTF PRINTING LABORATORY • PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • </span>
          <span>PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • CUSTOM DTF PRINTING LABORATORY • PAST DROPS SOLD OUT • ARCHIVE SALE 30%+ OFF • </span>
        </div>
      </div>

      {/* Sale Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="bg-cream2 border-b border-cream3 py-24 z-10 relative"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <div className="inline-flex items-center gap-1.5 text-accent font-mono uppercase tracking-widest text-xs font-semibold mb-2">
                <Flame className="w-4 h-4 fill-accent" />
                // EXCLUSIVE OFFERS
              </div>
              <h2 className="font-display text-4xl uppercase font-black text-dark">SALE ARCHIVE</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SALE_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="bg-cream border border-cream3 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="w-36 h-44 shrink-0 bg-cream3 rounded-xl overflow-hidden relative">
                  <img src={product.imageFront} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  <img src={product.imageBack} alt={`${product.name} back`} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute top-2 left-2 bg-accent text-cream text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded z-10">
                    -{product.discountPercent}% OFF
                  </span>
                </div>

                <div className="flex-grow flex flex-col justify-between h-full w-full">
                  <div>
                    <span className="text-[10px] text-accent uppercase font-mono tracking-widest font-bold">{product.color}</span>
                    <h3 className="font-display text-base font-black uppercase text-dark mt-1 mb-2">{product.name}</h3>

                    <div className="flex items-baseline gap-3 mb-4 font-mono">
                      <span className="text-lg font-black text-accent">₹{product.salePrice}</span>
                      <span className="text-xs text-dark2/45 line-through">₹{product.originalPrice}</span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(product, true)}
                    className="w-full py-3 bg-accent text-cream hover:bg-dark transition-colors font-mono font-bold text-xs uppercase tracking-widest rounded"
                  >
                    Quick Add to Bag
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* DTF Customization Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 py-24 border-b border-cream3 z-10 relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-dark3/5 border border-cream3 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest mb-6">
              <Palette className="w-4 h-4 text-dark" />
              PRINT LAB
            </div>
            <h2 className="font-display text-3xl md:text-5xl uppercase font-black text-dark mb-6">
              CUSTOM PRINT SERVICE
            </h2>
            <p className="text-dark2/75 text-sm leading-relaxed mb-8">
              Want a customized graphic look? Choose your apparel canvas base color, configure print alignment, and pick our premier graphic art drops to construct your own custom streetwear artifact.
            </p>

            <div className="space-y-6 border-t border-cream3 pt-8 font-sans">
              {/* Upload Design */}
              <div>
                <span className="text-[10px] text-dark2/50 uppercase tracking-widest font-mono font-bold block mb-3">Upload Design</span>
                <label className="border-2 border-dashed border-dark/25 hover:border-dark rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-cream">
                  <Upload className="w-8 h-8 text-dark2/60 mb-2" />
                  <span className="text-xs font-bold text-dark block">Click to select design file</span>
                  <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                </label>
                {dtfUploadedFile && (
                  <div className="mt-3 bg-dark text-primary px-3 py-2 text-xs font-mono rounded flex justify-between items-center animate-pulse">
                    <span>Attached: {dtfUploadedFile}</span>
                    <button onClick={() => setDtfUploadedFile(null)} className="text-primary hover:text-accent font-bold">Clear</button>
                  </div>
                )}
              </div>

              {/* T-Shirt Color */}
              <div>
                <span className="text-[10px] text-dark2/50 uppercase tracking-widest font-mono font-bold block mb-3">Select T-Shirt Color</span>
                <div className="flex gap-4">
                  {['Black', 'White', 'Cream'].map(color => (
                    <motion.button
                      key={color}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDtfColor(color)}
                      className={`px-4 py-2 border text-xs font-mono font-bold rounded transition-all ${dtfColor === color ? 'bg-dark border-dark text-primary' : 'border-cream3 text-dark'
                        }`}
                    >
                      {color}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Select Size */}
              <div>
                <span className="text-[10px] text-dark2/50 uppercase tracking-widest font-mono font-bold block mb-3">Select Size</span>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map(sz => (
                    <motion.button
                      key={sz}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setDtfSize(sz)}
                      className={`w-10 py-2 border text-xs font-mono font-bold rounded transition-all ${dtfSize === sz ? 'bg-dark border-dark text-primary' : 'border-cream3 text-dark'
                        }`}
                    >
                      {sz}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Qty & Alignment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-dark2/50 uppercase tracking-widest font-mono font-bold block mb-3">Printing Position</span>
                  <select
                    value={dtfArtwork}
                    onChange={(e) => setDtfArtwork(e.target.value)}
                    className="w-full px-3 py-2.5 border border-cream3 rounded text-xs font-mono bg-cream focus:outline-none"
                  >
                    <option>Front Center</option>
                    <option>Left Chest</option>
                    <option>Large Back</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-dark2/50 uppercase tracking-widest font-mono font-bold block mb-3">Quantity Selection</span>
                  <div className="flex items-center border border-cream3 rounded bg-cream overflow-hidden">
                    <button onClick={() => setDtfQty(q => Math.max(1, q - 1))} className="px-3 py-2 font-bold">-</button>
                    <span className="flex-grow text-center text-xs font-mono font-bold">{dtfQty}</span>
                    <button onClick={() => setDtfQty(q => q + 1)} className="px-3 py-2 font-bold">+</button>
                  </div>
                </div>
              </div>

              {/* Pricing Estimate */}
              <div className="border-t border-cream3 pt-6 flex justify-between items-center font-mono">
                <div>
                  <span className="text-xs text-dark2/50 uppercase block">Instant Price Estimate</span>
                </div>
                <span className="text-xl font-black text-dark">₹{totalDtfEstimate}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleOrderDtf}
                className="w-full py-4 bg-dark text-cream hover:bg-accent hover:text-cream transition-colors font-mono font-black text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Order Custom Print
              </motion.button>
            </div>
          </div>

          {/* Interactive Customization Preview */}
          <div className="bg-cream2 border border-cream3 rounded-2xl p-8 flex flex-col items-center justify-center relative">
            <span className="absolute top-4 left-4 text-[9px] font-mono uppercase bg-accent text-cream font-bold px-2 py-1 rounded">
              Interactive Preview
            </span>

            <div className={`relative w-72 h-80 rounded-xl shadow-md border border-cream3 flex items-center justify-center transition-all ${dtfColor === 'Black' ? 'bg-[#1C1C1E]' : dtfColor === 'White' ? 'bg-white' : 'bg-[#F4EFEB]'
              }`}>
              <div className={`absolute border border-dashed border-accent/30 rounded p-1.5 flex flex-col items-center justify-center transition-all ${dtfArtwork === 'Front Center' ? 'top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28' :
                dtfArtwork === 'Left Chest' ? 'top-1/4 left-1/4 -translate-x-1/2 w-14 h-14' :
                  'bottom-10 left-1/2 -translate-x-1/2 w-40 h-44'
                }`}>
                <div className="text-center font-mono select-none">
                  <div className="text-xs text-accent font-black tracking-widest uppercase">FOR THE WIN</div>
                  <div className="text-[7px] text-accent mt-1 opacity-70">CUSTOM DTF</div>
                </div>
              </div>
              <div className="absolute top-2 w-12 h-1.5 bg-[#8A8A8F]/40 rounded-full" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Coming Soon Section */}
      <motion.section
        id="coming-soon"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="bg-dark text-cream py-24 border-b border-dark3 z-10 relative"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-primary font-mono uppercase tracking-widest text-xs font-semibold block mb-4">// NEXT DROP SNEAK PEEK</span>
          <h2 className="font-display text-4xl md:text-6xl uppercase font-black mb-4">SATORI SHADOW COLLECTION</h2>
          <p className="text-cream/70 text-sm md:text-base leading-relaxed mb-12 max-w-xl mx-auto">
            Upcoming limited series introducing reflective technical fabrics and premium heavy-duty pocket details. Drops in:
          </p>

          {/* Countdown timer */}
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-16 font-mono text-center">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-dark2 border border-dark3 p-4 rounded">
              <span className="block text-2xl md:text-4xl font-black text-primary">{timeLeft.days}</span>
              <span className="text-[9px] text-cream/40 uppercase tracking-widest font-bold">DAYS</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-dark2 border border-dark3 p-4 rounded">
              <span className="block text-2xl md:text-4xl font-black text-primary">{timeLeft.hours}</span>
              <span className="text-[9px] text-cream/40 uppercase tracking-widest font-bold">HRS</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-dark2 border border-dark3 p-4 rounded">
              <span className="block text-2xl md:text-4xl font-black text-primary">{timeLeft.minutes}</span>
              <span className="text-[9px] text-cream/40 uppercase tracking-widest font-bold">MINS</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-dark2 border border-dark3 p-4 rounded">
              <span className="block text-2xl md:text-4xl font-black text-primary">{timeLeft.seconds}</span>
              <span className="text-[9px] text-cream/40 uppercase tracking-widest font-bold">SECS</span>
            </motion.div>
          </div>

          {/* Sneak peek image */}
          <div className="mb-16 aspect-[16/9] max-w-xl mx-auto bg-dark2 border border-dark3 rounded-xl overflow-hidden relative">
            <img
              src="/images/WhatsApp Image 2026-06-22 at 1.35.40 PM.jpeg"
              alt="Sneak peek preview"
              className="w-full h-full object-cover filter blur-[2.5px] scale-105"
            />
            <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
              <span className="border border-cream/25 bg-dark2/80 px-4 py-2 text-xs uppercase tracking-widest font-mono rounded font-black">
                SNEAK PEEK IMAGES
              </span>
            </div>
          </div>

          {/* Notify signup form */}
          {!notified ? (
            <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter email for drop alert access"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="flex-grow px-5 py-4 rounded bg-dark2 border border-dark3 text-cream focus:border-primary focus:outline-none text-sm"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-4 bg-primary text-dark font-black uppercase tracking-widest text-xs rounded hover:bg-cream hover:text-dark transition-colors flex items-center justify-center gap-2 font-mono shrink-0"
              >
                Notify Me
              </motion.button>
            </form>
          ) : (
            <div className="bg-dark2 border border-primary/25 max-w-sm mx-auto p-4 rounded text-center text-xs font-mono text-cream/90 animate-pulse">
              ⚡ EARLY ACCESS REGISTRATION LOCKED.
            </div>
          )}
        </div>
      </motion.section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setQuickViewProduct(null)} className="absolute inset-0 bg-dark/60 backdrop-blur-xs" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream border border-cream3 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 md:grid-cols-2"
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 bg-cream border border-cream3 p-2 rounded-full hover:bg-cream3 cursor-pointer z-10"
            >
              <X className="w-4 h-4 text-dark" />
            </button>

            <div className="aspect-[4/5] bg-cream3">
              <img
                src={quickViewProduct.imageFront}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-accent font-mono uppercase tracking-widest block mb-1">CURRENT DROP 01</span>
                <h3 className="font-display text-lg font-black uppercase text-dark mb-2">{quickViewProduct.name}</h3>
                <p className="text-base font-bold font-mono text-dark mb-4">₹{quickViewProduct.price}</p>
                <p className="text-xs text-dark2/75 leading-relaxed mb-6">{quickViewProduct.description}</p>
                <p className="text-[10px] text-dark2/45 font-mono mb-4">{quickViewProduct.details}</p>

                {/* Size list */}
                <div className="mb-4">
                  <span className="text-[9px] text-dark2/45 uppercase tracking-widest font-mono font-bold block mb-2">Select Size</span>
                  <div className="flex gap-1.5">
                    {quickViewProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSizes(prev => ({ ...prev, [quickViewProduct.id]: sz }))}
                        className={`w-9 py-1 border text-[10px] font-mono font-bold rounded ${selectedSizes[quickViewProduct.id] === sz ? 'bg-dark border-dark text-primary' : 'border-cream3 text-dark'
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
                className="w-full py-3.5 bg-dark text-cream hover:bg-accent hover:text-cream transition-colors font-mono font-bold text-xs uppercase tracking-widest rounded"
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
  