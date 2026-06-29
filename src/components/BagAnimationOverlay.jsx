import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { Sparkles, Check } from 'lucide-react'
import Interactive3DBag from './Interactive3DBag'

// Sparkle/Particle element generator
const generateParticles = () => {
  return Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    angle: (i * 360) / 16 + (Math.random() * 15 - 7.5),
    distance: 40 + Math.random() * 60,
    size: 4 + Math.random() * 6,
    color: i % 2 === 0 ? '#E2F952' : '#FFFFFF', // Neon yellow & White
  }))
}

const getColorHex = (colorName) => {
  if (!colorName) return '#0F0F0F'
  if (typeof colorName !== 'string') return '#0F0F0F'
  if (colorName.startsWith('#')) return colorName
  
  const hexMatch = colorName.match(/#([0-9a-fA-F]{3,6})/)
  if (hexMatch) return `#${hexMatch[1]}`
  
  const clean = colorName.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase()
  
  const COLOR_MAP = {
    'black': '#0F0F0F',
    'white': '#FFFFFF',
    'off-white': '#FAF9F6',
    'offwhite': '#FAF9F6',
    'cream': '#FDF6E2',
    'beige': '#FAD7A0',
    'sand': '#D2C4A8',
    'charcoal': '#3E3E3E',
    'grey': '#707070',
    'gray': '#707070',
    'acid wash gray': '#4A4A4A',
    'acid gray': '#4A4A4A',
    'navy': '#1A2536',
    'navy blue': '#1A2536',
    'olive': '#4D5844',
    'acid olive': '#595C43',
    'lime': '#CCFF00',
    'cyber blue': '#00E5FF',
    'blue': '#2196F3',
    'light blue': '#AED6F1',
    'acid purple': '#583F72',
    'purple': '#8E44AD',
    'violet': '#8E44AD',
    'dusty rose': '#DCAE96',
    'rose': '#E8A5A5',
    'pink': '#FFC0CB',
    'baby pink': '#FFC0CB',
    'lavender': '#D2B4DE',
    'pastel lavender': '#D8B4F8',
    'sage green': '#9CAF88',
    'sage': '#9CAF88',
    'green': '#2ECC71',
    'peach': '#FFDAB9',
    'red': '#E74C3C',
    'maroon': '#800000',
    'burgundy': '#800020',
    'plum': '#F1948A',
    'pista': '#A9DFBF',
    'yellow': '#F1C40F',
    'orange': '#E67E22',
    'brown': '#8B4513',
    'terracotta': '#E2725B',
    'rust': '#B7410E',
    'teal': '#008080',
    'mint': '#98FF98',
    'gold': '#D4AF37',
    'silver': '#C0C0C0'
  }

  if (COLOR_MAP[clean]) return COLOR_MAP[clean]

  for (const key in COLOR_MAP) {
    if (clean.includes(key)) return COLOR_MAP[key]
  }

  return '#0F0F0F'
}

export default function BagAnimationOverlay() {
  const { animatingProduct, setAnimatingProduct, setCartOpen } = useCart()
  const [stage, setStage] = useState('idle') // 'idle', 'flying', 'bagBounce', 'completed'
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (animatingProduct) {
      setStage('flying')
      setParticles([])
      
      // Stage 2: Hit the bag (0.6s fly time)
      const hitTimer = setTimeout(() => {
        setStage('bagBounce')
        setParticles(generateParticles())
      }, 600)

      // Stage 3: Completed (0.9s)
      const completeTimer = setTimeout(() => {
        setStage('completed')
      }, 950)

      // Auto dismiss after 3.5s
      const dismissTimer = setTimeout(() => {
        setAnimatingProduct(null)
        setStage('idle')
        setCartOpen(true)
      }, 2700)

      return () => {
        clearTimeout(hitTimer)
        clearTimeout(completeTimer)
        clearTimeout(dismissTimer)
      }
    }
  }, [animatingProduct, setAnimatingProduct])

  if (!animatingProduct) return null

  // Resolve the image path (support direct product image or secondary image arrays)
  const productImage = animatingProduct.image || 
    (animatingProduct.images && animatingProduct.images[0]) || 
    '/images/1.1.jpeg'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        {/* Darkened blur backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark/60 backdrop-blur-md"
        />

        {/* Central Toast Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative bg-white/95 border border-cream3 text-dark w-full max-w-sm p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center overflow-hidden select-none font-sans"
        >
          {/* Subtle gradient light indicator from top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

          {/* Animated Product Image Flying down */}
          <AnimatePresence>
            {stage === 'flying' && (
              <motion.div
                initial={{ y: -180, scale: 1.1, opacity: 0, rotate: -6 }}
                animate={{ 
                  y: -25, 
                  scale: 0.18, 
                  opacity: [0.3, 1, 1, 0], 
                  rotate: 15
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                className="absolute z-30 w-32 aspect-[3.4/5] rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-cream"
              >
                <img src={productImage} alt="Product" className="w-full h-full object-cover" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particle Blast */}
          {stage !== 'flying' && stage !== 'idle' && (
            <div className="absolute top-[135px] w-2 h-2 flex items-center justify-center pointer-events-none z-40">
              {particles.map((p) => {
                const rad = (p.angle * Math.PI) / 180
                const targetX = Math.cos(rad) * p.distance
                const targetY = Math.sin(rad) * p.distance - 40 // tilt upwards
                return (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{ 
                      x: targetX, 
                      y: targetY, 
                      scale: 0, 
                      opacity: 0,
                      rotate: p.angle * 2
                    }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color === '#FFFFFF' ? '#161616' : p.color, // Contrast on light bg
                      boxShadow: `0 0 8px ${p.color === '#FFFFFF' ? 'rgba(0,0,0,0.1)' : p.color}`
                    }}
                  />
                )
              })}
            </div>
          )}

          {/* Shopping Bag wrapper - Rendering footer bag component */}
          <div className="relative h-64 w-full flex items-center justify-center mb-4 overflow-visible -mt-6">
            <motion.div
              animate={stage === 'bagBounce' ? {
                scale: [0.72, 0.62, 0.85, 0.68, 0.75, 0.72],
                rotate: [0, -3, 3, -1, 1, 0]
              } : { scale: 0.72 }}
              transition={{ duration: 0.55 }}
              className="relative z-10 origin-center"
            >
              <Interactive3DBag hideHint={true} />
            </motion.div>

            {/* Glowing shadow under bag */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-4 bg-dark/5 blur-md rounded-full" />
          </div>

          {/* Confirmation Info Text */}
          <div className="text-center space-y-3 z-10 font-sans">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={stage !== 'flying' ? { opacity: 1, y: 0 } : {}}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark/5 border border-dark/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-dark"
            >
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Added To Bag</span>
            </motion.div>

            <motion.h3 
              initial={{ opacity: 0 }}
              animate={stage !== 'flying' ? { opacity: 1 } : {}}
              className="font-display text-lg font-black uppercase tracking-tight text-dark line-clamp-1 max-w-[260px]"
            >
              {animatingProduct.name}
            </motion.h3>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={stage !== 'flying' ? { opacity: 1 } : {}}
              className="flex flex-wrap justify-center items-center gap-2 text-[11px] font-mono text-dark/60"
            >
              <span className="bg-dark/5 px-2 py-0.5 rounded border border-dark/10 uppercase">
                Size: <strong className="text-dark">{animatingProduct.size}</strong>
              </span>
              <span>•</span>
              {animatingProduct.color && (
                <>
                  <span className="inline-flex items-center gap-1.5 bg-dark/5 px-2.5 py-0.5 rounded border border-dark/10 uppercase font-bold">
                    <span 
                      style={{ backgroundColor: getColorHex(animatingProduct.color) }} 
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs inline-block shrink-0" 
                    />
                    Color: <strong className="text-dark">{animatingProduct.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}</strong>
                  </span>
                  <span>•</span>
                </>
              )}
              <span>₹{animatingProduct.price}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
