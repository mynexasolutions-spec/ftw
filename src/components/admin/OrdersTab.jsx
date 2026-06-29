import { useState } from 'react'
import { ShoppingBag, Search, Sparkles, Eye, X, User, MapPin, CreditCard, Tag, Clock, Truck, CheckCircle, Mail, Phone, Copy, Check } from 'lucide-react'
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
    <div className="space-y-8 animate-fade-in pb-12">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-violet-50/80 to-purple-100/40 border border-purple-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-purple-700/80 uppercase tracking-widest block">Total Orders</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-purple-950 mt-1 font-mono">{totalCount}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-purple-600 bg-purple-50/90 px-2 py-0.5 rounded border border-purple-150/50">All received</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-purple-700 shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-amber-50/80 to-orange-100/40 border border-orange-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-amber-700/80 uppercase tracking-widest block">Pending Orders</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-amber-950 mt-1 font-mono">{pendingCount}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-amber-600 bg-amber-50/90 px-2 py-0.5 rounded border border-amber-150/50 animate-pulse">Awaiting dispatch</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-amber-700 shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Shipped Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-blue-50/80 to-indigo-100/40 border border-blue-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-blue-700/80 uppercase tracking-widest block">Shipped Orders</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-blue-950 mt-1 font-mono">{shippedCount}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-blue-600 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-150/50">In transit</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-blue-700 shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Delivered Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-emerald-550/10 to-teal-100/40 border border-teal-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-emerald-700/80 uppercase tracking-widest block">Delivered Orders</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-sans font-black text-emerald-950 mt-1 font-mono">{deliveredCount}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-emerald-600 bg-emerald-550/10 px-2 py-0.5 rounded border border-teal-150/50">Completed</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-emerald-700 shrink-0 border border-teal-100 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
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
                        <td className="p-4 lg:p-4.5 pl-6 font-bold text-dark font-mono truncate max-w-[120px] lg:max-w-[140px] text-xs lg:text-sm" title={order.id}>{order.id}</td>
                        <td className="p-4 lg:p-4.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-dark uppercase block text-xs lg:text-sm">{order.customer_name}</span>
                            {hasCustom && <span className="bg-accent/10 text-accent border border-accent/20 text-[8px] lg:text-[9px] font-black uppercase px-2 py-0.5 rounded-lg tracking-wider shrink-0">Custom</span>}
                          </div>
                          <span className="text-[9px] lg:text-[10.5px] text-dark2/45 block mt-0.5">{order.email}</span>
                        </td>
                        <td className="p-4 lg:p-4.5 font-bold text-dark font-mono text-xs lg:text-sm">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="p-4 lg:p-4.5">
                          <div className="space-y-1">
                            <span className="text-[9px] lg:text-[10px] uppercase font-black text-dark2/50 block leading-none">{order.payment_method}</span>
                            <span className={`text-[8.5px] lg:text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md border inline-flex items-center ${statusText?.toLowerCase().includes('paid') && !statusText?.toLowerCase().includes('unpaid') ? 'bg-emerald-550/10 text-emerald-700 border-emerald-150' : 'bg-amber-555/10 text-amber-700 border-amber-150'}`}>{statusText || 'Unpaid'}</span>
                          </div>
                        </td>
                        <td className="p-4 lg:p-4.5">
                          <span className={`text-[9px] lg:text-[10px] font-black uppercase px-2.5 py-1 rounded-full border inline-flex items-center ${order.status === 'Delivered' ? 'bg-green-550/10 text-green-700 border-green-150' : order.status === 'Shipped' || order.status === 'Dispatched' ? 'bg-blue-550/10 text-blue-700 border-blue-150' : order.status === 'Processing' ? 'bg-purple-550/10 text-purple-700 border-purple-150' : order.status === 'Cancelled' ? 'bg-red-550/10 text-red-700 border-red-150' : order.status === 'Pending' ? 'bg-yellow-555/10 text-yellow-700 border-yellow-150' : 'bg-yellow-555/10 text-yellow-700 border-yellow-150'}`}>{order.status || 'Pending'}</span>
                        </td>
                        <td className="p-4 lg:p-4.5 text-dark2/50 font-mono text-[10px] lg:text-xs">{formatOrderDate(order.created_at)}</td>
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
                        </div>
                        <span className="text-[9.5px] text-dark2/45 font-mono block">Ref: {order.id}</span>
                      </div>
                      <span className="font-extrabold text-dark font-mono text-sm shrink-0">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 bg-white border border-cream3 p-3 rounded-xl shadow-xs text-[10px]">
                      <div>
                        <span className="text-[8px] uppercase font-black text-dark2/45 block mb-0.5">Payment</span>
                        <span className="font-bold text-dark">{order.payment_method}</span>
                        <span className={`ml-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border inline-flex items-center ${statusText?.toLowerCase().includes('paid') && !statusText?.toLowerCase().includes('unpaid') ? 'bg-emerald-550/10 text-emerald-700 border-emerald-150' : 'bg-amber-555/10 text-amber-700 border-amber-150'}`}>{statusText || 'Unpaid'}</span>
                      </div>
                      <div className="text-right border-l border-cream3/50 pl-3">
                        <span className="text-[8px] uppercase font-black text-dark2/45 block mb-0.5">Status</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center ${order.status === 'Delivered' ? 'bg-green-550/10 text-green-700 border-green-150' : order.status === 'Shipped' || order.status === 'Dispatched' ? 'bg-blue-550/10 text-blue-700 border-blue-150' : order.status === 'Processing' ? 'bg-purple-550/10 text-purple-700 border-purple-150' : order.status === 'Cancelled' ? 'bg-red-550/10 text-red-700 border-red-150' : 'bg-yellow-555/10 text-yellow-700 border-yellow-150'}`}>{order.status || 'Pending'}</span>
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
                className="fixed inset-0 bg-dark/75 backdrop-blur-xs"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-cream border border-cream3 w-full max-w-4xl lg:max-w-5xl p-5 sm:p-7 lg:p-8 rounded-[32px] shadow-2xl relative z-10 font-sans text-dark max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-5 right-5 p-2.5 rounded-full hover:bg-cream3 transition-colors bg-white/70 border border-cream3 cursor-pointer z-10 shadow-xs"
                >
                  <X className="w-5 h-5 text-dark" />
                </button>

                {/* Title & Status Header */}
                <div className="border-b border-cream3 pb-4 mb-5 pr-12 select-none">
                  <span className="text-[9px] lg:text-xs font-mono text-dark2/45 uppercase tracking-widest font-black block mb-1">MANAGEMENT PANEL</span>
                  <h3 className="font-sans text-xl sm:text-2xl lg:text-3xl font-black uppercase text-dark">Order Overview</h3>
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mt-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] lg:text-xs font-black uppercase border ${isCancelled ? 'bg-red-500/10 text-red-700 border-red-150' : selectedOrder.status === 'Delivered' ? 'bg-green-550/10 text-green-700 border-green-150' : selectedOrder.status === 'Shipped' || selectedOrder.status === 'Dispatched' ? 'bg-blue-550/10 text-blue-700 border-blue-150' : selectedOrder.status === 'Processing' ? 'bg-purple-550/10 text-purple-700 border-purple-150' : 'bg-yellow-555/10 text-yellow-700 border-yellow-150'}`}>{selectedOrder.status || 'Pending'}</span>
                    <button
                      onClick={() => handleCopy(selectedOrder.id, 'id')}
                      className="text-[11px] lg:text-xs font-mono font-bold text-dark/70 hover:text-dark flex items-center gap-2 bg-cream2 px-3 py-1 rounded-lg border border-cream3 transition-all cursor-pointer"
                    >
                      <span>ID: {selectedOrder.id}</span>
                      {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-green-600 animate-bounce" /> : <Copy className="w-3.5 h-3.5 text-dark2/50" />}
                    </button>
                  </div>
                </div>

                {/* Master Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-6 text-xs lg:text-sm text-dark">

                  {/* Left Column: Progress & Products (7/12 width) */}
                  <div className="lg:col-span-7 space-y-6">

                    {/* Cancelled Banner if applicable */}
                    {isCancelled && (
                      <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs lg:text-sm font-semibold">
                        <X className="w-5 h-5 shrink-0 bg-red-100 p-1 rounded-full" />
                        <div>
                          <p className="font-bold uppercase text-[10px] lg:text-xs">Cancelled Order</p>
                          <p className="text-[10px] lg:text-xs text-red-650/80 mt-0.5">This transaction has been terminated and stock allocations reverted.</p>
                        </div>
                      </div>
                    )}

                    {/* Items Overview */}
                    <div className="bg-white border border-cream3 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-cream3 pb-3">
                        <span className="text-[10px] lg:text-xs text-dark/60 uppercase font-mono font-black tracking-widest block">Items Overview ({selectedOrder.items?.length || 0})</span>
                        <span className="text-[10px] font-mono text-dark/40 uppercase">Articles in Shipment</span>
                      </div>
                      
                      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1.5 scrollbar-thin">
                        {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="bg-[#FAF9F5] border border-cream3/80 rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-dark/20 transition-all shadow-2xs">
                            {/* Product Info & Thumbnail */}
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              {item.image ? (
                                <div className="w-16 h-20 sm:w-20 sm:h-24 lg:w-22 lg:h-26 bg-white border border-cream3 rounded-xl p-1.5 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                                </div>
                              ) : (
                                <div className="w-16 h-20 sm:w-20 sm:h-24 lg:w-22 lg:h-26 bg-cream border border-cream3 rounded-xl shrink-0 flex items-center justify-center text-dark/30 font-mono text-[10px]">
                                  No Image
                                </div>
                              )}
                              
                              <div className="min-w-0 flex-1 space-y-2.5">
                                <div>
                                  <span className="font-black block uppercase leading-snug text-dark text-xs lg:text-sm tracking-tight">{item.name}</span>
                                </div>

                                {/* Clean Specification Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-1 bg-white border border-cream3 rounded-lg text-[10px] lg:text-xs font-mono font-bold text-dark/70 shadow-2xs">
                                    SKU: <span className="font-black text-dark">{item.sku || item.id?.split('-')[0] || 'CUSTOM'}</span>
                                  </span>
                                  
                                  <span className="px-2.5 py-1 bg-dark text-white rounded-lg text-[10px] lg:text-xs font-mono font-black shadow-2xs">
                                    SIZE: {item.size || 'M'}
                                  </span>
                                  
                                  <span className="px-2.5 py-1 bg-white border border-cream3 rounded-lg text-[10px] lg:text-xs font-mono font-bold text-dark/80 inline-flex items-center gap-1.5 shadow-2xs">
                                    <span
                                      style={{ backgroundColor: getColorHex(item.color) }}
                                      className="w-3 h-3 rounded-full border border-black/15 shrink-0 inline-block"
                                    />
                                    <span>COLOR: {item.color?.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '') || 'Standard'}</span>
                                  </span>

                                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-900 rounded-lg text-[10px] lg:text-xs font-mono font-black shadow-2xs">
                                    QTY: {item.qty || 1}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Action Button */}
                            <div className="flex md:flex-col justify-between md:justify-center items-end md:items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-cream3/60 gap-3 shrink-0">
                              <div className="text-left md:text-right font-mono">
                                <span className="font-black block text-sm lg:text-base text-dark">₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
                                <span className="text-dark/45 block text-[10px] lg:text-xs">₹{(item.price || 0).toLocaleString('en-IN')} each</span>
                              </div>

                              {(item.designId || item.customDesign) && (
                                <button
                                  type="button"
                                  onClick={() => handleViewOrderItemDesign(item)}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#161616] hover:bg-accent hover:text-dark text-white rounded-xl text-[10.5px] lg:text-xs font-sans font-black uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap border-none"
                                >
                                  <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-accent group-hover:text-dark shrink-0" />
                                  <span>View Studio Design</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="bg-white border border-cream3 rounded-2xl p-5 lg:p-6 space-y-2.5 font-mono text-xs lg:text-sm text-dark shadow-xs">
                      <span className="text-[10px] lg:text-xs text-dark2/45 uppercase font-black tracking-widest block border-b border-cream3 pb-2.5 mb-3">Invoice Summary</span>
                      <div className="flex justify-between text-dark/70"><span>Subtotal</span><span>₹{itemsSubtotal.toLocaleString('en-IN')}</span></div>
                      {discount > 0 && (<div className="flex justify-between text-accent font-bold"><span>Applied Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>)}
                      <div className="flex justify-between text-dark/70"><span>Delivery Charge</span>{shippingFee === 0 ? <span className="text-green-700 font-bold uppercase">FREE</span> : <span>₹{shippingFee.toLocaleString('en-IN')}</span>}</div>
                      <div className="flex justify-between border-t border-cream3 pt-3 font-black text-xs sm:text-sm lg:text-base text-dark"><span>Grand Total</span><span className="font-mono text-sm lg:text-base">₹{selectedOrder.total.toLocaleString('en-IN')}</span></div>
                    </div>

                  </div>

                  {/* Right Column: Customer & Delivery Info (5/12 width) */}
                  <div className="lg:col-span-5 space-y-6">

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 border border-cream3 rounded-2xl p-4 bg-white shadow-xs font-mono text-[10px] sm:text-[11px] lg:text-xs text-dark">
                      <div className="text-center sm:text-left border-r border-cream3 last:border-0 pr-1">
                        <span className="text-[8px] lg:text-[9px] text-dark2/40 uppercase font-black block leading-none mb-1">Total</span>
                        <span className="font-black text-xs lg:text-sm text-dark block truncate">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-center sm:text-left border-r border-cream3 last:border-0 px-1">
                        <span className="text-[8px] lg:text-[9px] text-dark2/40 uppercase font-black block leading-none mb-1">Qty</span>
                        <span className="font-black text-xs lg:text-sm text-dark">{selectedOrder.items?.reduce((sum, item) => sum + (item.qty || 1), 0) || 0}</span>
                      </div>
                      <div className="text-center sm:text-left last:border-0 pl-1">
                        <span className="text-[8px] lg:text-[9px] text-dark2/40 uppercase font-black block leading-none mb-1">Date</span>
                        <span className="font-bold text-dark block leading-tight text-[10px] lg:text-xs mt-0.5">{formatOrderDate(selectedOrder.created_at)}</span>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white border border-cream3 rounded-2xl p-5 lg:p-6 space-y-3 shadow-xs">
                      <h4 className="text-[10px] lg:text-xs font-mono uppercase font-black text-dark2/50 tracking-wider flex items-center gap-2"><User className="w-4 h-4 text-accent" />Customer Details</h4>
                      <div className="space-y-2.5 bg-cream/30 p-3.5 rounded-xl border border-cream3/40 text-xs lg:text-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1"><span className="text-dark/50">Name:</span> <span className="font-bold uppercase text-left">{selectedOrder.customer_name}</span></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                          <span className="text-dark/50 shrink-0">Email:</span>
                          <button onClick={() => handleCopy(selectedOrder.email, 'email')} className="font-semibold text-left sm:text-right hover:text-accent flex items-center gap-1.5 border-none bg-transparent cursor-pointer break-all text-xs lg:text-sm">
                            <span>{selectedOrder.email}</span>
                            {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> : <Copy className="w-3 h-3 text-dark2/40 shrink-0" />}
                          </button>
                        </div>
                        {selectedOrder.phone && (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1"><span className="text-dark/50">Phone:</span> <span className="font-semibold">{selectedOrder.phone}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white border border-cream3 rounded-2xl p-5 lg:p-6 space-y-3 shadow-xs">
                      <h4 className="text-[10px] lg:text-xs font-mono uppercase font-black text-dark2/50 tracking-wider flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent" />Payment Method</h4>
                      <div className="space-y-2.5 bg-cream/30 p-3.5 rounded-xl border border-cream3/40 text-xs lg:text-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1"><span className="text-dark/50">Gateway:</span> <span className="font-bold uppercase">{selectedOrder.payment_method}</span></div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1"><span className="text-dark/50">Status:</span> <span className="font-black text-accent uppercase">{statusText}</span></div>

                        {rzpOrderId && (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                            <span className="text-dark/50 shrink-0">Razorpay ID:</span>
                            <button onClick={() => handleCopy(rzpOrderId, 'rzp')} className="font-mono text-[10px] lg:text-xs font-bold text-dark/80 hover:text-accent truncate text-left flex items-center gap-1.5 border-none bg-transparent cursor-pointer break-all">
                              <span className="truncate max-w-[140px]">{rzpOrderId}</span>
                              {copiedField === 'rzp' ? <Check className="w-3.5 h-3.5 text-green-600 animate-bounce" /> : <Copy className="w-3 h-3 text-dark2/40" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white border border-cream3 rounded-2xl p-5 lg:p-6 space-y-3 shadow-xs">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] lg:text-xs font-mono uppercase font-black text-dark2/50 tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />Shipping Address</h4>
                        <button onClick={() => handleCopy(selectedOrder.address, 'shipping')} className="text-[10px] lg:text-xs font-black uppercase text-dark2/50 hover:text-accent flex items-center gap-1 bg-cream2 px-2 py-1 rounded-lg border border-cream3 transition-all cursor-pointer">
                          {copiedField === 'shipping' ? <span>Copied!</span> : <span>Copy</span>}
                        </button>
                      </div>
                      <p className="bg-cream/30 p-3.5 rounded-xl border border-cream3/40 font-semibold leading-relaxed whitespace-pre-line text-xs lg:text-sm text-dark/85">{selectedOrder.address}</p>
                    </div>

                  </div>
                </div>

              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
