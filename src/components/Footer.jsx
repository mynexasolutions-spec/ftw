import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Instagram, Gamepad2, Shield, Package, Zap, Facebook, ArrowRight, Star, Trophy, Target, Flame } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import Interactive3DBag from './Interactive3DBag'
import { getStoreSettings } from '../lib/supabase'

export default function Footer() {
  const [email, setEmail] = useState('')
  const { setCartOpen } = useCart()
  const [settings, setSettings] = useState({
    support_email: 'forthewinmail8@gmail.com',
    support_instagram: 'ftw_streetwear',
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
        console.error("Failed to load footer settings:", err)
      }
    }
    loadSettings()
  }, [])

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
    { label: 'Blogs', to: '/blogs' },
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

  const stats = [
    { icon: Trophy, label: 'Happy Customers', value: '2,400+' },
    { icon: Target, label: 'Drops Launched', value: '18+' },
    { icon: Star, label: 'Avg Rating', value: '4.9\u2605' },
    { icon: Flame, label: 'Items Shipped', value: '5,000+' },
  ]

  return (
    <footer className="footer-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .footer-container {
          background: linear-gradient(175deg, #FAF8FE 0%, #F0EAFB 60%, #EBE3F8 100%);
          border-top: 1.5px solid rgba(139,92,246,0.18);
          position: relative;
          z-index: 10;
          padding-top: 0;
          padding-bottom: 0;
          overflow: hidden;
          font-family: 'Space Grotesk', 'Rajdhani', sans-serif;
        }

        .footer-grid-overlay {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(139,92,246,0.06) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
          z-index: 0;
        }

        /* Stats ticker bar */
        .ftw-stats-bar {
          background: #090B11;
          border-bottom: 1px solid rgba(139,92,246,0.22);
          padding: 13px 24px;
          position: relative; z-index: 2;
        }
        .ftw-stat-item {
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px;
          border-right: 1px solid rgba(139,92,246,0.18);
        }
        .ftw-stat-item:last-child { border-right: none; }
        .ftw-stat-icon {
          width: 30px; height: 30px;
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
          display: flex; align-items: center; justify-content: center; color: #A855F7; flex-shrink: 0;
          clip-path: polygon(5px 0,calc(100% - 5px) 0,100% 5px,100% calc(100% - 5px),calc(100% - 5px) 100%,5px 100%,0 calc(100% - 5px),0 5px);
        }

        /* Far Left and Right Margin HUD Accents */
        .hud-side-bar {
          position: absolute;
          top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent 5%, rgba(139, 92, 246, 0.25) 30%, rgba(139, 92, 246, 0.25) 70%, transparent 95%);
          z-index: 10;
          display: none;
        }
        @media (min-width: 1280px) {
          .hud-side-bar {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .hud-side-bar-left { left: 24px; }
        .hud-side-bar-right { right: 24px; }

        .hud-side-badge {
          width: 18px;
          height: 18px;
          background: #FAF8FE;
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B5CF6;
          font-size: 10px;
          font-weight: bold;
          transform: rotate(45deg);
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
        }
        .hud-side-badge span {
          transform: rotate(-45deg);
        }

        /* Tech corner HUD elements */
        .footer-hud-corner {
          position: absolute;
          width: 24px; height: 24px;
          border-color: rgba(168, 85, 247, 0.3);
          border-style: solid;
          pointer-events: none;
          z-index: 1;
        }
        .hud-top-left { top: 16px; left: 16px; border-width: 2px 0 0 2px; }
        .hud-top-right { top: 16px; right: 16px; border-width: 2px 2px 0 0; }

        .footer-brand-desc {
          font-size: 13px;
          color: #4A4D55;
          line-height: 1.8;
          border-left: 2.5px solid #8B5CF6;
          padding-left: 16px;
        }

        /* Drop Alerts Card */
        .alerts-card {
          background: #090B11;
          border: 1px solid rgba(168, 85, 247, 0.35);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 18px;
          position: relative;
          overflow: hidden;
          clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
        }
        .alerts-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #8B5CF6, transparent);
        }

        .alert-icon-wrap {
          background: rgba(168, 85, 247, 0.15);
          border: 1px solid rgba(168, 85, 247, 0.4);
          border-radius: 6px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          color: #A855F7;
          clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px);
        }

        .alert-input-group {
          display: flex;
          align-items: center;
          background: #121622;
          border: 1.5px solid rgba(168, 85, 247, 0.2);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }
        .alert-input-group:focus-within {
          border-color: #8B5CF6;
        }
        .alert-join-btn {
          background: linear-gradient(90deg, #7C3AED 0%, #2563EB 100%);
          color: #FFFFFF;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
          padding: 10px 22px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
          clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%);
        }
        .alert-join-btn:hover {
          opacity: 0.95;
        }

        /* Follow Social Icons */
        .social-pill {
          width: 42px; height: 36px;
          background: #090B11;
          border: 1.5px solid rgba(168, 85, 247, 0.25);
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF;
          transition: all 0.3s ease;
          cursor: pointer;
          clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%);
        }
        .social-pill:hover {
          background: #8B5CF6;
          border-color: #A855F7;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
        }

        /* Column Headers */
        .col-header-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .col-header-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF;
          box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
          clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px);
        }
        .col-header-title {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #1A1C23;
        }
        .col-header-hud-line {
          height: 1px;
          background: rgba(168, 85, 247, 0.25);
          position: relative;
          width: 100%;
          margin-bottom: 20px;
        }
        .col-header-hud-line::after {
          content: '//';
          font-size: 8px;
          font-weight: bold;
          color: rgba(168, 85, 247, 0.5);
          position: absolute;
          right: 0; top: -6px;
          background: #FAF8FE;
          padding-left: 6px;
        }

        /* Link list styling */
        .footer-link-item {
          font-size: 11px;
          font-weight: 700;
          color: #4A4D55;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .footer-link-item:hover {
          color: #8B5CF6;
          transform: translateX(3px);
        }
        .link-arrow {
          color: #A855F7;
          font-weight: 900;
          font-family: monospace;
        }

        /* Bag area glow */
        .ftw-bag-glow {
          position: absolute; width: 180px; height: 180px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
          pointer-events: none; top: 50%; left: 50%; transform: translate(-50%,-50%);
        }
        .ftw-bag-tagline {
          font-size: 7.5px; font-weight: 700; letter-spacing: 0.24em;
          text-transform: uppercase; color: rgba(139,92,246,0.42);
          text-align: center; margin-top: 4px; font-family: monospace;
        }

        /* Bottom Dark Bar */
        .bottom-hud-panel {
          background: #090B11;
          border-top: 1.5px solid rgba(168, 85, 247, 0.3);
          position: relative;
          padding: 18px 24px;
          margin-top: 48px;
          z-index: 2;
        }
        .bottom-hud-panel::before {
          content: '';
          position: absolute;
          top: -1.5px; left: 50%;
          transform: translateX(-50%);
          width: 140px; height: 18px;
          background: #090B11;
          border-color: rgba(168, 85, 247, 0.3);
          border-style: solid;
          border-width: 0 1.5px 1.5px 1.5px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%);
          z-index: 3;
        }

        .bolt-badge-wrap {
          position: absolute;
          top: -14px; left: 50%;
          transform: translateX(-50%);
          z-index: 4;
        }
        .bolt-badge {
          width: 26px; height: 26px;
          background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
          border: 1px solid rgba(168, 85, 247, 0.6);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.6);
        }

        /* Payment badges stylized as real logos */
        .pay-frame {
          border: 1.2px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 24px;
        }
        .pay-visa {
          color: #2563EB;
          font-style: italic;
          font-family: 'Outfit', sans-serif;
        }
        .pay-mc {
          position: relative;
          color: #FFFFFF;
          padding-left: 26px !important;
        }
        .pay-mc::before {
          content: '';
          position: absolute;
          left: 6px; top: 7px;
          width: 10px; height: 10px;
          background: #EF4444;
          border-radius: 50%;
        }
        .pay-mc::after {
          content: '';
          position: absolute;
          left: 12px; top: 7px;
          width: 10px; height: 10px;
          background: #F59E0B;
          border-radius: 50%;
          opacity: 0.85;
        }
        .pay-rupay {
          color: #FFFFFF;
          font-weight: 800;
          font-style: italic;
        }
        .pay-upi {
          color: #00E5FF;
          font-family: sans-serif;
          font-weight: 900;
        }
        .pay-cod {
          color: #10B981;
          border-color: rgba(16, 185, 129, 0.25);
        }
      ` }} />

      <div className="footer-grid-overlay"></div>
      <div className="footer-hud-corner hud-top-left"></div>
      <div className="footer-hud-corner hud-top-right"></div>

      {/* Stats Ticker Bar */}
      <div className="ftw-stats-bar">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="ftw-stat-item">
              <div className="ftw-stat-icon"><Icon className="w-3.5 h-3.5" /></div>
              <div>
                <div className="text-white font-black text-[14px] leading-none font-mono">{value}</div>
                <div className="text-gray-500 text-[8px] uppercase tracking-widest font-bold mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-12 gap-x-8 pb-10">

          {/* Left Column: Brand, Alerts, Follow */}
          <div className="lg:col-span-4 flex flex-col gap-7">
            <div>
              <Link to="/" className="flex items-center gap-3 group select-none relative h-10 mb-4 w-fit block">
                <img src="/images/ftw-logo.webp" alt="For The Win Logo" className="h-[68px] w-auto object-contain transition-all duration-300 group-hover:scale-105 absolute top-1/2 -translate-y-1/2 left-0" style={{ maxWidth: 'none' }} />
                <span className="font-display text-[13px] leading-none tracking-[0.22em] font-black uppercase pl-20 flex items-center gap-1 text-gray-900">
                  <span>FOR THE</span>
                  <span className="text-purple-600 italic transform -skew-x-6 inline-block">WIN</span>
                </span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-dashed border-purple-500/30 text-purple-600 font-mono uppercase tracking-[0.2em] text-[7.5px] font-black rounded mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                FTW_BRAND // EST. 2024
              </span>
              <p className="footer-brand-desc">
                Premium heavyweight streetwear — built on quality fabrics, clean finishes, and everyday wearability. Wear it with intent.
              </p>
            </div>

            {/* Drop Alerts chamfered card */}
            <div className="alerts-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="alert-icon-wrap">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black tracking-widest text-white uppercase leading-tight">Get Drop Alerts</h4>
                  <p className="text-[8.5px] text-gray-400 mt-0.5 leading-tight">First access to drops, restocks &amp; exclusive offers.</p>
                </div>
              </div>
              <form onSubmit={handleSubscribe}>
                <div className="alert-input-group">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow px-3 py-2.5 text-xs bg-transparent focus:outline-none text-white placeholder:text-gray-600 font-mono"
                  />
                  <button type="submit" className="alert-join-btn flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3" />
                    Join
                  </button>
                </div>
                <p className="text-[7px] text-gray-600 mt-2 pl-1 font-mono tracking-widest uppercase">No spam · Unsubscribe anytime</p>
              </form>
            </div>

            {/* Social icons */}
            <div>
              <p className="text-[8.5px] font-black uppercase tracking-[0.2em] text-gray-700 mb-3 font-mono">[ Follow Us ]</p>
              <div className="flex items-center gap-2.5">
                <a href={`https://instagram.com/${settings.support_instagram}`} target="_blank" rel="noopener noreferrer" className="social-pill" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={`mailto:${settings.support_email}`} className="social-pill" title="Email">
                  <Mail className="w-4 h-4" />
                </a>
                <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="social-pill" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Middle Columns (Navigate / Policies) */}
          <div className="md:col-span-1 lg:col-span-4 grid grid-cols-2 gap-6 lg:gap-8">
            <div>
              <div className="col-header-wrap">
                <div className="col-header-icon">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <h4 className="col-header-title">Navigate</h4>
              </div>
              <div className="col-header-hud-line"></div>
              <ul className="space-y-3.5">
                {navLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="footer-link-item">
                      <span className="link-arrow">»</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="col-header-wrap">
                <div className="col-header-icon">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="col-header-title">Policies</h4>
              </div>
              <div className="col-header-hud-line"></div>
              <ul className="space-y-3.5">
                {policyLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="footer-link-item">
                      <span className="link-arrow">»</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: 3D Preview */}
          <div className="md:col-span-1 lg:col-span-4 flex flex-col items-center">
            <div className="col-header-wrap w-full">
              <div className="col-header-icon">
                <Package className="w-4 h-4" />
              </div>
              <h4 className="col-header-title">Interactive Preview</h4>
            </div>
            <div className="col-header-hud-line"></div>

            <div
              className="flex flex-col items-center justify-center min-h-[240px] relative w-full cursor-pointer"
              onClick={() => setCartOpen(true)}
              title="Click to open cart"
            >
              <div className="ftw-bag-glow" />
              <Interactive3DBag />
              <p className="ftw-bag-tagline">drag · click to open cart</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Dark HUD Bar */}
      <div className="bottom-hud-panel">
        <div className="bolt-badge-wrap">
          <div className="bolt-badge">
            <Zap className="w-4 h-4 text-white fill-white animate-pulse" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 relative z-10 pt-1">
          {/* Payment badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-widest mr-1 font-mono">Pay via</span>
            <span className="pay-frame pay-visa">Visa</span>
            <span className="pay-frame pay-mc">Mastercard</span>
            <span className="pay-frame pay-rupay">Rupay</span>
            <span className="pay-frame pay-upi">UPI</span>
            <span className="pay-frame pay-cod">COD</span>
          </div>

          {/* Copyright */}
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.22em] text-center font-mono">
            © 2026 <span className="font-extrabold text-white">FOR THE <span className="text-purple-400 italic -skew-x-3 inline-block">WIN</span></span> · All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
