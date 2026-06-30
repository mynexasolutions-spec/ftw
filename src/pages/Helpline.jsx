import { useState } from 'react'
import { Mail, Phone, MessageCircle, Instagram, Clock, HelpCircle, ShieldCheck, Send, ChevronDown, Compass, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { insertInquiry } from '../lib/supabase'

export default function Helpline() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await insertInquiry(formData)
      toast.success("Message sent! We will get back to you soon.", {
        style: { 
          background: '#161616', 
          color: '#FAF9F6', 
          border: '1px solid #222222',
          fontFamily: "'Space Grotesk', sans-serif"
        }
      })
      setFormData({
        name: '',
        email: '',
        orderNumber: '',
        subject: 'General Inquiry',
        message: ''
      })
    } catch (err) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  }

  const faqData = [
    {
      q: "How can I track my order?",
      a: "Once your order is shipped, we will email you a tracking link. You can also check your order status in the 'My Orders' section on our website."
    },
    {
      q: "What is your exchange and return policy?",
      a: "Since our clothes are highly limited, size exchanges depend on what we have in stock. If you receive a damaged item, please contact us within 7 days."
    },
    {
      q: "Can I print custom designs?",
      a: "Yes! You can use our customizer tool to design your own T-shirt. We will print it and ship it directly to you."
    },
    {
      q: "What materials do you use?",
      a: "We use premium, heavy 100% organic cotton for a comfortable, oversized fit."
    }
  ]

  return (
    <div className="bg-[#FAF9F6] text-[#161616] font-sans min-h-screen relative overflow-hidden selection:bg-[#161616] selection:text-white bg-grid-dots bg-grain">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(255,78,32,0.06),transparent)] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-purple-500/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-orange-500/2 blur-[150px] rounded-full pointer-events-none" />

      {/* Grid overlay for streetwear structure */}
      <div className="absolute inset-0 bg-grid-black/[0.012] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-20 relative z-10">
        
        {/* Title Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 sm:mb-16 border-l-4 border-[#161616] pl-4 sm:pl-6"
        >
          <span className="text-[#FF4E20] font-mono uppercase tracking-[0.25em] text-xs font-bold block mb-2">
            HELP & SUPPORT
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-[#161616] leading-tight">
            SUPPORT <span className="text-[#FF4E20] italic transform skew-x-3 inline-block">HELPLINE</span>
          </h1>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
        >
          
          {/* LEFT: Inquiry Form Card */}
          <motion.div 
            variants={cardVariants}
            className="lg:col-span-7 bg-white border border-neutral-200/80 p-5 sm:p-10 rounded-2xl sm:rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#161616]/30 transition-all duration-500"
          >
            {/* Glowing Accent Top Border */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#FF4E20] to-transparent opacity-80" />
            
            <div className="mb-8">
              <span className="text-orange-600 font-mono uppercase tracking-widest text-[10px] font-bold block mb-2">CONTACT US</span>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-dark leading-tight">
                Send us a message
              </h2>
              <p className="text-xs text-dark/50 mt-1 font-mono">Fill in the form below and we will get back to you soon.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-[#161616]/60 font-bold">Your Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-[#161616] focus:outline-none focus:border-[#161616] focus:bg-white transition-all text-xs font-semibold placeholder:text-neutral-400"
                  />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-[#161616]/60 font-bold">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g. name@domain.com" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-[#161616] focus:outline-none focus:border-[#161616] focus:bg-white transition-all text-xs font-semibold placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Number */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-[#161616]/60 font-bold">Order ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. #FTW-10928" 
                    value={formData.orderNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-[#161616] focus:outline-none focus:border-[#161616] focus:bg-white transition-all text-xs font-semibold placeholder:text-neutral-400"
                  />
                </div>
                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-[#161616]/60 font-bold">Subject *</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-[#161616] focus:outline-none focus:border-[#161616] focus:bg-white transition-all text-xs font-semibold cursor-pointer"
                  >
                    <option>General Inquiry</option>
                    <option>Order Status & Tracking</option>
                    <option>Sizing & Fittings</option>
                    <option>Exchange & Refund Queries</option>
                    <option>Custom print requests</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-[#161616]/60 font-bold">Message Details *</label>
                <textarea 
                  required 
                  rows="5"
                  placeholder="Tell us how we can help you..." 
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-[#161616] focus:outline-none focus:border-[#161616] focus:bg-white transition-all text-xs font-semibold resize-none placeholder:text-neutral-400"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full sm:w-fit px-8 py-4 bg-[#161616] text-white hover:bg-[#FF4E20] transition-all duration-300 font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-md border-none"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* RIGHT: Contact Channels & Meta Cards */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Direct Channels */}
            <motion.div 
              variants={cardVariants}
              className="bg-white border border-neutral-200/80 p-5 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#FF4E20]/25 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#FF4E20] to-transparent opacity-80" />
              
              <div className="mb-6">
                <span className="text-[#FF4E20] font-mono uppercase tracking-widest text-[10px] font-bold block mb-2">DIRECT CONTACT</span>
                <h3 className="font-sans text-xl sm:text-2xl font-bold text-dark leading-tight">Other ways to reach us</h3>
              </div>

              <div className="space-y-4">
                {/* Email Support */}
                <a 
                  href="mailto:forthewinmail8@gmail.com" 
                  className="flex items-center gap-4 p-4 border border-neutral-100 hover:border-[#161616] hover:bg-[#FAF9F6] rounded-2xl transition-all duration-300 group/item decoration-none"
                >
                  <div className="p-3 bg-[#FAF9F6] text-[#FF4E20] rounded-xl group-hover/item:bg-[#FF4E20] group-hover/item:text-white transition-colors duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-[#161616]/40 uppercase font-mono font-bold block mb-0.5">Email Support</span>
                    <span className="text-xs text-dark font-mono font-bold break-all block">forthewinmail8@gmail.com</span>
                  </div>
                </a>

                {/* WhatsApp Support */}
                <a 
                  href="https://wa.me/91XXXXXXXXXX" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-neutral-100 hover:border-[#161616] hover:bg-[#FAF9F6] rounded-2xl transition-all duration-300 group/item decoration-none"
                >
                  <div className="p-3 bg-[#FAF9F6] text-[#161616] rounded-xl group-hover/item:bg-[#161616] group-hover/item:text-white transition-colors duration-300">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#161616]/40 uppercase font-mono font-bold block mb-0.5">WhatsApp Support</span>
                    <span className="text-xs text-dark font-mono font-bold block">+91 XXXXX XXXXX</span>
                  </div>
                </a>

                {/* Phone support */}
                <a 
                  href="tel:+91XXXXXXXXXX" 
                  className="flex items-center gap-4 p-4 border border-neutral-100 hover:border-[#161616] hover:bg-[#FAF9F6] rounded-2xl transition-all duration-300 group/item decoration-none"
                >
                  <div className="p-3 bg-[#FAF9F6] text-[#FF4E20] rounded-xl group-hover/item:bg-[#FF4E20] group-hover/item:text-white transition-colors duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#161616]/40 uppercase font-mono font-bold block mb-0.5">Call Us</span>
                    <span className="text-xs text-dark font-mono font-bold block">+91 XXXXX XXXXX</span>
                  </div>
                </a>

                {/* Instagram support */}
                <a 
                  href="https://instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-neutral-100 hover:border-[#161616] hover:bg-[#FAF9F6] rounded-2xl transition-all duration-300 group/item decoration-none"
                >
                  <div className="p-3 bg-[#FAF9F6] text-[#161616] rounded-xl group-hover/item:bg-[#161616] group-hover/item:text-white transition-colors duration-300">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#161616]/40 uppercase font-mono font-bold block mb-0.5">Instagram DM</span>
                    <span className="text-xs text-dark font-mono font-bold block">@ftw_streetwear</span>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Support Meta info */}
            <motion.div 
              variants={cardVariants}
              className="bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-5"
            >
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-[#FAF9F6] text-[#FF4E20] rounded-lg border border-neutral-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-mono font-bold text-dark mb-1">Our Hours</h4>
                  <p className="text-[10px] text-dark/50 font-mono uppercase">Mon – Sat: 10:00 AM – 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-[#FAF9F6] text-dark rounded-lg border border-neutral-100">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-mono font-bold text-dark mb-1">Returns & Exchanges</h4>
                  <p className="text-[10px] text-dark/50 leading-relaxed font-mono uppercase">Our items are highly limited. Sizing and exchanges depend on what we have in stock.</p>
                </div>
              </div>
            </motion.div>

          </div>

        </motion.div>
      </main>

      {/* FAQ Accordion Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-neutral-200/80 p-5 sm:p-10 rounded-2xl sm:rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#FF4E20] to-transparent opacity-80" />
          
          <div className="mb-8 border-b border-neutral-100 pb-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[#FF4E20] font-mono uppercase tracking-widest text-[10px] font-bold block mb-2">FAQ</span>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-dark leading-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <HelpCircle className="w-7 h-7 text-[#FF4E20] animate-pulse shrink-0" />
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div key={idx} className="border-b border-neutral-100 last:border-0 pb-4">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center py-3 text-left font-bold uppercase tracking-tight text-[#161616] hover:text-[#FF4E20] transition-colors font-sans text-xs sm:text-sm cursor-pointer border-none bg-transparent"
                  >
                    <span>{faq.q}</span>
                    <span className="text-base font-mono shrink-0 ml-4">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#FF4E20]' : 'text-neutral-400'}`} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="text-dark/60 font-sans leading-relaxed text-xs pl-1 mt-2 pr-6 uppercase tracking-wider font-mono text-[10px]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Streetwear quote banner */}
      <section className="pb-20 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#161616] text-[#FAF9F6] p-6 sm:p-16 rounded-2xl sm:rounded-[32px] relative overflow-hidden border border-neutral-900 shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Compass className="w-48 h-48 animate-spin-slow text-white" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF4E20] font-black mb-4 block">ABOUT US</span>
          <blockquote className="font-display text-lg sm:text-3xl font-black uppercase leading-tight tracking-tight max-w-3xl mx-auto mb-6 text-white">
            "We make clothes that help you express yourself and your unique style."
          </blockquote>
          <span className="text-[10px] text-white/50 uppercase font-mono tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> FOR THE WIN • TOKYO - SEOUL - MUMBAI
          </span>
        </motion.div>
      </section>
    </div>
  )
}
