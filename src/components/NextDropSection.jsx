import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Mail, Bell, Heart, Star, Share2, Maximize2, Zap } from 'lucide-react'

export default function NextDropSection({
  comingSoonSubtitle,
  comingSoonTitle,
  comingSoonDescription,
  timeLeft,
  countdownTarget,
  notified,
  handleNotifyMe,
  notifyEmail,
  setNotifyEmail,
  activeSneakPeek,
  setActiveSneakPeek,
  comingSoonImages
}) {
  return (
    <motion.section
      id="coming-soon"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto px-6 py-14 md:py-24 z-10 relative overflow-hidden"
    >
      {/* HUD Gaming Styling for Next Drop Section */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Background details matching screenshot */
        .hud-grid-deco {
          position: absolute;
          left: -40px;
          top: 10%;
          opacity: 0.15;
          pointer-events: none;
          font-family: monospace;
          font-size: 10px;
          color: #7C3AED;
          line-height: 1.5;
        }

        .hud-arrows-deco {
          display: inline-flex;
          gap: 4px;
          font-size: 20px;
          color: #3B82F6;
          font-weight: 900;
          margin-left: 20px;
          vertical-align: middle;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 
              0 16px 36px rgba(0, 0, 0, 0.7), 
              inset 0 0 20px rgba(139, 92, 246, 0.3),
              0 0 20px rgba(139, 92, 246, 0.15);
          }
          50% {
            box-shadow: 
              0 16px 40px rgba(0, 0, 0, 0.8), 
              inset 0 0 35px rgba(139, 92, 246, 0.6),
              0 0 40px rgba(139, 92, 246, 0.45);
            background-image: linear-gradient(135deg, #EC4899, #7C3AED, #3B82F6);
          }
        }

        /* Countdown Cards matching image 1-to-1 with extra gaming aesthetics */
        .hud-countdown-card {
          position: relative;
          background-image: linear-gradient(135deg, #7C3AED, #3B82F6, #EC4899);
          clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px);
          animation: pulse-glow 3s infinite ease-in-out;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hud-countdown-card:hover {
          transform: translateY(-8px) scale(1.05);
          animation-play-state: paused;
          box-shadow: 
            0 25px 50px rgba(139, 92, 246, 0.45), 
            0 0 45px rgba(139, 92, 246, 0.55);
        }
        .hud-countdown-inner {
          position: absolute;
          inset: 2.5px;
          background: #06070a;
          background-image: 
            radial-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
            linear-gradient(180deg, #090a0f 0%, #030406 100%);
          background-size: 8px 8px, 100% 100%;
          clip-path: polygon(14.5px 0, calc(100% - 14.5px) 0, 100% 14.5px, 100% calc(100% - 14.5px), calc(100% - 14.5px) 100%, 14.5px 100%, 0 calc(100% - 14.5px), 0 14.5px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }
        .hud-countdown-number {
          text-shadow: 
            0 0 12px rgba(139, 92, 246, 0.95), 
            0 0 24px rgba(139, 92, 246, 0.7),
            0 0 40px rgba(59, 130, 246, 0.5);
          letter-spacing: 0.05em;
          font-family: 'Orbitron', monospace;
          color: #FFFFFF;
        }

        /* Tactical main display window on right */
        .hud-display-window {
          position: relative;
          background-image: linear-gradient(135deg, #3B82F6, #1D4ED8);
          clip-path: polygon(36px 0, calc(100% - 36px) 0, 100% 36px, 100% calc(100% - 36px), calc(100% - 36px) 100%, 36px 100%, 0 calc(100% - 36px), 0 36px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);
          transition: background-image 0.3s ease, box-shadow 0.3s ease;
        }
        .hud-display-window:hover {
          background-image: linear-gradient(135deg, #7C3AED, #3B82F6, #EC4899);
          box-shadow: 0 20px 45px rgba(124, 58, 237, 0.25);
        }
        .hud-display-inner {
          position: absolute;
          inset: 3px;
          background: #090A0F;
          clip-path: polygon(35px 0, calc(100% - 35px) 0, 100% 35px, 100% calc(100% - 35px), calc(100% - 35px) 100%, 35px 100%, 0 calc(100% - 35px), 0 35px);
          overflow: hidden;
          z-index: 2;
        }

        /* Share & Wishlist button overlay styling */
        .hud-btn-circle {
          width: 36px;
          height: 36px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        .hud-btn-circle:hover {
          transform: scale(1.1);
          background: #F8FAFC;
          border-color: #7C3AED;
          color: #7C3AED;
        }

        /* Smaller preview thumbnails styling */
        .hud-thumb-btn {
          position: relative;
          background-image: linear-gradient(135deg, #1F2937, #11131E);
          clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
          transition: all 0.3s ease;
        }
        .hud-thumb-btn img {
          position: relative;
          z-index: 5;
        }
        .hud-thumb-btn.active {
          background-image: linear-gradient(135deg, #7C3AED, #3B82F6, #EC4899);
        }
        .hud-thumb-inner {
          position: absolute;
          inset: 2px;
          background: #090A0F;
          clip-path: polygon(11px 0, calc(100% - 11px) 0, 100% 11px, 100% calc(100% - 11px), calc(100% - 11px) 100%, 11px 100%, 0 calc(100% - 11px), 0 11px);
          z-index: 2;
        }

        /* Submit alert notifications box styling */
        .hud-notify-btn {
          background: linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%);
          color: #FFFFFF;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        }
        .hud-notify-input {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          color: #000000;
          font-family: 'Space Grotesk', sans-serif;
          clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
        }
      ` }} />

      {/* Grid crosshair decals on background */}
      <div className="hud-grid-deco">
        + -- HUD_ONLINE -- +<br />
        | SENSORS: ACTIVE  |<br />
        | GRID_COORDS: 497 |<br />
        + ---------------- +
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Info & Countdown */}
        <div className="lg:col-span-6 text-left flex flex-col justify-center w-full relative z-10">
          {/* Next Drop Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/35 text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black rounded-lg mb-6 w-fit">
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" />
            {comingSoonSubtitle || 'NEXT DROP • SNEAK PEEK'}
            <div className="hud-arrows-deco">»</div>
          </div>

          {/* Bold Header */}
          <h2 className="font-display text-[32px] sm:text-[45px] md:text-5xl lg:text-[54px] xl:text-[62px] font-black tracking-tighter italic leading-[1.05] text-dark uppercase select-none mb-4 whitespace-nowrap">
            MIDNIGHT REIGN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 block">COLLECTION</span>
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-8 max-w-lg font-sans">
            {comingSoonDescription || "An exclusive collection engineered with ultra-heavyweight cotton, distressed vintage details, and industrial utility graphics. Highly limited edition drop."}
          </p>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-3 max-w-xl w-full mb-8">
            {[
              { val: timeLeft.days, label: 'DAYS' },
              { val: timeLeft.hours, label: 'HOURS' },
              { val: timeLeft.minutes, label: 'MINS' },
              { val: timeLeft.seconds, label: 'SECS' }
            ].map((item, idx) => (
              <div key={idx} className="hud-countdown-card aspect-[1/1.1]">
                <div className="hud-countdown-inner absolute inset-[2px]">
                  <div className="text-3xl sm:text-5xl font-black text-white font-mono mb-1 tracking-tight relative z-10 hud-countdown-number overflow-hidden h-[1.15em] flex items-center justify-center">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={item.val}
                        initial={{ y: 24, opacity: 0, scale: 0.85, filter: 'blur(2px)' }}
                        animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ y: -24, opacity: 0, scale: 0.85, filter: 'blur(2px)' }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                        className="inline-block"
                        style={{ textShadow: '0 0 12px rgba(139, 92, 246, 0.8)' }}
                      >
                        {String(item.val).padStart(2, '0')}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="text-[9px] text-purple-400 font-black tracking-widest block font-mono relative z-10">{item.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Notification Alert Sign up Form */}
          <div className="w-full max-w-md">
            {!notified ? (
              <form onSubmit={handleNotifyMe} className="flex gap-2.5 w-full">
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email for drop alert"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 hud-notify-input focus:outline-none focus:border-purple-600 text-xs sm:text-sm"
                  />
                </div>
                <button type="submit" className="px-8 py-4 hud-notify-btn shrink-0 flex items-center gap-1.5 cursor-pointer">
                  <Bell className="w-4 h-4" />
                  <span>Notify Me</span>
                </button>
              </form>
            ) : (
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl text-left text-xs font-mono text-purple-600 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                </span>
                <span>EARLY ACCESS RESERVED. WE'LL EMAIL YOU.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Windows */}
        <div className="lg:col-span-6 flex flex-col gap-6 items-center w-full relative z-10">
          {/* Main Visual Frame */}
          <div className="aspect-[4/4.3] w-full max-w-md hud-display-window overflow-hidden">
            <div className="hud-display-inner absolute inset-[3px]">
              {/* Top Micro tag */}
              <div className="absolute top-6 left-6 z-20 bg-black text-white px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-2 border border-purple-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                SNEAK PEEK
              </div>



              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSneakPeek}
                  src={comingSoonImages[activeSneakPeek]?.url || '/images/Regular-T.png'}
                  alt="Teaser Preview"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover relative z-10"
                />
              </AnimatePresence>

              <div className="absolute bottom-6 left-6 right-6 bg-black/85 backdrop-blur-md px-5 py-4 rounded-xl flex items-center justify-between z-20 border border-white/10">
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-widest">
                  {comingSoonImages[activeSneakPeek]?.label || 'SNEAK PREVIEW'}
                </span>
                <button className="text-[9px] font-mono text-purple-400 font-black tracking-wider uppercase border border-purple-500/30 px-3 py-1 rounded bg-purple-500/10">
                  TEXTURE CLOSE-UP
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Thumbnails grid */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {comingSoonImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSneakPeek(idx)}
                className={`aspect-[4/4.5] hud-thumb-btn overflow-hidden cursor-pointer ${activeSneakPeek === idx ? 'active scale-[0.98]' : 'opacity-60'
                  }`}
              >
                <div className="hud-thumb-inner absolute inset-[2px]">
                  <img src={img.url || '/images/Regular-T.png'} alt={img.label} className="w-full h-full object-cover relative z-10" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono text-white/90 bg-purple-600 px-2 py-0.5 rounded z-20">
                    0{idx + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
