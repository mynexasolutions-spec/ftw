import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Flame, ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const activities = [
  { label: 'Gym Workouts', context: 'High stretch, ultimate breathability' },
  { label: 'Date Nights', context: 'Sleek, minimalist aesthetic drape' },
  { label: 'Game Nights', context: 'Cozy, relaxed oversized comfort' },
  { label: 'Sleeping In', context: 'Ultra soft luxury combed cotton' },
  { label: 'Morning Runs', context: 'Pre-shrunk, sweat absorbing weave' },
  { label: 'Board Meetings', context: 'Clean collar layouts, sharp structure' },
  { label: 'Dance Classes', context: 'Maximum flexibility & movement' },
  { label: 'Clubbing', context: 'Reflective cyber neon graphics shine' }
]

const fabrics = [
  { label: 'Fabric Base',       value: 'Heavyweight French Terry & Premium Combed Cotton', info: '300+ GSM structured cotton' },
  { label: 'Print Techniques',  value: 'Puff · Screen · Embroidery · HD DTF', info: 'High-definition industrial prints' },
  { label: 'Weight & Feel',     value: '280GSM+ for structured street fit', info: 'Durable and heavy shape retention' },
  { label: 'Finish',            value: 'Clean seams · Washed softness · Zero bleed', info: 'Pre-shrunk and bio-washed' },
]

const pillars = [
  {
    icon: Sparkles,
    title: 'Fabric First',
    desc: 'Heavyweight French Terry for structured pieces. Premium jersey and cotton blends for everyday comfort — chosen for how it feels, not just how it looks.',
    tag: '280GSM+ French Terry'
  },
  {
    icon: ShieldCheck,
    title: 'Elite Finish',
    desc: 'High-density puff prints, reflective screen prints, rich embroidery, and clean DTF — executed with premium techniques that make every piece look and feel bespoke.',
    tag: 'Industrial Premium Prints'
  },
  {
    icon: Flame,
    title: 'Perfect Fit',
    desc: 'Engineered streetwear silhouettes. Structured where it matters, relaxed where you need to breathe. Designed for maximum confidence and versatility.',
    tag: 'Unisex Fit Engineering'
  }
]

