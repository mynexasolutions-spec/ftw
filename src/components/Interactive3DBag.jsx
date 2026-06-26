import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'

/* ─────────────────────────────────────────────
   FTW Logo – identical to Navbar / Footer logo
   ───────────────────────────────────────────── */
function FTWLogo({ small = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: small ? 3 : 5 }}>
      <img
        src="/images/ftw-logo.webp"
        alt="FTW Logo"
        style={{
          height: small ? '28px' : '40px',
          width: 'auto',
          objectFit: 'contain'
        }}
      />
      <span style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 900,
        fontSize: small ? '8px' : '11px',
        letterSpacing: '0.18em',
        color: '#161616',
        lineHeight: 1,
        textTransform: 'uppercase',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '3px'
      }}>
        <span>FOR THE</span>
        <span style={{ color: '#F97316', fontStyle: 'italic', transform: 'skewX(-6deg)', display: 'inline-block' }}>WIN</span>
      </span>
    </div>
  )
}

export default function Interactive3DBag({ hideHint = false }) {
  const { setCartOpen } = useCart()
  const [rotationY, setRotationY] = useState(-20)
  const [isDragging, setIsDragging] = useState(false)

  const rotationYRef    = useRef(-20)
  const velocityRef     = useRef(0)
  const isDraggingRef   = useRef(false)
  const lastMouseXRef   = useRef(0)
  const lastTimeRef     = useRef(0)

  const startXRef       = useRef(0)
  const startYRef       = useRef(0)
  const dragDistRef     = useRef(0)

  useEffect(() => {
    let rafId

    const tick = () => {
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.05) {
          rotationYRef.current = (rotationYRef.current + velocityRef.current) % 360
          velocityRef.current *= 0.93
        } else {
          rotationYRef.current = (rotationYRef.current + 0.4) % 360
        }
        setRotationY(rotationYRef.current)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const handleStart = (clientX, clientY) => {
    isDraggingRef.current = true
    setIsDragging(true)
    lastMouseXRef.current = clientX
    startXRef.current     = clientX
    startYRef.current     = clientY
    lastTimeRef.current   = performance.now()
    velocityRef.current   = 0
    dragDistRef.current   = 0
  }

  const handleMove = (clientX) => {
    if (!isDraggingRef.current) return
    const now    = performance.now()
    const dt     = Math.max(1, now - lastTimeRef.current)
    const deltaX = clientX - lastMouseXRef.current
    velocityRef.current   = (deltaX / dt) * 16
    rotationYRef.current  = (rotationYRef.current + deltaX * 0.55) % 360
    setRotationY(rotationYRef.current)
    lastMouseXRef.current = clientX
    lastTimeRef.current   = now
    dragDistRef.current   += Math.abs(deltaX)
  }

  const handleEnd = () => {
    isDraggingRef.current = false
    setIsDragging(false)
  }

  const handleClick = () => {
    // Open cart only if the mouse barely moved (it's a tap/click, not a drag)
    if (dragDistRef.current < 8) {
      setCartOpen(true)
    }
    dragDistRef.current = 0
  }

  /* ─── Bag geometry ────────────────────────────── */
  // Box: W=140  H=170  D=50
  // Handle aperture centred at top

  const FRONT_FACE_STYLE = {
    // Warm off-white with very subtle warm tint
    background: 'linear-gradient(160deg,#FAFAF8 0%,#F4F3EE 55%,#ECEAE2 100%)',
    border: '1px solid #D8D5CC',
  }

  const SIDE_FACE_STYLE = {
    background: 'linear-gradient(90deg,#E8E5DC 0%,#C8C4B8 45%,#D4D1C8 100%)',
    border: '1px solid #C4C1B8',
  }

  const BOTTOM_FACE_STYLE = {
    background: 'linear-gradient(180deg,#C8C5BC 0%,#ABAAA2 100%)',
  }

  // Handle path (the U-loop shape drawn with SVG ropes)
  const handlePath = "M 42 28 C 42 10 98 10 98 28"

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', userSelect:'none', fontFamily:'monospace' }}>

      {/* Inject pulse keyframes once */}
      <style>{`
        @keyframes ftwPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.6; transform:scale(1.3); }
        }
      `}</style>


      {/* Spacer so the handle rope arc has room above the viewport */}
      <div style={{ height: 28 }} />

      {/* Perspective viewport */}
      <div
        style={{ perspective: '900px', width: 210, height: 300, cursor: isDragging ? 'grabbing' : 'pointer', position: 'relative', overflow: 'visible' }}
        onClick={handleClick}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={() => handleEnd()}
        onMouseLeave={() => handleEnd()}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => {
          if (isDraggingRef.current) {
            e.preventDefault()
            handleMove(e.touches[0].clientX)
          }
        }}
        onTouchEnd={() => { handleEnd(); handleClick() }}
      >

        {/* Drop shadow ellipse */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%) rotateX(85deg)',
          width: 110,
          height: 16,
          borderRadius: '50%',
          background: 'rgba(22,22,22,0.18)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }} />

        {/* 3D Bag box */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            marginLeft: -70,
            width: 140,
            height: 170,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotationY}deg) rotateX(-8deg)`,
            transition: isDragging ? 'none' : 'transform 0.04s linear',
          }}
        >
          {/* ════ FRONT FACE ════ */}
          <BagFace
            style={{
              ...FRONT_FACE_STYLE,
              transform: 'translateZ(25px)',
            }}
            handlePath={handlePath}
            showLogo
            logoLabel="front"
          />

          {/* ════ BACK FACE ════ */}
          <BagFace
            style={{
              ...FRONT_FACE_STYLE,
              background: 'linear-gradient(160deg,#F4F3EE 0%,#ECEAE2 55%,#E4E2D8 100%)',
              transform: 'translateZ(-25px) rotateY(180deg)',
            }}
            handlePath={handlePath}
            showLogo
            logoLabel="back"
          />

          {/* ════ LEFT SIDE ════ */}
          <div style={{
            position: 'absolute',
            top: 0, bottom: 0,
            width: 50,
            left: '50%',
            marginLeft: -25,
            ...SIDE_FACE_STYLE,
            transform: 'rotateY(-90deg) translateZ(70px)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
          }}>
            {/* V-fold crease */}
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
              {/* centre crease line */}
              <line x1="25" y1="0" x2="25" y2="170" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
              {/* bottom gusset triangle */}
              <line x1="0"  y1="148" x2="25" y2="170" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              <line x1="50" y1="148" x2="25" y2="170" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              {/* ambient shading band */}
              <rect x="18" y="0" width="14" height="170" fill="rgba(0,0,0,0.05)" />
            </svg>
          </div>

          {/* ════ RIGHT SIDE ════ */}
          <div style={{
            position: 'absolute',
            top: 0, bottom: 0,
            width: 50,
            left: '50%',
            marginLeft: -25,
            background: 'linear-gradient(90deg,#D8D5CC 0%,#E4E2DA 45%,#CCCAB8 100%)',
            border: '1px solid #C4C1B8',
            transform: 'rotateY(90deg) translateZ(70px)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
          }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
              <line x1="25" y1="0" x2="25" y2="170" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
              <line x1="0"  y1="148" x2="25" y2="170" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              <line x1="50" y1="148" x2="25" y2="170" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              <rect x="18" y="0" width="14" height="170" fill="rgba(0,0,0,0.04)" />
            </svg>
          </div>

          {/* ════ BOTTOM FACE ════ */}
          <div style={{
            position: 'absolute',
            width: 140,
            height: 50,
            bottom: -25,
            left: 0,
            ...BOTTOM_FACE_STYLE,
            transform: 'rotateX(90deg) translateZ(0)',
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
          }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
              {/* bottom gusset fold lines */}
              <line x1="0"   y1="0"  x2="70"  y2="25" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              <line x1="140" y1="0"  x2="70"  y2="25" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              <line x1="70"  y1="0"  x2="70"  y2="25" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
            </svg>
          </div>

          {/* ════ TOP FACE (visible when tilted) ════ */}
          <div style={{
            position: 'absolute',
            width: 140,
            height: 50,
            top: -25,
            left: 0,
            background: 'linear-gradient(180deg,#E8E6DE 0%,#D8D6CE 100%)',
            border: '1px solid #CCCAB8',
            transform: 'rotateX(90deg)',
            backfaceVisibility: 'hidden',
          }}>
            {/* Handle rope exits */}
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
              {/* left rope hole */}
              <ellipse cx="44" cy="25" rx="6" ry="6" fill="rgba(0,0,0,0.12)" />
              <ellipse cx="44" cy="25" rx="4" ry="4" fill="rgba(0,0,0,0.22)" />
              {/* right rope hole */}
              <ellipse cx="96" cy="25" rx="6" ry="6" fill="rgba(0,0,0,0.12)" />
              <ellipse cx="96" cy="25" rx="4" ry="4" fill="rgba(0,0,0,0.22)" />
            </svg>
          </div>

          {/* ════ INTERIOR BACK (dark inside) ════ */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg,#B8B5AC 0%,#A0A09A 100%)',
            transform: 'translateZ(24px) rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }} />

          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg,#B8B5AC 0%,#A0A09A 100%)',
            transform: 'translateZ(-24px)',
            backfaceVisibility: 'hidden',
          }} />

          {/* ════ HANDLE FRONT (rendered inside the box in 3D space) ════ */}
          <div style={{
            position: 'absolute',
            top: -40,
            left: 0,
            width: 140,
            height: 50,
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
            transform: 'translateZ(25px)',
          }}>
            <svg viewBox="0 0 140 50" style={{ width:'100%', height:'100%', overflow:'visible' }}>
              <defs>
                <linearGradient id="ropeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#8B7355" />
                  <stop offset="50%"  stopColor="#6B5535" />
                  <stop offset="100%" stopColor="#8B7355" />
                </linearGradient>
              </defs>
              <path
                d="M 44 48 C 44 20 96 20 96 48"
                fill="none"
                stroke="url(#ropeGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 44 48 C 44 20 96 20 96 48"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="3 4"
              />
              <circle cx="44" cy="48" r="5" fill="#9A8060" stroke="#6B5535" strokeWidth="1.5" />
              <circle cx="96" cy="48" r="5" fill="#9A8060" stroke="#6B5535" strokeWidth="1.5" />
              <circle cx="44" cy="48" r="2.5" fill="#5A4025" />
              <circle cx="96" cy="48" r="2.5" fill="#5A4025" />
            </svg>
          </div>

          {/* ════ HANDLE BACK (rendered inside the box in 3D space) ════ */}
          <div style={{
            position: 'absolute',
            top: -40,
            left: 0,
            width: 140,
            height: 50,
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
            transform: 'translateZ(-25px) rotateY(180deg)',
          }}>
            <svg viewBox="0 0 140 50" style={{ width:'100%', height:'100%', overflow:'visible' }}>
              <path
                d="M 44 48 C 44 20 96 20 96 48"
                fill="none"
                stroke="url(#ropeGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 44 48 C 44 20 96 20 96 48"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="3 4"
              />
              <circle cx="44" cy="48" r="5" fill="#9A8060" stroke="#6B5535" strokeWidth="1.5" />
              <circle cx="96" cy="48" r="5" fill="#9A8060" stroke="#6B5535" strokeWidth="1.5" />
              <circle cx="44" cy="48" r="2.5" fill="#5A4025" />
              <circle cx="96" cy="48" r="2.5" fill="#5A4025" />
            </svg>
          </div>
        </div>

      </div>

      {/* Hint label */}
      {!hideHint && (
        <span style={{
          fontSize: 8,
          fontWeight: 700,
          color: 'rgba(22,22,22,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginTop: 10,
          fontFamily: 'monospace',
        }}>
          drag · click to open cart
        </span>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   BagFace – one flat face of the shopping bag
   with SVG cutout handle + logo overlay
   ───────────────────────────────────────────── */
function BagFace({ style, showLogo, logoSmall }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backfaceVisibility: 'hidden',
      overflow: 'hidden',
      borderRadius: 1,
      ...style,
    }}>
      {/* Handle cutout via SVG evenodd */}
      <svg viewBox="0 0 140 170" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          {/* Subtle linen texture pattern */}
          <pattern id="linenpat" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="4" y2="4" stroke="rgba(0,0,0,0.025)" strokeWidth="0.5" />
            <line x1="4" y1="0" x2="0" y2="4" stroke="rgba(0,0,0,0.025)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Linen texture overlay */}
        <rect x="0" y="0" width="140" height="170" fill="url(#linenpat)" />

        {/* Handle-hole cutout shape */}
        <path
          d="M 0 0 L 140 0 L 140 170 L 0 170 Z
             M 44 30 C 44 12 96 12 96 30 C 96 36 92 38 88 36 C 84 34 84 26 70 26 C 56 26 56 34 52 36 C 48 38 44 36 44 30 Z"
          fill="rgba(0,0,0,0.04)"
          fillRule="evenodd"
        />

        {/* Top-edge reinforcement tape strip */}
        <rect x="0" y="0" width="140" height="10"
          fill="rgba(0,0,0,0.06)"
        />

        {/* Bottom gusset crease lines */}
        <line x1="0"   y1="148" x2="22"  y2="170" stroke="rgba(0,0,0,0.1)"  strokeWidth="1" />
        <line x1="140" y1="148" x2="118" y2="170" stroke="rgba(0,0,0,0.1)"  strokeWidth="1" />
        <line x1="0"   y1="148" x2="140" y2="148" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

        {/* Handle hole shadow / depth */}
        <path
          d="M 44 30 C 44 12 96 12 96 30 C 96 36 92 38 88 36 C 84 34 84 26 70 26 C 56 26 56 34 52 36 C 48 38 44 36 44 30 Z"
          fill="rgba(0,0,0,0.18)"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.5"
        />

        {/* Hole inner highlight */}
        <path
          d="M 46 29 C 46 14 94 14 94 29"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {/* ─── FTW Logo overlay ─── */}
      {showLogo && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 18,
          pointerEvents: 'none',
          gap: 10,
        }}>
          <FTWLogo small={logoSmall} />

          {/* Thin rule under logo */}
          <div style={{
            width: logoSmall ? 60 : 80,
            height: 1,
            background: 'rgba(22,22,22,0.15)',
          }} />

          {/* Sub-tagline */}
          <span style={{
            fontFamily: 'monospace',
            fontSize: logoSmall ? 6 : 7,
            fontWeight: 700,
            color: 'rgba(22,22,22,0.4)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}>
            Streetwear • Drop Series
          </span>
        </div>
      )}
    </div>
  )
}
