import React, { useState } from 'react'
import { Tag, Plus, Trash2, Percent, IndianRupee, Check, Copy, Flame, Award, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function CouponsTab({
  coupons = [],
  couponCode,
  setCouponCode,
  couponDiscount,
  setCouponDiscount,
  couponType,
  setCouponType,
  handleAddCoupon,
  handleDeleteCoupon
}) {
  const [copiedCode, setCopiedCode] = useState(null)

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success("Coupon code copied!")
    setTimeout(() => setCopiedCode(null), 1500)
  }

  // Calculate metrics
  const totalCoupons = coupons.length
  const percentCount = coupons.filter(c => c.type === 'percent').length
  const flatCount = coupons.filter(c => c.type === 'flat').length

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Tag className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent fill-accent" />
            </div>
            Coupons & Promotions
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Create promotional codes, manage discount percentages, and configure flat rate offers.</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Active Coupons */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-violet-50/80 to-purple-100/40 border border-purple-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono font-black text-purple-700/80 uppercase tracking-widest block">Active Coupons</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-purple-950 mt-1 font-mono">{totalCoupons}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-purple-600 bg-purple-50/90 px-2 py-0.5 rounded border border-purple-150/50">Live Codes</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-purple-700 shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-accent fill-accent" />
            </div>
          </div>
        </motion.div>

        {/* Percentage Coupons */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-amber-50/80 to-orange-100/40 border border-orange-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono font-black text-amber-700/80 uppercase tracking-widest block">Percent Codes</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-amber-955 mt-1 font-mono">{percentCount}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-amber-600 bg-amber-50/90 px-2 py-0.5 rounded border border-amber-150/50">Percentage Off</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-amber-700 shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
              <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Flat Rate Coupons */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-blue-50/80 to-indigo-100/40 border border-blue-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono font-black text-blue-700/80 uppercase tracking-widest block">Flat Discount Codes</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-955 mt-1 font-mono">{flatCount}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-blue-600 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-150/50">Cash Off (₹)</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-blue-700 shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Coupon Generator Form */}
      <div className="bg-white border border-cream3 rounded-3xl p-5 sm:p-6 lg:p-7 shadow-sm">
        <span className="text-[9px] lg:text-xs text-accent font-black uppercase tracking-widest block mb-4 border-b border-cream3 pb-2 font-mono">Coupon Generator</span>
        <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-xs lg:text-sm font-sans">
          <div className="space-y-1.5">
            <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Coupon Code *</label>
            <input
              type="text" 
              required 
              placeholder="e.g. SAVE20" 
              value={couponCode} 
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full px-4 py-2.5 lg:py-3 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:border-dark focus:bg-white text-xs lg:text-sm uppercase font-sans font-bold transition-all placeholder-dark/30 h-[39px] lg:h-[43px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Discount Value *</label>
            <input
              type="number" 
              required 
              placeholder="e.g. 15" 
              value={couponDiscount} 
              onChange={(e) => setCouponDiscount(e.target.value)}
              className="w-full px-4 py-2.5 lg:py-3 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:border-dark focus:bg-white text-xs lg:text-sm font-sans font-bold transition-all placeholder-dark/30 h-[39px] lg:h-[43px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Discount Type</label>
            <div className="flex bg-cream2 p-1 border border-cream3 rounded-xl gap-1 h-[39px] lg:h-[43px] items-center">
              <button
                type="button"
                onClick={() => setCouponType('percent')}
                className={`flex-1 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase transition-all cursor-pointer border-none ${
                  couponType === 'percent' 
                    ? 'bg-dark text-cream shadow-sm' 
                    : 'bg-transparent text-dark2/60 hover:text-dark'
                }`}
              >
                Percent (%)
              </button>
              <button
                type="button"
                onClick={() => setCouponType('flat')}
                className={`flex-1 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase transition-all cursor-pointer border-none ${
                  couponType === 'flat' 
                    ? 'bg-dark text-cream shadow-sm' 
                    : 'bg-transparent text-dark2/60 hover:text-dark'
                }`}
              >
                Flat (₹)
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-dark hover:bg-accent hover:text-dark text-white rounded-xl font-bold uppercase cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2 text-xs lg:text-sm hover:scale-[1.02] active:scale-95 shrink-0 border-none h-[39px] lg:h-[43px]"
          >
            <Plus className="w-4 h-4 lg:w-4.5 lg:h-4.5" /> Create Coupon
          </button>
        </form>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <div className="col-span-full text-center py-12 text-dark2/50 bg-white border border-cream3 rounded-2xl text-xs lg:text-sm font-sans shadow-xs">
            No active coupons found.
          </div>
        ) : (
          coupons.map(c => {
            const isPercent = c.type === 'percent'
            return (
              <motion.div 
                key={c.id} 
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`relative bg-white border p-5 lg:p-6 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden min-h-[145px] lg:min-h-[160px] hover:shadow-md transition-all duration-300 group ${
                  isPercent ? 'border-purple-200/80 hover:border-purple-300' : 'border-blue-200/80 hover:border-blue-300'
                }`}
              >
                {/* Ticket Side Cutouts */}
                <div className="absolute left-0 top-[calc(65%-8px)] -translate-x-1/2 w-4 h-4 bg-cream border-r border-cream3 rounded-full z-10" />
                <div className="absolute right-0 top-[calc(65%-8px)] translate-x-1/2 w-4 h-4 bg-cream border-l border-cream3 rounded-full z-10" />
                
                {/* Coupon Details */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="font-mono font-black text-xs sm:text-sm lg:text-base tracking-widest text-dark bg-cream2 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-cream3 block w-fit shadow-xs">
                      {c.code}
                    </span>
                    <span className="text-[9px] lg:text-[10px] text-dark2/45 font-black uppercase tracking-widest block mt-2.5 flex items-center gap-1">
                      <Flame className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-accent animate-pulse" /> Active Promotion
                    </span>
                  </div>
                  <span className={`text-[10px] lg:text-xs font-black px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl shrink-0 shadow-xs uppercase border ${
                    isPercent 
                      ? 'bg-purple-50 text-purple-700 border-purple-150' 
                      : 'bg-blue-50 text-blue-700 border-blue-150'
                  }`}>
                    {isPercent ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </span>
                </div>

                {/* Ticket Footer Action Row */}
                <div className="flex justify-between items-center border-t border-dashed border-cream3/80 pt-3 mt-4">
                  <span className="text-[8.5px] lg:text-[9.5px] text-dark2/40 font-mono tracking-widest uppercase font-black">FTW Code Spec</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className="px-3 lg:px-3.5 py-1 lg:py-1.5 bg-cream hover:bg-dark hover:text-white rounded-xl border border-cream3 text-[9px] lg:text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer"
                      title="Copy Coupon Code"
                    >
                      {copiedCode === c.code ? (
                        <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-600" /> Copied</span>
                      ) : (
                        <span>Copy</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 lg:p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all border-none cursor-pointer inline-flex items-center justify-center shadow-xs"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
