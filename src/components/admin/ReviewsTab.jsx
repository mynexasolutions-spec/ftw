import React, { useState } from 'react'
import { Star, Trash2, Calendar, ShoppingBag, CheckCircle, Clock, MessageSquare, Award, X, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReviewsTab({
  reviews = [],
  products = [],
  orders = [],
  handleApproveReview,
  handleDeleteReview
}) {
  const [activeReviewModal, setActiveReviewModal] = useState(null)

  const findOrderedProductImage = (rev) => {
    if (!rev) return null
    if (orders && orders.length > 0) {
      const reviewerOrders = orders.filter(o => 
        (o.email && rev.email && o.email.toLowerCase().trim() === rev.email.toLowerCase().trim()) ||
        (o.customer_name && rev.name && o.customer_name.toLowerCase().trim() === rev.name.toLowerCase().trim())
      )
      for (const order of reviewerOrders) {
        const item = order.items?.find(it => 
          it.name?.toLowerCase().trim() === rev.product_name?.toLowerCase().trim()
        )
        if (item?.image) {
          return item.image
        }
      }
    }
    return null
  }

  const formatReviewDate = (dateStr) => {
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

  // Calculate metrics
  const totalReviews = reviews.length
  const pendingReviews = reviews.filter(r => !r.approved).length
  const approvedReviews = reviews.filter(r => r.approved).length
  const approvedReviewsList = reviews.filter(r => r.approved)
  const avgRating = approvedReviewsList.length > 0 
    ? (approvedReviewsList.reduce((sum, r) => sum + r.rating, 0) / approvedReviewsList.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Star className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent fill-accent" />
            </div>
            Reviews Panel
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Moderate customer feedback, check product ratings, and approve reviews.</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Reviews */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-violet-50/80 to-purple-100/40 border border-purple-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-purple-700/80 uppercase tracking-widest block">Total Reviews</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-purple-950 mt-1 font-sans">{totalReviews}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-purple-600 bg-purple-50/90 px-2 py-0.5 rounded border border-purple-150/50">All time</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-purple-700 shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Pending Moderation */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-amber-50/80 to-orange-100/40 border border-orange-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-amber-700/80 uppercase tracking-widest block">Pending Approval</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-amber-955 mt-1 font-sans">{pendingReviews}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-amber-600 bg-amber-50/90 px-2 py-0.5 rounded border border-amber-150/50 animate-pulse">Needs Review</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-amber-700 shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Approved Reviews */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-emerald-550/10 to-teal-100/40 border border-teal-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-emerald-700/80 uppercase tracking-widest block">Approved</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-emerald-950 mt-1 font-sans">{approvedReviews}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-emerald-600 bg-emerald-550/10 px-2 py-0.5 rounded border border-teal-150/50">Live on Store</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-emerald-700 shrink-0 border border-teal-100 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Average Rating */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-rose-50 to-rose-100/40 border border-rose-100 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans font-black text-rose-700/80 uppercase tracking-widest block">Average Rating</span>
            <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-rose-955 mt-1 font-sans">{avgRating} <span className="text-xs sm:text-sm lg:text-base text-rose-700/60 font-sans">/ 5.0</span></p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-extrabold text-rose-600 bg-rose-50/90 px-2 py-0.5 rounded border border-rose-150/50">Quality Score</span>
            <div className="p-1.5 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-rose-700 shrink-0 border border-rose-100 group-hover:scale-110 transition-transform">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-accent fill-accent" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Reviews Container */}
      <div className="bg-white border border-cream3 rounded-2xl overflow-hidden shadow-sm">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-dark2/50 font-sans text-xs lg:text-sm flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-8 h-8 text-cream3" />
            <span>No reviews found.</span>
          </div>
        ) : (
          <>
            {/* Desktop / Laptop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full table-fixed text-left border-collapse text-xs lg:text-sm font-sans">
                <thead>
                  <tr className="bg-cream/40 border-b border-cream3 text-[10px] lg:text-xs uppercase font-black text-dark2/50 tracking-wider">
                    <th className="p-4 lg:p-4.5 pl-6 w-[22%]">Product Details</th>
                    <th className="p-4 lg:p-4.5 w-[15%]">Customer</th>
                    <th className="p-4 lg:p-4.5 w-[12%]">Rating</th>
                    <th className="p-4 lg:p-4.5 w-[25%]">Review Comment</th>
                    <th className="p-4 lg:p-4.5 w-[10%]">Date</th>
                    <th className="p-4 lg:p-4.5 w-[10%] text-center">Status</th>
                    <th className="p-4 lg:p-4.5 text-right pr-6 w-[16%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream3">
                  {reviews.map(rev => {
                    const matchedProduct = products.find(
                      p => {
                        if (!p.name || !rev.product_name) return false
                        const pNameClean = p.name.toLowerCase().trim()
                        const rNameClean = rev.product_name.toLowerCase().trim()
                        return pNameClean === rNameClean || rNameClean.includes(pNameClean) || pNameClean.includes(rNameClean)
                      }
                    )

                    const orderedImg = findOrderedProductImage(rev)
                    const displayImg = orderedImg || matchedProduct?.image

                    return (
                      <tr key={rev.id} className="hover:bg-cream/20 transition-colors group text-dark font-sans">
                        {/* Product Info */}
                        <td className="p-4 lg:p-4.5 pl-6">
                          <div className="flex items-center gap-3">
                            {displayImg ? (
                              <img 
                                src={displayImg} 
                                alt={rev.product_name} 
                                className="w-10 h-12 lg:w-11 lg:h-13 object-cover rounded-lg border border-cream3 shrink-0 bg-cream"
                              />
                            ) : (
                              <div className="w-10 h-12 lg:w-11 lg:h-13 rounded-lg border border-cream3 bg-cream3/50 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-4 h-4 text-dark2/30" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-extrabold uppercase text-[11px] lg:text-xs xl:text-sm text-dark leading-tight whitespace-normal break-words" title={rev.product_name}>
                                {rev.product_name}
                              </p>
                              {matchedProduct && (
                                <p className="text-[9px] lg:text-[10px] font-sans text-dark2/45 mt-0.5">
                                  {matchedProduct.sku ? `SKU: ${matchedProduct.sku}` : `₹${matchedProduct.price.toLocaleString('en-IN')}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-4 lg:p-4.5">
                          <span className="font-bold text-dark uppercase block text-xs lg:text-sm">{rev.name}</span>
                          {rev.email && <span className="text-[9px] lg:text-[10.5px] text-dark2/45 block mt-0.5 font-sans">{rev.email}</span>}
                        </td>

                        {/* Rating Stars */}
                        <td className="p-4 lg:p-4.5">
                          <div className="flex gap-0.5 text-amber-400 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-cream3'}`} 
                              />
                            ))}
                          </div>
                        </td>

                        {/* Review Comment */}
                        <td className="p-4 lg:p-4.5 max-w-[280px] lg:max-w-[340px]">
                          <div className="flex flex-col items-start gap-1">
                            <p className="text-dark2/80 italic leading-relaxed truncate w-full text-xs lg:text-sm" title={rev.comment}>
                              "{rev.comment || 'No written comment provided.'}"
                            </p>
                            {rev.comment && rev.comment.length > 40 && (
                              <button 
                                onClick={() => setActiveReviewModal(rev)}
                                className="text-[9px] lg:text-[10px] font-sans font-black uppercase text-accent hover:underline cursor-pointer border-none bg-transparent p-0"
                              >
                                See Full Review
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="p-4 lg:p-4.5 text-dark2/50 font-sans text-[10px] lg:text-xs">{formatReviewDate(rev.created_at)}</td>

                        {/* Status Badge */}
                        <td className="p-4 lg:p-4.5 text-center">
                          <span className={`text-[8.5px] lg:text-[10px] font-black uppercase px-2.5 py-1 rounded-md border inline-flex items-center ${
                            rev.approved 
                              ? 'bg-emerald-550/10 text-emerald-700 border-emerald-150' 
                              : 'bg-amber-555/10 text-amber-700 border-amber-150'
                          }`}>
                            {rev.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 lg:p-4.5 text-right pr-6">
                          <div className="flex items-center justify-end gap-2.5">
                            {!rev.approved && (
                              <button 
                                onClick={() => handleApproveReview(rev.id)} 
                                className="px-3 py-1.5 bg-dark text-primary hover:bg-accent hover:text-dark text-[9px] lg:text-xs font-sans font-black uppercase tracking-wider rounded-lg cursor-pointer transition-colors border-none"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteReview(rev.id)} 
                              className="p-2 text-dark2/45 hover:text-accent hover:bg-rose-50 hover:border-rose-100 border border-transparent rounded-lg transition-all cursor-pointer inline-flex items-center justify-center" 
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden divide-y divide-cream3 bg-cream2/10">
              {reviews.map(rev => {
                const matchedProduct = products.find(
                  p => {
                    if (!p.name || !rev.product_name) return false
                    const pNameClean = p.name.toLowerCase().trim()
                    const rNameClean = rev.product_name.toLowerCase().trim()
                    return pNameClean === rNameClean || rNameClean.includes(pNameClean) || pNameClean.includes(rNameClean)
                  }
                )

                    const orderedImg = findOrderedProductImage(rev)
                    const displayImg = orderedImg || matchedProduct?.image

                    return (
                      <div key={rev.id} className="p-4 sm:p-5 space-y-4 hover:bg-cream/15 transition-all text-dark font-sans">
                        {/* Header Row */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-extrabold text-dark text-xs uppercase block">{rev.name}</span>
                            <div className="flex items-center gap-1 text-dark2/40 text-[9px] font-sans mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{formatReviewDate(rev.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex gap-0.5 text-amber-400 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-cream3'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        {/* Product Subcard */}
                        <div className="flex items-center gap-3 bg-white border border-cream3 p-3 rounded-xl shadow-xs text-[10px]">
                          {displayImg ? (
                            <img 
                              src={displayImg} 
                              alt={rev.product_name} 
                              className="w-8 h-10 object-cover rounded-lg border border-cream3 shrink-0 bg-cream"
                            />
                          ) : (
                            <div className="w-8 h-10 rounded-lg border border-cream3 bg-cream3/50 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-3.5 h-3.5 text-dark2/30" />
                            </div>
                          )}
                      <div className="min-w-0">
                        <span className="font-extrabold text-dark uppercase block leading-none truncate">{rev.product_name}</span>
                        {matchedProduct && (
                          <span className="text-[9px] text-dark2/45 block mt-1 font-sans">
                            {matchedProduct.sku && `SKU: ${matchedProduct.sku}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review text */}
                    <div className="space-y-1">
                      <p className="text-dark2/80 text-xs italic pl-1 leading-relaxed line-clamp-3">
                        "{rev.comment || 'No written comment provided.'}"
                      </p>
                      {rev.comment && rev.comment.length > 80 && (
                        <button 
                          onClick={() => setActiveReviewModal(rev)}
                          className="text-[9px] font-sans font-black uppercase text-accent hover:underline cursor-pointer border-none bg-transparent p-0 pl-1"
                        >
                          See Full Review
                        </button>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-2.5 justify-between items-center pt-1 flex-wrap">
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border inline-flex items-center ${
                        rev.approved 
                          ? 'bg-emerald-555/10 text-emerald-700 border-emerald-150' 
                          : 'bg-amber-555/10 text-amber-700 border-amber-150'
                      }`}>
                        {rev.approved ? 'Approved' : 'Pending Approval'}
                      </span>

                      <div className="flex items-center gap-2">
                        {!rev.approved && (
                          <button 
                            onClick={() => handleApproveReview(rev.id)} 
                            className="px-3.5 py-1.5 bg-dark text-primary hover:bg-accent hover:text-dark text-[9px] font-sans font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors border-none"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteReview(rev.id)} 
                          className="p-2 bg-cream hover:bg-rose-50 hover:text-accent hover:border-rose-200 rounded-xl text-dark2 border border-cream3 transition-all cursor-pointer flex items-center justify-center shadow-xs" 
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Full Review Details Modal */}
      <AnimatePresence>
        {activeReviewModal && (() => {
          const rev = activeReviewModal
          const matchedProduct = products.find(
            p => {
              if (!p.name || !rev.product_name) return false
              const pNameClean = p.name.toLowerCase().trim()
              const rNameClean = rev.product_name.toLowerCase().trim()
              return pNameClean === rNameClean || rNameClean.includes(pNameClean) || pNameClean.includes(rNameClean)
            }
          )

          return (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveReviewModal(null)}
                className="fixed inset-0 bg-dark/75 backdrop-blur-xs"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-cream border border-cream3 w-full max-w-md lg:max-w-lg rounded-[32px] shadow-2xl relative z-10 font-sans text-dark overflow-hidden flex flex-col max-h-[92vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveReviewModal(null)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream3 transition-colors bg-white/70 border border-cream3 cursor-pointer z-20 shadow-xs"
                >
                  <X className="w-4 h-4 lg:w-5 lg:h-5 text-dark" />
                </button>

                <div className="overflow-y-auto p-5 sm:p-7 lg:p-8 modal-purple-scrollbar flex-grow">

                {/* Modal Header */}
                <div className="border-b border-cream3 pb-4 mb-5 pr-10">
                  <span className="text-[9px] lg:text-[10px] font-sans text-dark2/45 uppercase tracking-widest font-black block mb-1">FEEDBACK DETAILS</span>
                  <h3 className="font-sans text-xl lg:text-2xl font-black uppercase text-dark">Customer Review</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] lg:text-xs font-black uppercase border ${
                      rev.approved 
                        ? 'bg-emerald-550/10 text-emerald-700 border-emerald-150' 
                        : 'bg-amber-555/10 text-amber-700 border-amber-150'
                    }`}>
                      {rev.approved ? 'Approved' : 'Pending Approval'}
                    </span>
                    <span className="text-[10px] lg:text-xs font-mono text-dark2/40 ml-2">{formatReviewDate(rev.created_at)}</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Rating Stars */}
                  <div>
                    <span className="text-[9px] lg:text-xs font-mono text-dark2/45 uppercase font-black tracking-widest block mb-1.5">Rating Score</span>
                    <div className="flex gap-1.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5.5 h-5.5 lg:w-6 lg:h-6 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-cream3'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-white border border-cream3 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
                    <span className="text-[9px] lg:text-xs font-mono text-dark2/45 uppercase font-black block">Reviewer</span>
                    <p className="font-black text-dark uppercase text-sm lg:text-[15px]">{rev.name}</p>
                    {rev.email && <p className="font-mono font-black text-xs lg:text-sm text-dark break-all">{rev.email}</p>}
                  </div>

                  {/* Product Details */}
                  <div className="bg-white border border-cream3 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
                    <span className="text-[9px] lg:text-xs font-mono text-dark2/45 uppercase font-black block">Product Item</span>
                    <div className="flex items-center gap-3.5">
                      {displayImg ? (
                        <img 
                          src={displayImg} 
                          alt={rev.product_name} 
                          className="w-11 h-13 lg:w-12 lg:h-14 object-cover rounded-xl border border-cream3 shrink-0 bg-cream"
                        />
                      ) : (
                        <div className="w-11 h-13 lg:w-12 lg:h-14 rounded-xl border border-cream3 bg-cream3/50 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-dark2/30" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-extrabold text-dark uppercase block text-xs lg:text-sm leading-tight truncate">{rev.product_name}</span>
                        {matchedProduct && (
                          <span className="text-[9.5px] lg:text-xs text-dark2/45 block mt-1 font-mono">
                            {matchedProduct.sku ? `SKU: ${matchedProduct.sku}` : `₹${matchedProduct.price.toLocaleString('en-IN')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Comment */}
                  <div className="bg-cream2/60 border border-cream3 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
                    <span className="text-[9px] lg:text-xs font-mono text-dark2/45 uppercase font-black block">Written Feedback</span>
                    <p className="text-xs lg:text-sm text-dark2/80 italic leading-relaxed whitespace-pre-wrap">
                      "{rev.comment || 'No written comment provided.'}"
                    </p>
                  </div>
                </div>

                  {/* Approve Button in Modal */}
                  {!rev.approved && (
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          handleApproveReview(rev.id)
                          setActiveReviewModal(null)
                        }}
                        className="w-full py-3.5 bg-dark text-primary hover:bg-accent hover:text-dark text-xs lg:text-sm font-mono font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-colors border-none shadow-md"
                      >
                        Approve Review
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