export default function About() {
  return (
    <div className="bg-[#FAF9F6] text-[#161616] font-sans min-h-screen relative overflow-hidden selection:bg-[#161616] selection:text-white bg-grid-dots bg-grain">
      
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(255,78,32,0.06),transparent)] pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-500/3 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-orange-500/3 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Streetwear grid overlay */}
      <div className="absolute inset-0 bg-grid-black/[0.015] pointer-events-none" />

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24">
        
        {/* Title Header: Matches Helpline and Shop pages */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 sm:mb-16 border-l-4 border-[#161616] pl-4 sm:pl-6"
        >
          <span className="text-[#FF4E20] font-mono uppercase tracking-[0.25em] text-xs font-bold block mb-2">
            FTW BRAND STORY
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#161616] leading-none">
            ABOUT <span className="text-[#FF4E20] italic transform skew-x-3 inline-block">US</span>
          </h1>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <motion.div variants={fadeUp}>
              <span className="block font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#161616] leading-none mb-1">
                FOR THE <span className="text-[#FF4E20] italic transform skew-x-3 inline-block">WIN</span>
              </span>
            </motion.div>

            <motion.p variants={fadeUp} className="text-sm sm:text-base text-[#161616]/70 leading-[1.8] max-w-md border-l-4 border-[#FF4E20] pl-5">
              We design everyday premium clothing built around fabric, fit, and finish. Engineered for individuals who move with confidence and write their own rules.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#161616] hover:bg-[#FF4E20] text-[#FAF9F6] hover:text-white text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#FF4E20]/20 cursor-pointer border-none"
              >
                Explore Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/helpline"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF9F6] border border-neutral-200 text-[#161616] text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
              >
                Get in Touch
              </Link>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-5 relative group"
          >
            <div className="aspect-[3/4] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-xl relative bg-[#FAF9F6]">
              <img
                src="/images/3.2.jpeg"
                alt="FTW lookbook model wearing green graphic streetwear tee"
                className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-103"
                onError={(e) => { e.target.src = '/images/Regular-T.png' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="block text-[9px] font-mono text-white/50 uppercase tracking-widest">FTW SERIES 01</span>
                  <span className="block text-sm font-black text-white uppercase tracking-wider mt-1">Signature Cut & Sew</span>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#FF4E20] bg-[#161616]/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 shadow-md">
                  100% Combed Cotton
                </span>
              </div>
            </div>

            {/* Floating metrics badge */}
            <div className="absolute top-4 left-4 z-20 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF4E20]/10 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-[#FF4E20]" />
              </div>
              <div>
                <span className="block text-lg font-mono font-black text-[#161616] leading-none tracking-tight">280+</span>
                <span className="block text-[9px] font-mono text-[#161616]/50 uppercase tracking-widest mt-0.5">GSM Fabric Weight</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATEMENT SECTION ── */}
      <section className="relative z-10 py-16 sm:py-24 border-y border-neutral-200/85 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
          >
            <div className="lg:col-span-5 space-y-6">
              <motion.div variants={fadeUp}>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#FF4E20] font-bold block mb-3">WHAT IS FTW?</span>
                <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#161616] leading-none tracking-tight">
                  IT'S ABOUT<br />CHOOSING YOURSELF.
                </h2>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-4 text-xs sm:text-sm text-[#161616]/60 leading-[1.8] font-sans">
                <p>
                  <strong className="text-[#161616] font-black">FTW stands for "FOR THE WIN."</strong> It's our philosophy of confidence. Wearing pieces that fit perfectly, feel incredibly soft, and command respect wherever you go.
                </p>
                <p>
                  We don't do boring clothing. Every drop is crafted with high-density textures and custom heavy fabrics. We focus on creating wardrobe masterpieces that speak for themselves.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-3.5 pt-2">
                <div className="w-10 h-10 rounded-xl bg-[#161616] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#FF4E20]" />
                </div>
                <div>
                  <p className="text-[11px] font-mono font-black uppercase tracking-widest text-[#161616] leading-none">ZERO COMPROMISES</p>
                  <p className="text-[9px] text-[#161616]/40 mt-1 font-mono uppercase">Premium materials · Built to endure</p>
                </div>
              </motion.div>
            </div>

            {/* Context/Activity cards */}
            <motion.div variants={fadeUp} className="lg:col-span-7 space-y-4">
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-[#161616]/40 block">FIT FOR ALL SCENARIOS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activities.map((tag, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAF9F6] border border-neutral-200/80 p-4 rounded-xl hover:border-[#FF4E20] hover:bg-[#FF4E20]/5 transition-all duration-300 group flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4E20] shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#161616] block">{tag.label}</span>
                      <span className="text-[9px] text-[#161616]/45 font-sans mt-0.5 block">{tag.context}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PILLARS SECTION ── */}
      <section className="relative z-10 py-16 sm:py-24 border-b border-neutral-200/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-12 border-l-4 border-[#161616] pl-5"
          >
            <motion.span variants={fadeUp} className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#FF4E20] font-bold block mb-2">OUR STANDARDS</motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-black uppercase text-[#161616] leading-none">
              FABRIC. FIT. FINISH.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xs sm:text-sm text-[#161616]/50 mt-3 max-w-md leading-relaxed font-sans">
              Our core product framework. We engineer garments from the yarn level to ensure unmatched quality.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, desc, tag }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                className="bg-white border border-neutral-200/80 rounded-[24px] p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:border-[#FF4E20]/40 transition-all duration-400 group relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF4E20] to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#161616] text-[#FF4E20] flex items-center justify-center mb-6 group-hover:bg-[#FF4E20] group-hover:text-white transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-sm">
                    <Icon className="w-5 h-5 transition-colors" />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-black uppercase text-[#161616] mb-2.5 tracking-wide">{title}</h3>
                  <p className="text-[11px] sm:text-xs text-[#161616]/60 leading-[1.8] font-sans">{desc}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-neutral-200/80 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#161616]/40">{tag}</span>
                  <ArrowRight className="w-4 h-4 text-[#161616]/20 group-hover:text-[#161616] transition-colors duration-250 group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS SECTION ── */}
      <section className="relative z-10 py-16 sm:py-24 border-b border-neutral-200/85 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-5 relative aspect-[3/4] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-lg group bg-[#FAF9F6]"
            >
              <img
                src="/images/1.2.jpeg"
                alt="Detailed view of FTW premium stitching and collar"
                className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-103"
                onError={(e) => { e.target.src = '/images/Regular-T.png' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-200/80 shadow-md">
                <span className="text-[8px] font-mono text-[#161616]/40 uppercase tracking-widest block mb-1">Tailored Specifications</span>
                <p className="text-xs font-semibold text-[#161616] leading-snug">Double-needle stitched ribs, taped shoulder-to-shoulder collars, pre-shrunk structures. Crafted to stay premium for years.</p>
              </div>
            </motion.div>

            {/* Right Info Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="lg:col-span-7 space-y-6"
            >
              <motion.div variants={fadeUp}>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#FF4E20] font-bold block mb-2">FABRIC COMPOSITIONS</span>
                <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#161616] leading-none mb-6">
                  A LUXURY YOU<br />CAN FEEL DAILY.
                </h2>
              </motion.div>
              
              <motion.div variants={fadeUp} className="space-y-3.5">
                {fabrics.map(({ label, value, info }, i) => (
                  <div key={i} className="flex items-start gap-5 p-4 bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl hover:border-[#FF4E20]/40 transition-colors duration-250 group">
                    <span className="w-1 h-full min-h-[36px] rounded-full bg-[#FF4E20]/30 group-hover:bg-[#FF4E20] shrink-0 mt-0.5 transition-colors" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-4 flex-wrap">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#161616]/40">{label}</span>
                        <span className="text-[8px] font-mono text-[#FF4E20] font-bold uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{info}</span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#161616] uppercase tracking-wide mt-1.5 block leading-snug">{value}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-[#161616] rounded-[32px] overflow-hidden border border-neutral-900 relative shadow-2xl"
        >
          <div className="absolute inset-0">
            <img src="/images/3.3.jpeg" alt="" className="w-full h-full object-cover opacity-15" onError={(e) => { e.target.style.display = 'none' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#161616] via-[#161616]/95 to-[#161616]/80" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-12 md:p-16">
            <div className="max-w-lg text-center lg:text-left">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-white/40 block mb-3.5">READY TO UPGRADE?</span>
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase leading-none text-white tracking-tight">
                EXPRESS YOUR <span className="text-[#FF4E20] italic transform skew-x-3 inline-block">IDENTITY.</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50 mt-4 leading-relaxed max-w-sm mx-auto lg:mx-0">
                Browse our current limited-drop catalog and experience heavy, high-density luxury daily.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-[#FF4E20] hover:bg-white text-white hover:text-[#161616] px-7 py-4 font-mono font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-xl transition-all duration-300 shadow-md border-none text-center cursor-pointer decoration-none"
              >
                Explore Drop <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/helpline"
                className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 px-7 py-4 font-mono font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-xl transition-all duration-300 text-center cursor-pointer decoration-none"
              >
                Customer Support
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
