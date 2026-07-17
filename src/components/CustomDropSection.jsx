import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Palette, ChevronRight, Zap, Target, Upload } from 'lucide-react'

const STEPS = [
  { step: '01', title: 'CHOOSE BLANK', desc: 'Pick your style blank and choose your color.', icon: Palette },
  { step: '02', title: 'UPLOAD ART', desc: 'Drag your high-res graphics onto the front or back.', icon: Upload },
  { step: '03', title: 'SELECT SIZE', desc: 'Select size and adjust print placement scale.', icon: Target },
  { step: '04', title: 'PRINT & SHIP', desc: 'We print using premium DTF and deliver it directly.', icon: Zap }
]

export default function CustomDropSection({
  user,
  toast,
  navigate,
  dtfVideoUrl,
  dtfVideoCaption
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto px-6 py-16 sm:py-24 border-b border-neutral-200/60 z-10 relative overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .dtf-grid-bg {
          background-image: radial-gradient(rgba(139, 92, 246, 0.04) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }

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

        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .dtf-gradient-text {
          background-size: 200% auto;
          animation: gradientX 4s ease infinite;
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .dtf-float {
          animation: floatY 6s ease-in-out infinite;
        }

        /* Steps Double Border Box */
        .hud-step-box-border {
          background: rgba(226, 232, 240, 0.6);
          padding: 1.2px;
          border-radius: 20px;
          transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
        }
        .hud-step-box-border:hover {
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(139, 92, 246, 0.12);
        }
        .hud-step-box-inner {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 19px;
          padding: 26px 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: background 0.3s ease;
        }
        .hud-step-box-border:hover .hud-step-box-inner {
          background: linear-gradient(180deg, #FFFFFF 0%, rgba(250, 245, 255, 0.9) 100%);
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
          box-shadow: 0 0 10px #8B5CF6;
        }

        /* Large Custom Launcher Button */
        .hud-launch-btn-wrapper {
          filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.25));
          transition: filter 0.3s ease;
        }
        .hud-launch-btn-wrapper:hover {
          filter: drop-shadow(0 8px 24px rgba(139, 92, 246, 0.45));
        }
        .hud-launch-btn {
          position: relative;
          background: linear-gradient(135deg, #110C24 0%, #03000A 100%);
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          color: #FFFFFF;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 18px 42px;
          cursor: pointer;
          transition: all 0.3s ease;
          clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
          display: inline-flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }
        .hud-launch-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .hud-launch-btn:hover::after {
          left: 130%;
        }
        .hud-launch-btn:hover {
          background: linear-gradient(135deg, #1F153F 0%, #090314 100%);
          border-color: rgba(139, 92, 246, 0.6) !important;
          transform: scale(1.03);
        }

        @media (max-width: 640px) {
          .hud-launch-btn {
            padding: 16px 24px !important;
            font-size: 11.5px !important;
            width: 100% !important;
            justify-content: center !important;
          }
        }
      ` }} />



      {/* Cybernetic Compasses */}
      <div className="absolute right-[-8%] top-[-10%] w-[320px] h-[320px] rounded-full border border-purple-500/5 animate-spin-slow pointer-events-none z-0" />
      <div className="absolute left-[-8%] bottom-[-10%] w-[280px] h-[280px] rounded-full border border-indigo-500/5 animate-spin-reverse-slow pointer-events-none z-0" />

      <div className="relative z-10">
        
        {/* Split Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Heading and Info */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start space-y-6">
            
            <span className="relative inline-flex items-center gap-2.5 pl-5 pr-6 py-2 bg-purple-50/80 backdrop-blur-xs border border-purple-200 text-purple-700 font-mono uppercase tracking-wider text-[11px] lg:text-xs font-semibold rounded-full overflow-hidden shadow-xs">
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-pink-500/15 pointer-events-none animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-purple-600 relative z-10 animate-spin-slow" />
              <span className="relative z-10 tracking-widest">FOR THE WIN CUSTOM STUDIO</span>
            </span>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-dark uppercase select-none drop-shadow-[0_4px_28px_rgba(139,92,246,0.15)]">
              CUSTOM <span className="dtf-gradient-text text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 pr-2 inline-block">STUDIO</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-500 font-sans leading-relaxed max-w-2xl">
              Upload your own high-resolution graphics, apply customized typography, scale placements on the fly, and build heavy blank streetwear fits on our interactive 3D digital canvas.
            </p>

            {/* Sub-features icons as modern pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/80 backdrop-blur-xs rounded-xl text-[10.5px] font-mono font-bold text-purple-755 border border-purple-100 hover:border-purple-300 transition-all hover:scale-105 shadow-2xs">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                <span>Fabric Select</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/80 backdrop-blur-xs rounded-xl text-[10.5px] font-mono font-bold text-purple-755 border border-purple-100 hover:border-purple-300 transition-all hover:scale-105 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Drag Graphic</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/80 backdrop-blur-xs rounded-xl text-[10.5px] font-mono font-bold text-purple-755 border border-purple-100 hover:border-purple-300 transition-all hover:scale-105 shadow-2xs">
                <Target className="w-3.5 h-3.5 text-purple-600" />
                <span>Placement Scale</span>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-4 w-full sm:w-auto">
              <div className="hud-launch-btn-wrapper inline-block">
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
                  <Palette className="w-4.5 h-4.5 text-[#D6FF40] animate-pulse" />
                  <span>LAUNCH CUSTOMIZER STUDIO</span>
                  <ChevronRight className="w-4.5 h-4.5 text-[#D6FF40] ml-1" />
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Demo Phone Mockup / Process Video */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
            {dtfVideoUrl ? (
              <div className="relative pt-4 pb-4 w-full flex flex-col items-center">
                {/* Floating Mockup (No absolute caption overlapping it) */}
                <div className="relative dtf-float">
                  {/* Neon Glow Ring behind Mockup */}
                  <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/30 via-pink-400/20 to-transparent rounded-[3rem] blur-3xl pointer-events-none" />

                  {/* Sleek Bezel Device Mockup */}
                  <div className="relative w-[190px] sm:w-[230px] lg:w-[280px] aspect-[9/16] rounded-[2.2rem] overflow-hidden border-[6px] border-slate-900 bg-slate-950 shadow-2xl ring-4 ring-slate-900/10">
                    <video
                      src={dtfVideoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    {/* Process Badge Overlay */}
                    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[8px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> DTF Process
                    </div>
                  </div>
                </div>

                {/* Caption below the floating video container (Static positioning) */}
                {dtfVideoCaption && (
                  <div className="mt-8 w-[250px] sm:w-[280px] lg:w-[330px] bg-white border border-purple-100 shadow-xl rounded-2xl px-4 py-3 text-center relative z-10">
                    <p className="text-[11px] sm:text-xs font-semibold text-dark leading-snug">
                      {dtfVideoCaption}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-[200px] h-[300px] bg-cream border border-cream3 rounded-2xl flex items-center justify-center text-dark/30 font-mono text-xs">
                Interactive Studio
              </div>
            )}
          </div>

        </div>

        {/* Steps Grid Block */}
        <div className="mt-20">
          <div className="border-t border-cream3/50 pt-12">
            <h3 className="text-center font-mono text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">
              HOW IT WORKS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s, idx) => (
                <div key={idx} className="hud-step-box-border text-left">
                  <div className="hud-step-box-inner">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11.5px] font-mono font-bold text-purple-600">STEP {s.step}</span>
                        <div className="hud-step-indicator" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3.5">
                        <s.icon className="w-4.5 h-4.5 text-purple-600" />
                      </div>
                      <h4 className="font-sans text-[13.5px] font-bold uppercase tracking-wider text-dark mb-1">
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
          </div>
        </div>

      </div>
    </motion.section>
  )
}
