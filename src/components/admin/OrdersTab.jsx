import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Sparkles, Eye, X, User, MapPin, CreditCard, Tag, Clock, Truck, CheckCircle, Mail, Phone, Copy, Check, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

const getColorBackgroundStyle = (colorStr) => {
  if (!colorStr) return { backgroundColor: '#0F0F0F' }
  const separators = ['+', '/', ' and ', '&']
  let parts = []
  for (const sep of separators) {
    if (colorStr.includes(sep)) {
      parts = colorStr.split(sep).map(s => s.trim())
      break
    }
  }
  if (parts.length > 1) {
    const hex1 = getColorHex(parts[0])
    const hex2 = getColorHex(parts[1])
    return {
      background: `linear-gradient(135deg, ${hex1} 50%, ${hex2} 50%)`
    }
  }
  return { backgroundColor: getColorHex(colorStr) }
}

export default function OrdersTab({
  filteredOrders,
  searchQuery,
  setSearchQuery,
  handleStatusChange,
  handleViewOrderItemDesign
}) {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'standard' | 'custom'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  const [copiedField, setCopiedField] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const [packageWeight, setPackageWeight] = useState(0.5)
  const [packageLength, setPackageLength] = useState(15)
  const [packageBreadth, setPackageBreadth] = useState(15)
  const [packageHeight, setPackageHeight] = useState(5)

  const [packageVolumetricWeight, setPackageVolumetricWeight] = useState(0)

  useEffect(() => {
    if (selectedOrder) {
      setPackageWeight(selectedOrder.package_weight ?? 0.5)
      setPackageLength(selectedOrder.package_length ?? 15)
      setPackageBreadth(selectedOrder.package_breadth ?? 15)
      setPackageHeight(selectedOrder.package_height ?? 5)
      const initialVol = selectedOrder.package_volumetric_weight ?? (((selectedOrder.package_length ?? 15) * (selectedOrder.package_breadth ?? 15) * (selectedOrder.package_height ?? 5)) / 5000)
      setPackageVolumetricWeight(Number(Number(initialVol).toFixed(3)))
    }
  }, [selectedOrder?.id])

  const handleLengthChange = (val) => {
    setPackageLength(val)
    const l = Number(val) || 0
    const b = Number(packageBreadth) || 0
    const h = Number(packageHeight) || 0
    setPackageVolumetricWeight(Number((l * b * h / 5000).toFixed(3)))
  }

  const handleBreadthChange = (val) => {
    setPackageBreadth(val)
    const l = Number(packageLength) || 0
    const b = Number(val) || 0
    const h = Number(packageHeight) || 0
    setPackageVolumetricWeight(Number((l * b * h / 5000).toFixed(3)))
  }

  const handleHeightChange = (val) => {
    setPackageHeight(val)
    const l = Number(packageLength) || 0
    const b = Number(packageBreadth) || 0
    const h = Number(val) || 0
    setPackageVolumetricWeight(Number((l * b * h / 5000).toFixed(3)))
  }

  const handleShiprocketSync = async (orderId) => {
    setIsSyncing(true)
    setSyncError(null)
    try {
      const response = await fetch('/api/shiprocket-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          weight: packageWeight,
          length: packageLength,
          breadth: packageBreadth,
          height: packageHeight,
          volumetricWeight: packageVolumetricWeight
        })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync with Shiprocket')
      }

      // Update local state in the modal
      setSelectedOrder(prev => ({
        ...prev,
        shiprocket_order_id: data.shiprocket_order_id,
        shiprocket_shipment_id: data.shiprocket_shipment_id,
        shiprocket_awb_code: data.shiprocket_awb_code,
        shiprocket_status: 'Synced',
        shiprocket_sync_error: null,
        package_weight: packageWeight,
        package_length: packageLength,
        package_breadth: packageBreadth,
        package_height: packageHeight,
        package_volumetric_weight: packageVolumetricWeight,
        status: prev.status === 'Pending' ? 'Processing' : prev.status
      }))

      // Notify parent to refresh orders
      if (handleStatusChange) {
        await handleStatusChange(orderId, selectedOrder.status === 'Pending' ? 'Processing' : selectedOrder.status)
      }
    } catch (err) {
      console.error('Shiprocket sync error:', err)
      setSyncError(err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
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

  const formatOrderDate = (dateStr, showTime = false) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      const datePart = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      if (!showTime) return datePart
      const timePart = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      return `${datePart}, ${timePart}`
    } catch (e) {
      return dateStr
    }
  }

  const finalOrdersList = filteredOrders.filter(order => {
    const hasCustom = order.items?.some(item => item.designId || item.customDesign)
    if (typeFilter === 'standard' && hasCustom) return false
    if (typeFilter === 'custom' && !hasCustom) return false

    if (statusFilter !== 'all') {
      const oStatus = (order.status || 'Pending').toLowerCase()
      if (statusFilter === 'pending' && oStatus !== 'pending') return false
      if (statusFilter === 'processing' && oStatus !== 'processing') return false
      if (statusFilter === 'shipped' && oStatus !== 'shipped' && oStatus !== 'dispatched') return false
      if (statusFilter === 'delivered' && oStatus !== 'delivered') return false
      if (statusFilter === 'cancelled' && oStatus !== 'cancelled') return false
    }

    return true
  })

  const totalCount = filteredOrders.length
  const pendingCount = filteredOrders.filter(o => (o.status || 'Pending').toLowerCase() === 'pending').length
  const shippedCount = filteredOrders.filter(o => {
    const s = (o.status || '').toLowerCase()
    return s === 'shipped' || s === 'dispatched' || s === 'processing'
  }).length
  const deliveredCount = filteredOrders.filter(o => (o.status || '').toLowerCase() === 'delivered').length

  return (
    <div className="space-y-4 sm:space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <ShoppingBag className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Orders Panel
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium font-sans">Manage customer transactions, tracking status, and custom print requests.</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Orders Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-violet-50/80 to-purple-100/40 border border-purple-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-purple-700/80 uppercase tracking-widest block">Total Orders</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-purple-950 mt-0.5 sm:mt-1 font-sans">{totalCount}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-purple-600 bg-purple-50/90 px-1.5 py-0.5 rounded border border-purple-150/50">All received</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-purple-700 shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-amber-50/80 to-orange-100/40 border border-orange-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-amber-700/80 uppercase tracking-widest block">Pending Orders</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-amber-950 mt-0.5 sm:mt-1 font-sans">{pendingCount}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-amber-600 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-150/50 animate-pulse">Awaiting dispatch</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-amber-700 shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Shipped Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-blue-50/80 to-indigo-100/40 border border-blue-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-blue-700/80 uppercase tracking-widest block">Shipped Orders</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-blue-955 mt-0.5 sm:mt-1 font-sans">{shippedCount}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-blue-600 bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-150/50">In transit</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-blue-700 shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
              <Truck className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Delivered Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-emerald-550/10 to-teal-100/40 border border-teal-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-emerald-700/80 uppercase tracking-widest block">Delivered Orders</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-emerald-955 mt-0.5 sm:mt-1 font-sans">{deliveredCount}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-emerald-600 bg-emerald-550/10 px-1.5 py-0.5 rounded border border-teal-150/50">Completed</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-emerald-700 shrink-0 border border-teal-100 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-cream2/30 border border-cream3 p-3 sm:p-4 rounded-2xl">
        {/* Order Type Filter Tabs - Horizontally scrollable on mobile */}
        <div className="flex overflow-x-auto pb-1.5 lg:pb-0 -mb-1.5 lg:mb-0 w-full lg:w-auto gap-2 select-none scrollbar-none snap-x">
          {[
            { id: 'all', label: 'All Orders', icon: ShoppingBag },
            { id: 'standard', label: 'Catalog', icon: Tag },
            { id: 'custom', label: 'Custom Prints ✨', icon: Sparkles }
          ].map(tab => {
            const count = filteredOrders.filter(order => {
              const hasCustom = order.items?.some(item => item.designId || item.customDesign)
              if (tab.id === 'standard') return !hasCustom
              if (tab.id === 'custom') return hasCustom
              return true
            }).length
            const isTabActive = typeFilter === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border shrink-0 snap-start ${isTabActive
                  ? 'bg-dark text-white border-dark shadow-xs'
                  : 'bg-white border-cream3 text-dark2/60 hover:text-dark hover:border-dark/25'
                  }`}
              >
                <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search & Status Filter Group */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
          {/* Status Select Filter */}
          <div className="relative flex items-center group">
            {(() => {
              const iconClass = "absolute left-3 w-4 h-4 lg:w-4.5 lg:h-4.5 text-dark/45 pointer-events-none group-focus-within:text-dark transition-colors"
              if (statusFilter === 'pending') return <Clock className={iconClass} />
              if (statusFilter === 'processing') return <Sparkles className={iconClass} />
              if (statusFilter === 'shipped') return <Truck className={iconClass} />
              if (statusFilter === 'delivered') return <CheckCircle className={iconClass} />
              if (statusFilter === 'cancelled') return <X className={iconClass} />
              return <ShoppingBag className={iconClass} />
            })()}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 lg:w-48 pl-9 lg:pl-10 pr-8 py-2.5 lg:py-3 bg-white border border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs lg:text-sm font-sans font-bold text-dark cursor-pointer appearance-none shadow-xs"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped / Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/40 text-[10px] lg:text-xs">▼</div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 lg:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-4.5 lg:h-4.5 text-dark/30 group-focus-within:text-dark transition-colors" />
            <input
              type="text"
              placeholder="Search reference or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 lg:pl-11 pr-4 py-2.5 lg:py-3 rounded-xl border border-cream3 bg-white hover:border-neutral-355 focus:border-dark focus:bg-white text-xs lg:text-sm text-dark focus:outline-none font-sans font-semibold transition-all shadow-xs placeholder-dark/30"
            />
          </div>
        </div>
      </div>

      {/* Orders Container */}
      <div className="bg-white border border-cream3 rounded-2xl overflow-hidden shadow-sm">
        {finalOrdersList.length === 0 ? (
          <div className="p-12 text-center text-dark2/50 font-sans text-xs lg:text-sm flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-8 h-8 text-cream3" />
            <span>No orders match the selection criteria.</span>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs lg:text-sm font-sans">
                <thead>
                  <tr className="bg-cream/40 border-b border-cream3 text-[10px] lg:text-xs uppercase font-black text-dark2/50 tracking-wider">
                    <th className="p-4 lg:p-4.5 pl-6">Order Reference</th>
                    <th className="p-4 lg:p-4.5">Customer Details</th>
                    <th className="p-4 lg:p-4.5">Amount</th>
                    <th className="p-4 lg:p-4.5">Payment Info</th>
                    <th className="p-4 lg:p-4.5">Order Status</th>
                    <th className="p-4 lg:p-4.5">Placed Date</th>
                    <th className="p-4 lg:p-4.5">Modify Status</th>
                    <th className="p-4 lg:p-4.5 text-right pr-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream3">
                  {finalOrdersList.map(order => {
                    const { statusText } = parsePaymentStatus(order.payment_status)
                    const hasCustom = order.items?.some(item => item.designId || item.customDesign)
                    return (
                      <tr key={order.id} className="hover:bg-cream/20 transition-colors group text-dark font-sans">
                        <td className="p-4 lg:p-4.5 pl-6 font-bold text-dark font-sans truncate max-w-[120px] lg:max-w-[140px] text-xs lg:text-sm" title={order.id}>{order.id}</td>
                        <td className="p-4 lg:p-4.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-dark uppercase block text-xs lg:text-sm">{order.customer_name}</span>
                            {hasCustom && <span className="bg-accent/10 text-accent border border-accent/20 text-[8px] lg:text-[9px] font-black uppercase px-2 py-0.5 rounded-lg tracking-wider shrink-0">Custom</span>}
                          </div>
                          <span className="text-[9px] lg:text-[10.5px] text-dark2/45 block mt-0.5">{order.email}</span>
                        </td>
                        <td className="p-4 lg:p-4.5 font-bold text-dark font-sans text-xs lg:text-sm">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="p-4 lg:p-4.5">
                          <div className="space-y-1">
                            <span className="text-[9px] lg:text-[10px] uppercase font-black text-dark2/50 block leading-none">{order.payment_method}</span>
                            <span className={`text-[8.5px] lg:text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md border inline-flex items-center ${statusText?.toLowerCase().includes('paid') && !statusText?.toLowerCase().includes('unpaid') ? 'bg-emerald-550/10 text-emerald-700 border-emerald-150' : 'bg-amber-555/10 text-amber-700 border-amber-150'}`}>{statusText || 'Unpaid'}</span>
                          </div>
                        </td>
                        <td className="p-4 lg:p-4.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`text-[9px] lg:text-[10px] font-black uppercase px-2.5 py-1 rounded-full border inline-flex items-center ${order.status === 'Delivered' ? 'bg-green-550/10 text-green-700 border-green-150' : order.status === 'Shipped' || order.status === 'Dispatched' ? 'bg-blue-550/10 text-blue-700 border-blue-150' : order.status === 'Processing' ? 'bg-purple-550/10 text-purple-700 border-purple-150' : order.status === 'Cancelled' ? 'bg-red-550/10 text-red-700 border-red-150' : order.status === 'Pending' ? 'bg-yellow-555/10 text-yellow-700 border-yellow-150' : 'bg-yellow-555/10 text-yellow-700 border-yellow-150'}`}>{order.status || 'Pending'}</span>
                            {!order.shiprocket_order_id && order.status !== 'Cancelled' && (
                              <span className="bg-red-50 text-red-700 border border-red-100 text-[8.5px] lg:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide shrink-0">Action Required</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 lg:p-4.5 text-dark2/50 font-sans text-[10px] lg:text-xs">{formatOrderDate(order.created_at, true)}</td>
                        <td className="p-4 lg:p-4.5">
                          <select value={order.status || 'Pending'} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-cream/70 hover:bg-cream border border-cream3 rounded-lg text-[10px] lg:text-xs font-sans font-bold text-dark focus:outline-none cursor-pointer focus:border-dark transition-all">
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 lg:p-4.5 text-right pr-6">
                          <button onClick={() => setSelectedOrder(order)} className="p-2 lg:p-2.5 bg-cream hover:bg-dark hover:text-white rounded-xl text-dark2 hover:text-white transition-all cursor-pointer border border-cream3 hover:border-dark inline-flex items-center justify-center shadow-xs">
                            <Eye className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-based List View */}
            <div className="xl:hidden divide-y divide-cream3 bg-cream2/10">
              {finalOrdersList.map(order => {
                const { statusText } = parsePaymentStatus(order.payment_status)
                const hasCustom = order.items?.some(item => item.designId || item.customDesign)

                return (
                  <div key={order.id} className="p-4 sm:p-5 space-y-4 hover:bg-cream/15 transition-all text-dark font-sans">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-dark text-xs uppercase">{order.customer_name}</span>
                          {hasCustom && <span className="bg-accent/10 text-accent border border-accent/20 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg tracking-wider shrink-0">Custom</span>}
                          {!order.shiprocket_order_id && order.status !== 'Cancelled' && (
                            <span className="bg-red-50 text-red-700 border border-red-100 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide shrink-0">Action Required</span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-dark2/45 font-sans block">Ref: {order.id}</span>
                        <span className="text-[9.5px] text-dark2/45 font-sans block mt-0.5">Placed: {formatOrderDate(order.created_at, true)}</span>
                      </div>
                      <span className="font-extrabold text-dark font-sans text-sm shrink-0">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 bg-white border border-cream3 p-3 rounded-xl shadow-xs text-[10px]">
                      <div>
                        <span className="text-[8px] uppercase font-black text-dark2/45 block mb-0.5">Payment</span>
                        <span className="font-bold text-dark">{order.payment_method}</span>
                        <span className={`ml-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border inline-flex items-center ${statusText?.toLowerCase().includes('paid') && !statusText?.toLowerCase().includes('unpaid') ? 'bg-emerald-550/10 text-emerald-700 border-emerald-150' : 'bg-amber-555/10 text-amber-700 border-amber-150'}`}>{statusText || 'Unpaid'}</span>
                      </div>
                      <div className="text-right border-l border-cream3/50 pl-3">
                        <span className="text-[8px] uppercase font-black text-dark2/45 block mb-0.5">Status</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center ${order.status === 'Delivered' ? 'bg-green-550/10 text-green-700 border-green-150' : order.status === 'Shipped' || order.status === 'Dispatched' ? 'bg-blue-550/10 text-blue-700 border-blue-150' : order.status === 'Processing' ? 'bg-purple-550/10 text-purple-700 border-purple-150' : order.status === 'Cancelled' ? 'bg-red-550/10 text-red-700 border-red-150' : order.status === 'Pending' ? 'bg-yellow-555/10 text-yellow-700 border-yellow-150' : 'bg-yellow-555/10 text-yellow-700 border-yellow-150'}`}>{order.status || 'Pending'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2.5 justify-between items-center pt-1 flex-wrap">
                      <select value={order.status || 'Pending'} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="flex-grow px-3 py-2 bg-white border border-cream3 rounded-xl text-[10px] font-sans font-bold text-dark focus:outline-none cursor-pointer">
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button onClick={() => setSelectedOrder(order)} className="py-2 px-4 bg-cream hover:bg-dark hover:text-white rounded-xl text-dark2 border border-cream3/60 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        <Eye className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && (() => {
          const { statusText, rzpOrderId } = parsePaymentStatus(selectedOrder.payment_status)
          const itemsSubtotal = selectedOrder.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0) || 0
          const shippingFee = selectedOrder.shipping !== undefined && selectedOrder.shipping !== null ? selectedOrder.shipping : (itemsSubtotal >= 1499 ? 0 : 99)
          const discount = selectedOrder.discount !== undefined && selectedOrder.discount !== null ? selectedOrder.discount : Math.max(0, itemsSubtotal + shippingFee - selectedOrder.total)

          const isCancelled = (selectedOrder.status || 'Pending').toLowerCase() === 'cancelled'

          return (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 bg-dark/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-cream border border-cream3 w-full max-w-4xl lg:max-w-5xl rounded-[28px] shadow-2xl relative z-10 font-sans text-dark max-h-[92vh] overflow-hidden flex flex-col"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream3 hover:scale-105 active:scale-95 transition-all bg-white border border-cream3 cursor-pointer z-20 shadow-sm"
                >
                  <X className="w-5 h-5 text-dark" />
                </button>

                <div className="overflow-y-auto p-5 sm:p-7 lg:p-8 modal-purple-scrollbar flex-grow">

                  {/* Title & Status Header */}
                  <div className="border-b border-cream3 pb-4 mb-5 pr-12 select-none">
                    <span className="text-[10px] lg:text-xs font-sans text-dark2/45 uppercase tracking-wider font-semibold block mb-1">Management Panel</span>
                    <h3 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-dark tracking-tight">Order Details</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] lg:text-xs font-semibold uppercase border tracking-wider ${isCancelled ? 'bg-red-500/10 text-red-700 border-red-200' : selectedOrder.status === 'Delivered' ? 'bg-green-550/10 text-green-700 border-green-200' : selectedOrder.status === 'Shipped' || selectedOrder.status === 'Dispatched' ? 'bg-blue-550/10 text-blue-700 border-blue-200' : selectedOrder.status === 'Processing' ? 'bg-purple-550/10 text-purple-700 border-purple-200' : 'bg-yellow-555/10 text-yellow-700 border-yellow-200'}`}>{selectedOrder.status || 'Pending'}</span>
                      <button
                        onClick={() => handleCopy(selectedOrder.id, 'id')}
                        className="text-[10px] lg:text-xs font-sans font-semibold text-dark/70 hover:text-dark flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-cream3 transition-all cursor-pointer hover:shadow-sm"
                      >
                        <span className="text-dark2/50 font-mono">ID:</span>
                        <span className="font-mono font-bold text-dark">{selectedOrder.id}</span>
                        {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> : <Copy className="w-3 h-3 text-dark2/40 shrink-0" />}
                      </button>
                    </div>
                  </div>

                  {/* Master Layout Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 text-xs lg:text-sm text-dark">

                    {/* Left Column: Progress & Products (7/12 width) */}
                    <div className="lg:col-span-7 space-y-6">

                      {/* Cancelled Banner if applicable */}
                      {isCancelled && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-150 text-red-700 rounded-2xl text-xs lg:text-sm font-semibold">
                          <X className="w-5 h-5 shrink-0 bg-red-100 p-1 rounded-full" />
                          <div>
                            <p className="font-bold uppercase text-[10px] lg:text-xs tracking-wider">Cancelled Order</p>
                            <p className="text-[10px] lg:text-xs text-red-700/80 mt-0.5 font-medium">This transaction has been terminated and stock allocations reverted.</p>
                          </div>
                        </div>
                      )}

                      {/* Items Overview */}
                      <div className="bg-white border border-cream3 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-cream3 pb-2.5">
                          <span className="text-xs font-bold text-dark/70">Items Overview ({selectedOrder.items?.length || 0})</span>
                          <span className="text-[10px] text-dark/40 font-medium">Articles in Shipment</span>
                        </div>

                        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1.5 modal-purple-scrollbar">
                          {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="bg-cream/20 border border-cream3 rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-dark/20 transition-all hover:bg-cream/40 shadow-sm">
                              {/* Product Info & Thumbnail */}
                              <div className="flex items-start gap-4 min-w-0 flex-1">
                                {item.image ? (
                                  <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white border border-cream3 rounded-xl p-1.5 shrink-0 shadow-sm flex items-center justify-center overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                                  </div>
                                ) : (
                                  <div className="w-16 h-20 sm:w-20 sm:h-24 bg-cream border border-cream3 rounded-xl shrink-0 flex items-center justify-center text-dark/30 font-sans text-[10px]">
                                    No Image
                                  </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-2">
                                  <div>
                                    <span className="font-bold block text-dark text-xs lg:text-sm">{item.name}</span>
                                  </div>

                                  {/* Clean Specification Badges */}
                                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    <span className="px-2 py-0.5 bg-white border border-cream3 rounded-md text-[10px] font-medium text-dark/70 shadow-2xs">
                                      SKU: <span className="font-semibold text-dark">{item.sku || item.id?.split('-')[0] || 'CUSTOM'}</span>
                                    </span>

                                    <span className="px-2 py-0.5 bg-dark text-white rounded-md text-[10px] font-semibold shadow-2xs">
                                      Size: {item.size || 'M'}
                                    </span>

                                    <span className="px-2 py-0.5 bg-white border border-cream3 rounded-md text-[10px] font-medium text-dark/80 inline-flex items-center gap-1 shadow-2xs">
                                      <span
                                        style={getColorBackgroundStyle(item.color)}
                                        className="w-3 h-3 rounded-full border border-black/15 shrink-0 inline-block shadow-inner"
                                      />
                                      <span>Color: {item.color?.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '') || 'Standard'}</span>
                                    </span>

                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[10px] font-semibold shadow-2xs">
                                      Qty: {item.qty || 1}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price & Action Button */}
                              <div className="flex md:flex-col justify-between md:justify-center items-end md:items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-cream3/60 gap-3 shrink-0">
                                <div className="text-left md:text-right font-sans">
                                  <span className="font-bold block text-sm lg:text-base text-dark">₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
                                  <span className="text-dark/45 block text-[10px] lg:text-xs">₹{(item.price || 0).toLocaleString('en-IN')} each</span>
                                </div>

                                {(item.designId || item.customDesign) && (
                                  <button
                                    type="button"
                                    onClick={() => handleViewOrderItemDesign(item)}
                                    className="group inline-flex items-center gap-1.5 px-3 py-2 bg-[#161616] hover:bg-accent hover:text-dark text-white rounded-xl text-[10px] font-sans font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap border-none"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-accent group-hover:text-dark shrink-0" />
                                    <span>View Studio Design</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="bg-white border border-cream3 rounded-3xl p-5 lg:p-6 space-y-3 font-sans text-xs lg:text-sm text-dark shadow-sm">
                        <span className="text-xs font-semibold text-dark2/60 block border-b border-cream3 pb-2 mb-2">Invoice Summary</span>
                        <div className="flex justify-between text-dark/70"><span>Subtotal</span><span className="font-medium text-dark">₹{itemsSubtotal.toLocaleString('en-IN')}</span></div>
                        {discount > 0 && (<div className="flex justify-between text-accent font-medium"><span>Applied Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>)}
                        <div className="flex justify-between text-dark/70"><span>Delivery Charge</span>{shippingFee === 0 ? <span className="text-green-700 font-semibold uppercase">FREE</span> : <span className="font-medium text-dark">₹{shippingFee.toLocaleString('en-IN')}</span>}</div>
                        <div className="flex justify-between border-t border-cream3 pt-3 font-semibold text-sm sm:text-base text-dark"><span>Grand Total</span><span className="font-bold text-sm sm:text-base text-purple-700">₹{selectedOrder.total.toLocaleString('en-IN')}</span></div>
                      </div>

                      {/* Shiprocket Delivery Integration */}
                      <div className="bg-white border border-cream3 rounded-2xl p-5 shadow-sm space-y-3.5">
                        <div className="flex justify-between items-center border-b border-cream3 pb-2.5">
                          <h4 className="text-xs font-semibold text-dark2/60 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-purple-600" /> Shiprocket Shipment
                          </h4>
                          {selectedOrder.shiprocket_order_id ? (
                            <span className="bg-purple-550/10 text-purple-750 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                              Synced
                            </span>
                          ) : (
                            <span className="bg-amber-555/10 text-amber-705 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                              Unsynced
                            </span>
                          )}
                        </div>

                        {/* Sync Error Alert */}
                        {(syncError || selectedOrder.shiprocket_sync_error) && (
                          <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-semibold block text-[10px]">Sync Failure</span>
                              <p className="text-red-700/80 leading-relaxed">
                                {syncError || selectedOrder.shiprocket_sync_error}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedOrder.shiprocket_order_id ? (
                          /* Synced Details Layout */
                          <div className="space-y-3 text-xs sm:text-sm">
                            <div className="grid grid-cols-2 gap-3 bg-cream/10 p-3.5 rounded-xl border border-cream3/50">
                              <div>
                                <span className="text-[10px] text-dark/50 block mb-0.5">Shiprocket ID</span>
                                <span className="font-semibold text-dark">{selectedOrder.shiprocket_order_id}</span>
                              </div>
                              <div className="border-l border-cream3/40 pl-3">
                                <span className="text-[10px] text-dark/50 block mb-0.5">Shipment ID</span>
                                <span className="font-semibold text-dark">{selectedOrder.shiprocket_shipment_id || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-cream/10 p-3.5 rounded-xl border border-cream3/40">
                              <div>
                                <span className="text-[10px] text-dark/50 block mb-0.5">AWB Code</span>
                                <span className="font-semibold text-dark">{selectedOrder.shiprocket_awb_code || 'Awaiting Assignment'}</span>
                              </div>
                              <div className="border-l border-cream3/40 pl-3">
                                <span className="text-[10px] text-dark/50 block mb-0.5">Tracking Link</span>
                                {selectedOrder.shiprocket_awb_code ? (
                                  <a
                                    href={`https://shiprocket.co/tracking/${selectedOrder.shiprocket_awb_code}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 mt-0.5"
                                  >
                                    <span>Track Package</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                ) : (
                                  <span className="text-dark/45 font-medium">Pending AWB</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Unsynced Action Button */
                          <div className="space-y-3">
                            <p className="text-xs text-dark/60 leading-relaxed">
                              Fill package weight & box dimensions before creating the shipment in Shiprocket.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-dark/50 block mb-1">Dead Wt. (Kg)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={packageWeight}
                                  onChange={(e) => setPackageWeight(e.target.value)}
                                  className="w-full bg-white border border-cream3 rounded-lg px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-purple-400"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-dark/50 block mb-1">Length (cm)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={packageLength}
                                  onChange={(e) => handleLengthChange(e.target.value)}
                                  className="w-full bg-white border border-cream3 rounded-lg px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-purple-400"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-dark/50 block mb-1">Breadth (cm)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={packageBreadth}
                                  onChange={(e) => handleBreadthChange(e.target.value)}
                                  className="w-full bg-white border border-cream3 rounded-lg px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-purple-400"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-dark/50 block mb-1">Height (cm)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={packageHeight}
                                  onChange={(e) => handleHeightChange(e.target.value)}
                                  className="w-full bg-white border border-cream3 rounded-lg px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-purple-400"
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center bg-cream/10 border border-cream3/50 rounded-lg px-3 py-2 text-xs">
                              <span className="text-dark/50">Volumetric Weight</span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0.001"
                                  value={packageVolumetricWeight}
                                  onChange={(e) => setPackageVolumetricWeight(Number(e.target.value))}
                                  className="w-20 bg-white border border-cream3 rounded px-2 py-0.5 text-xs font-semibold text-dark text-right focus:outline-none focus:border-purple-400"
                                />
                                <span className="font-semibold text-dark">Kg</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isSyncing}
                              onClick={() => handleShiprocketSync(selectedOrder.id)}
                              className="w-full py-3 bg-purple-600 hover:bg-purple-750 disabled:bg-purple-600/50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-none"
                            >
                              {isSyncing ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Syncing...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 text-accent" />
                                  <span>Create Shipment</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right Column: Customer & Delivery Info (5/12 width) */}
                    <div className="lg:col-span-5 space-y-6">

                      {/* Key Metrics Grid */}
                      <div className="flex flex-wrap items-stretch justify-between gap-y-3 gap-x-2 border border-cream3 rounded-2xl p-4 bg-white shadow-sm text-xs text-dark">
                        <div className="flex-1 min-w-[70px] border-r border-cream3 last:border-0 pr-2">
                          <span className="text-[10px] text-dark/45 block mb-1">Total</span>
                          <span className="font-semibold text-sm text-dark block truncate">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex-1 min-w-[50px] border-r border-cream3 last:border-0 px-2">
                          <span className="text-[10px] text-dark/45 block mb-1">Qty</span>
                          <span className="font-semibold text-sm text-dark">{selectedOrder.items?.reduce((sum, item) => sum + (item.qty || 1), 0) || 0}</span>
                        </div>
                        <div className="flex-[2] min-w-[150px] last:border-0 pl-2">
                          <span className="text-[10px] text-dark/45 block mb-1">Date</span>
                          <span className="font-semibold text-dark block leading-tight text-xs mt-0.5">{formatOrderDate(selectedOrder.created_at, true)}</span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="bg-white border border-cream3 rounded-2xl p-5 shadow-sm space-y-3">
                        <h4 className="text-xs font-semibold text-dark2/60 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Customer Details</h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between border-b border-cream3/30 pb-2">
                            <span className="text-dark/50">Name</span>
                            <span className="font-semibold text-dark">{selectedOrder.customer_name}</span>
                          </div>
                          <div className="flex justify-between border-b border-cream3/30 pb-2 items-center">
                            <span className="text-dark/50">Email</span>
                            <button onClick={() => handleCopy(selectedOrder.email, 'email')} className="font-medium hover:text-accent flex items-center gap-1.5 border-none bg-transparent cursor-pointer text-dark text-xs sm:text-sm p-0">
                              <span>{selectedOrder.email}</span>
                              {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> : <Copy className="w-3 h-3 text-dark2/40 shrink-0" />}
                            </button>
                          </div>
                          {selectedOrder.phone && (
                            <div className="flex justify-between">
                              <span className="text-dark/50">Phone</span>
                              <span className="font-semibold text-dark">{selectedOrder.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="bg-white border border-cream3 rounded-2xl p-5 shadow-sm space-y-3">
                        <h4 className="text-xs font-semibold text-dark2/60 flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent" /> Payment Method</h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between border-b border-cream3/30 pb-2">
                            <span className="text-dark/50">Gateway</span>
                            <span className="font-semibold text-dark uppercase">{selectedOrder.payment_method}</span>
                          </div>
                          <div className="flex justify-between border-b border-cream3/30 pb-2">
                            <span className="text-dark/50">Status</span>
                            <span className="font-bold text-accent">{statusText}</span>
                          </div>
                          {rzpOrderId && (
                            <div className="flex justify-between items-center">
                              <span className="text-dark/50">Razorpay ID</span>
                              <button onClick={() => handleCopy(rzpOrderId, 'rzp')} className="font-mono text-xs font-medium text-dark/70 hover:text-accent flex items-center gap-1 border-none bg-transparent cursor-pointer p-0">
                                <span>{rzpOrderId}</span>
                                {copiedField === 'rzp' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3 h-3 text-dark2/40" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-white border border-cream3 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-dark2/60 flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Shipping Address</h4>
                          <button onClick={() => handleCopy(selectedOrder.address, 'shipping')} className="text-[10px] font-semibold text-dark2/50 hover:text-dark flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-cream3 transition-all cursor-pointer">
                            {copiedField === 'shipping' ? <span>Copied!</span> : <span>Copy</span>}
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-dark/85 bg-cream/10 p-3 rounded-xl border border-cream3/50 leading-relaxed">{selectedOrder.address}</p>
                      </div>

                    </div>
                  </div>

                </div> {/* End of inner scroll container */}
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
