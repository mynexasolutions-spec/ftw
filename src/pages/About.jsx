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
  { label: 'Gym & Fitness', context: 'High stretch, ultimate breathability' },
  { label: 'Date Nights', context: 'Sleek, minimalist premium drape' },
  { label: 'Game Nights', context: 'Cozy, relaxed oversized comfort' },
  { label: 'Sleeping & Running', context: 'Ultra soft luxury combed cotton' },
  { label: 'Meetings', context: 'Clean layouts, sharp structured vibe' },
  { label: 'Dance Classes', context: 'Maximum flexibility & movement' },
  { label: 'Tuitions & Classes', context: 'Effortless everyday look' },
  { label: 'Clubbing & Events', context: 'Vibrant, premium street aesthetic' }
]

const fabrics = [
  { label: 'Premium Fabrics', value: 'Heavyweight French Terry & Premium Cottons', info: 'Luxury you can live in' },
  { label: 'Print Techniques', value: 'Puff Prints · Screen Prints · Embroidery · DTF', info: 'High-end techniques' },
  { label: 'Structured Pieces', value: 'French Terry for structured silhouettes', info: 'Premium structured fit' },
  { label: 'Everyday Comfort', value: 'Premium Jersey & Cotton Blends', info: 'Clean finishes & wearability' },
]

