import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Palette, ChevronRight, Zap, Target, Upload } from 'lucide-react'

export default function CustomDropSection({
  user,
  toast,
  navigate
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto px-6 py-14 sm:py-24 border-b border-neutral-200/60 z-10 relative overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverseSlow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 40s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spinReverseSlow 32s linear infinite;
        }

        /* Steps Double Border Box */
        .hud-step-box-border {
          background: #E2E8F0;
          padding: 1.2px;
          border-radius: 16px;
          transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
        }
        .hud-step-box-border:hover {
          background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.08);
        }
        .hud-step-box-inner {
          background: #FFFFFF;
          border-radius: 15px;
          padding: 24px 22px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: background 0.3s ease;
        }
        .hud-step-box-border:hover .hud-step-box-inner {
          background: linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%);
        }

        .hud-step-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #E2E8F0;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .hud-step-box-border:hover .hud-step-indicator {
          background: #8B5CF6;
          box-shadow: 0 0 8px #8B5CF6;
        }

        /* Large Custom Launcher Button */
        .hud-launch-btn-wrapper {
          filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.35));
          transition: filter 0.3s ease;
        }
        .hud-launch-btn-wrapper:hover {
          filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.7));
        }
        .hud-launch-btn {
          background: #000000;
          color: #FFFFFF;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13.5px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 20px 48px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hud-launch-btn:hover {
          background: #1E1B4B;
          transform: scale(1.02);
        }

        @media (max-width: 640px) {
          .hud-launch-btn {
            padding: 16px 28px !important;
            font-size: 12px !important;
            width: 100% !important;
            justify-content: center !important;
          }
        }
      ` }} />

      {/* Cybernetic Tech Compasses in Background */}
      <div className="absolute right-[-8%] top-[-10%] w-[320px] h-[320px] rounded-full border border-purple-500/5 animate-spin-slow pointer-events-none z-0" />
      <div className="absolute left-[-8%] bottom-[-10%] w-[280px] h-[280px] rounded-full border border-indigo-500/5 animate-spin-reverse-slow pointer-events-none z-0" />

      {/* Centered Main Section Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-4">
        
        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-500/10 border border-purple-500/25 text-purple-600 font-mono uppercase tracking-[0.25em] text-[12.5px] lg:text-[14px] font-black rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" /> FOR THE WIN CUSTOM STUDIO
        </span>

        <h2 className="font-display text-[32px] sm:text-[45px] md:text-5xl lg:text-[64px] font-black tracking-tighter italic leading-none text-dark uppercase select-none mt-5">
          CUSTOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 pr-3 inline-block">STUDIO</span>
        </h2>

        <p className="text-[14px] sm:text-base text-slate-500 font-sans leading-relaxed mt-4 max-w-2xl">
          Upload your graphics, apply typography, scale placement, and build your own heavy blank streetwear fits on our interactive 3D digital canvas.
        </p>

        {/* Sub-features icons */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 mt-5">
          <div className="flex items-center gap-1.5 text-[11.5px] font-mono font-black text-slate-600 uppercase">
            <Palette className="w-4 h-4 text-purple-600" />
            <span>Fabric Select</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-[11.5px] font-mono font-black text-slate-600 uppercase">
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Drag Graphic</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-[11.5px] font-mono font-black text-slate-600 uppercase">
            <Target className="w-4 h-4 text-purple-600" />
            <span>High Density Print</span>
          </div>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-10">
          {[
            { step: '01', title: 'CHOOSE BLANK', desc: 'Pick your style blank and choose your color.' },
            { step: '02', title: 'UPLOAD ART', desc: 'Drag your high-res graphics onto the front or back.' },
            { step: '03', title: 'SELECT SIZE', desc: 'Select size and adjust print placement scale.' },
            { step: '04', title: 'PRINT & SHIP', desc: 'We print using premium DTF and deliver it directly.' }
          ].map((s, idx) => (
            <div key={idx} className="hud-step-box-border text-left">
              <div className="hud-step-box-inner">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] font-mono font-black text-slate-400">STEP {s.step}</span>
                    <div className="hud-step-indicator" />
                  </div>
                  <h4 className="font-display text-[14.5px] font-black uppercase tracking-wide text-dark mb-1">
                    {s.title}
                  </h4>
                  <p className="text-[12.5px] text-slate-500 font-sans leading-snug">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Launch Action */}
        <div className="mt-10 w-full sm:w-auto">
          <div className="hud-launch-btn-wrapper">
            <Link
              to="/customizer"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault()
                  toast.error("Please login to access the customizer!", {
                    id: 'auth-required-home-dtf',
                    style: { background: '#161616', color: '#FAF9F6' }
                  })
                  navigate('/auth?redirect=/customizer')
                }
              }}
              className="hud-launch-btn"
            >
              <Palette className="w-4.5 h-4.5 text-[#D6FF40]" />
              <span>LAUNCH CUSTOMIZER STUDIO</span>
              <ChevronRight className="w-4.5 h-4.5 text-[#D6FF40]" />
            </Link>
          </div>
        </div>

      </div>
    </motion.section>
  )
}
