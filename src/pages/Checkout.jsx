import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { openRazorpayCheckout } from '../lib/razorpay'
import { insertOrder, getCoupons, getStoreSettings, getProducts, decrementProductStock } from '../lib/supabase'
import {
  ArrowLeft, CreditCard, ShieldCheck, ShoppingBag,
  Trash2, Plus, Minus, Tag, Check, Sparkles, Zap, ArrowRight
} from 'lucide-react'

const getColorHex = (colorName) => {
  if (!colorName) return '#0F0F0F'
  if (typeof colorName !== 'string') return '#0F0F0F'
  if (colorName.startsWith('#')) return colorName
  
  const hexMatch = colorName.match(/#([0-9a-fA-F]{3,6})/)
  if (hexMatch) return `#${hexMatch[1]}`
  
  const clean = colorName.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase()
  
  const COLOR_MAP = {
    'black': '#0F0F0F',
    'white': '#FFFFFF',
    'off-white': '#FAF9F6',
    'offwhite': '#FAF9F6',
    'cream': '#FDF6E2',
    'beige': '#FAD7A0',
    'sand': '#D2C4A8',
    'charcoal': '#3E3E3E',
    'grey': '#707070',
    'gray': '#707070',
    'acid wash gray': '#4A4A4A',
    'acid gray': '#4A4A4A',
    'navy': '#1A2536',
    'navy blue': '#1A2536',
    'olive': '#4D5844',
    'acid olive': '#595C43',
    'lime': '#CCFF00',
    'cyber blue': '#00E5FF',
    'blue': '#2196F3',
    'light blue': '#AED6F1',
    'acid purple': '#583F72',
    'purple': '#8E44AD',
    'violet': '#8E44AD',
    'dusty rose': '#DCAE96',
    'rose': '#E8A5A5',
    'pink': '#FFC0CB',
    'baby pink': '#FFC0CB',
    'lavender': '#D2B4DE',
    'pastel lavender': '#D8B4F8',
    'sage green': '#9CAF88',
    'sage': '#9CAF88',
    'green': '#2ECC71',
    'peach': '#FFDAB9',
    'red': '#E74C3C',
    'maroon': '#800000',
    'burgundy': '#800020',
    'plum': '#F1948A',
    'pista': '#A9DFBF',
    'yellow': '#F1C40F',
    'orange': '#E67E22',
    'brown': '#8B4513',
    'terracotta': '#E2725B',
    'rust': '#B7410E',
    'teal': '#008080',
    'mint': '#98FF98',
    'gold': '#D4AF37',
    'silver': '#C0C0C0'
  }

  if (COLOR_MAP[clean]) return COLOR_MAP[clean]

  for (const key in COLOR_MAP) {
    if (clean.includes(key)) return COLOR_MAP[key]
  }

  return '#0F0F0F'
}

// ─── CONFETTI EFFECT ─────────────────────────────────────────────────────────
function Confetti() {
  const colors = ['#CCFF00', '#FF0055', '#00E5FF', '#FFB300', '#8800FF', '#00FF66']
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const generated = Array.from({ length: 120 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2
      const velocity = 80 + Math.random() * 220
      const xStart = window.innerWidth / 2
      const yStart = window.innerHeight / 3
      return {
        id: i,
        xStart,
        yStart,
        xEnd: xStart + Math.cos(angle) * velocity + (Math.random() - 0.5) * 200,
        yEnd: window.innerHeight + 100,
        yMid: yStart + Math.sin(angle) * velocity - (60 + Math.random() * 120),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        shape: Math.random() > 0.5 ? 'circle' : 'square',
        duration: 2.2 + Math.random() * 2,
        delay: Math.random() * 0.2,
        spin: Math.random() * 1080 - 540,
      }
    })
    setParticles(generated)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: p.xStart,
            y: p.yStart,
            scale: 0,
            rotate: 0,
            opacity: 1
          }}
          animate={{
            x: [p.xStart, (p.xStart + p.xEnd) / 2, p.xEnd],
            y: [p.yStart, p.yMid, p.yEnd],
            scale: [0, 1, 1, 0.7, 0],
            rotate: p.spin,
            opacity: [1, 1, 1, 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            ease: "easeOut",
            delay: p.delay
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Read from .env as VITE_RAZORPAY_KEY_ID (safe to expose — only Key ID, not secret)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
// ─────────────────────────────────────────────────────────────────────────────


export default function Checkout() {
  const navigate = useNavigate()
  const { items, cartTotal, removeFromCart, updateQty, clearCart } = useCart()
  const { user, loading } = useAuth()

  // Enforce login for checkout
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to proceed to checkout!", {
        id: 'auth-required-checkout',
        style: { background: '#161616', color: '#FAF9F6' }
      })
      navigate('/auth?redirect=/checkout')
    }
  }, [loading, user, navigate])

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('razorpay') // 'razorpay' | 'cod'
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)

  const [isPlacing, setIsPlacing] = useState(false)
  const [placeStep, setPlaceStep] = useState(0)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [logoBase64, setLogoBase64] = useState('')
  const [currentStep, setCurrentStep] = useState(1) // 1: Address, 2: Payment

  const validateAddressStep = () => {
    const required = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zip']
    for (const key of required) {
      if (!formData[key] || formData[key].trim() === '') {
        toast.error(`Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, {
          style: { background: '#0B0B0B', color: '#FFFFFF' }
        })
        return false
      }
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address.', {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return false
    }
    if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit phone number.', {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return false
    }
    return true
  }

  useEffect(() => {
    const loadLogo = () => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = '/images/ftw-logo.webp'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        setLogoBase64(canvas.toDataURL('image/png'))
      }
    }
    loadLogo()
  }, [])

  const [dbCoupons, setDbCoupons] = useState([])
  const [dbSettings, setDbSettings] = useState({
    shipping_threshold: 1499,
    shipping_flat_rate: 99,
    enable_razorpay: true,
    enable_cod: true,
    store_address: 'FTW Streetwear Lab, Mumbai, IN'
  })

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }))
    }
  }, [user])

  useEffect(() => {
    async function loadCheckoutData() {
      try {
        const couponsData = await getCoupons()
        setDbCoupons(couponsData || [])
        const settingsData = await getStoreSettings()
        if (settingsData) {
          setDbSettings(settingsData)
          if (!settingsData.enable_razorpay && settingsData.enable_cod) {
            setPaymentMethod('cod')
          } else if (settingsData.enable_razorpay && !settingsData.enable_cod) {
            setPaymentMethod('razorpay')
          }
        }
      } catch (e) {
        console.error("Checkout data prefetch failed:", e)
      }
    }
    loadCheckoutData()
  }, [])

  useEffect(() => {
    if (orderCompleted) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [orderCompleted])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyPromo = (e) => {
    e.preventDefault()
    const cleanCode = promoCode.trim().toUpperCase()
    const matched = dbCoupons.find(c => c.code === cleanCode && c.active)
    if (matched) {
      setAppliedPromo({
        code: cleanCode,
        discount: matched.value,
        type: matched.type
      })
      toast.success(`Promo code ${cleanCode} applied!`, {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
    } else {
      toast.error('Invalid or expired promo code.', {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
  }

  const subtotal = cartTotal
  const discountAmount = appliedPromo
    ? (appliedPromo.type === 'percent' ? subtotal * (appliedPromo.discount / 100) : appliedPromo.discount)
    : 0

  const shippingFee = subtotal >= dbSettings.shipping_threshold ? 0 : dbSettings.shipping_flat_rate
  const finalTotal = Math.round(subtotal - discountAmount + shippingFee)
  const finalTotalPaise = finalTotal * 100 // Razorpay uses paise

  const saveOrderToDB = async (id, payStatus) => {
    const orderData = {
      id,
      customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      user_id: user?.id || null,
      phone: formData.phone,
      address: `${formData.address}, ${formData.apartment ? formData.apartment + ', ' : ''}${formData.city}, ${formData.state} - ${formData.zip}`,
      payment_method: paymentMethod,
      payment_status: payStatus,
      items: items,
      total: finalTotal,
      discount: Math.round(discountAmount),
      shipping: shippingFee,
      status: 'Pending'
    }
    try {
      await insertOrder(orderData)
      try {
        const allProducts = await getProducts()
        for (const item of items) {
          const foundProd = allProducts.find(p => item.id.startsWith(p.id))
          if (foundProd) {
            await decrementProductStock(foundProd.id, item.qty || 1, item.size, item.color)
          }
        }
      } catch (stockErr) {
        console.error("Failed to update product stock counts after ordering:", stockErr)
      }
    } catch (err) {
      console.error("Order sync to Supabase failed:", err)
    }
  }

  const handleCODOrder = async () => {
    const randomId = `FTW-${Math.floor(100000 + Math.random() * 900000)}`
    setOrderId(randomId)
    setIsPlacing(true)
    setPlaceStep(0)
    await saveOrderToDB(randomId, 'COD - Unpaid')
    setTimeout(() => {
      setPlaceStep(1)
      setTimeout(() => {
        setPlaceStep(2)
        setTimeout(() => {
          setIsPlacing(false)
          setOrderCompleted(true)
          clearCart()
        }, 1200)
      }, 1200)
    }, 1200)
  }

  const handleRazorpayPayment = () => {
    const randomOrderId = `FTW-${Math.floor(100000 + Math.random() * 900000)}`

    openRazorpayCheckout({
      keyId: RAZORPAY_KEY_ID,
      amount: finalTotalPaise,
      currency: 'INR',
      name: 'FOR THE WIN',
      description: `FTW Drop 01 — ${items.length} item(s)`,
      image: logoBase64 || (window.location.origin + '/images/ftw-logo.webp'),
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zip}`,
        promo_code: appliedPromo?.code || 'none',
      },
      theme: {
        color: '#CCFF00',
        backdrop_color: '#0B0B0B',
      },
      onSuccess: async (response) => {
        const rzpOrderId = response.razorpay_order_id || 'N/A'
        setOrderId(randomOrderId)
        setIsPlacing(true)
        setPlaceStep(2)
        await saveOrderToDB(randomOrderId, `Paid - Razorpay ID: ${rzpOrderId}`)
        setTimeout(() => {
          setIsPlacing(false)
          setOrderCompleted(true)
          clearCart()
        }, 1500)
        toast.success('Payment successful! 🎉', {
          style: { background: '#0B0B0B', color: '#CCFF00' }
        })
      },
      onDismiss: () => {
        toast('Payment cancelled.', {
          icon: '⚠️',
          style: { background: '#0B0B0B', color: '#FFFFFF' }
        })
      },
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your cart is empty.', {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return
    }

    if (paymentMethod === 'cod') {
      handleCODOrder()
    } else {
      handleRazorpayPayment()
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  // ─── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-cream text-dark py-16 md:py-24 px-6 flex items-center justify-center font-sans bg-grid-dots bg-grain">
        <Confetti />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-xl w-full bg-white border border-cream3 rounded-3xl p-6 md:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner border border-primary/20 relative"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-accent"
            />
            <Check className="w-8 h-8 md:w-10 md:h-10 text-accent relative z-10" />
          </motion.div>

          <h1 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight text-dark mb-2">
            order placed
          </h1>
          <p className="text-dark2/60 text-xs md:text-sm font-mono uppercase tracking-widest mb-6">
            Ref: {orderId}
          </p>
          <p className="text-dark2 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 max-w-md mx-auto">
            you get invoice after order delivered
          </p>

          <div className="bg-cream2 border border-cream3 rounded-2xl p-4 sm:p-6 text-left space-y-4 mb-6 md:mb-8">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono border-b border-cream3/60 pb-3">
              <span className="text-dark2/50">ESTIMATED ARRIVAL</span>
              <span className="font-bold text-dark">3 – 5 BUSINESS DAYS</span>
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono">
              <span className="text-dark2/50">PAYMENT CHANNEL</span>
              <span className="font-bold text-dark uppercase">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Secure'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              to="/my-orders"
              className="flex-1 py-3 sm:py-4 bg-dark text-cream hover:bg-primary hover:text-dark transition-colors font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-lg flex items-center justify-center"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="flex-1 py-3 sm:py-4 border border-cream3 hover:border-dark text-dark transition-colors font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-lg flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── CHECKOUT FORM ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream text-dark pt-16 pb-8 px-6 relative overflow-hidden font-sans bg-grid-dots bg-grain">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(204,255,0,0.06),rgba(255,255,255,0))] pointer-events-none z-0" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Back Link */}
        <div className="mb-3">
          <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-dark2/60 hover:text-dark group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Storefront
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step Navigation / Indicator */}
            <div className="flex border-b border-cream3/60 pb-2 gap-6 font-mono text-[10px] uppercase tracking-wider font-bold">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`transition-colors cursor-pointer pb-2 -mb-[11px] border-b-2 ${currentStep === 1 ? 'text-dark border-dark' : 'text-dark2/40 border-transparent hover:text-dark'}`}
              >
                01. Shipping Address
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateAddressStep()) setCurrentStep(2)
                }}
                className={`transition-colors cursor-pointer pb-2 -mb-[11px] border-b-2 ${currentStep === 2 ? 'text-dark border-dark' : 'text-dark2/40 border-transparent hover:text-dark'}`}
              >
                02. Payment Method
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step-address"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* SECTION 01 — Shipping Address */}
                    <div className="bg-white/40 backdrop-blur-md border border-cream3 p-6 md:p-7 rounded-3xl shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-cream3 pb-3">
                        <div className="w-6 h-6 rounded bg-dark text-primary flex items-center justify-center font-mono text-[10px] font-bold">01</div>
                        <h2 className="font-display text-base font-black uppercase text-dark">SHIPPING ADDRESS</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'First Name', name: 'firstName', placeholder: 'e.g. Virgil', type: 'text' },
                          { label: 'Last Name', name: 'lastName', placeholder: 'e.g. Abloh', type: 'text' },
                          { label: 'Email Address', name: 'email', placeholder: 'e.g. virgil@offwhite.com', type: 'email' },
                          { label: 'Phone Number', name: 'phone', placeholder: 'e.g. +91 9876543210', type: 'tel' },
                        ].map((field) => (
                          <div key={field.name} className="space-y-1">
                            <label className="text-[9px] text-dark2/50 uppercase tracking-widest font-mono font-bold block">{field.label}</label>
                            <input
                              type={field.type}
                              name={field.name}
                              required
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              disabled={field.name === 'email' && !!user?.email}
                              className={`w-full px-3 py-2.5 border border-cream3 rounded-xl text-sm focus:outline-none focus:border-dark transition-colors ${field.name === 'email' && !!user?.email
                                ? 'bg-cream3/60 text-dark2/50 cursor-not-allowed'
                                : 'bg-cream/40'
                                }`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-dark2/50 uppercase tracking-widest font-mono font-bold block">Street Address</label>
                        <input type="text" name="address" required value={formData.address} onChange={handleInputChange}
                          placeholder="e.g. 23 Fashion St"
                          className="w-full px-3 py-2.5 bg-cream/40 border border-cream3 rounded-xl text-sm focus:outline-none focus:border-dark transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-dark2/50 uppercase tracking-widest font-mono font-bold block">Apartment / Suite (Optional)</label>
                        <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange}
                          placeholder="e.g. Floor 2, Suite A"
                          className="w-full px-3 py-2.5 bg-cream/40 border border-cream3 rounded-xl text-sm focus:outline-none focus:border-dark transition-colors" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'City', name: 'city', placeholder: 'Mumbai' },
                          { label: 'State', name: 'state', placeholder: 'Maharashtra' },
                          { label: 'ZIP Code', name: 'zip', placeholder: '400001' },
                        ].map((field) => (
                          <div key={field.name} className="space-y-1">
                            <label className="text-[9px] text-dark2/50 uppercase tracking-widest font-mono font-bold block">{field.label}</label>
                            <input type="text" name={field.name} required value={formData[field.name]} onChange={handleInputChange}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2.5 bg-cream/40 border border-cream3 rounded-xl text-sm focus:outline-none focus:border-dark transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (validateAddressStep()) setCurrentStep(2)
                      }}
                      className="w-fit mx-auto px-6 sm:px-8 py-3 sm:py-4 bg-dark hover:bg-primary hover:text-dark text-cream transition-all font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-xl border border-dark hover:border-primary"
                    >
                      Continue to Payment
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-payment"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* SECTION 02 — Payment Gateway */}
                    <div className="bg-white/40 backdrop-blur-md border border-cream3 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                      <div className="flex items-center gap-3 border-b border-cream3 pb-4">
                        <div className="w-8 h-8 rounded bg-dark text-primary flex items-center justify-center font-mono text-xs font-bold">02</div>
                        <h2 className="font-display text-lg font-black uppercase text-dark">PAYMENT GATEWAY</h2>
                      </div>

                      {!dbSettings.enable_razorpay && !dbSettings.enable_cod ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-5 text-center font-mono text-xs space-y-2">
                          <p className="font-bold uppercase tracking-wider">⚠️ Payment Service Unavailable</p>
                          <p className="opacity-70 leading-relaxed">Payment gateways are undergoing system updates. Please try again after some time.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Razorpay Option */}
                          {dbSettings.enable_razorpay && (
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('razorpay')}
                              className={`w-full flex items-center justify-between p-3.5 sm:p-4 border rounded-2xl transition-all cursor-pointer ${paymentMethod === 'razorpay'
                                  ? 'bg-dark border-dark text-cream shadow-lg'
                                  : 'bg-white/50 border-cream3 text-dark hover:border-dark'
                                }`}
                            >
                              <div className="flex items-center gap-3.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'razorpay' ? 'bg-primary text-dark' : 'bg-cream text-dark'}`}>
                                  <Zap className="w-4 h-4" />
                                </div>
                                <div className="text-left font-sans">
                                  <span className="text-xs uppercase font-black block">Razorpay Secure Checkout</span>
                                  <span className="text-[10px] opacity-60 block mt-0.5 font-mono">Cards · UPI · Net Banking · Wallets</span>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-primary' : 'border-dark2/20'}`}>
                                {paymentMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                            </button>
                          )}

                          {/* COD Option */}
                          {dbSettings.enable_cod && (
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('cod')}
                              className={`w-full flex items-center justify-between p-3.5 sm:p-4 border rounded-2xl transition-all cursor-pointer ${paymentMethod === 'cod'
                                  ? 'bg-dark border-dark text-cream shadow-lg'
                                  : 'bg-white/50 border-cream3 text-dark hover:border-dark'
                                }`}
                            >
                              <div className="flex items-center gap-3.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-primary text-dark' : 'bg-cream text-dark'}`}>
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <div className="text-left font-sans">
                                  <span className="text-xs uppercase font-black block">Cash on Delivery (COD)</span>
                                  <span className="text-[10px] opacity-60 block mt-0.5 font-mono">Pay with cash or scan on delivery</span>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-dark2/20'}`}>
                                {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Razorpay info pill */}
                      {paymentMethod === 'razorpay' && dbSettings.enable_razorpay && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-dark text-primary rounded-xl p-4 flex items-start gap-3 text-xs font-mono"
                        >
                          <Zap className="w-4 h-4 shrink-0 mt-0.5 text-primary animate-pulse" />
                          <div>
                            <div className="font-bold uppercase tracking-wider mb-1">Razorpay Secure Checkout</div>
                            <div className="opacity-60 leading-relaxed">You will be redirected to Razorpay's encrypted payment modal. Supports UPI, Cards, Net Banking &amp; Wallets.</div>
                          </div>
                        </motion.div>
                      )}

                      {/* Security / Info Banner */}
                      {(dbSettings.enable_razorpay || dbSettings.enable_cod) && (
                        <div className="bg-cream2 border border-cream3/60 rounded-2xl p-5 text-xs text-dark2/60 leading-relaxed flex items-start gap-3">
                          <ShieldCheck className="w-5 h-5 text-dark shrink-0" />
                          <span>
                            {paymentMethod === 'razorpay'
                              ? 'All transactions are secured . We never store your card details.'
                              : 'Please pay cash or scan the digital QR code with your delivery partner upon arrival.'}
                          </span>
                        </div>
                      )}

                      {/* Footer Actions inside the card */}
                      <div className="flex flex-col-reverse sm:flex-row gap-4 items-center sm:justify-between border-t border-cream3 pt-6 mt-6">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-mono uppercase tracking-widest text-dark2/60 hover:text-dark flex items-center justify-center gap-1.5 transition-colors font-bold w-full sm:w-fit py-2.5 sm:py-0"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Address
                        </button>
                        <motion.button
                          whileTap={(!dbSettings.enable_razorpay && !dbSettings.enable_cod) ? {} : { scale: 0.98 }}
                          type="submit"
                          disabled={!dbSettings.enable_razorpay && !dbSettings.enable_cod}
                          className={`w-fit mx-auto px-6 sm:px-8 py-3 sm:py-4 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-xl border ${(!dbSettings.enable_razorpay && !dbSettings.enable_cod)
                              ? 'bg-dark/10 text-dark2/30 border-cream3 cursor-not-allowed shadow-none'
                              : 'bg-dark hover:bg-primary hover:text-dark text-cream border-dark hover:border-primary transition-all'
                            }`}
                        >
                          {(!dbSettings.enable_razorpay && !dbSettings.enable_cod) ? (
                            <>Service Offline</>
                          ) : paymentMethod === 'razorpay' ? (
                            <>
                              <Zap className="w-4 h-4" />
                              Pay ₹{finalTotal} via Razorpay
                            </>
                          ) : (
                            <>Confirm COD Order — ₹{finalTotal}</>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">

            {/* Promo Code */}
            <div className="bg-white/40 backdrop-blur-md border border-cream3 p-6 rounded-3xl shadow-sm">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-grow">
                  <Tag className="w-4 h-4 text-dark2/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="DISCOUNT CODE"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-cream/40 border border-cream3 rounded-xl text-[10px] sm:text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-dark placeholder:text-dark2/30"
                  />
                </div>
                <button type="submit" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-dark text-cream hover:bg-primary hover:text-dark transition-all rounded-xl text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                  Apply
                </button>
              </form>
              {appliedPromo && (
                <div className="mt-3 bg-dark text-primary px-3 py-2 text-xs font-mono rounded-lg flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {appliedPromo.code} ({appliedPromo.type === 'percent' ? `-${appliedPromo.discount}%` : `-₹${appliedPromo.discount}`} off)
                  </span>
                  <button type="button" onClick={handleRemovePromo} className="hover:text-accent font-bold uppercase text-[10px]">Remove</button>
                </div>
              )}

            </div>

            {/* Cart Summary */}
            <div className="bg-white/40 backdrop-blur-md border border-cream3 p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-display text-lg font-black uppercase text-dark border-b border-cream3 pb-4 flex justify-between items-center">
                <span>ORDER SUMMARY</span>
                <span className="text-xs font-mono text-dark2/45">[{items.length}]</span>
              </h3>

              <div className="max-h-[280px] overflow-y-auto divide-y divide-cream3 pr-1">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-dark2/40 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto opacity-30" />
                    <span className="text-xs font-mono uppercase block">Your bag is empty</span>
                  </div>
                ) : items.map((item) => {
                  const standardProductId = item.id && item.id.startsWith('ftw-') ? (item.id.split('-').length >= 4 ? item.id.split('-').slice(0, -2).join('-') : item.id) : null;
                  return (
                    <div key={`${item.id}-${item.size}-${item.color || ''}`} className="py-4 flex gap-4 items-center">
                      {standardProductId ? (
                        <Link to={`/product/${standardProductId}`} className="w-14 h-18 bg-cream3 rounded-xl overflow-hidden shrink-0 block group">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform" />
                        </Link>
                      ) : (
                        <div className="w-14 h-18 bg-cream3 rounded-xl overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        {standardProductId ? (
                          <Link to={`/product/${standardProductId}`} className="group block decoration-none">
                            <h4 className="text-xs font-bold uppercase text-dark truncate group-hover:text-accent transition-colors">{item.name}</h4>
                          </Link>
                        ) : (
                          <h4 className="text-xs font-bold uppercase text-dark truncate">{item.name}</h4>
                        )}
                      <div className="flex gap-1.5 flex-wrap items-center mt-0.5">
                        <span className="text-[9px] text-accent font-mono font-bold uppercase">SIZE {item.size}</span>
                        {item.color && (
                          <span className="inline-flex items-center gap-1.5 text-[9px] text-dark2/60 font-mono font-bold uppercase">
                            <span 
                              style={{ backgroundColor: getColorHex(item.color) }} 
                              className="w-3 h-3 rounded-full border border-black/20 shadow-xs inline-block shrink-0" 
                            />
                            COLOR {item.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button type="button" onClick={() => updateQty(item.id, item.size, item.color, item.qty - 1)}
                          className="w-5 h-5 rounded border border-cream3 flex items-center justify-center hover:bg-cream3 transition-colors">
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-mono font-bold">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}
                          className="w-5 h-5 rounded border border-cream3 flex items-center justify-center hover:bg-cream3 transition-colors">
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold block">₹{item.price * item.qty}</span>
                      <button type="button" onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="text-dark2/30 hover:text-accent mt-1.5 p-0.5 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Shipping Threshold Progress */}
              <div className="border-t border-cream3 pt-5 pb-1 font-mono text-xs">
                {subtotal >= dbSettings.shipping_threshold ? (
                  <div className="flex items-center gap-2 text-green-700 font-bold uppercase tracking-wider text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    You qualify for free shipping!
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] uppercase font-black tracking-wider text-dark2/50">
                      <span>Free Shipping Goal</span>
                      <span>Add <span className="font-extrabold text-dark">₹{dbSettings.shipping_threshold - subtotal}</span> more</span>
                    </div>
                    <div className="w-full h-2 bg-cream3/60 border border-cream3/30 rounded-full overflow-hidden shadow-inner p-[1px]">
                      <div 
                        style={{ width: `${Math.min((subtotal / dbSettings.shipping_threshold) * 100, 100)}%` }} 
                        className="h-full bg-gradient-to-r from-dark via-dark/90 to-[#CCFF00] rounded-full transition-all duration-700 ease-out shadow-sm" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-cream3 pt-5 space-y-3 font-mono text-xs uppercase">
                <div className="flex justify-between text-dark2/60">
                  <span>Subtotal</span><span>₹{subtotal}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-accent">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-₹{discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-dark2/60">
                  <span>Shipping</span><span>{shippingFee === 0 ? <span className="text-green-700 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                </div>

                <div className="border-t border-cream3 pt-4 flex justify-between items-baseline">
                  <span className="font-display font-black text-sm text-dark">TOTAL</span>
                  <span className="text-xl font-black text-dark">₹{finalTotal}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── Order Processing Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {isPlacing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-md flex flex-col items-center justify-center text-cream px-6"
          >
            <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-8" />
            <div className="h-8 overflow-hidden relative w-72 text-center">
              <AnimatePresence mode="wait">
                {placeStep === 0 && (
                  <motion.span key="s0" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    className="font-mono text-xs uppercase tracking-widest text-primary absolute inset-0 block">
                    VERIFYING STOCK ALLOCATION...
                  </motion.span>
                )}
                {placeStep === 1 && (
                  <motion.span key="s1" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    className="font-mono text-xs uppercase tracking-widest text-primary absolute inset-0 block">
                    CONFIRMING PAYMENT CHANNEL...
                  </motion.span>
                )}
                {placeStep === 2 && (
                  <motion.span key="s2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    className="font-mono text-xs uppercase tracking-widest text-primary absolute inset-0 block">
                    FINALIZING YOUR SECURE ORDER...
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
