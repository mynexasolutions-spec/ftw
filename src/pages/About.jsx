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
  { label: 'Everyday Comfort', value: 'Premium Jersey & Cotton Blends', info: 'Clean finishes & wearability' }
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
    <div className="bg-[#FAF9F6] text-[#161616] font-sans min-h-screen relative overflow-hidden selection:bg-dark selection:text-[#D6FF40] bg-grain pb-12">

      {/* Gaming UI grid lines, overlays, and glows */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grain {
            background-image: 
              radial-gradient(rgba(139, 92, 246, 0.08) 1.2px, transparent 1.2px),
              radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
            background-size: 20px 20px, 100% 100%, 100% 100%;
          }

          /* Full scanline overlay */
          .about-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.02) 2px,
              rgba(139,92,246,0.02) 4px
            );
          }

          /* Outer border wrapper for helpline card — darker gaming border */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.8), rgba(99,58,214,0.6), rgba(37,99,235,0.6));
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }
          .hud-card-border:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(139,92,246,0.15), 0 0 15px rgba(139,92,246,0.1);
          }

          /* HUD Card layout matching screenshot */
          .hud-about-card {
            background: #FFFFFF;
            padding: 32px;
            position: relative;
            width: 100%;
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
          }
          .hud-about-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2.5px;
            background: linear-gradient(90deg, transparent, #8B5CF6 20%, #C084FC 50%, #6D28D9 80%, transparent);
            z-index: 5;
          }
          
          /* HUD corner ticks */
          .hud-corner { position: absolute; width: 14px; height: 14px; border-color: rgba(139,92,246,0.5); border-style: solid; z-index: 10; }
          .hud-tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }

          /* Hex values for tech gaming vibe */
          .hud-hex { position: absolute; font-size: 7.5px; font-family: monospace; color: rgba(139,92,246,0.45); letter-spacing: 0.05em; font-weight: bold; z-index: 10; }
          .hud-hex-tl { top: 4px; left: 24px; }
          .hud-hex-tr { top: 4px; right: 24px; }

          .hud-title-main {
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 1000;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.1;
            color: #161616;
          }

          /* Tech submit button styled exact */
          .hud-submit-action {
            background: linear-gradient(90deg, #7C3AED 0%, #9333EA 50%, #6D28D9 100%);
            color: #FFFFFF;
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 900;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 16px 36px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
            box-shadow: 0 6px 20px rgba(124,58,237,0.3);
            text-decoration: none;
          }
          .hud-submit-action:hover {
            box-shadow: 0 10px 28px rgba(124,58,237,0.45);
          }
        `
      }} />

      <div className="about-scanlines" />

      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/3 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-indigo-500/3 blur-[150px] rounded-full pointer-events-none" />

      {/* Decorative vertical texts & decals */}
      <div className="absolute left-6 top-[25%] rotate-[-90deg] origin-left text-[9px] font-mono text-gray-400 tracking-[0.3em] uppercase select-none pointer-events-none">
        FTW // BRAND // SYSTEMS
      </div>

      <div className="absolute right-6 top-[25%] text-gray-400 font-mono text-[10px] select-none pointer-events-none text-right">
        X X X X X<br />
        SYSTEM_ON
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24">

        {/* Title Header: Matches Helpline and Shop pages */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14 text-left border-b border-[#E8E5DC] pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black rounded mb-4">
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" /> FTW_MANIFESTO
          </div>
          <h1 className="hud-title-main text-3xl sm:text-4xl lg:text-5xl">
            ABOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 italic">US</span>
          </h1>
          <p className="text-dark2/50 font-mono text-[11px] md:text-sm uppercase tracking-wider mt-2">
            PREMIUM HEAVYWEIGHT STREETWEAR Narrative AND DESIGN VAULT.
          </p>
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
              <span className="block font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#161616] leading-none mb-1">
                FOR THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 italic transform skew-x-3 inline-block">WIN</span>
              </span>
            </motion.div>

            <motion.p variants={fadeUp} className="text-[17px] sm:text-[19px] text-[#161616]/75 leading-[1.8] max-w-xl border-l-4 border-purple-600 pl-5 font-sans">
              FTW is an everyday premium brand that is for confident and fashion-driven people who want to look put together without trying too hard. It's about choosing yourself, showing up confidently, and wearing something that makes you feel super comfortable and yet gives you a premium vibe.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/shop"
                className="hud-submit-action"
              >
                Explore Catalog <ArrowRight className="w-4 h-4 text-white" />
              </Link>
              <Link
                to="/helpline"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF9F6] border border-neutral-200 text-[#161616] text-[12px] sm:text-sm tracking-widest px-8 py-4 rounded-xl transition-all duration-300 shadow-sm font-mono font-black uppercase cursor-pointer decoration-none"
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
            <div className="absolute -inset-2 bg-gradient-to-tr from-purple-500/20 to-indigo-500/0 rounded-[38px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
            <div className="absolute inset-0 bg-purple-600 rounded-[32px] translate-x-2.5 translate-y-2.5 opacity-10 group-hover:translate-x-3.5 group-hover:translate-y-3.5 transition-transform duration-500" />

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
                  <span className="block text-[10px] font-mono text-white/60 uppercase tracking-widest">FTW SERIES 01</span>
                  <span className="block text-sm font-black text-white uppercase tracking-wider mt-1">Signature Cut & Sew</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D6FF40] bg-[#161616]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-md">
                  100% Combed Cotton
                </span>
              </div>
            </div>

            {/* Floating metrics badge */}
            <div className="absolute -top-4 -left-4 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="block text-lg font-mono font-black text-[#161616] leading-none tracking-tight">PREMIUM</span>
                <span className="block text-[9px] font-mono text-[#161616]/50 uppercase tracking-widest mt-0.5">Everyday Vibe</span>
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
                <span className="text-[12px] font-mono uppercase tracking-[0.25em] text-purple-600 font-bold block mb-3">WHAT IS FTW?</span>
                <h2 className="font-sans text-3xl sm:text-4xl font-black uppercase text-[#161616] leading-none tracking-tight">
                  IT'S ABOUT<br />CHOOSING YOURSELF.
                </h2>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-4 text-[16px] sm:text-[18px] text-[#161616]/70 leading-[1.8] font-sans">
                <p>
                  <strong className="text-[#161616] font-black">FTW stands for "FOR THE WIN."</strong> It's about choosing yourself, showing up confidently and wearing something that makes you feel super comfortable and yet gives you a premium vibe and also gives you freedom to style it your way anywhere.
                </p>
                <p>
                  The brand is not about clothes—it's about effortless fashion and premium vibe.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-3.5 pt-2">
                <div className="w-10 h-10 rounded-xl bg-[#161616] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#D6FF40]" />
                </div>
                <div>
                  <p className="text-[13px] font-mono font-black uppercase tracking-widest text-[#161616] leading-none">OUR USP</p>
                  <p className="text-[11px] text-[#161616]/40 mt-1 font-mono uppercase">Fabric, Fit, Finish so every piece feels premium</p>
                </div>
              </motion.div>
            </div>

            {/* Context/Activity cards wrapped in HUD borders */}
            <motion.div variants={fadeUp} className="lg:col-span-7 space-y-5">
              <span className="text-[12px] font-mono font-black uppercase tracking-[0.25em] text-[#161616]/45 block">STYLE IT HOW YOU WANT, WHEREVER YOU WANT</span>
              <p className="text-[15.5px] sm:text-[17px] text-dark2/50 leading-relaxed font-sans">
                It won't require much effort. Whether you're active, relaxing, or working, these pieces are engineered to never disappoint:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                {activities.map((tag, idx) => (
                  <div key={idx} className="hud-card-border">
                    <div className="hud-about-card p-4 hover:bg-purple-50/[0.02] transition-colors duration-300 flex items-start gap-3.5 relative overflow-hidden">
                      <div className="hud-corner hud-tl" />
                      <div className="hud-corner hud-tr" />
                      <div className="hud-corner hud-bl" />
                      <div className="hud-corner hud-br" />

                      <div className="w-8 h-8 rounded-xl bg-[#161616]/5 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-mono font-bold text-purple-600">0{idx + 1}</span>
                      </div>

                      <div>
                        <span className="text-[13px] font-mono font-black uppercase tracking-wider text-[#161616] block">{tag.label}</span>
                        <span className="text-[12px] text-[#161616]/50 mt-0.5 block leading-normal">{tag.context}</span>
                      </div>
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
            className="mb-12 border-l-4 border-purple-600 pl-5"
          >
            <motion.span variants={fadeUp} className="text-[12px] font-mono uppercase tracking-[0.25em] text-purple-600 font-bold block mb-2">DESIGN PHILOSOPHY</motion.span>
            <motion.h2 variants={fadeUp} className="font-sans text-3xl sm:text-4xl font-bold uppercase text-[#161616] leading-tight">
              DESIGNED WITH INTENTION.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[16px] sm:text-[18px] text-[#161616]/75 mt-4 max-w-2xl leading-relaxed font-sans">
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
                className="hud-card-border"
              >
                <div className="hud-about-card p-6 sm:p-8 flex flex-col justify-between hover:bg-purple-50/[0.01] transition-colors duration-300 min-h-[300px]">
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />
                  
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#161616] text-purple-400 flex items-center justify-center mb-6 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-sans text-base sm:text-lg font-bold text-[#161616] mb-2">{title}</h3>
                    <p className="text-[13.5px] sm:text-[14.5px] text-[#161616]/60 leading-[1.8] font-sans">{desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-200/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#161616]/40">{tag}</span>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </div>
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
              <div className="absolute inset-0 bg-purple-600 rounded-[32px] -translate-x-2.5 translate-y-2.5 opacity-10 group-hover:-translate-x-3.5 group-hover:translate-y-3.5 transition-transform duration-500" />
              <div className="aspect-[3/4] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-2xl relative bg-[#FAF9F6] z-10">
                <img
                  src="/images/1.2.jpeg"
                  alt="Detailed view of FTW premium stitching and collar"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/75 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-200/80 shadow-md">
                  <span className="text-[9px] font-mono text-[#161616]/40 uppercase tracking-widest block mb-1">Tailored Specifications</span>
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
                <span className="text-[12px] font-mono uppercase tracking-[0.25em] text-purple-600 font-bold block mb-2">PRODUCT QUALITY</span>
                <h2 className="font-sans text-3xl sm:text-4xl font-bold uppercase text-[#161616] leading-tight mb-6">
                  A LUXURY YOU CAN<br />ACTUALLY LIVE IN.
                </h2>
                <p className="text-[16px] sm:text-[18px] text-[#161616]/70 leading-relaxed font-sans mb-4">
                  FTW is built on premium fabrics, clean finishes, and everyday wearability. We focus on fabric quality, like heavyweight French Terry and premium cottons. French Terry is used for structured pieces, while premium jersey and cotton blends are selected for everyday comfort. Prints and designs are done using high-end techniques like puff prints, screen prints, embroidery, and DTF printing to give the fabric the most comfortable and effortless look that feels premium.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-3.5">
                {fabrics.map(({ label, value, info }, i) => (
                  <div key={i} className="flex items-start gap-5 p-4 bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl hover:border-purple-500/40 transition-colors duration-250 group">
                    <span className="w-1 h-full min-h-[36px] rounded-full bg-purple-500/20 group-hover:bg-purple-600 shrink-0 mt-0.5 transition-colors" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-4 flex-wrap">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#161616]/40">{label}</span>
                        <span className="text-[10px] font-mono text-purple-600 font-bold uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{info}</span>
                      </div>
                      <span className="text-[13.5px] sm:text-[15px] font-bold text-[#161616] uppercase tracking-wide mt-1.5 block leading-snug">{value}</span>
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
        <div className="hud-card-border">
          <div className="hud-about-card p-8 sm:p-12 md:p-16">
            <div className="hud-corner hud-tl" />
            <div className="hud-corner hud-tr" />
            <div className="hud-corner hud-bl" />
            <div className="hud-corner hud-br" />
            
            <div className="absolute inset-0">
              <img src="/images/3.3.jpeg" alt="" className="w-full h-full object-cover opacity-10" onError={(e) => { e.target.style.display = 'none' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-lg text-center lg:text-left">
                <span className="text-[11px] font-mono font-black uppercase tracking-[0.25em] text-purple-600 block mb-3.5">CUSTOMER CARE HELPLINE</span>
                <h2 className="font-sans text-3xl sm:text-4xl font-bold uppercase leading-tight text-gray-900">
                  We are here <span className="text-purple-600 italic transform skew-x-3 inline-block">for you.</span>
                </h2>
                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-4 leading-relaxed max-w-sm mx-auto lg:mx-0 font-sans">
                  Have questions about our drop narrative, order updates, or sizing details? Get in touch with our customer care helpline anytime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
                <Link
                  to="/shop"
                  className="hud-submit-action"
                >
                  Explore Drop <ArrowRight className="w-4 h-4 text-white" />
                </Link>
                <Link
                  to="/helpline"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 border border-purple-500/20 text-purple-600 hover:bg-purple-50 px-7 py-4 font-mono font-black uppercase text-[11px] sm:text-xs tracking-widest rounded-xl transition-all duration-300 text-center cursor-pointer decoration-none"
                >
                  Go to Helpline
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
