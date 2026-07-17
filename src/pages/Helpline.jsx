import { useState, useEffect } from 'react'
import { Mail, Phone, MessageCircle, Instagram, Clock, HelpCircle, ShieldCheck, Send, ChevronDown, Compass, Sparkles, User, FileText, HelpCircle as HelpIcon, ArrowRight, Zap, Gamepad2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { insertInquiry, getStoreSettings } from '../lib/supabase'

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
  const [settings, setSettings] = useState({
    support_email: 'forthewinmail8@gmail.com',
    support_whatsapp: '+91 XXXXX XXXXX',
    support_instagram: 'ftw_streetwear',
    support_hours: 'MON – SAT: 10:00 AM – 7:00 PM IST',
    facebook_link: 'https://facebook.com'
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const dbSettings = await getStoreSettings()
        if (dbSettings) {
          setSettings(dbSettings)
        }
      } catch (err) {
        console.error("Failed to load helpline settings:", err)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await insertInquiry(formData)
      toast.success("Message dispatched! Telemetry confirmed.", {
        style: {
          background: '#161616',
          color: '#FAF9F6',
          border: '1.5px solid #8B5CF6',
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
      toast.error("Failed to transmit telemetry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const faqData = [
    {
      q: "How can I track my order?",
      a: "Once your order is shipped, we will email you a tracking link. You can also check your order status in the 'My Orders' section on our website."
    },
    {
      q: "What is your exchange and return policy?",
      a: "Since our clothes are highly limited, size exchanges depend on what we have in stock. If you receive a damaged item, please contact us within 4-5 days."
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
    <div className="bg-[#FAF9F6] text-dark min-h-screen relative overflow-hidden bg-grain pb-20">
      {/* Inline styles to match the precise HUD screenshot layout with purple accents */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grain {
            background-image: 
              radial-gradient(rgba(139, 92, 246, 0.08) 1.2px, transparent 1.2px),
              radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
            background-size: 20px 20px, 100% 100%, 100% 100%;
          }

          /* Main Heading FTW decal styling */
          .hud-helpline-title {
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 1000;
            font-size: clamp(34px, 5.5vw, 64px);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.1;
            color: #161616;
            margin-top: 10px;
          }
          .hud-helpline-title span {
            background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-style: italic;
          }

          /* Outer border wrapper for helpline card — darker gaming border */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.9), rgba(99,58,214,0.9), rgba(37,99,235,0.9));
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }

          /* HUD Card layout matching screenshot */
          .hud-helpline-card {
            background: #FFFFFF;
            padding: 16px;
            position: relative;
            clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
          }
          @media (min-width: 640px) {
            .hud-helpline-card {
              padding: 32px;
              clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
            }
          }
          /* Keep content forward */
          .hud-helpline-card > form,
          .hud-helpline-card > div,
          .hud-helpline-card > span,
          .hud-helpline-card > h2,
          .hud-helpline-card > h3,
          .hud-helpline-card > p,
          .hud-helpline-card > a {
            position: relative;
            z-index: 10;
          }

          /* Tech Input Controls */
          .hud-field-wrap {
            position: relative;
          }
          .hud-field-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #A855F7;
            width: 16px;
            height: 16px;
            z-index: 10;
          }
          .hud-input-ctl {
            width: 100%;
            padding: 14px 14px 14px 44px;
            background: rgba(245,240,255,0.45);
            border: 1.5px solid rgba(139,92,246,0.22);
            border-radius: 12px;
            color: #161616;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          @media (min-width: 1024px) {
            .hud-input-ctl {
              font-size: 16px;
              padding: 16px 16px 16px 50px;
            }
          }
          .hud-input-ctl:focus {
            border-color: #8B5CF6;
            outline: none;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
            background: #FFFFFF;
          }

          /* Tech submit button styled exact */
          .hud-submit-action {
            background: #161616;
            color: #D6FF40;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 900;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px 36px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          @media (min-width: 1024px) {
            .hud-submit-action {
              font-size: 14px;
              padding: 18px 48px;
            }
          }
          .hud-submit-action:hover {
            background: #8B5CF6;
            color: #FFFFFF;
            box-shadow: 0 0 22px rgba(139, 92, 246, 0.4);
          }

          /* Direct Contact box item */
          .hud-contact-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border: 1px solid #E8E5DC;
            border-radius: 12px;
            background: #FFFFFF;
            transition: all 0.3s ease;
            text-decoration: none;
          }
          .hud-contact-row:hover {
            border-color: #8B5CF6;
            background: #FAF8FE;
          }

          .hud-contact-iconbox {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border: 1.5px solid #8B5CF6;
            background: rgba(139, 92, 246, 0.06);
            color: #8B5CF6;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.1);
          }
        `
      }} />


      <div className="absolute right-6 top-[25%] text-gray-400 font-mono text-[10px] select-none pointer-events-none text-right">
        X X X X X<br />
        SYSTEM_UP
      </div>

      {/* Large Decorative Console Gamepad Backdrop Icons */}
      <div className="absolute right-[2%] top-[10%] opacity-[0.15] text-purple-500/40 pointer-events-none z-0">
        <Gamepad2 className="w-20 h-20 sm:w-[180px] sm:h-[180px] rotate-[15deg]" />
      </div>
      <div className="absolute left-[2%] top-[42%] opacity-[0.12] text-indigo-500/40 pointer-events-none z-0">
        <Gamepad2 className="w-16 h-16 sm:w-[160px] sm:h-[160px] rotate-[-20deg]" />
      </div>
      <div className="absolute right-[2%] top-[68%] opacity-[0.14] text-purple-500/40 pointer-events-none z-0">
        <Gamepad2 className="w-20 h-20 sm:w-[170px] sm:h-[170px] rotate-[35deg]" />
      </div>
      <div className="absolute left-[2%] bottom-[2%] opacity-[0.10] text-indigo-500/40 pointer-events-none z-0">
        <Gamepad2 className="w-16 h-16 sm:w-[150px] sm:h-[150px] rotate-[-10deg]" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 relative z-10">

        {/* Header Layout */}
        <div className="mb-14 text-left border-b border-[#E8E5DC] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black rounded mb-4">
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" /> HELP & SUPPORT
          </div>
          <h1 className="hud-helpline-title">
            SUPPORT <span>HELPLINE</span>
          </h1>
          <p className="text-dark2/50 font-mono text-xs md:text-sm font-bold uppercase tracking-wider mt-2">
            WE'VE GOT YOUR BACK. LET'S GET YOU BACK IN THE GAME.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Contact Inquiry Form (60% width) */}
          <div className="lg:col-span-7 hud-helpline-card">
            <div className="mb-8">
              <span className="text-purple-600 font-mono uppercase tracking-widest text-[10px] md:text-xs font-black block mb-1.5">/// CONTACT US</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#161616] tracking-tight leading-none uppercase font-display">Send us a message</h2>
              <p className="text-sm md:text-sm text-dark2/50 mt-1 font-sans">Fill in the form below and we will get back to you soon.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-xs font-mono uppercase text-[#161616] font-black">Your Name *</label>
                  <div className="hud-field-wrap">
                    <User className="hud-field-icon" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="hud-input-ctl"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-xs font-mono uppercase text-[#161616] font-black">Email Address *</label>
                  <div className="hud-field-wrap">
                    <Mail className="hud-field-icon" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="hud-input-ctl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order ID */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-xs font-mono uppercase text-[#161616] font-black">Order ID (Optional)</label>
                  <div className="hud-field-wrap">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-mono font-bold text-sm z-10">#</span>
                    <input
                      type="text"
                      placeholder="e.g. #FTW-10928"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                      className="hud-input-ctl animate-none"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-xs font-mono uppercase text-[#161616] font-black">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="hud-input-ctl cursor-pointer py-4"
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
                <label className="block text-xs md:text-xs font-mono uppercase text-[#161616] font-black">Message Details *</label>
                <div className="hud-field-wrap">
                  <FileText className="absolute left-4 top-5 text-purple-400 w-4 h-4 z-10" />
                  <textarea
                    required
                    rows="5"
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="hud-input-ctl resize-none pl-11 pt-4"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hud-submit-action"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Submit Message'}</span>
              </button>
            </form>
          </div>

          {/* RIGHT: Direct Contacts (40% width) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="hud-helpline-card">
              <div className="mb-6">
                <span className="text-purple-600 font-mono uppercase tracking-widest text-[10px] md:text-xs font-black block mb-1.5">/// DIRECT CONTACT</span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase font-display">Other ways to reach us</h3>
              </div>

              <div className="space-y-4">
                {/* Email support */}
                <a href={`mailto:${settings.support_email}`} className="hud-contact-row">
                  <div className="flex items-center gap-4">
                    <div className="hud-contact-iconbox">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs md:text-[11px] text-gray-400 uppercase font-mono font-bold block mb-0.5">Email Support</span>
                      <span className="text-sm md:text-sm text-slate-800 font-mono font-bold break-all">{settings.support_email}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </a>

                {/* WhatsApp support */}
                <a href={`https://wa.me/${(settings.support_whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hud-contact-row">
                  <div className="flex items-center gap-4">
                    <div className="hud-contact-iconbox">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs md:text-[11px] text-gray-400 uppercase font-mono font-bold block mb-0.5">WhatsApp Support</span>
                      <span className="text-sm md:text-sm text-slate-800 font-mono font-bold">{settings.support_whatsapp}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </a>

                {/* Instagram support */}
                <a href={`https://instagram.com/${settings.support_instagram}`} target="_blank" rel="noopener noreferrer" className="hud-contact-row">
                  <div className="flex items-center gap-4">
                    <div className="hud-contact-iconbox">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs md:text-[11px] text-gray-400 uppercase font-mono font-bold block mb-0.5">Instagram DM</span>
                      <span className="text-sm md:text-sm text-slate-800 font-mono font-bold">@{settings.support_instagram}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </a>
              </div>
            </div>

            {/* Support Hours */}
            <div className="hud-helpline-card flex items-center gap-4 p-5">
              <div className="hud-contact-iconbox shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs md:text-[11px] text-gray-400 uppercase font-mono font-bold block mb-0.5">Our Hours</span>
                <span className="text-sm md:text-sm text-slate-800 font-mono font-bold">{settings.support_hours}</span>
              </div>
            </div>

            {/* Returns & Exchanges */}
            <div className="hud-helpline-card flex items-start gap-4 p-5">
              <div className="hud-contact-iconbox shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs text-gray-400 uppercase font-mono font-bold block mb-0.5">Returns & Exchanges</span>
                <span className="text-sm md:text-sm text-slate-800 font-sans font-bold leading-normal block max-w-sm">
                  Our items are highly limited. Sizing and exchanges depend on what we have in stock.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
