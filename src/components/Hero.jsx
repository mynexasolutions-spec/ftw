import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, Gem, Gamepad2, Sparkles, ArrowRight, Shield, Truck } from 'lucide-react'

export default function Hero({ heroImages, heroBgBanner, heroBgBannerMobile, allProducts }) {
  const navigate = useNavigate()

  // Curtain / Phase Sequence Choreography
  const [phase, setPhase] = useState('0')
  const [isRevealed, setIsRevealed] = useState(false)
  const [showShopBtn, setShowShopBtn] = useState(false)

  const [offset, setOffset] = useState(0)
  const [direction, setDirection] = useState('next')
  const [isSliding, setIsSliding] = useState(false)
  const [prevOffset, setPrevOffset] = useState(0)

  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getScale = (isCenter) => {
    if (isCenter) {
      if (isMobile) return 0.9;
      if (isTablet) return 0.95;
      return 1.05;
    }
    return isMobile ? 0.8 : (isTablet ? 0.85 : 0.9);
  }

  const getProductForHeroImage = (item) => {
    if (!item) return null;
    let parsedItem = item;
    if (typeof item === 'string' && item.trim().startsWith('{')) {
      try { parsedItem = JSON.parse(item); } catch (e) { }
    }
    const assignedId = typeof parsedItem === 'object' ? parsedItem?.productId : null;

    if (assignedId && allProducts && allProducts.length > 0) {
      return allProducts.find(p => String(p.id).trim() === String(assignedId).trim()) || null;
    }
    return null;
  }

  const slideTo = (dir) => {
    if (isSliding || !Array.isArray(heroImages) || heroImages.length === 0) return
    setIsSliding(true)
    setDirection(dir)
    setPrevOffset(offset)

    const newOffset = dir === 'next'
      ? (offset + 1) % heroImages.length
      : (offset - 1 + heroImages.length) % heroImages.length

    setOffset(newOffset)

    setTimeout(() => {
      setIsSliding(false)
    }, 760)
  }

  // Touch Swipe Support
  const touchX = useRef(0)
  const handleTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 48) slideTo(dx < 0 ? 'next' : 'prev')
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') slideTo('prev')
      if (e.key === 'ArrowRight') slideTo('next')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [offset, isSliding, heroImages])

  // Sequence choreography
  useEffect(() => {
    const timers = []
    timers.push(setTimeout(() => setPhase('1'), 150))
    timers.push(setTimeout(() => setPhase('2'), 650))
    timers.push(setTimeout(() => setPhase('3'), 1150))
    timers.push(setTimeout(() => setPhase('4'), 1750))
    timers.push(setTimeout(() => setIsRevealed(true), 2250))
    timers.push(setTimeout(() => setPhase('5'), 3100))
    timers.push(setTimeout(() => setShowShopBtn(true), 3400))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Badges metadata matching the design
  const cardBadges = [
    { text: 'New Arrival', icon: <Sparkles className="w-3 h-3 text-white" />, bgColor: 'bg-indigo-600' },
    { text: 'Best Seller', icon: <Trophy className="w-3 h-3 text-white" />, bgColor: 'bg-blue-600' },
    { text: 'Featured', icon: <Zap className="w-3 h-3 text-white" />, bgColor: 'bg-purple-600' },
    { text: 'Limited Drop', icon: <Gem className="w-3 h-3 text-white" />, bgColor: 'bg-cyan-600' },
    { text: 'Gamer Edition', icon: <Gamepad2 className="w-3 h-3 text-white" />, bgColor: 'bg-violet-600' }
  ]

  return (
    <div className={`stage phase-${phase} ${isRevealed ? 'stage-reveal' : ''}`} id="stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --ink: #0a0a0a;
          --paper: #fbfaf8;
          --gold: #c9a96a;
          --grey-line: rgba(255,255,255,0.14);
          --grey-line-dark: rgba(10,10,10,0.12);
          --ease: cubic-bezier(.22,1,.36,1);
        }

        .stage {
          width: 100vw;
          height: 62vh;
          min-height: 480px;
          overflow: hidden;
          position: relative;
          background: #f5f2e9;
        }

        @media (min-width: 768px) {
          .stage {
            height: 80vh;
            min-height: 600px;
          }
        }
        @media (min-width: 1024px) {
          .stage {
            height: 100vh;
            min-height: 720px;
          }
        }

        .backdrop-hero {
          position: absolute; inset: 0;
          background-color: #F6F5F2;
          background-size: cover;
          background-position: center;
          z-index: 0;
          overflow: hidden;
          background-image: var(--bg-mobile);
        }
        @media (min-width: 768px) {
          .backdrop-hero {
            background-image: var(--bg-desktop);
          }
        }
        @media (min-width: 1024px) {
          .backdrop-hero {
            background-position: 85% center;
          }
        }
        .backdrop-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image: 
            radial-gradient(rgba(147, 51, 234, 0.05) 1.2px, transparent 1.2px);
          background-size: 24px 24px;
          background-position: center;
          opacity: 0.35;
          z-index: 2;
        }
        .backdrop-hero::after {
          content: '';
          position: absolute; inset: 0;
          background: transparent;
          z-index: 1;
        }

        .curtain-hero {
          display: none;
        }

        .hud-border-top {
          position: fixed;
          top: 66px; left: 0; right: 0;
          height: 20px;
          z-index: 30;
          overflow: visible;
          transform: translateY(-100px);
          opacity: 0;
          transition: transform 700ms cubic-bezier(.22,1,.36,1), opacity 700ms cubic-bezier(.22,1,.36,1);
        }
        .stage-reveal .hud-border-top {
          transform: translateY(0);
          opacity: 1;
        }
        .hud-border-top-bg {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          clip-path: polygon(0 0, 100% 0, 100% 10px, 85% 10px, 83% 20px, 17% 20px, 15% 10px, 0 10px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.06), 0 4px 12px rgba(139, 92, 246, 0.03);
          width: 100%;
          height: 100%;
        }
        .hud-border-top-line {
          position: absolute;
          inset: 0;
          background: rgba(139, 92, 246, 0.35); /* Softer purple border */
          clip-path: polygon(
            0 8.5px, 15% 8.5px, 17% 18.5px, 83% 18.5px, 85% 8.5px, 100% 8.5px,
            100% 10px, 85% 10px, 83% 20px, 17% 20px, 15% 10px, 0 10px
          );
          pointer-events: none;
          width: 100%;
          height: 100%;
        }
        @media (min-width: 768px) {
          .hud-border-top {
            top: 66px;
          }
        }

        .hud-border-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 24px;
          background: #FFFFFF;
          border-top: 2px solid #E8E5DC;
          z-index: 30;
          clip-path: polygon(0 14px, 15% 14px, 17% 4px, 42% 4px, 44% 0, 56% 0, 58% 4px, 83% 4px, 85% 14px, 100% 14px, 100% 24px, 0 24px);
        }

        /* Hero Text Styles matching the screenshot */
        .hero-title-container {
          position: absolute;
          top: clamp(86px, 11vh, 118px);
          left: 50%;
          transform: translateX(-50%) translateY(-20px);
          opacity: 0;
          transition: transform 800ms cubic-bezier(.22,1,.36,1) 150ms, opacity 800ms cubic-bezier(.22,1,.36,1) 150ms;
          text-align: center;
          z-index: 25;
          width: 95%;
          max-width: 800px;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stage-reveal .hero-title-container {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        .hero-title-top-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
        }

        .title-hud-line {
          display: none;
        }
        @media (min-width: 640px) {
          .title-hud-line {
            display: flex;
            align-items: center;
            flex: 1;
            height: 1px;
            background: rgba(168, 85, 247, 0.4);
            position: relative;
          }
          .title-hud-line::before {
            content: '';
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(168, 85, 247, 0.8);
            border-radius: 50%;
          }
          .title-hud-line-left::before { right: -2px; }
          .title-hud-line-right::before { left: -2px; }
          
          .hud-slashes {
            font-size: 8px;
            font-weight: 900;
            color: rgba(168, 85, 247, 0.7);
            position: absolute;
            background: #F6F5F2;
            padding: 0 6px;
            letter-spacing: 1px;
            font-style: italic;
          }
          .title-hud-line-left .hud-slashes { right: 20px; }
          .title-hud-line-right .hud-slashes { left: 20px; }
        }

        .hero-title-top {
          font-family: 'Orbitron', 'Space Grotesk', sans-serif;
          font-size: clamp(16px, 2vw, 28px);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-style: italic;
          background: linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          white-space: nowrap;
        }

        .hero-title-main {
          font-family: 'Orbitron', 'Outfit', sans-serif;
          font-size: clamp(30px, 4.5vw, 58px);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #1A1A1A;
          line-height: 0.95;
          margin-top: 4px;
          margin-bottom: 12px;
          font-style: italic;
          text-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .hero-title-bottom-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
        }

        .title-sub-line {
          display: none;
        }
        @media (min-width: 640px) {
          .title-sub-line {
            display: block;
            flex: 1;
            height: 1px;
            background: rgba(0, 0, 0, 0.08);
            position: relative;
          }
          .title-sub-line::before {
            content: '';
            position: absolute;
            top: -2px;
            width: 5px;
            height: 5px;
            background: rgba(0, 0, 0, 0.2);
            transform: rotate(45deg);
          }
          .title-sub-line-left::before { right: -2.5px; }
          .title-sub-line-right::before { left: -2.5px; }
        }

        .hero-title-sub {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: clamp(10px, 1.2vw, 13px);
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2D2D2D;
          font-family: 'Rajdhani', sans-serif;
          white-space: nowrap;
        }

        .deck-hero {
          position: absolute;
          left: 0; right: 0;
          top: clamp(200px, 28vh, 340px);
          bottom: clamp(100px, 12vh, 120px);
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(8px, 1.5vw, 24px);
          padding: 0 clamp(16px, 3.2vw, 64px);
        }

        .card-hero {
          position: relative;
          overflow: visible !important; /* Allow the glow drop-shadow to render outside boundaries */
          flex: 1 1 0;
          max-width: 320px;
          opacity: 0;
          transform: translateY(26px) scale(.94);
          transition:
            height 1.3s var(--ease),
            max-height 1.3s var(--ease),
            flex-basis 1s var(--ease),
            filter .6s var(--ease);
        }

        .card-hero-border {
          position: absolute;
          inset: 0;
          background: #E8E5DC; /* Default border color */
          clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
          transition: background-color .6s var(--ease);
          width: 100%;
          height: 100%;
        }

        .card-hero-inner {
          position: absolute;
          inset: 2.5px; /* Border line thickness */
          background: #000000;
          clip-path: polygon(13px 0, calc(100% - 13px) 0, 100% 13px, 100% calc(100% - 13px), calc(100% - 13px) 100%, 13px 100%, 0 calc(100% - 13px), 0 13px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: calc(100% - 5px);
          height: calc(100% - 5px);
        }

        .card-hero { height: 0; max-height: 0; }

        @keyframes borderGlow {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.35)) drop-shadow(0 0 2px rgba(139, 92, 246, 0.25));
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(139, 92, 246, 0.65)) drop-shadow(0 0 6px rgba(139, 92, 246, 0.45));
          }
        }

        /* active styling */
        .card-hero[data-pos="2"] {
          animation: borderGlow 2.5s infinite ease-in-out;
          z-index: 25;
        }
        .card-hero[data-pos="2"] .card-hero-border {
          background: #8B5CF6 !important;
        }

        /* phase transitions */
        .phase-1 .card-hero[data-pos="2"],
        .phase-2 .card-hero[data-pos="2"],
        .phase-3 .card-hero[data-pos="2"],
        .phase-4 .card-hero[data-pos="2"],
        .phase-5 .card-hero[data-pos="2"] {
          opacity: 1; transform: translateY(0) scale(1);
          height: clamp(170px, 26vh, 240px); max-height: 240px;
        }

        .phase-2 .card-hero[data-pos="1"],
        .phase-2 .card-hero[data-pos="3"],
        .phase-3 .card-hero[data-pos="1"],
        .phase-3 .card-hero[data-pos="3"],
        .phase-4 .card-hero[data-pos="1"],
        .phase-4 .card-hero[data-pos="3"],
        .phase-5 .card-hero[data-pos="1"],
        .phase-5 .card-hero[data-pos="3"] {
          opacity: 1; transform: scale(.98);
          height: clamp(150px, 22vh, 210px); max-height: 210px;
        }

        .phase-3 .card-hero[data-pos="0"],
        .phase-3 .card-hero[data-pos="4"],
        .phase-4 .card-hero[data-pos="0"],
        .phase-4 .card-hero[data-pos="4"],
        .phase-5 .card-hero[data-pos="0"],
        .phase-5 .card-hero[data-pos="4"] {
          opacity: 1; transform: scale(.95);
          height: clamp(130px, 18vh, 180px); max-height: 180px;
        }

        @media (min-width: 768px) {
          .phase-1 .card-hero[data-pos="2"],
          .phase-2 .card-hero[data-pos="2"],
          .phase-3 .card-hero[data-pos="2"],
          .phase-4 .card-hero[data-pos="2"],
          .phase-5 .card-hero[data-pos="2"] {
            height: clamp(240px, 35vh, 320px); max-height: 320px;
          }
          .phase-2 .card-hero[data-pos="1"],
          .phase-2 .card-hero[data-pos="3"],
          .phase-3 .card-hero[data-pos="1"],
          .phase-3 .card-hero[data-pos="3"],
          .phase-4 .card-hero[data-pos="1"],
          .phase-4 .card-hero[data-pos="3"],
          .phase-5 .card-hero[data-pos="1"],
          .phase-5 .card-hero[data-pos="3"] {
            height: clamp(210px, 30vh, 280px); max-height: 280px;
          }
          .phase-3 .card-hero[data-pos="0"],
          .phase-3 .card-hero[data-pos="4"],
          .phase-4 .card-hero[data-pos="0"],
          .phase-4 .card-hero[data-pos="4"],
          .phase-5 .card-hero[data-pos="0"],
          .phase-5 .card-hero[data-pos="4"] {
            height: clamp(180px, 25vh, 230px); max-height: 230px;
          }

          .phase-4 .card-hero[data-pos="2"],
          .phase-5 .card-hero[data-pos="2"] {
            height: clamp(300px, 45vh, 440px); max-height: 440px;
          }
          .phase-4 .card-hero[data-pos="1"],
          .phase-4 .card-hero[data-pos="3"],
          .phase-5 .card-hero[data-pos="1"],
          .phase-5 .card-hero[data-pos="3"] {
            height: clamp(260px, 38vh, 380px); max-height: 380px;
          }
          .phase-4 .card-hero[data-pos="0"],
          .phase-4 .card-hero[data-pos="4"],
          .phase-5 .card-hero[data-pos="0"],
          .phase-5 .card-hero[data-pos="4"] {
            height: clamp(220px, 32vh, 320px); max-height: 320px;
          }
        }

        @media (min-width: 1024px) {
          .phase-1 .card-hero[data-pos="2"],
          .phase-2 .card-hero[data-pos="2"],
          .phase-3 .card-hero[data-pos="2"],
          .phase-4 .card-hero[data-pos="2"],
          .phase-5 .card-hero[data-pos="2"] {
            height: clamp(320px, 45vh, 480px); max-height: 480px;
          }
          .phase-2 .card-hero[data-pos="1"],
          .phase-2 .card-hero[data-pos="3"],
          .phase-3 .card-hero[data-pos="1"],
          .phase-3 .card-hero[data-pos="3"],
          .phase-4 .card-hero[data-pos="1"],
          .phase-4 .card-hero[data-pos="3"],
          .phase-5 .card-hero[data-pos="1"],
          .phase-5 .card-hero[data-pos="3"] {
            height: clamp(280px, 40vh, 440px); max-height: 440px;
          }
          .phase-3 .card-hero[data-pos="0"],
          .phase-3 .card-hero[data-pos="4"],
          .phase-4 .card-hero[data-pos="0"],
          .phase-4 .card-hero[data-pos="4"],
          .phase-5 .card-hero[data-pos="0"],
          .phase-5 .card-hero[data-pos="4"] {
            height: clamp(230px, 32vh, 360px); max-height: 360px;
          }

          .phase-4 .card-hero[data-pos="2"],
          .phase-5 .card-hero[data-pos="2"] {
            height: clamp(420px, 58vh, 680px); max-height: 680px;
          }
          .phase-4 .card-hero[data-pos="1"],
          .phase-4 .card-hero[data-pos="3"],
          .phase-5 .card-hero[data-pos="1"],
          .phase-5 .card-hero[data-pos="3"] {
            height: clamp(350px, 48vh, 560px); max-height: 560px;
          }
          .phase-4 .card-hero[data-pos="0"],
          .phase-4 .card-hero[data-pos="4"],
          .phase-5 .card-hero[data-pos="0"],
          .phase-5 .card-hero[data-pos="4"] {
            height: clamp(300px, 40vh, 480px); max-height: 480px;
          }
        }

        .nav-arrow-hero {
          position: absolute;
          top: 50%;
          z-index: 40;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid #8B5CF6;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #8B5CF6;
          opacity: 0; pointer-events: none;
          transition: opacity .45s var(--ease), background .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .nav-arrow-hero svg { width: 12px; height: 12px; }
        .nav-arrow-prev-hero { left: 4px; transform: translateY(-50%); }
        .nav-arrow-next-hero { right: 4px; transform: translateY(-50%); }
        .nav-arrow-prev-hero:hover { background: #ffffff; transform: translateY(-50%) scale(1.06); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); }
        .nav-arrow-next-hero:hover { background: #ffffff; transform: translateY(-50%) scale(1.06); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); }

        .shop-btn-wrapper {
          position: absolute;
          bottom: 28px; left: 50%; transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 90%;
          max-width: 540px;
          z-index: 25;
          opacity: 0;
          transition: opacity .6s var(--ease), filter 0.3s ease;
          animation: buttonGlow 3s infinite ease-in-out;
        }
        .shop-btn-wrapper:hover {
          filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.85)) !important;
          animation-play-state: paused;
        }

        @keyframes buttonGlow {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.45));
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(139, 92, 246, 0.75));
          }
        }

        .shop-btn-hero {
          background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
          color: #FFFFFF;
          border: none;
          padding: 8px 24px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .15em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: 'Space Grotesk', 'Rajdhani', sans-serif;
          white-space: nowrap;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
          position: relative;
          transition: transform .2s ease;
        }
        .shop-btn-hero:hover { 
          transform: scale(1.03); 
        }

        .hud-line {
          display: none;
        }

        @media (min-width: 640px) {
          .hud-line {
            display: block;
            flex: 1;
            height: 1.5px;
            background: rgba(124, 58, 237, 0.6);
            position: relative;
          }
          .hud-line::before {
            content: '';
            position: absolute;
            top: -3.5px;
            width: 8px;
            height: 8px;
            border: 1.5px solid rgba(124, 58, 237, 0.8);
            border-radius: 50%;
            background: #ffffff;
          }
          .hud-line-left::before { right: -4px; }
          .hud-line-right::before { left: -4px; }
          
          .hud-line-left::after {
            content: '••••';
            font-size: 11px;
            font-weight: bold;
            color: rgba(124, 58, 237, 0.7);
            position: absolute;
            left: 0;
            top: -10px;
            letter-spacing: 2px;
          }
          .hud-line-right::after {
            content: '••••';
            font-size: 11px;
            font-weight: bold;
            color: rgba(124, 58, 237, 0.7);
            position: absolute;
            right: 0;
            top: -10px;
            letter-spacing: 2px;
          }
        }

        @media (min-width: 768px) {
          .nav-arrow-hero {
            width: 36px;
            height: 36px;
            top: 50%;
          }
          .nav-arrow-hero svg { width: 16px; height: 16px; }
          .nav-arrow-prev-hero { left: 40px; }
          .nav-arrow-next-hero { right: 40px; }
          .shop-btn-wrapper {
            bottom: 36px;
            gap: 20px;
            max-width: 720px;
          }
          .shop-btn-hero {
            padding: 12px 40px;
            font-size: clamp(12px, 1vw, 14px);
          }
        }
        


        .phase-4 .nav-arrow-hero,
        .phase-5 .nav-arrow-hero { opacity: 1; pointer-events: auto; }
      ` }} />

      <div className="backdrop-hero" style={{
        '--bg-desktop': heroBgBanner ? `url(${heroBgBanner})` : 'none',
        '--bg-mobile': heroBgBannerMobile ? `url(${heroBgBannerMobile})` : (heroBgBanner ? `url(${heroBgBanner})` : 'none')
      }}></div>
      <div className="curtain-hero"></div>

      {/* Top HUD Frame line */}
      <div className="hud-border-top">
        <div className="hud-border-top-bg"></div>
        <div className="hud-border-top-line"></div>
      </div>

      {/* Hero Title Section */}
      <div className="hero-title-container">
        {/* Top row with slashes */}
        <div className="hero-title-top-row">
          <div className="title-hud-line title-hud-line-left">
            <span className="hud-slashes">////</span>
          </div>
          <span className="hero-title-top">LEVEL UP</span>
          <div className="title-hud-line title-hud-line-right">
            <span className="hud-slashes">////</span>
          </div>
        </div>

        {/* Main large title */}
        <h1 className="hero-title-main">YOUR STYLE</h1>

        {/* Sub line with controllers and lines */}
        <div className="hero-title-bottom-row">
          <div className="title-sub-line title-sub-line-left"></div>
          <div className="hero-title-sub">
            <Gamepad2 className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>GAME ON. WEAR IT.</span>
            <Gamepad2 className="w-4 h-4 text-purple-600 animate-pulse" />
          </div>
          <div className="title-sub-line title-sub-line-right"></div>
        </div>
      </div>

      <div className="deck-hero" id="deck">
        <button className="nav-arrow-hero nav-arrow-prev-hero" id="prevBtn" aria-label="Previous" onClick={() => slideTo('prev')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button className="nav-arrow-hero nav-arrow-next-hero" id="nextBtn" aria-label="Next" onClick={() => slideTo('next')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>

        {[0, 1, 2, 3, 4].map((i) => {
          const currentImg = Array.isArray(heroImages) && heroImages.length > 0 ? heroImages[(i + offset) % heroImages.length] : heroImages
          let parsedImg = currentImg
          if (typeof currentImg === 'string' && currentImg.trim().startsWith('{')) {
            try { parsedImg = JSON.parse(currentImg); } catch (e) { }
          }
          const targetProduct = getProductForHeroImage(currentImg)
          const targetUrl = targetProduct ? `/product/${targetProduct.id}` : null

          // Helper to clean color names
          const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';

          // Resolve product colors array safely
          const colorsArr = Array.isArray(targetProduct?.colors)
            ? targetProduct.colors
            : (typeof targetProduct?.colors === 'string'
              ? targetProduct.colors.split(',').map(c => c.trim())
              : []);

          // Resolve default color
          const defaultColorName = targetProduct?.default_color
            ? cleanColor(targetProduct.default_color)
            : (colorsArr.length > 0 ? cleanColor(colorsArr[0]) : '');

          // Resolve variants safely (parse if stringified JSON)
          let resolvedVariants = targetProduct?.variants || [];
          if (typeof resolvedVariants === 'string') {
            try {
              resolvedVariants = JSON.parse(resolvedVariants);
            } catch (e) {
              resolvedVariants = [];
            }
          }

          // Find the first variant matching default color that has images
          const defaultVariant = (targetProduct && Array.isArray(resolvedVariants))
            ? resolvedVariants.find(v => cleanColor(v.color) === defaultColorName && Array.isArray(v.images) && v.images.length > 0)
            : null;

          const customizerImageUrl = typeof parsedImg === 'string' ? parsedImg : (parsedImg?.url || '');
          const firstSelectedImage = customizerImageUrl
            ? customizerImageUrl
            : (defaultVariant
              ? defaultVariant.images[0]
              : (targetProduct?.image
                ? targetProduct.image
                : ((targetProduct && Array.isArray(targetProduct.images) && targetProduct.images.length > 0)
                  ? targetProduct.images[0]
                  : '')));

          const imgSrc = firstSelectedImage
          const badge = cardBadges[i % cardBadges.length]

          return (
            <div
              key={i}
              className={`card-hero ${i === 0 || i === 4 ? 'hidden md:block' : ''} ${targetUrl ? 'cursor-pointer group/heroCard' : 'cursor-default'}`}
              data-pos={i}
              onClick={() => targetUrl && navigate(targetUrl)}
              title={targetProduct ? `View ${targetProduct.name}` : undefined}
            >
              <div className="card-hero-border">
                <div className="card-hero-inner">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                      key={`${imgSrc}-${i}`}
                      src={imgSrc}
                      custom={direction}
                      variants={{
                        enter: (dir) => ({
                          x: dir === 'next' ? '100%' : '-100%',
                          scale: getScale(i === 2),
                        }),
                        center: {
                          x: 0,
                          scale: getScale(i === 2),
                        },
                        exit: (dir) => ({
                          x: dir === 'next' ? '-100%' : '100%',
                          scale: getScale(i === 2),
                        }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: 'tween', duration: 0.68, ease: [0.4, 0, 0.2, 1] }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center',
                        backgroundColor: '#000000',
                      }}
                    />
                  </AnimatePresence>

                  {/* Dynamic Gaming Badge on Card: Responsive white pill with purple icon container */}
                  <div className="absolute bottom-2 left-2 sm:bottom-3.5 sm:left-3.5 bg-white text-dark py-1 pl-1 pr-2.5 sm:py-1.5 sm:pl-1.5 sm:pr-3 rounded-xl sm:rounded-2xl text-[7.5px] sm:text-[9px] font-sans font-black flex items-center gap-1 sm:gap-1.5 shadow-md z-10 opacity-95 transition-transform group-heroCard:scale-105">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-purple-600 flex items-center justify-center text-white shrink-0">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white text-white" />
                    </div>
                    <span className="tracking-wider text-[#161616] uppercase font-extrabold">{targetProduct?.tag || badge.text}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="shop-btn-wrapper"
        id="shopBtn"
        style={{
          opacity: showShopBtn ? 1 : 0,
          pointerEvents: showShopBtn ? 'auto' : 'none'
        }}
      >
        <div className="hud-line hud-line-left"></div>
        <Link
          to="/shop"
          className="shop-btn-hero"
        >
          <span>Shop Collection</span>
          <span className="ml-2 font-bold">&gt;</span>
        </Link>
        <div className="hud-line hud-line-right"></div>
      </div>



      {/* Bottom HUD Frame line */}
      <div className="hud-border-bottom"></div>
    </div>
  )
}
