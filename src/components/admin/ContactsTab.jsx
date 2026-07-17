import React, { useState } from 'react'
import { Mail, Search, Trash2, Calendar, Clipboard, Check, ArrowUpRight, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function ContactsTab({
  filteredInquiries = [],
  inquiries = [],
  searchQuery,
  setSearchQuery,
  handleDeleteInquiry
}) {
  const [copiedEmail, setCopiedEmail] = useState(null)

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    toast.success("Email copied to clipboard!")
    setTimeout(() => setCopiedEmail(null), 1500)
  }

  // Calculate metrics
  const totalInqs = inquiries.length
  const orderRelated = inquiries.filter(i => i.orderNumber).length
  const generalInqs = totalInqs - orderRelated

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Mail className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Customer Inquiries
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Read support messages, process query tickets, and send direct email replies.</p>
        </div>
        <span className="text-[10px] lg:text-xs bg-dark text-cream font-sans font-bold px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl uppercase tracking-wider shadow-xs">
          {filteredInquiries.length === inquiries.length 
            ? `${inquiries.length} Inquiries` 
            : `Found ${filteredInquiries.length} of ${inquiries.length}`}
        </span>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
        {/* Total Inquiries */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-violet-50/80 to-purple-100/40 border border-purple-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-purple-700/80 uppercase tracking-widest block">Total Inbox</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-purple-955 mt-0.5 sm:mt-1 font-sans">{totalInqs}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-purple-600 bg-purple-50/90 px-1.5 py-0.5 rounded border border-purple-150/50">Messages</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-purple-700 shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Order Related */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-amber-50/80 to-orange-100/40 border border-orange-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-amber-700/80 uppercase tracking-widest block">Order Queries</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-amber-955 mt-0.5 sm:mt-1 font-sans">{orderRelated}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-amber-600 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-150/50">Tracking Info</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-amber-700 shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* General Support */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-blue-50/80 to-indigo-100/40 border border-blue-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-blue-700/80 uppercase tracking-widest block">General Support</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-955 mt-0.5 sm:mt-1 font-sans">{generalInqs}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-blue-600 bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-150/50">Help / Q&A</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-blue-700 shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Input */}
      <div className="relative group max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-4.5 lg:h-4.5 text-dark/30 group-focus-within:text-dark transition-colors" />
        <input
          type="text" 
          placeholder="Search inquiries by sender, email, subject, order # or message content..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 lg:pl-11 pr-4 py-3 lg:py-3.5 rounded-xl border border-cream3 bg-white hover:border-neutral-355 focus:border-dark focus:bg-white text-xs lg:text-sm text-dark focus:outline-none font-sans font-semibold transition-all shadow-xs placeholder-dark/30"
        />
      </div>

      {/* Inquiries List */}
      <div className="space-y-5">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 text-dark2/50 bg-white border border-cream3 rounded-3xl text-xs lg:text-sm font-sans shadow-xs">
            {inquiries.length === 0 ? 'No inquiries received.' : 'No matching inquiries found.'}
          </div>
        ) : (
          filteredInquiries.map(inq => {
            const initials = inq.name ? inq.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'C'
            return (
              <motion.div 
                key={inq.id} 
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white border border-cream3 p-5 sm:p-6 lg:p-7 rounded-3xl hover:shadow-md transition-all duration-300 space-y-4 text-xs lg:text-sm font-sans shadow-sm relative overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-dark/5 text-dark flex items-center justify-center font-bold text-xs lg:text-sm uppercase border border-cream3 shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-dark text-sm lg:text-base block uppercase tracking-tight truncate">{inq.subject || 'No Subject'}</span>
                      <div className="text-[10px] lg:text-xs text-dark2/60 mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
                        From: <span className="font-bold text-dark">{inq.name}</span> (<a href={`mailto:${inq.email}`} className="text-accent hover:underline font-sans">{inq.email}</a>)
                        {inq.orderNumber && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent/10 text-accent border border-accent/25 rounded-md text-[9px] lg:text-[10px] font-sans font-black uppercase">
                            Order ID: {inq.orderNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] lg:text-[10px] bg-cream text-dark2/50 border border-cream3 px-3 py-1.5 rounded-xl font-sans font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-dark2/35" />{new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                <div className="text-dark2/80 font-sans leading-relaxed bg-cream2/30 p-4 lg:p-5 rounded-2xl border border-cream3/40 whitespace-pre-wrap text-[11px] lg:text-xs xl:text-sm">
                  {inq.message}
                </div>

                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 pt-3 border-t border-cream3/60">
                  <span className="text-[9px] lg:text-[10px] text-dark2/45 font-sans tracking-widest uppercase font-black">Ticket Ref: {inq.id}</span>
                  <div className="flex items-center gap-2 flex-wrap w-full xs:w-auto justify-end">
                    <button
                      onClick={() => handleCopyEmail(inq.email)}
                      className="px-3.5 lg:px-4 py-2 lg:py-2.5 bg-cream hover:bg-dark hover:text-white rounded-xl text-dark2/60 transition-all border border-cream3 text-[9.5px] lg:text-xs font-sans font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Copy Email"
                    >
                      {copiedEmail === inq.email ? (
                        <>
                          <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>
                    <a 
                      href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Support Inquiry')}&body=Hello ${encodeURIComponent(inq.name)},%0D%0A%0D%0AThank you for contacting For The Win.%0D%0A%0D%0A`}
                      className="px-4 lg:px-5 py-2 lg:py-2.5 bg-dark text-cream hover:bg-accent hover:text-dark transition-all duration-300 font-sans font-bold uppercase tracking-widest text-[9.5px] lg:text-xs rounded-xl shadow-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 border-none cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                      <span>Reply</span>
                    </a>
                    <button 
                      onClick={() => handleDeleteInquiry(inq.id)} 
                      className="p-2 lg:p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl text-rose-600 transition-all cursor-pointer border-none flex items-center justify-center shadow-xs" 
                      title="Delete Inquiry"
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
