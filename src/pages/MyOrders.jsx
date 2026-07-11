import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrders, insertReview, getReviews, getCustomDesign, getCustomizerConfig } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronDown, ChevronUp, Loader2, MapPin, CreditCard, Download, Star, X, CheckCircle, Eye, Tag, Edit, Type, Image as ImageIcon, Sparkles, Layers } from 'lucide-react'
import { toast } from 'react-hot-toast'

const MOCKUPS = {
  front: '/images/media__1782208425084.png',
  back: '/images/media__1782208435752.png',
  left_sleeve: '/images/media__1782208444237.png',
  right_sleeve: '/images/media__1782208452503.png',
}

const ZONE_BOXES = {
  front: { top: '26%', left: '27.5%', width: '45%', height: '52%' },
  back: { top: '20%', left: '27.5%', width: '45%', height: '62%' },
  left_sleeve: { top: '48%', left: '60%', width: '22%', height: '16%' },
  right_sleeve: { top: '48%', left: '32%', width: '22%', height: '16%' },
}

const PRODUCT_STYLES = {
  regular: 'Regular Tee',
  oversize: 'Oversize Tee',
  polo: 'Collared Tee'
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Enforce login for my orders
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to view your orders!", {
        id: 'auth-required-my-orders',
        style: { background: '#161616', color: '#FAF9F6' }
      })
      navigate('/auth?redirect=/my-orders')
    }
  }, [authLoading, user, navigate])

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Rating modal state
  const [ratingModal, setRatingModal] = useState(null) // { order, item }
  const [ratings, setRatings] = useState({}) // { `${orderId}-${itemIdx}`: { stars, review } }
  const [submittedRatings, setSubmittedRatings] = useState({})
  const [hoveredStar, setHoveredStar] = useState(0)
  const [userReviews, setUserReviews] = useState([])

  // Custom Design Preview States
  const [selectedDesignForPreview, setSelectedDesignForPreview] = useState(null)
  const [previewZone, setPreviewZone] = useState('front')
  const [customizerConfig, setCustomizerConfig] = useState(null)

  useEffect(() => {
    async function loadUserOrders() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const [allOrders, allReviews, config] = await Promise.all([
          getOrders(),
          getReviews(),
          getCustomizerConfig()
        ])

        const userOrders = allOrders.filter(o => {
          if (o.user_id && user.id) {
            return o.user_id === user.id
          }
          return o.email?.toLowerCase() === user.email?.toLowerCase()
        })
        setOrders(userOrders)
        setCustomizerConfig(config)

        // Load user's reviews from Supabase DB
        const filteredReviews = allReviews.filter(
          r => r.user_id === user.id || r.email?.toLowerCase() === user.email?.toLowerCase()
        )
        setUserReviews(filteredReviews)
      } catch (err) {
        console.error("Failed to load user orders/reviews/config:", err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadUserOrders()
    }
  }, [user, authLoading])

  const handleViewOrderItemDesign = async (item) => {
    let customDesignObj = item.customDesign
    if (customDesignObj && typeof customDesignObj === 'string') {
      try {
        customDesignObj = JSON.parse(customDesignObj)
      } catch (e) {
        console.error("Error parsing customDesign:", e)
      }
    }

    if (customDesignObj) {
      setSelectedDesignForPreview({
        id: item.designId || `des-unsaved-${Date.now()}`,
        style_id: customDesignObj.style_id || 'regular',
        color_name: customDesignObj.color_name || 'White',
        color_hex: customDesignObj.color_hex || '#FAF9F6',
        canvas_elements: customDesignObj.canvas_elements || { front: [], back: [], left_sleeve: [], right_sleeve: [] },
        total_price: customDesignObj.total_price || item.price,
        created_at: new Date().toISOString()
      })
      setPreviewZone('front')
      return
    }

    if (item.designId) {
      try {
        const loadToast = toast.loading("Loading custom design details...", {
          style: { background: '#0B0B0B', color: '#FAF9F6', border: '1px solid #2D2D2D' }
        })
        const loaded = await getCustomDesign(item.designId)
        toast.dismiss(loadToast)
        if (loaded) {
          setSelectedDesignForPreview(loaded)
          setPreviewZone('front')
        } else {
          toast.error("Custom design not found.")
        }
      } catch (err) {
        toast.error("Failed to load design details.")
      }
    }
  }

  const toggleExpand = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id))
  }

  // ── Download Invoice ──
  const loadJsPDF = () => {
    return new Promise((resolve, reject) => {
      if (window.jspdf) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load PDF library. Please check your internet connection.'))
      document.head.appendChild(script)
    })
  }

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = url
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
    })
  }

  const generateInvoice = async (order) => {
    toast.loading('Generating PDF Invoice...', { id: 'pdf-toast' })
    try {
      await loadJsPDF()
      const logoBase64 = await loadImageAsBase64('/images/ftw-logo.webp')
      const { jsPDF } = window.jspdf
      const doc = new jsPDF('p', 'mm', 'a4')

      // Colors
      const primaryColor = [255, 78, 32] // #FF4E20
      const darkColor = [17, 17, 17] // #111
      const lightBg = [249, 249, 247] // #f9f9f7
      const borderColor = [238, 238, 238] // #eee
      const textSecondary = [120, 120, 120]

      // Page dimensions
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 15
      let y = 20



      // --- Header ---
      let textOffset = margin
      if (logoBase64) {
        // Draw the logo image
        doc.addImage(logoBase64, 'PNG', margin, y - 8, 12, 14)
        textOffset = margin + 16
      }

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(24)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.text('FOR THE ', textOffset, y)
      const firstPartWidth = doc.getTextWidth('FOR THE ')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFont('Helvetica', 'bolditalic')
      doc.text('WIN', textOffset + firstPartWidth, y)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2])
      doc.text('PREMIUM STREETWEAR', textOffset, y + 5)

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.text('TAX INVOICE', pageWidth - margin, y, { align: 'right' })

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2])
      const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      doc.text(`Order ID: ${order.id}`, pageWidth - margin, y + 5, { align: 'right' })
      doc.text(`Date: ${dateStr}`, pageWidth - margin, y + 9, { align: 'right' })
      doc.text(`Status: ${order.status || 'Delivered'}`, pageWidth - margin, y + 13, { align: 'right' })

      y += 18
      doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)

      // --- Bill To & Payment Info boxes ---
      y += 8
      const boxWidth = (pageWidth - margin * 2 - 6) / 2
      const boxHeight = 35

      // Bill To Box
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
      doc.setLineWidth(0.2)
      doc.roundedRect(margin, y, boxWidth, boxHeight, 3, 3, 'FD')

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2])
      doc.text('BILL TO', margin + 5, y + 6)
      doc.setFontSize(10)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.text(order.customer_name || order.name || 'Customer', margin + 5, y + 12)
      doc.setFontSize(8)
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2])
      doc.text(order.email || '', margin + 5, y + 16)
      const addressLines = doc.splitTextToSize(order.address || '', boxWidth - 10)
      doc.text(addressLines, margin + 5, y + 21)

      // Payment Box
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
      doc.roundedRect(margin + boxWidth + 6, y, boxWidth, boxHeight, 3, 3, 'FD')

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2])
      doc.text('PAYMENT INFO', margin + boxWidth + 11, y + 6)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.text(`Method: ${order.payment_method || 'N/A'}`, margin + boxWidth + 11, y + 14)
      const displayStatus = (order.payment_status || '').includes('COD') ? 'COD' : (order.payment_status || '').split('-')[0].trim() || 'Paid'
      doc.text(`Status: ${displayStatus}`, margin + boxWidth + 11, y + 20)

      // --- Items Table ---
      y += boxHeight + 10
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2])
      doc.text('ITEMS ORDERED', margin, y)

      y += 4
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2])
      doc.rect(margin, y, pageWidth - margin * 2, 8, 'F')

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text('#', margin + 3, y + 5.5)
      doc.text('PRODUCT', margin + 10, y + 5.5)
      doc.text('SIZE', margin + 95, y + 5.5)
      doc.text('QTY', margin + 115, y + 5.5)
      doc.text('UNIT PRICE', margin + 135, y + 5.5)
      doc.text('AMOUNT', pageWidth - margin - 3, y + 5.5, { align: 'right' })

      y += 8
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])

      const items = order.items || []
      items.forEach((item, index) => {
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
        doc.line(margin, y + 8, pageWidth - margin, y + 8)

        doc.setFont('Helvetica', 'normal')
        doc.text((index + 1).toString(), margin + 3, y + 5.5)
        doc.setFont('Helvetica', 'bold')

        const nameText = item.name || ''
        const nameLines = doc.splitTextToSize(nameText, 80)
        doc.text(nameLines, margin + 10, y + 5.5)

        doc.setFont('Helvetica', 'normal')
        doc.text(item.size || '-', margin + 95, y + 5.5)
        doc.text((item.qty || 1).toString(), margin + 115, y + 5.5)
        doc.text(`Rs. ${(item.price || 0).toLocaleString('en-IN')}`, margin + 135, y + 5.5)

        doc.setFont('Helvetica', 'bold')
        const amount = (item.price || 0) * (item.qty || 1)
        doc.text(`Rs. ${amount.toLocaleString('en-IN')}`, pageWidth - margin - 3, y + 5.5, { align: 'right' })

        const rowHeight = Math.max(nameLines.length * 4.5, 8)
        y += rowHeight
      })

      // --- Total Summary Row ---
      y += 5
      const itemsSubtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0)
      const shippingFee = order.shipping !== undefined && order.shipping !== null
        ? order.shipping
        : (itemsSubtotal >= 1499 ? 0 : 99)
      const discount = order.discount !== undefined && order.discount !== null
        ? order.discount
        : Math.max(0, itemsSubtotal + shippingFee - order.total)
      const hasDiscount = discount > 0
      const summaryBoxHeight = hasDiscount ? 24 : 18

      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
      doc.rect(margin, y, pageWidth - margin * 2, summaryBoxHeight, 'F')
      doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2])
      doc.line(margin, y, pageWidth - margin, y)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])

      let summaryY = y + 5.5

      // Subtotal Row
      doc.text('Subtotal:', pageWidth - margin - 50, summaryY, { align: 'right' })
      doc.text(`Rs. ${itemsSubtotal.toLocaleString('en-IN')}`, pageWidth - margin - 3, summaryY, { align: 'right' })
      summaryY += 5.5

      // Discount Row
      if (hasDiscount) {
        doc.text('Discount:', pageWidth - margin - 50, summaryY, { align: 'right' })
        doc.setTextColor(255, 78, 32)
        doc.text(`-Rs. ${discount.toLocaleString('en-IN')}`, pageWidth - margin - 3, summaryY, { align: 'right' })
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
        summaryY += 5.5
      }

      // Delivery Row
      doc.text('Delivery:', pageWidth - margin - 50, summaryY, { align: 'right' })
      if (shippingFee === 0) {
        doc.setTextColor(22, 163, 74)
        doc.text('FREE', pageWidth - margin - 3, summaryY, { align: 'right' })
      } else {
        doc.text(`Rs. ${shippingFee}`, pageWidth - margin - 3, summaryY, { align: 'right' })
      }
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      summaryY += 5.5

      // Grand Total Row
      doc.setFont('Helvetica', 'bold')
      doc.text('Grand Total:', pageWidth - margin - 50, summaryY, { align: 'right' })
      doc.text(`Rs. ${order.total.toLocaleString('en-IN')}`, pageWidth - margin - 3, summaryY, { align: 'right' })

      y += summaryBoxHeight

      // --- Footer ---
      y = pageHeight - margin - 15
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
      doc.line(margin, y, pageWidth - margin, y)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2])
      doc.text('Thank you for shopping with FOR THE WIN — forthewinmail8@gmail.com', pageWidth / 2, y + 6, { align: 'center' })
      doc.text('This is a computer-generated invoice and does not require a physical signature.', pageWidth / 2, y + 10, { align: 'center' })
      // --- Watermark (Drawn at the end to layer on top of solid background fills) ---
      if (logoBase64) {
        doc.saveGraphicsState()
        doc.setGState(new doc.GState({ opacity: 0.025 }))
        const wmWidth = 70
        const wmHeight = 82
        doc.addImage(logoBase64, 'PNG', (pageWidth - wmWidth) / 2, (pageHeight - wmHeight) / 2, wmWidth, wmHeight)
        doc.restoreGraphicsState()
      }

      doc.save(`Invoice-FTW-${order.id}.pdf`)
      toast.success('Invoice downloaded as PDF!', {
        id: 'pdf-toast',
        style: { background: '#0B0B0B', color: '#FAF9F6', border: '1px solid #2D2D2D' }
      })
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Could not generate PDF. Please try again.', { id: 'pdf-toast' })
    }
  }

  // ── Submit Rating ──
  const handleSubmitRating = async (orderId, itemIdx) => {
    const key = `${orderId}-${itemIdx}`
    const r = ratings[key]
    if (!r?.stars) { toast.error('Please select a star rating'); return }

    const order = orders.find(o => o.id === orderId)
    if (!order) { toast.error('Order not found'); return }

    const item = order.items?.[itemIdx]
    if (!item) { toast.error('Product details not found'); return }

    const toastId = toast.loading('Submitting review...', {
      style: { background: '#0B0B0B', color: '#FAF9F6', border: '1px solid #2D2D2D' }
    })

    try {
      await insertReview({
        product_name: item.name,
        name: order.customer_name || 'Anonymous Client',
        email: user?.email || order.email || '',
        user_id: user?.id || null,
        rating: Number(r.stars),
        comment: r.review || '',
        approved: false // goes to admin moderation before appearing publicly
      })

      setSubmittedRatings(prev => ({ ...prev, [key]: r }))
      setUserReviews(prev => [...prev, {
        product_name: item.name,
        name: order.customer_name || 'Anonymous Client',
        email: user?.email || order.email || '',
        user_id: user?.id || null,
        rating: Number(r.stars),
        comment: r.review || '',
        approved: false
      }])
      setRatingModal(null)
      toast.success('Thank you! Your review is pending moderator approval. ⭐', {
        id: toastId,
        style: { background: '#0B0B0B', color: '#FAF9F6', border: '1px solid #2D2D2D' }
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit review. Please try again.', { id: toastId })
    }
  }

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (e) {
      return dateStr
    }
  }

  const parsePaymentStatus = (paymentStatus) => {
    let statusText = paymentStatus || 'Unpaid'
    let rzpOrderId = ''
    if (statusText.includes('Razorpay ID:')) {
      const parts = statusText.split('Razorpay ID:')
      statusText = parts[0].trim()
      rzpOrderId = parts[1].trim()
    }
    return { statusText, rzpOrderId }
  }

  const getStatusStep = (status) => {
    const s = (status || 'Pending').toLowerCase()
    if (s === 'delivered') return 3
    if (s === 'shipped' || s === 'dispatched') return 2
    if (s === 'processing') return 1
    return 0 // Pending
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Custom Designs' && order.items?.some(item => item.designId || item.customDesign)) ||
      (order.status || 'Pending').toLowerCase() === selectedStatus.toLowerCase() ||
      (selectedStatus === 'Shipped' && (order.status || '').toLowerCase() === 'dispatched')

    const matchesSearch = searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream text-dark py-32 px-6 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
        <p className="text-xs text-dark2/50 uppercase tracking-widest font-mono">Retrieving your order history...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] bg-cream text-dark py-32 px-6 flex items-center justify-center font-sans bg-grid-dots bg-grain">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-cream3 rounded-3xl p-8 md:p-10 shadow-lg text-center"
        >
          <div className="w-16 h-16 bg-cream3 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-dark2/50" />
          </div>
          <h2 className="font-sans text-2xl font-extrabold uppercase tracking-tight text-dark mb-2">Access Order History</h2>
          <p className="text-xs text-dark2/60 font-sans mb-8 leading-relaxed">
            Please log in or create an account to view and track your streetwear orders.
          </p>
          <Link
            to="/auth"
            className="w-full py-4 bg-dark text-cream hover:bg-accent hover:text-dark transition-all duration-300 font-sans font-bold uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            Log In / Sign Up
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-[#FAF9F6] text-[#161616] min-h-screen relative overflow-hidden font-sans bg-grid-dots bg-grain">

      {/* Styled styles for My Orders page gaming theme details */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Full subtle scanline overlay */
          .orders-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.015) 2px,
              rgba(139,92,246,0.015) 4px
            );
          }

          /* HUD Card outer boundary */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.7), rgba(99,58,214,0.5), rgba(37,99,235,0.5));
            clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }

          /* HUD inner card layout */
          .hud-orders-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            height: 100%;
            clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px);
          }

          /* Corner ticks */
          .hud-corner { position: absolute; width: 10px; height: 10px; border-color: rgba(139,92,246,0.4); border-style: solid; z-index: 10; }
          .hud-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }

          .hud-hex { font-family: monospace; font-size: 7px; color: rgba(139,92,246,0.5); letter-spacing: 0.05em; font-weight: bold; }
        `
      }} />

      <div className="orders-scanlines" />

      {/* Decorative vertical decors */}
      <div className="absolute left-6 top-[35%] rotate-[-90deg] origin-left text-[9px] font-mono text-gray-400 tracking-[0.25em] uppercase select-none pointer-events-none hidden xl:block">
        FTW // CUSTOMER_PORTAL // DATABASE_SECURE
      </div>

      <div className="min-h-screen pt-16 pb-24 px-6 md:px-12 max-w-5xl mx-auto text-dark relative selection:bg-purple-600 selection:text-white">
        {/* Title Header: Matches Shop/Helpline/About page titles */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 sm:mb-16 border-l-4 border-purple-600 pl-4 sm:pl-6"
        >
          <span className="text-purple-600 font-mono uppercase tracking-[0.25em] text-[13.5px] font-black block mb-2">
            CUSTOMER SPACE
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#161616] leading-none">
            MY <span className="text-purple-600 italic transform skew-x-3 inline-block">ORDERS</span>
          </h1>
        </motion.div>

      {/* Filter and Search Bar */}
      {orders.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search by Order ID or Item Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3.5 border border-cream3 rounded-2xl bg-white text-xs font-sans focus:outline-none focus:border-purple-600 transition-colors placeholder:text-dark2/30 font-bold uppercase tracking-wider"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Custom Designs', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2.5 text-[11px] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${selectedStatus === status
                    ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                    : 'bg-white border-cream3 text-dark2/70 hover:border-purple-600/35'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-cream3 rounded-3xl p-12 text-center space-y-6 shadow-sm"
        >
          <ShoppingBag className="w-12 h-12 text-dark/30 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold uppercase text-dark">No orders found</h3>
            <p className="text-xs text-dark2/50 leading-relaxed max-w-sm mx-auto">
              You haven't placed any orders yet. Check out our latest drops in the shop!
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dark text-cream hover:bg-primary hover:text-dark transition-all rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md"
          >
            Go to Shop
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-cream3 rounded-3xl p-12 text-center text-xs text-dark2/50 font-sans shadow-sm">
              No orders found matching the filter criteria.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id
              const totalQty = order.items?.reduce((sum, item) => sum + (item.qty || 1), 0) || 0
              const currentStep = getStatusStep(order.status)
              const { statusText, rzpOrderId } = parsePaymentStatus(order.payment_status)
              const itemsSubtotal = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0) || 0
              const shippingFee = order.shipping !== undefined && order.shipping !== null
                ? order.shipping
                : (itemsSubtotal >= 1499 ? 0 : 99)
              const discount = order.discount !== undefined && order.discount !== null
                ? order.discount
                : Math.max(0, itemsSubtotal + shippingFee - order.total)

              const isDelivered = (order.status || '').toLowerCase() === 'delivered'
              const isShipped = (order.status || '').toLowerCase() === 'shipped' || (order.status || '').toLowerCase() === 'dispatched'
              const isProcessing = (order.status || '').toLowerCase() === 'processing'
              const isCancelled = (order.status || '').toLowerCase() === 'cancelled'

              const steps = ['Placed', 'Processing', 'Shipped', 'Delivered']

              return (
                <motion.div
                  key={order.id}
                  layout="position"
                  className="relative bg-white border border-purple-200 rounded-3xl overflow-hidden shadow-sm hover:border-purple-400/50 hover:shadow-[0_4px_20px_rgba(139,92,246,0.08)] transition-all duration-300"
                >
                  {/* HUD top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
                  {/* HUD corner ticks */}
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />
                  {/* Collapsed Header Info / Card Trigger */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-6 md:p-8 cursor-pointer hover:bg-cream/10 transition-colors"
                  >
                    {/* Top row: Order meta + status + chevron */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
                        <div>
                          <span className="text-[10px] font-mono text-purple-600/70 uppercase font-black block tracking-wider">Order ID</span>
                          <span className="font-mono text-[13px] font-black text-dark block mt-1">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-purple-600/70 uppercase font-black block tracking-wider">Placed On</span>
                          <span className="text-[13px] font-bold text-dark block mt-1">{formatOrderDate(order.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-purple-600/70 uppercase font-black block tracking-wider">Grand Total</span>
                          <span className="text-[15px] font-black font-mono text-dark block mt-1">₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-purple-600/70 uppercase font-black block tracking-wider">Status</span>
                          <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-black uppercase mt-1 border tracking-wider ${isDelivered ? 'bg-green-50 text-green-700 border-green-200' :
                              isShipped ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                isProcessing ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  isCancelled ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-dark2/45 font-bold md:hidden uppercase tracking-widest">Tap to View</span>
                        <button className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all border border-purple-200 cursor-pointer">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Product Preview Strip + Quick Info — always visible */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-cream3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Left: Product thumbnails */}
                        <div className="flex items-center gap-3 flex-wrap flex-grow">
                          {order.items.slice(0, 5).map((item, idx) => {
                            const standardProductId = item.id && item.id.startsWith('ftw-') ? (item.id.split('-').length >= 4 ? item.id.split('-').slice(0, -2).join('-') : item.id) : null

                            const itemContent = (
                              <>
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-12 object-cover rounded-xl border border-cream3 bg-cream shrink-0 group-hover:scale-[1.03] transition-transform"
                                  />
                                ) : (
                                  <div className="w-10 h-12 rounded-xl border border-cream3 bg-cream3/50 flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-4 h-4 text-dark2/30" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-[12px] font-extrabold uppercase text-dark leading-tight group-hover:text-purple-600 transition-colors">{item.name}</p>
                                  <p className="text-[11px] font-mono text-purple-600 font-black uppercase mt-0.5">
                                    {item.size && `Sz ${item.size}`}{item.qty > 1 ? ` × ${item.qty}` : ''}
                                  </p>
                                  <p className="text-[11px] font-mono text-dark2/60 mt-0.5">₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</p>
                                </div>
                              </>
                            )

                            return standardProductId ? (
                              <Link
                                key={idx}
                                to={`/product/${standardProductId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 shrink-0 bg-cream/60 border border-cream3 rounded-2xl px-3 py-2 hover:border-dark/30 hover:bg-cream/90 group transition-all decoration-none"
                              >
                                {itemContent}
                              </Link>
                            ) : (
                              <div key={idx} className="flex items-center gap-2 shrink-0 bg-cream/60 border border-cream3 rounded-2xl px-3 py-2">
                                {itemContent}
                              </div>
                            )
                          })}
                          {order.items.length > 5 && (
                            <div className="shrink-0 w-10 h-12 rounded-xl bg-cream3/60 border border-cream3 flex items-center justify-center">
                              <span className="text-[10px] font-black text-dark2/60">+{order.items.length - 5}</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Quick-glance info + action buttons grouped */}
                        <div className="flex flex-col gap-3 md:items-end justify-center shrink-0 mt-2 md:mt-0">
                          {/* Info pills */}
                          <div className="flex flex-wrap gap-2 md:justify-end">
                            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5">
                              <ShoppingBag className="w-3 h-3 text-purple-500 shrink-0" />
                              <span className="text-[11px] font-black text-dark font-mono whitespace-nowrap">
                                {order.items.reduce((s, i) => s + (i.qty || 1), 0)} item{order.items.reduce((s, i) => s + (i.qty || 1), 0) > 1 ? 's' : ''}
                              </span>
                            </div>
                            {order.payment_method && (
                              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5">
                                <CreditCard className="w-3 h-3 text-purple-500 shrink-0" />
                                <span className="text-[11px] font-black text-dark font-mono whitespace-nowrap uppercase">{order.payment_method}</span>
                              </div>
                            )}
                            {order.address && (
                              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5">
                                <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                                <span className="text-[11px] font-black text-dark font-mono whitespace-nowrap">
                                  {order.address.split(',').slice(-2, -1)[0]?.trim() || order.address.substring(0, 18)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Delivered action buttons */}
                          {isDelivered && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); generateInvoice(order) }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-[11px] font-mono font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-colors duration-200 border-none cursor-pointer whitespace-nowrap shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5" /> Invoice
                              </button>
                              {order.items && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRatingModal({ order, itemIdx: 0 }) }}
                                  className={`flex items-center gap-1.5 px-4 py-2 border text-[11px] font-mono font-black uppercase tracking-widest rounded-xl transition-colors duration-200 cursor-pointer whitespace-nowrap ${order.items.every(item => userReviews.some(ur => ur.product_name === item.name))
                                      ? 'bg-cream border-cream3 text-dark2/50 hover:text-purple-600 hover:border-purple-400'
                                      : 'bg-cream2 border-cream3 text-dark hover:border-purple-600 hover:text-purple-600'
                                    }`}
                                >
                                  {order.items.every(item => userReviews.some(ur => ur.product_name === item.name)) ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5" /> Rated
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-3.5 h-3.5" /> Rate
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border-t border-cream3 p-6 md:p-8 bg-cream/10 space-y-8"
                      >
                        {/* Customer, Address & Payment Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-dark font-sans">
                          <div className="bg-white border border-purple-100 rounded-2xl p-5 space-y-2">
                            <span className="text-[11px] font-mono text-purple-600/70 uppercase font-black block tracking-wider">Delivery Details</span>
                            <p className="text-[13px] font-semibold leading-relaxed whitespace-pre-line text-dark2/80">{order.address}</p>
                          </div>
                          <div className="bg-white border border-purple-100 rounded-2xl p-5 space-y-2">
                            <span className="text-[11px] font-mono text-purple-600/70 uppercase font-black block tracking-wider">Payment Information</span>
                            <p className="text-[13px] font-semibold text-dark uppercase"><span className="text-dark2/45 font-normal">Method:</span> {order.payment_method}</p>
                            <p className="text-[13px] font-semibold text-dark uppercase"><span className="text-dark2/45 font-normal">Status:</span> {statusText}</p>
                            {rzpOrderId && (
                              <p className="font-mono text-[9px] text-dark/70 break-all leading-tight mt-1 bg-cream3/30 p-2 rounded-lg border border-cream3"><span className="font-sans text-dark2/45 font-black uppercase text-[8px] block mb-0.5">Razorpay Order ID</span>{rzpOrderId}</p>
                            )}
                          </div>
                        </div>

                        {/* 3. Items Purchased Table */}
                        <div className="bg-white border border-purple-100 rounded-2xl p-5 space-y-3">
                          <span className="text-[11px] text-purple-600/70 uppercase font-black tracking-widest block border-b border-purple-100 pb-2">Purchased Items ({order.items?.length || 0})</span>
                          <div className="space-y-4">
                            {order.items?.map((item, idx) => {
                              const standardProductId = item.id && item.id.startsWith('ftw-') ? (item.id.split('-').length >= 4 ? item.id.split('-').slice(0, -2).join('-') : item.id) : null

                              const imgEl = item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-15 object-cover bg-cream border border-cream3 rounded-xl shrink-0 transition-transform group-hover:scale-105"
                                />
                              )

                              const titleEl = (
                                <h4 className="text-[13px] font-extrabold uppercase text-dark truncate leading-tight group-hover:text-purple-600 transition-colors">{item.name}</h4>
                              )

                              return (
                                <div key={idx} className="flex gap-4 items-center py-1 text-xs text-dark font-sans border-b border-cream3/40 last:border-none pb-4 last:pb-0">
                                  {standardProductId ? (
                                    <Link to={`/product/${standardProductId}`} className="shrink-0 group block overflow-hidden rounded-xl">
                                      {imgEl}
                                    </Link>
                                  ) : (
                                    imgEl
                                  )}
                                  <div className="flex-grow min-w-0">
                                    {standardProductId ? (
                                      <Link to={`/product/${standardProductId}`} className="group block decoration-none">
                                        {titleEl}
                                      </Link>
                                    ) : (
                                      titleEl
                                    )}
                                    <span className="text-[12px] text-purple-600 font-mono font-black uppercase tracking-wider block mt-1">
                                      Size {item.size} <span className="text-dark/45">x</span> {item.qty || 1}
                                    </span>
                                    {(item.designId || item.customDesign) && (
                                      <button
                                        onClick={() => handleViewOrderItemDesign(item)}
                                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-cream hover:bg-cream3 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg border border-cream3 hover:border-dark/20 text-dark transition-all cursor-pointer whitespace-nowrap"
                                      >
                                        <Eye className="w-3 h-3 text-accent" /> View Custom Design
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[11px] text-dark2/45 block font-mono">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                                    <span className="text-[13px] font-mono font-black block text-dark"> = ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* 4. Amount Summary Box */}
                        <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-5 space-y-2.5 font-mono text-dark">
                          <span className="text-[11px] text-purple-600/70 uppercase font-black tracking-widest block border-b border-purple-100 pb-2 mb-1">Amount Breakdown</span>
                          <div className="flex justify-between text-[13px] text-dark/70">
                            <span>Subtotal</span>
                            <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-[13px] text-purple-600 font-bold">
                              <span>Discount</span>
                              <span>-₹{discount.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[13px] text-dark/70">
                            <span>Delivery</span>
                            {shippingFee === 0 ? (
                              <span className="text-green-700 font-bold uppercase">FREE</span>
                            ) : (
                              <span>₹{shippingFee.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                          <div className="flex justify-between border-t border-purple-200 pt-3 font-bold text-[15px] text-dark">
                            <span>Grand Total</span>
                            <span className="font-black font-mono text-purple-700">₹{order.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Delivered: action row inside expanded */}
                        {isDelivered && (
                          <div className="flex flex-wrap gap-3 pt-2 border-t border-cream3">
                            <span className="text-[11px] font-mono font-black uppercase tracking-widest text-purple-600/50 self-center">Order Complete —</span>
                            <button
                              onClick={() => generateInvoice(order)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-[11px] font-mono font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-colors duration-200 border-none cursor-pointer shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Invoice
                            </button>
                            <button
                              onClick={() => setRatingModal({ order, itemIdx: 0 })}
                              className={`inline-flex items-center gap-2 px-5 py-2.5 border text-[11px] font-mono font-black uppercase tracking-widest rounded-xl transition-colors duration-200 cursor-pointer ${order.items?.every(item => userReviews.some(ur => ur.product_name === item.name))
                                  ? 'bg-cream border-cream3 text-dark/40 hover:text-purple-600 hover:border-purple-400'
                                  : 'bg-cream border-cream3 text-dark hover:border-purple-600 hover:text-purple-600'
                                }`}
                            >
                              {order.items?.every(item => userReviews.some(ur => ur.product_name === item.name)) ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" /> View Ratings
                                </>
                              ) : (
                                <>
                                  <Star className="w-3.5 h-3.5" /> Rate Products
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            }))}
        </div>
      )}

      {/* ── Rating Modal ── */}
      <AnimatePresence>
        {ratingModal && (() => {
          const { order, itemIdx } = ratingModal
          const items = order.items || []
          const currentItemIdx = itemIdx
          const item = items[currentItemIdx]
          const key = `${order.id}-${currentItemIdx}`
          const dbReview = userReviews.find(r => r.product_name === item?.name)
          const submitted = submittedRatings[key] || (dbReview ? { stars: dbReview.rating, review: dbReview.comment } : null)
          const currentRating = ratings[key] || { stars: 0, review: '' }

          return (
            <motion.div
              key="rating-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm"
              onClick={() => setRatingModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-cream3 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden text-dark font-sans"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-cream3">
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-dark2/45 block">FEEDBACK LOOPS</span>
                    <h3 className="font-display font-black uppercase text-dark text-lg tracking-tight mt-0.5">
                      {submitted ? 'YOUR FEEDBACK' : 'RATE THIS ARTIFACT'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setRatingModal(null)}
                    className="p-2 rounded-full hover:bg-cream3 text-dark2/50 hover:text-dark transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Item tabs if multiple items */}
                {items.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto px-6 pt-4 pb-0 no-scrollbar">
                    {items.map((itm, i) => (
                      <button
                        key={i}
                        onClick={() => setRatingModal({ order, itemIdx: i })}
                        className={`shrink-0 px-3.5 py-2 text-[9px] font-mono font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${i === currentItemIdx
                            ? 'bg-dark text-cream border-dark'
                            : 'bg-cream2 border-cream3 text-dark2/50 hover:border-dark/20 hover:text-dark'
                          }`}
                      >
                        {itm.name.split(' ').slice(0, 2).join(' ')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Item info */}
                <div className="px-6 pt-5 flex items-center gap-4">
                  {item?.image ? (
                    <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-xl border border-cream3 bg-cream/60 shrink-0" />
                  ) : (
                    <div className="w-14 h-16 rounded-xl border border-cream3 bg-cream3/50 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-dark2/30" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase text-dark leading-tight truncate">{item?.name}</p>
                    <p className="text-[9px] font-mono text-accent font-black uppercase mt-1.5">{item?.size && `Size ${item.size}`}</p>
                  </div>
                </div>

                {/* Star selector */}
                <div className="px-6 pt-5">
                  <p className="text-[9px] font-mono font-black uppercase tracking-widest text-dark2/45 mb-3">Your Rating</p>
                  {submitted ? (
                    <div className="flex items-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-7 h-7 ${s <= submitted.stars ? 'text-accent fill-accent' : 'text-cream3'}`} />
                      ))}
                      <span className="text-xs font-mono font-black text-dark ml-2">{submitted.stars}/5 Stars</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          onMouseEnter={() => setHoveredStar(s)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setRatings(prev => ({ ...prev, [key]: { ...currentRating, stars: s } }))}
                          className="border-none bg-transparent p-0.5 transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star className={`w-8 h-8 transition-colors ${s <= (hoveredStar || currentRating.stars)
                              ? 'text-accent fill-accent'
                              : 'text-cream3'
                            }`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Review text */}
                  {submitted ? (
                    submitted.review && (
                      <div className="bg-cream2 border border-cream3 rounded-2xl p-4 text-xs text-dark2/60 italic mb-5 leading-relaxed">
                        "{submitted.review}"
                      </div>
                    )
                  ) : (
                    <textarea
                      rows={3}
                      placeholder="TELL US WHAT YOU LOVED..."
                      value={currentRating.review}
                      onChange={(e) => setRatings(prev => ({ ...prev, [key]: { ...currentRating, review: e.target.value } }))}
                      className="w-full px-4 py-3 bg-cream2 border border-cream3 rounded-2xl text-xs font-mono focus:outline-none focus:border-dark text-dark placeholder:text-dark2/25 uppercase resize-none mb-5 transition-colors tracking-wider"
                    />
                  )}
                </div>

                {/* Footer actions */}
                <div className="px-6 pb-6 flex gap-3">
                  {submitted ? (
                    <div className="flex-grow flex items-center gap-2 justify-center py-3.5 bg-green-50 border border-green-200 rounded-2xl">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-green-700">Rating Submitted</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setRatingModal(null)}
                        className="px-5 py-3.5 bg-cream2 border border-cream3 text-dark text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl hover:border-dark/20 transition-all cursor-pointer border-solid"
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => handleSubmitRating(order.id, currentItemIdx)}
                        className="flex-grow py-3.5 bg-dark text-cream text-[10px] font-mono font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-dark transition-all border-none cursor-pointer"
                      >
                        Submit Rating
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDesignForPreview && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div onClick={() => setSelectedDesignForPreview(null)} className="absolute inset-0 bg-dark/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#FAFAF7] border-2 border-cream3 w-full max-w-5xl p-6 sm:p-8 rounded-[32px] shadow-2xl relative z-10 text-sm font-sans flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto text-dark"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDesignForPreview(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream3 border-none bg-transparent cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-dark" />
              </button>

              {/* Visual Canvas Block */}
              <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-cream2/30 rounded-2xl p-6 border border-cream3">
                {/* Zone Selectors with print element counts */}
                <div className="flex flex-wrap justify-center gap-1.5 bg-cream3/60 p-1.5 rounded-2xl border border-cream3">
                  {[
                    { id: 'front', label: 'Front' },
                    { id: 'back', label: 'Back' },
                    { id: 'left_sleeve', label: 'L Sleeve' },
                    { id: 'right_sleeve', label: 'R Sleeve' }
                  ].map(z => {
                    const count = (selectedDesignForPreview.canvas_elements?.[z.id] || []).length
                    const isActive = previewZone === z.id
                    return (
                      <button
                        key={z.id}
                        onClick={() => setPreviewZone(z.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border-none ${isActive
                          ? 'bg-dark text-white shadow-md'
                          : 'text-dark2/60 hover:text-dark hover:bg-cream2 bg-transparent'
                          }`}
                      >
                        <span>{z.label}</span>
                        {count > 0 && (
                          <span className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold ${isActive ? 'bg-primary text-dark' : 'bg-accent text-white animate-pulse'
                            }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* The Shirt Preview Box */}
                <div className="relative rounded-[24px] overflow-hidden shadow-xl border-4 border-white bg-white" style={{
                  width: 320,
                  height: 380,
                  flexShrink: 0
                }}>
                  {/* Scaled Inner Shirt Canvas */}
                  <div style={{
                    width: 420,
                    height: 500,
                    transform: 'scale(0.76)',
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}>
                    {/* Colour background underlay */}
                    <div className="absolute inset-0 z-0 transition-colors duration-300" style={{ backgroundColor: selectedDesignForPreview.color_hex || '#FAF9F6' }} />
                    {/* Mockup base photo */}
                    {(() => {
                      const matchedColor = customizerConfig?.colors?.find(c => c.name.toLowerCase() === selectedDesignForPreview.color_name?.toLowerCase())
                      const previewMockupSrc = matchedColor?.mockups?.[previewZone] || MOCKUPS[previewZone]
                      return (
                        <img
                          src={previewMockupSrc}
                          alt="Mockup Shirt"
                          className="absolute inset-0 z-10 w-full h-full object-contain mix-blend-multiply select-none pointer-events-none"
                        />
                      )
                    })()}
                    {/* Elements container */}
                    <div className="absolute overflow-hidden z-20" style={{
                      top: ZONE_BOXES[previewZone].top,
                      left: ZONE_BOXES[previewZone].left,
                      width: ZONE_BOXES[previewZone].width,
                      height: ZONE_BOXES[previewZone].height,
                    }}>
                      {selectedDesignForPreview.canvas_elements?.[previewZone]?.map((el, idx) => (
                        <div key={el.id} style={{
                          position: 'absolute',
                          left: el.x,
                          top: el.y,
                          transform: `rotate(${el.rotation || 0}deg) scale(${el.scale || 1})`,
                          transformOrigin: 'center',
                          zIndex: 10 + idx,
                          pointerEvents: 'none'
                        }}
                        className="flex items-center justify-center p-1.5"
                        >
                          {el.type === 'text' && (
                            <span style={{
                              fontFamily: el.fontFamily || 'Inter',
                              color: el.color || '#000',
                              fontSize: el.size || 16,
                              fontWeight: el.bold ? 'bold' : 'normal',
                              fontStyle: el.italic ? 'italic' : 'normal',
                              textDecoration: el.underline ? 'underline' : 'none',
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}>{el.content}</span>
                          )}
                          {el.type === 'image' && (
                            <img src={el.url} alt="custom" className="max-w-[100px] max-h-[100px] object-contain" />
                          )}
                          {el.type === 'preset' && (
                            <div className="flex flex-col items-center gap-0.5 bg-white/85 rounded-lg px-2 py-1 shadow-sm border border-white/60">
                              <span className="text-2xl leading-none">{el.emoji}</span>
                              <span className="text-[6px] font-black uppercase tracking-widest text-dark/70 font-mono">{el.text}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-between space-y-6 pt-4 md:pt-0 font-sans">
                <div className="space-y-5">
                  <div className="border-b border-cream3 pb-3.5">
                    <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest block mb-1">Custom Design Reference</span>
                    <div className="flex gap-2 items-center">
                      <span className="font-mono text-[10px] font-bold text-dark bg-white px-3 py-2 rounded-xl border border-cream3 select-all block w-full truncate shadow-inner" title={selectedDesignForPreview.id}>
                        {selectedDesignForPreview.id}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedDesignForPreview.id)
                          toast.success("Design ID copied!")
                        }}
                        className="p-2.5 rounded-xl hover:bg-cream3 border border-cream3 bg-transparent cursor-pointer text-dark/60 shrink-0 transition-colors"
                        title="Copy ID"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <h3 className="font-sans text-2xl font-black uppercase text-dark tracking-tight leading-none">
                      {PRODUCT_STYLES[selectedDesignForPreview.style_id] || 'Custom Tee'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-cream3 shadow-xs">
                        <span className="text-[9px] text-dark2/40 uppercase font-black block mb-1 tracking-wider">Base Blank</span>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-dark/15 shadow-inner" style={{ backgroundColor: selectedDesignForPreview.color_hex }} />
                          <span className="font-extrabold text-dark truncate uppercase tracking-tight">{selectedDesignForPreview.color_name}</span>
                        </div>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-cream3 shadow-xs">
                        <span className="text-[9px] text-dark2/40 uppercase font-black block mb-1 tracking-wider">Base Price</span>
                        <span className="font-mono font-black text-dark text-sm block">₹{(selectedDesignForPreview.total_price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Print Elements Summary */}
                  <div className="rounded-2xl border border-cream3 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-dark px-4 py-3 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <span className="text-[10px] text-white font-black uppercase tracking-widest">Graphics &amp; Elements Applied</span>
                    </div>

                    <div className="bg-white divide-y divide-cream3 max-h-[280px] overflow-y-auto scrollbar-none">
                      {['front', 'back', 'left_sleeve', 'right_sleeve'].map(z => {
                        const els = selectedDesignForPreview.canvas_elements?.[z] || []
                        if (els.length === 0) return null
                        const zoneLabels = { front: 'F', back: 'B', left_sleeve: 'LS', right_sleeve: 'RS' }
                        const zoneColors = { front: 'bg-accent', back: 'bg-dark', left_sleeve: 'bg-blue-500', right_sleeve: 'bg-purple-500' }
                        return (
                          <div key={z}>
                            {/* Zone header */}
                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-cream2/60">
                              <div className={`w-6 h-6 rounded-lg ${zoneColors[z]} flex items-center justify-center shrink-0`}>
                                <span className="text-[9px] font-black text-white tracking-wider">{zoneLabels[z]}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-dark">
                                {z.replace('_', ' ')} Zone
                              </span>
                              <span className="ml-auto text-[9px] font-mono text-dark/30 bg-cream3/60 px-2 py-0.5 rounded-full">
                                {els.length} element{els.length > 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Elements */}
                            <div className="divide-y divide-cream3/60">
                              {els.map((el, index) => (
                                <div key={index} className="flex items-center gap-3 px-4 py-3 hover:bg-cream2/40 transition-colors">

                                  {/* Type icon / image thumbnail */}
                                  {el.type === 'text' && (
                                    <div className="w-8 h-8 rounded-xl bg-dark flex items-center justify-center shrink-0">
                                      <Type className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                  {el.type === 'image' && (
                                    el.url
                                      ? <img src={el.url} alt="" className="w-8 h-8 rounded-xl object-cover border border-cream3 shrink-0 bg-cream2" />
                                      : <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"><ImageIcon className="w-3.5 h-3.5 text-blue-400" /></div>
                                  )}
                                  {el.type === 'preset' && (
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                                    </div>
                                  )}

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    {el.type === 'text' && (
                                      <>
                                        <p className="text-[11px] font-bold text-dark truncate">"{el.content}"</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full border border-dark/10 shrink-0"
                                            style={{ backgroundColor: el.color }}
                                          />
                                          <span className="text-[9px] font-mono text-dark/40 truncate">{el.fontFamily} · {el.color}</span>
                                        </div>
                                      </>
                                    )}
                                    {el.type === 'image' && (
                                      <>
                                        <p className="text-[11px] font-bold text-dark truncate">Custom Image</p>
                                        <p className="text-[9px] font-mono text-dark/40 truncate mt-0.5">{el.name || 'Uploaded file'}</p>
                                      </>
                                    )}
                                    {el.type === 'preset' && (
                                      <>
                                        <p className="text-[11px] font-bold text-dark truncate">{el.name}</p>
                                        <p className="text-[9px] font-mono text-dark/40 truncate mt-0.5">Preset · {el.text}</p>
                                      </>
                                    )}
                                  </div>

                                  {/* Download btn for images */}
                                  {el.type === 'image' && el.url && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(el.url)
                                          const blob = await res.blob()
                                          const blobUrl = URL.createObjectURL(blob)
                                          const a = document.createElement('a')
                                          a.href = blobUrl
                                          a.download = el.name || `ftw-design-image-${index + 1}.png`
                                          a.click()
                                          URL.revokeObjectURL(blobUrl)
                                        } catch {
                                          window.open(el.url, '_blank')
                                        }
                                      }}
                                      className="w-7 h-7 rounded-lg bg-dark hover:bg-accent text-white flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors"
                                      title="Download image"
                                    >
                                      <Download className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}

                      {!['front', 'back', 'left_sleeve', 'right_sleeve'].some(z => (selectedDesignForPreview.canvas_elements?.[z] || []).length > 0) && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <Layers className="w-6 h-6 text-dark/15" />
                          <span className="text-xs text-dark/35 font-mono uppercase tracking-widest">No design elements applied</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {/* Two main actions on one row */}
                  <div className="flex gap-2">
                    <Link
                      to={`/customizer?designId=${selectedDesignForPreview.id}&readOnly=true`}
                      className="flex-1 py-3 bg-cream border border-cream3 text-dark hover:bg-cream3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 active:scale-98 decoration-none"
                    >
                      <Eye className="w-3.5 h-3.5 text-accent shrink-0" /> View Studio
                    </Link>

                    <Link
                      to={`/customizer?designId=${selectedDesignForPreview.id}&recreate=true`}
                      className="flex-1 py-3 bg-dark text-white hover:bg-neutral-800 border-none text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-98 decoration-none"
                    >
                      <Edit className="w-3.5 h-3.5 text-accent shrink-0" /> Recreate Copy
                    </Link>
                  </div>

                  <button
                    onClick={() => setSelectedDesignForPreview(null)}
                    className="w-full py-3 bg-cream hover:bg-cream3 text-dark2 hover:text-dark text-[10px] font-bold uppercase tracking-widest rounded-xl border border-cream3 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" /> Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  )
}