const pillars = [
  {
    icon: Sparkles,
    title: 'Fabric First',
    desc: 'Heavyweight French Terry for structured pieces. Premium jersey and cotton blends for everyday comfort — chosen for how it feels, not just how it looks.',
    tag: 'Heavyweight French Terry'
  },
  {
    icon: ShieldCheck,
    title: 'Elite Finish',
    desc: 'High-density puff prints, reflective screen prints, rich embroidery, and clean DTF — executed with premium techniques that make every piece look and feel bespoke.',
    tag: 'Premium Prints & Details'
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

            <motion.p variants={fadeUp} className="text-sm sm:text-base text-[#161616]/70 leading-[1.8] max-w-md border-l-4 border-[#FF4E20] pl-5 font-sans">
              FTW is an everyday premium brand that is for confident and fashion-driven people who want to look put together without trying too hard. It's about choosing yourself, showing up confidently, and wearing something that makes you feel super comfortable and yet gives you a premium vibe.
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
            {/* Offset streetwear shadow card */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-[#FF4E20]/20 to-orange-500/0 rounded-[38px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
            <div className="absolute inset-0 bg-[#FF4E20] rounded-[32px] translate-x-2.5 translate-y-2.5 opacity-10 group-hover:translate-x-3.5 group-hover:translate-y-3.5 transition-transform duration-500" />

            <div className="aspect-[3/4] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-2xl relative bg-[#FAF9F6] z-10">
              <img
                src="/images/3.2.jpeg"
                alt="FTW lookbook model wearing green graphic streetwear tee"
                className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                onError={(e) => { e.target.src = '/images/Regular-T.png' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/75 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="block text-[9px] font-mono text-white/60 uppercase tracking-widest">FTW SERIES 01</span>
                  <span className="block text-sm font-black text-white uppercase tracking-wider mt-1">Signature Cut & Sew</span>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#FF4E20] bg-[#161616]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-md">
                  100% Combed Cotton
                </span>
              </div>
            </div>

            {/* Floating metrics badge */}
            <div className="absolute -top-4 -left-4 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF4E20]/15 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-[#FF4E20]" />
              </div>
              <div>
                <span className="block text-lg font-mono font-black text-[#161616] leading-none tracking-tight">PREMIUM</span>
                <span className="block text-[8px] font-mono text-[#161616]/50 uppercase tracking-widest mt-0.5">Everyday Vibe</span>
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
                  <strong className="text-[#161616] font-black">FTW stands for "FOR THE WIN."</strong> It's about choosing yourself, showing up confidently and wearing something that makes you feel super comfortable and yet gives you a premium vibe and also gives you freedom to style it your way anywhere.
                </p>
                <p>
                  The brand is not about clothes—it's about effortless fashion and premium vibe.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-3.5 pt-2">
                <div className="w-10 h-10 rounded-xl bg-[#161616] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#FF4E20]" />
                </div>
                <div>
                  <p className="text-[11px] font-mono font-black uppercase tracking-widest text-[#161616] leading-none">OUR USP</p>
                  <p className="text-[9px] text-[#161616]/40 mt-1 font-mono uppercase">Fabric, Fit, Finish so every piece feels premium</p>
                </div>
              </motion.div>
            </div>

            {/* Context/Activity cards */}
            <motion.div variants={fadeUp} className="lg:col-span-7 space-y-5">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#161616]/40 block">STYLE IT HOW YOU WANT, WHEREVER YOU WANT</span>
              <p className="text-xs sm:text-sm text-[#161616]/60 leading-relaxed font-sans">
                It won't require much effort. Whether you're active, relaxing, or working, these pieces are engineered to never disappoint:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activities.map((tag, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-50/50 border border-neutral-200/60 p-4 rounded-2xl hover:border-[#FF4E20]/60 hover:bg-white hover:shadow-xl hover:shadow-orange-500/[0.03] transition-all duration-300 group flex items-start gap-3.5 relative overflow-hidden"
                  >
                    {/* Tiny decorative label line */}
                    <div className="absolute top-0 right-4 w-6 h-[2px] bg-neutral-200 group-hover:bg-[#FF4E20]/40 transition-colors" />

                    <div className="w-8 h-8 rounded-xl bg-[#161616]/5 group-hover:bg-[#FF4E20]/10 flex items-center justify-center shrink-0 transition-colors duration-300">
                      <span className="text-[9px] font-mono font-bold text-[#161616]/40 group-hover:text-[#FF4E20] transition-colors">0{idx + 1}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#161616] block group-hover:text-[#FF4E20] transition-colors">{tag.label}</span>
                      <span className="text-[9px] text-[#161616]/50 font-sans mt-0.5 block leading-normal">{tag.context}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── DESIGN PHILOSOPHY SECTION ── */}
      <section className="relative z-10 py-16 sm:py-24 border-b border-neutral-200/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-12 border-l-4 border-[#161616] pl-5"
          >
            <motion.span variants={fadeUp} className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#FF4E20] font-bold block mb-2">DESIGN PHILOSOPHY</motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-black uppercase text-[#161616] leading-none">
              DESIGNED WITH INTENTION.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xs sm:text-sm text-[#161616]/75 mt-4 max-w-2xl leading-relaxed font-sans">
              We don’t just create clothing—we translate emotion, culture, and identity into something you can wear. Each drop carries a story, allowing you to express who you are without saying a word.
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

      {/* ── SPECS & QUALITY SECTION ── */}
      <section className="relative z-10 py-16 sm:py-24 border-b border-neutral-200/85 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-5 relative group"
            >
              <div className="absolute inset-0 bg-[#FF4E20] rounded-[32px] -translate-x-2.5 translate-y-2.5 opacity-10 group-hover:-translate-x-3.5 group-hover:translate-y-3.5 transition-transform duration-500" />
              <div className="aspect-[3/4] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-2xl relative bg-[#FAF9F6] z-10">
                <img
                  src="/images/1.2.jpeg"
                  alt="Detailed view of FTW premium stitching and collar"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/75 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-200/80 shadow-md">
                  <span className="text-[8px] font-mono text-[#161616]/40 uppercase tracking-widest block mb-1">Tailored Specifications</span>
                  <p className="text-xs font-semibold text-[#161616] leading-snug">Double-needle stitched ribs, taped shoulder-to-shoulder collars, pre-shrunk structures. Crafted to stay premium for years.</p>
                </div>
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
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#FF4E20] font-bold block mb-2">PRODUCT QUALITY</span>
                <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#161616] leading-none mb-6">
                  A LUXURY YOU CAN<br />ACTUALLY LIVE IN.
                </h2>
                <p className="text-xs sm:text-sm text-[#161616]/70 leading-relaxed font-sans mb-4">
                  FTW is built on premium fabrics, clean finishes, and everyday wearability. We focus on fabric quality, like heavyweight French Terry and premium cottons. French Terry is used for structured pieces, while premium jersey and cotton blends are selected for everyday comfort. Prints and designs are done using high-end techniques like puff prints, screen prints, embroidery, and DTF printing to give the fabric the most comfortable and effortless look that feels premium.
                </p>
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

      {/* ── CALL TO ACTION & CUSTOMER CARE ── */}
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
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#FF4E20] block mb-3.5">CUSTOMER CARE HELPLINE</span>
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase leading-none text-white tracking-tight">
                WE ARE HERE <span className="text-[#FF4E20] italic transform skew-x-3 inline-block">FOR YOU.</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50 mt-4 leading-relaxed max-w-sm mx-auto lg:mx-0 font-sans">
                Have questions about our drop narrative, order updates, or sizing details? Get in touch with our customer care helpline anytime.
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
                Go to Helpline
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
