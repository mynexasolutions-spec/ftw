import { motion } from 'framer-motion'
import { Flame, ArrowRight, Zap, Sparkles, Palette, Target, Dumbbell, Heart, Gamepad2, Moon, Briefcase, Music2, BookOpen, PartyPopper } from 'lucide-react'
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
  { label: 'Gym', icon: Dumbbell },
  { label: 'Date Night', icon: Heart },
  { label: 'Game Night', icon: Gamepad2 },
  { label: 'Sleeping / Running', icon: Moon },
  { label: 'Meetings', icon: Briefcase },
  { label: 'Dance Classes', icon: Music2 },
  { label: 'Tuitions', icon: BookOpen },
  { label: 'Clubbing', icon: PartyPopper }
]

const fabrics = [
  { label: 'Premium Fabrics', value: 'Heavyweight French Terry & Premium Cottons', icon: Sparkles },
  { label: 'Print Techniques', value: 'Puff Prints · Screen Prints · Embroidery · DTF', icon: Palette },
  { label: 'Structured Pieces', value: 'French Terry for structured silhouettes', icon: Target },
  { label: 'Everyday Comfort', value: 'Premium Jersey & Cotton Blends', icon: Zap }
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
          .hud-submit-action {
            position: relative;
            overflow: hidden;
          }
          .hud-submit-action::after {
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
          .hud-submit-action:hover::after {
            left: 130%;
          }
          .hud-submit-action:hover {
            box-shadow: 0 10px 28px rgba(124,58,237,0.45);
            transform: translateY(-2px);
          }

          @keyframes aboutFloatY {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .about-float {
            animation: aboutFloatY 5s ease-in-out infinite;
          }

          .about-badge-shimmer {
            position: relative;
            overflow: hidden;
          }
          .about-badge-shimmer::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent);
            animation: aboutShimmer 3s ease-in-out infinite;
          }
          @keyframes aboutShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @media (max-width: 640px) {
            .hud-submit-action {
              padding: 15px 24px !important;
              font-size: 11px !important;
            }
          }

          @keyframes marqueeScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .about-marquee-track {
            display: flex;
            width: max-content;
            animation: marqueeScroll 28s linear infinite;
          }

          .about-tilt {
            transition: transform 0.4s ease;
            transform-style: preserve-3d;
          }
          .about-tilt:hover {
            transform: perspective(1000px) rotateY(-4deg) rotateX(2deg) scale(1.015);
          }
        `
      }} />

      <div className="about-scanlines" />

      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(139,92,246,0.08),transparent)] pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-56 h-56 sm:w-96 sm:h-96 bg-purple-400/20 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-indigo-400/20 blur-[110px] sm:blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[55%] right-1/4 w-56 h-56 sm:w-[380px] sm:h-[380px] bg-pink-400/10 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />

      {/* Decorative vertical texts & decals (desktop only) */}
      <div className="hidden md:block absolute left-6 top-[25%] rotate-[-90deg] origin-left text-[9px] font-mono text-gray-400 tracking-[0.3em] uppercase select-none pointer-events-none">
        FTW // BRAND // SYSTEMS
      </div>

      <div className="hidden md:block absolute right-6 top-[25%] text-gray-400 font-mono text-[10px] select-none pointer-events-none text-right">
        X X X X X<br />
        SYSTEM_ON
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-24 pb-16 sm:pb-24">

        {/* Title Header: Matches Helpline and Shop pages */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14 text-left border-b border-[#E8E5DC] pb-8"
        >
          <div className="about-badge-shimmer inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black rounded mb-4">
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse relative z-10" /> <span className="relative z-10">WHAT IS FTW?</span>
          </div>
          <h1 className="hud-title-main text-3xl sm:text-4xl lg:text-5xl drop-shadow-[0_4px_24px_rgba(139,92,246,0.15)]">
            ABOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 italic">US</span>
          </h1>
          <p className="text-dark2/75 font-mono font-bold text-[11px] md:text-sm uppercase tracking-wider mt-2">
            EFFORTLESS FASHION. PREMIUM VIBE.
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
              FTW is a everyday premium brand that is for confident and fashion driven people who want to look put together <em className="text-purple-600 not-italic font-bold">without trying too hard</em>.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
              <Link
                to="/shop"
                className="hud-submit-action justify-center w-full sm:w-auto"
              >
                Explore Catalog <ArrowRight className="w-4 h-4 text-white" />
              </Link>
              <Link
                to="/helpline"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF9F6] border border-neutral-200 text-[#161616] text-[12px] sm:text-sm tracking-widest px-8 py-4 rounded-xl transition-all duration-300 shadow-sm font-mono font-black uppercase cursor-pointer decoration-none w-full sm:w-auto"
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

            <div className="about-tilt aspect-[3/4] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-2xl relative bg-[#FAF9F6] z-10">
              <img
                src="/images/3.2.jpeg"
                alt="FTW lookbook model wearing green graphic streetwear tee"
                className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                onError={(e) => { e.target.src = '/images/Regular-T.png' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/75 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="block text-[10px] font-mono font-bold text-white/85 uppercase tracking-widest">FTW SERIES 01</span>
                  <span className="block text-sm font-black text-white uppercase tracking-wider mt-1">Signature Cut & Sew</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D6FF40] bg-[#161616]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-md">
                  100% Combed Cotton
                </span>
              </div>
            </div>

            {/* Floating metrics badge */}
            <div className="about-float absolute -top-3 left-2 sm:-top-4 sm:-left-4 z-20 bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-xl flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-mono font-black text-[#161616] leading-none tracking-tight">PREMIUM</span>
                <span className="block text-[8px] sm:text-[9px] font-mono font-bold text-[#161616]/80 uppercase tracking-widest mt-0.5">Everyday Vibe</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="relative z-10 bg-[#161616] py-3.5 overflow-hidden border-y border-black/20">
        <div className="about-marquee-track">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center shrink-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center gap-3 px-6 font-mono font-black uppercase tracking-[0.2em] text-[12px] sm:text-sm text-white/90 whitespace-nowrap">
                  For The Win
                  <span className="text-[#D6FF40]">✦</span>
                  Premium Streetwear
                  <span className="text-purple-400">✦</span>
                  Effortless Fashion
                  <span className="text-[#D6FF40]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

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
            <div className="lg:col-span-6 space-y-6">
              <motion.div variants={fadeUp}>
                <span className="text-[12px] font-mono uppercase tracking-[0.25em] text-purple-600 font-bold block mb-3">WHAT IS FTW?</span>
                <h2 className="font-sans text-3xl sm:text-4xl font-black uppercase text-[#161616] leading-none tracking-tight drop-shadow-[0_4px_24px_rgba(139,92,246,0.12)]">
                  IT'S ABOUT<br />CHOOSING YOURSELF.
                </h2>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-4 text-[16px] sm:text-[18px] text-[#161616]/70 leading-[1.8] font-sans">
                <p>
                  <strong className="text-[#161616] font-bold">FTW stands for “FOR THE WIN”</strong>
                </p>
                <p>
                  It’s about <span className="text-purple-600 font-bold">choosing yourself</span>, showing up confidently and wearing something that makes you feel super comfortable and yet gives you a premium vibe and also gives you freedom to style it your way anywhere.
                </p>
                <p>
                  The brand is not about clothes it’s about <span className="text-purple-600 font-bold">effortless fashion and premium vibe</span>.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-3.5 p-4 bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl hover:border-purple-500/40 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#161616] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#D6FF40]" />
                </div>
                <div>
                  <p className="text-[13px] font-mono font-black uppercase tracking-widest text-[#161616] leading-none">OUR USP</p>
                  <p className="text-[12px] text-[#161616]/70 mt-1 font-mono uppercase font-bold">FTW focus on fabric ,fit,finish so that every single piece feels premium even in everyday wear.</p>
                </div>
              </motion.div>
            </div>

            {/* Context/Activity cards wrapped in HUD borders */}
            <motion.div variants={fadeUp} className="lg:col-span-6 space-y-5">
              <span className="text-[12px] font-mono font-black uppercase tracking-[0.25em] text-[#161616]/70 block">Wear it wherever you want ? Style it how you want!</span>
              <p className="text-[16px] text-dark2/50 leading-relaxed font-sans">
                It won’t require much efforts.
              </p>
              <p className="text-[15px] sm:text-[16.5px] text-[#161616]/80 leading-relaxed font-sans border-l-2 border-purple-500 pl-4 italic">
                Gym ,date night , game night , while you sleeping or running, going for a meeting , dance classes , tuitions , clubbing, doing anything and everything. This will not disappoint you.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans pt-2">
                {activities.map(({ label, icon: Icon }, idx) => (
                  <div key={idx} className="relative bg-white/90 backdrop-blur-md border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl py-6 px-3 transition-all duration-300 flex flex-col items-center justify-center gap-3 group/chip cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 group-hover/chip:bg-purple-600 flex items-center justify-center transition-colors duration-300 shadow-xs">
                      <Icon className="w-5 h-5 text-purple-600 group-hover/chip:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#161616] text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── DESIGN PHILOSOPHY SECTION ── */}
      <section className="relative z-10 py-16 sm:py-24 border-b border-neutral-200/85 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Supporting visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-5 relative group order-2 lg:order-1"
            >
              <div className="absolute inset-0 bg-indigo-600 rounded-[32px] -translate-x-2.5 translate-y-2.5 opacity-10 group-hover:-translate-x-3.5 group-hover:translate-y-3.5 transition-transform duration-500" />
              <div className="about-tilt aspect-[4/5] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-2xl relative bg-[#FAF9F6] z-10">
                <img
                  src="/images/2.1.jpeg"
                  alt="FTW streetwear design detail"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="block text-[10px] font-mono font-bold text-white/85 uppercase tracking-widest">Every Drop</span>
                  <span className="block text-sm font-black text-white uppercase tracking-wider mt-1">Carries A Story</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Quote + Copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="lg:col-span-7 relative order-1 lg:order-2"
            >
              <span className="pointer-events-none select-none absolute -top-8 -left-2 sm:-top-14 sm:-left-4 font-serif italic text-[90px] sm:text-[160px] leading-none text-purple-500/15 font-black">"</span>

              <motion.div variants={fadeUp} className="relative border-l-4 border-purple-600 pl-5">
                <span className="text-[12px] font-mono uppercase tracking-[0.25em] text-purple-600 font-bold block mb-2">FTW DESIGN PHILOSOPHY</span>
                <h2 className="font-sans text-3xl sm:text-4xl font-bold uppercase text-[#161616] leading-tight drop-shadow-[0_4px_24px_rgba(139,92,246,0.12)]">
                  Every FTW piece is designed with intention.
                </h2>
                <p className="text-[16px] sm:text-[18px] text-[#161616]/75 mt-4 max-w-2xl leading-relaxed font-sans">
                  We don’t just create clothing we translate emotion, culture, and identity into something you can wear. Each drop carries a story, allowing you to express who you are without saying a word.
                </p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SPECS & QUALITY SECTION ── */}
      <section className="relative z-10 py-16 sm:py-24 border-b border-neutral-200/85 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Info Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="lg:col-span-7 space-y-6"
            >
              <motion.div variants={fadeUp}>
                <span className="text-[12px] font-mono uppercase tracking-[0.25em] text-purple-600 font-bold block mb-2">OUR PRODUCT QUALITY</span>
                <h2 className="font-sans text-3xl sm:text-4xl font-bold uppercase text-[#161616] leading-tight mb-6 drop-shadow-[0_4px_24px_rgba(139,92,246,0.12)]">
                  A LUXURY YOU CAN ACTUALLY LIVE IN.
                </h2>
                <p className="text-[16px] sm:text-[18px] text-[#161616]/70 leading-relaxed font-sans mb-4">
                  FTW is built on premium fabrics clean finishes and everyday wearability. It’s a <span className="text-purple-600 font-bold">luxury you can actually live in</span>. We focus on fabric quality , like heavyweight French Terry and premium cottons. Prints and designs are done from high end techniques. French Terry is used for structured pieces ,Premium Jersey and cottons blends for every day comfort. Puff prints , screen prints , embroidery and DTF printing is used to give the fabric the most comfortable and effortless look that feels premium.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-3.5">
                {fabrics.map(({ label, value, icon: Icon }, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl hover:border-purple-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 group-hover:bg-purple-600 flex items-center justify-center shrink-0 transition-colors duration-300">
                      <Icon className="w-4.5 h-4.5 text-purple-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#161616]/70 block">{label}</span>
                      <span className="text-[13.5px] sm:text-[15px] font-bold text-[#161616] uppercase tracking-wide mt-1 block leading-snug">{value}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Image Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-5 relative group"
            >
              <div className="absolute inset-0 bg-purple-600 rounded-[32px] translate-x-2.5 translate-y-2.5 opacity-10 group-hover:translate-x-3.5 group-hover:translate-y-3.5 transition-transform duration-500" />
              <div className="about-tilt aspect-[3/4] rounded-[32px] overflow-hidden border border-neutral-200/80 shadow-2xl relative bg-[#FAF9F6] z-10">
                <img
                  src="/images/1.2.jpeg"
                  alt="Detailed view of FTW premium stitching and collar"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/75 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-200/80 shadow-md">
                  <span className="text-[9px] font-mono font-bold text-[#161616]/70 uppercase tracking-widest block mb-1">Tailored Specifications</span>
                  <p className="text-xs font-semibold text-[#161616] leading-snug">Double-needle stitched ribs, taped shoulder-to-shoulder collars, pre-shrunk structures. Crafted to stay premium for years.</p>
                </div>
              </div>
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
                <h2 className="font-sans text-3xl sm:text-4xl font-bold uppercase leading-tight text-gray-900 drop-shadow-[0_4px_24px_rgba(139,92,246,0.12)]">
                  We are here <span className="text-purple-600 italic transform skew-x-3 inline-block">for you.</span>
                </h2>
                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-4 leading-relaxed max-w-sm mx-auto lg:mx-0 font-sans">
                  Have questions about our products, order updates, or sizing details? Get in touch with our customer care helpline anytime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
                <Link
                  to="/shop"
                  className="hud-submit-action justify-center"
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
