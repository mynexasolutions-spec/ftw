import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Instagram, CreditCard, Wallet, Coins, QrCode, Banknote } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Interactive3DBag from './Interactive3DBag'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success("You're on the list. Stay alert for drop notices.", {
      style: { background: '#0B0B0B', color: '#FAF9F6', border: '1px solid #2D2D2D' }
    })
    setEmail('')
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Sale', to: '/shop?tab=Sale' },
    { label: 'Coming Soon', to: '/shop?tab=Coming+Soon' },
    { label: 'DTF Custom', to: '/shop?tab=dtf' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/helpline' },
    { label: 'My Orders', to: '/my-orders' },
  ]

  const policyLinks = [
    { label: 'Return Policy', to: '/policies?tab=return' },
    { label: 'Exchange Policy', to: '/policies?tab=exchange' },
    { label: 'Shipping Info', to: '/policies?tab=shipping' },
    { label: 'Privacy Policy', to: '/policies?tab=terms' },
    { label: 'Terms & Conditions', to: '/policies?tab=terms' },
  ]

  const paymentMethods = [
    { label: 'Visa', icon: CreditCard },
    { label: 'Mastercard', icon: Wallet },
    { label: 'RuPay', icon: Coins },
    { label: 'UPI', icon: QrCode },
    { label: 'COD', icon: Banknote },
  ]

  return (
    <footer className="bg-[#FAF9F5] border-t border-[#EAE6DF] font-sans relative z-10 selection:bg-accent selection:text-dark">


      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-12 gap-x-8 border-b border-[#EAE6DF] pb-12 mb-10">

          {/* Brand + Newsletter */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-7">
            <div>
              <Link to="/" className="flex items-center gap-3 group select-none relative h-10 mb-6 w-fit block">
                <img src="/images/ftw-logo.webp" alt="For The Win Logo" className="h-[70px] w-auto object-contain transition-all duration-300 group-hover:scale-105 absolute top-1/2 -translate-y-1/2 left-0" style={{ maxWidth: 'none' }} />
                <span className="font-display text-[13px] leading-none tracking-[0.22em] font-black uppercase pl-20 flex items-center gap-1 text-dark group-hover:text-orange-500 transition-colors duration-300">
                  <span>FOR THE</span>
                  <span className="text-orange-500 italic transform -skew-x-6 inline-block">WIN</span>
                </span>
              </Link>
              <p className="text-xs lg:text-[13px] text-dark2/50 leading-[1.9] max-w-sm border-l-2 border-accent pl-4">
                Premium heavyweight streetwear — built on quality fabrics, clean finishes, and everyday wearability. Wear it with intent.
              </p>
            </div>

            {/* Email form */}
            <div className="max-w-sm">
              <p className="text-[9px] lg:text-[10px] font-mono font-black uppercase tracking-[0.28em] text-dark/60 mb-3">Get Drop Alerts</p>
              <form onSubmit={handleSubscribe}>
                <div className="flex items-center bg-white border border-[#DCD8CF] rounded-2xl overflow-hidden focus-within:border-dark focus-within:ring-2 focus-within:ring-dark/5 transition-all duration-300">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow px-4 py-3 text-xs lg:text-sm bg-transparent focus:outline-none text-dark placeholder:text-dark2/30"
                  />
                  <button
                    type="submit"
                    className="mx-1.5 px-3.5 py-2 bg-dark hover:bg-accent text-cream hover:text-dark text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer border-none shrink-0"
                  >
                    Join
                  </button>
                </div>
                <p className="text-[9px] text-dark2/30 mt-2 pl-1 font-sans">No spam. Unsubscribe anytime.</p>
              </form>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] lg:text-[10px] font-mono uppercase tracking-widest text-dark2/35 font-bold mr-1">Follow</span>
              {[
                { href: 'https://instagram.com', Icon: Instagram, label: '@_ftw.8' },
                { href: 'mailto:forthewinmail8@gmail.com', Icon: Mail, label: 'Email' },
                { href: 'https://wa.me/91XXXXXXXXXX', Icon: MessageCircle, label: 'WhatsApp' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  title={label}
                  className="w-9 h-9 rounded-full bg-white border border-[#DCD8CF] flex items-center justify-center text-dark2/50 hover:bg-dark hover:text-[#D6FF40] hover:border-dark hover:scale-110 transition-all duration-300 shadow-xs"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="sm:col-span-1 lg:col-span-4 grid grid-cols-2 gap-6 md:gap-8">
            <div>
              <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-dark mb-5 pb-2 border-b border-[#EAE6DF]">Navigate</h4>
              <ul className="space-y-3">
                {navLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-[11px] lg:text-xs text-dark2/55 hover:text-accent transition-colors duration-200 font-medium uppercase tracking-wide flex items-center gap-1.5 group"
                    >
                      <span className="w-0 group-hover:w-2.5 h-[1.5px] bg-accent transition-all duration-200 shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-dark mb-5 pb-2 border-b border-[#EAE6DF]">Policies</h4>
              <ul className="space-y-3">
                {policyLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-[11px] lg:text-xs text-dark2/55 hover:text-accent transition-colors duration-200 font-medium uppercase tracking-wide flex items-center gap-1.5 group"
                    >
                      <span className="w-0 group-hover:w-2.5 h-[1.5px] bg-accent transition-all duration-200 shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3D Bag panel */}
          <div className="sm:col-span-1 lg:col-span-4 flex flex-col items-center justify-center min-h-[260px] relative w-full">
            <span className="absolute top-4 left-0 right-0 flex justify-center">
              <span className="text-[9px] lg:text-[10px] font-mono font-black uppercase tracking-[0.25em] text-dark2/35">Interactive Preview</span>
            </span>
            <Interactive3DBag />
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Payment badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
            <span className="text-[9px] lg:text-[10px] font-mono font-black uppercase tracking-widest text-dark2/35 mr-1 hidden sm:inline">Pay via</span>
            {paymentMethods.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#EAE6DF] rounded-lg text-[9px] lg:text-[10px] font-bold text-dark2/60 uppercase tracking-wide shadow-2xs hover:border-dark/30 hover:text-dark transition-all duration-300 cursor-default"
              >
                <Icon className="w-3 h-3 text-accent" />
                {label}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[9px] lg:text-[10px] font-mono text-dark2/40 uppercase tracking-[0.2em] text-center flex items-center gap-1.5 justify-center flex-wrap">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-black text-dark">FOR THE <span className="text-orange-500 italic transform -skew-x-3 inline-block font-sans">WIN</span></span>
            <span className="text-dark2/20">•</span>
            <span>All Rights Reserved</span>
          </p>

        </div>
      </div>
    </footer>
  )
}
