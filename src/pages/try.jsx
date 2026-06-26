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

      {/* Hero Banner Section (Luxury Streetwear Editorial Layout) */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative min-h-[72vh] border-b border-cream3 py-6 lg:py-10 flex items-center z-10 overflow-hidden"
      >
        {/* Large Faded Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
          <motion.div
            style={{
              x: heroMouse.x * 35,
              y: heroMouse.y * 35,
              transition: 'transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)'
            }}
            className="font-display text-[32vw] font-black text-dark opacity-[0.065] leading-none tracking-tighter"
          >
            FTW
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center w-full relative z-10">

          {/* Typographical Area */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 space-y-8 relative z-20 lg:pr-6"
          >
            <div className="overflow-hidden h-fit">
              <motion.div
                variants={revealMaskVariants}
                className="inline-flex items-center gap-2 bg-dark text-primary px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest shadow-neon"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                DROP 01 LIVE NOW
              </motion.div>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-[4.5rem] lg:text-[5.5rem] tracking-tighter leading-[0.7] uppercase font-black text-dark select-none">
              <div className="overflow-hidden h-fit">
                <motion.div variants={revealMaskVariants}>FOR THE</motion.div>
              </div>
              <div className="overflow-hidden h-fit -mt-2 md:-mt-4">
                <motion.div
                  variants={revealMaskVariants}
                  className="text-accent italic relative inline-block transform -skew-x-6 text-6xl sm:text-7xl md:text-[6.5rem] lg:text-[8rem] tracking-tight leading-[0.75]"
                >
                  WIN
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-primary -z-10 text-neon-glow" />
                </motion.div>
              </div>
            </h1>

            <motion.p
              variants={fadeUpVariants}
              className="text-dark2/85 text-xs sm:text-sm max-w-md leading-relaxed font-sans font-medium"
            >
              Limited-edition streetwear crafted with premium fabrics. Once sold out, never restocked.
            </motion.p>

            {/* Premium Interactive Stat Cards (Highlighting client requirements) */}
            <motion.div
              variants={fadeUpVariants}
              className="grid grid-cols-3 gap-3 md:gap-4 pt-4 max-w-lg text-[10px] font-mono uppercase text-dark2"
            >
              <div className="bg-white/40 backdrop-blur-md border border-cream3 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-primary transition-all duration-300 group">
                <Package className="w-5 h-5 text-accent mb-2" />
                <div>
                  <span className="text-[9px] text-dark2/50 font-bold block mb-1 transition-colors group-hover:text-dark">Highlight</span>
                  <span className="text-xs font-black text-dark font-display leading-none">LIMITED STOCK</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 animate-pulse" />
              </div>
              <div className="bg-white/40 backdrop-blur-md border border-cream3 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-primary transition-all duration-300 group">
                <Shirt className="w-5 h-5 text-dark mb-2" />
                <div>
                  <span className="text-[9px] text-dark2/50 font-bold block mb-1 transition-colors group-hover:text-dark">Highlight</span>
                  <span className="text-xs font-black text-dark font-display leading-none">EXCLUSIVE DESIGNS</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 animate-pulse" />
              </div>
              <div className="bg-white/40 backdrop-blur-md border border-cream3 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-accent transition-all duration-300 group">
                <Sparkles className="w-5 h-5 text-primary mb-2 text-neon-glow animate-pulse" />
                <div>
                  <span className="text-[9px] text-dark2/50 font-bold block mb-1 transition-colors group-hover:text-dark">Highlight</span>
                  <span className="text-xs font-black text-accent font-display leading-none">NEW DROPS</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
              </div>
            </motion.div>

            {/* Interactive Magnetic CTAs */}
            <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-4 pt-6">
              <motion.div
                onMouseMove={handleMagnetPrimaryMove}
                onMouseLeave={handleMagnetLeave}
                animate={{ x: magnetPrimary.x, y: magnetPrimary.y }}
                transition={{ type: 'spring', stiffness: 150, damping: 15 }}
              >
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-dark text-cream hover:bg-primary hover:text-dark transition-all duration-300 font-bold uppercase tracking-widest text-xs rounded-sm shadow-xl group border border-dark hover:border-primary"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                  className="inline-flex items-center gap-3 px-10 py-5 bg-cream border border-cream3 hover:border-dark text-dark font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-300 shadow-sm"
                >
                  View Lookbook
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Graphic Side Layout (Stacking Images Rotating Slideshow) */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[380px] sm:h-[500px] md:h-[600px] w-full mt-8 lg:mt-0 lg:ml-0 z-30">

            {/* Floating Limited-Drop Badge Overlay */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-2 md:right-10 bg-dark text-primary border border-primary/30 px-4 py-2 rounded-lg font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-neon z-50 pointer-events-none"
            >
              ⚡ LIMITED 100 PCS
            </motion.div>

            {/* Rotating 3D Fan Carousel of 3 Cards */}
            <div className="relative w-[180px] sm:w-[240px] md:w-[280px] aspect-[3/4.6] flex items-center justify-center">
              {heroImages.map((img, idx) => {
                const isCenter = idx === activeIndex;
                const isLeft = idx === (activeIndex - 1 + 3) % 3;

                let xVal = '0%';
                let scaleVal = 1;
                let rotateVal = 0;
                let opacityVal = 1;
                let zIndexVal = 30;

                if (isCenter) {
                  xVal = '0%';
                  scaleVal = 1;
                  rotateVal = 0;
                  opacityVal = 1;
                  zIndexVal = 30;
                } else if (isLeft) {
                  xVal = '-30%';
                  scaleVal = 0.88;
                  rotateVal = -6;
                  opacityVal = 0.75;
                  zIndexVal = 20;
                } else {
                  // isRight
                  xVal = '30%';
                  scaleVal = 0.88;
                  rotateVal = 6;
                  opacityVal = 0.75;
                  zIndexVal = 20;
                }

                return (
                  <motion.div
                    key={idx}
                    style={{
                      transformOrigin: 'bottom center',
                    }}
                    animate={{
                      x: xVal,
                      scale: scaleVal,
                      rotate: rotateVal,
                      opacity: opacityVal,
                      zIndex: zIndexVal,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 24,
                    }}
                    onClick={() => setActiveIndex(idx)}
                    className={`absolute inset-0 bg-cream3 rounded-3xl overflow-hidden shadow-2xl border border-cream3/80 cursor-pointer select-none`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover object-center select-none"
                    />
                  </motion.div>
                );
              })}
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
