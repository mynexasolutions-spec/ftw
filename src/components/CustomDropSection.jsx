import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Palette, ChevronRight, Zap, Target } from 'lucide-react'

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
        .hud-custom-card {
          background: #FFFFFF;
          background-image: 
            radial-gradient(rgba(124, 58, 237, 0.04) 1.5px, transparent 1.5px),
            linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
          background-size: 24px 24px, 100% 100%;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02);
          position: relative;
          padding: 56px 40px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          clip-path: polygon(30px 0, calc(100% - 30px) 0, 100% 30px, 100% calc(100% - 30px), calc(100% - 30px) 100%, 30px 100%, 0 calc(100% - 30px), 0 30px);
        }
        .hud-custom-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          background: #E2E8F0;
          padding: 1.5px;
          clip-path: polygon(30px 0, calc(100% - 30px) 0, 100% 30px, 100% calc(100% - 30px), calc(100% - 30px) 100%, 30px 100%, 0 calc(100% - 30px), 0 30px);
          transition: background 0.3s ease;
        }
        .hud-custom-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 45px rgba(139, 92, 246, 0.04);
        }

        /* Steps grid elements */
        .hud-step-box {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 28px 24px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }
        .hud-step-box:hover {
          border-color: #8B5CF6;
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.05);
          transform: translateY(-4px);
        }
        .hud-step-badge {
          background: rgba(139, 92, 246, 0.06);
          color: #8B5CF6;
          border: 1px solid rgba(139, 92, 246, 0.18);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 8px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }
        .hud-step-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #E2E8F0;
          transition: background-color 0.3s ease;
        }
        .hud-step-box:hover .hud-step-indicator {
          background: #8B5CF6;
        }

        /* Large Custom Launcher Button */
        .hud-launch-btn-wrapper {
          filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.35));
          transition: filter 0.3s ease;
        }
        .hud-launch-btn-wrapper:hover {
          filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.7));
        }
        .hud-launch-btn {
          background: #000000;
          color: #FFFFFF;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12.5px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 18px 42px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hud-launch-btn:hover {
          background: #1E1B4B; /* Deep Indigo/Black */
          transform: scale(1.02);
        }

        /* Mobile specific overrides for custom drop section */
        @media (max-width: 640px) {
          .hud-custom-card {
            padding: 32px 16px !important;
            clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px) !important;
          }
          .hud-custom-card::before {
            clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px) !important;
          }
          .hud-launch-btn {
            padding: 14px 24px !important;
            font-size: 11px !important;
            width: 100% !important;
            justify-content: center !important;
          }
        }
      ` }} />

      <div className="absolute right-[-10%] top-0 bottom-0 w-[50%] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.03),transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 hud-custom-card">
        {/* HUD Tech Corner Crosshairs */}
        <span className="absolute top-4 left-4 text-[9px] font-mono text-purple-600/25 select-none pointer-events-none">[+] SECTION:04</span>
        <span className="absolute top-4 right-4 text-[9px] font-mono text-purple-600/25 select-none pointer-events-none">SYS.INIT //</span>
        <span className="absolute bottom-4 left-4 text-[9px] font-mono text-purple-600/25 select-none pointer-events-none">// CUSTOMIZER</span>
        <span className="absolute bottom-4 right-4 text-[9px] font-mono text-purple-600/25 select-none pointer-events-none">STATUS: ONLINE</span>

        {/* Title & Info (Centered & Refined) */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 font-mono uppercase tracking-[0.25em] text-[8.5px] font-black rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" /> FOR THE WIN CUSTOM STUDIO
          </span>
          <h2 className="font-display text-[32px] sm:text-[45px] md:text-6xl lg:text-[78px] font-black tracking-tighter italic leading-none text-dark uppercase select-none mt-5 pr-4">
            CUSTOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 pr-3 inline-block">DROP</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-6 max-w-xl leading-relaxed font-sans font-medium">
            Upload your graphics, add personalized typography, adjust sizing, and build your own high-spec heavyweight streetwear blanks on our interactive 3D digital canvas.
          </p>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 uppercase">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>No Minimums</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 uppercase">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              <span>High Density Print</span>
            </div>
          </div>
        </div>

        {/* Steps Loop */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-10">
          {[
            {
              step: '01', title: 'CHOOSE BLANK', desc: 'Select your t-shirt base and pick your favorite heavyweight color option.', swatches: true
            },
            {
              step: '02', title: 'UPLOAD ARTWORK', desc: 'Drag and drop your graphics onto the front or back print canvas.'
            },
            {
              step: '03', title: 'SELECT SIZE', desc: 'Preview your product layout and choose your size and quantity.'
            },
            {
              step: '04', title: 'PRINT & SHIP', desc: 'We print using premium DTF technology and deliver straight to your door.'
            }
          ].map((s, idx) => (
            <div key={idx} className="hud-step-box flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[13px] font-mono font-bold text-slate-400">STEP {s.step}</span>
                  <div className="hud-step-indicator" />
                </div>
                <h4 className="font-display text-base md:text-[17px] font-black uppercase tracking-wide text-dark mb-2.5">
                  {s.title}
                </h4>
                <p className="text-[13px] text-slate-500 font-sans leading-relaxed">
                  {s.desc}
                </p>
              </div>
              
              {s.swatches && (
                <div className="flex gap-2 items-center mt-5">
                  {['#7C3AED', '#FFFFFF', '#000000', '#4A4A4A', '#84CC16'].map((col, ci) => (
                    <span 
                      key={ci} 
                      style={{ backgroundColor: col }} 
                      className="w-3 h-3 rounded-full border border-zinc-200 shrink-0 shadow-sm" 
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Launch button */}
        <div className="relative z-10 w-full mt-12 flex flex-col items-center justify-center">
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
              <Palette className="w-4 h-4 text-purple-400" />
              <span>LAUNCH CUSTOMIZER STUDIO</span>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
