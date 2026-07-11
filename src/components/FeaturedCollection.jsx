import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Star, Flame, Sparkles, Gamepad2, Zap } from 'lucide-react'

export default function FeaturedCollection({
  featuredProducts,
  activeFeaturedImageIndexes,
  toggleWishlist,
  isInWishlist,
  getProductRating,
  addToCart,
  toast
}) {
  const navigate = useNavigate()
  const [selectingSizeForFeatured, setSelectingSizeForFeatured] = useState(null)

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto px-6 py-14 sm:py-24 border-b border-neutral-200/60 z-10 relative"
    >
      {/* Style block for gaming HUD featured cards */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hud-featured-title {
          text-align: center;
          margin-bottom: 3.5rem;
          position: relative;
        }
        .hud-featured-title .catalog-series {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.25em;
          color: #8B5CF6;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(139, 92, 246, 0.08);
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px dashed rgba(139, 92, 246, 0.3);
        }
        .hud-featured-title h2 {
          font-family: 'Orbitron', 'Space Grotesk', sans-serif;
          font-size: clamp(34px, 5.5vw, 64px);
          font-weight: 1000;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1.1;
          margin-top: 10px;
          font-style: italic;
        }
        .hud-featured-title h2 span {
          background: linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hud-featured-title .hud-tagline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #64748B;
          text-transform: uppercase;
          margin-top: 8px;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* HUD Card styling */
        .hud-card {
          background: #FFFFFF;
          background-image: 
            radial-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px),
            linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%);
          background-size: 16px 16px, 100% 100%;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          padding: 12px;
          /* cut all 4 outer corners of the card precisely */
          clip-path: polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px);
        }
        /* Double-layered border effect specifically for the clipped shape */
        .hud-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          background: #E2E8F0; /* Border color */
          padding: 1.5px; /* Border width */
          clip-path: polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px);
          transition: background 0.3s ease;
        }
        /* HUD Tech styling element - corner brackets */
        .hud-card::after {
          content: '][';
          font-family: monospace;
          font-size: 10px;
          color: rgba(124, 58, 237, 0.0);
          position: absolute;
          top: 14px;
          right: 50px;
          font-weight: 900;
          transition: color 0.3s ease;
          pointer-events: none;
          letter-spacing: 4px;
        }
        .hud-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.06), 
            0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .hud-card:hover::after {
          color: rgba(0, 0, 0, 0.15);
        }
        .hud-card:hover .hud-add-btn {
          background: #8B5CF6;
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.25);
        }
        .hud-card:hover .hud-add-btn:hover {
          background: #7C3AED;
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
        }

        /* Custom Chamfered Bezel Header for Cards */
        .hud-card-image-wrap {
          position: relative;
          background: #F8FAFC;
          aspect-ratio: 1 / 1.05;
          /* cut all 4 corners precisely matching reference image style */
          clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
        }
        .hud-card-image-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: transparent;
          border: 1px solid #E2E8F0;
          clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
        }
        .hud-card-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #0F172A;
          color: #FFFFFF;
          padding: 6px 14px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          /* cut all 4 corners like the button layout */
          clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px);
        }
        .hud-card-badge.sale {
          background: #000000;
          color: #FFFFFF;
          border: 1px solid rgba(132, 204, 22, 0.35);
        }
        .hud-card-badge.trending {
          background: #000000;
          color: #FFFFFF;
          border: 1px solid rgba(139, 92, 246, 0.35);
        }
        .hud-card-badge.limited {
          background: #000000;
          color: #FFFFFF;
          border: 1px solid rgba(236, 72, 153, 0.35);
        }
        .hud-card-fav {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.2s ease;
        }
        .hud-card-fav:hover {
          transform: scale(1.1);
          background: #F8FAFC;
        }
        .hud-card-rating {
          position: absolute;
          bottom: 12px;
          left: 12px;
          z-index: 10;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 4px 10px;
          border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          color: #1E293B;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        .hud-card-status {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: #8B5CF6;
          text-transform: uppercase;
          margin-top: 12px;
          margin-bottom: 4px;
        }
        .hud-card-status.sale {
          color: #84CC16;
        }
        .hud-card-title {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: clamp(14px, 1.65vw, 18px);
          font-weight: 800;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          line-height: 1.3;
          min-height: 54px;
        }
        .hud-card-price-pill {
          background: #7C3AED;
          color: #FFFFFF;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 900;
          font-size: 14px;
          padding: 4px 12px;
          border-radius: 6px;
        }
        .hud-card-price-pill.green {
          background: #D9F99D;
          color: #3F6212;
        }
        .hud-card-price-pill.purple {
          background: #F3E8FF;
          color: #6B21A8;
        }

        /* Color selection dots */
        .hud-color-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
        }
        .hud-color-dot.active::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid #7C3AED;
          border-radius: 50%;
        }

        /* Add to bag button with matching chamfered sides precisely */
        .hud-add-btn {
          width: 100%;
          height: 42px;
          background: #8B5CF6;
          color: #FFFFFF;
          border: none;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
        }
        .hud-add-btn:hover {
          background: #7C3AED;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
        }
        .hud-add-btn svg {
          width: 15px;
          height: 15px;
          color: #FAF9F6;
        }

        /* Mobile specific adjustments for 2-column layout */
        @media (max-width: 640px) {
          .hud-card {
            padding: 8px !important;
            clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px) !important;
          }
          .hud-card::before {
            clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px) !important;
          }
          .hud-card-image-wrap {
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px) !important;
          }
          .hud-card-image-wrap::before {
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px) !important;
          }
          .hud-card-title {
            font-size: 11.5px !important;
            letter-spacing: 0.01em !important;
            line-height: 1.2 !important;
            min-height: 38px !important;
          }
          .hud-card-price-pill {
            font-size: 11px !important;
            padding: 2px 6px !important;
          }
          .hud-add-btn {
            font-size: 9px !important;
            height: 35px !important;
            letter-spacing: 0.05em !important;
          }
          .hud-card-badge {
            padding: 3px 6px !important;
            font-size: 8px !important;
            top: 6px !important;
            left: 6px !important;
          }
          .hud-card-fav {
            width: 26px !important;
            height: 26px !important;
            top: 6px !important;
            right: 6px !important;
          }
          .hud-card-rating {
            padding: 2px 6px !important;
            font-size: 9px !important;
            bottom: 6px !important;
            left: 6px !important;
          }
          .hud-color-dot {
            width: 12px !important;
            height: 12px !important;
          }
        }
      ` }} />

      {/* Custom Header Section */}
      <div className="hud-featured-title">
        <div>
          <span className="catalog-series">
            <Sparkles className="w-3.5 h-3.5" /> Catalog Series 01
          </span>
        </div>
        <h2>Featured <span>Collection</span></h2>
        <div className="hud-tagline">
          <Gamepad2 className="w-4 h-4 text-slate-500" />
          Gear Up. Level Up.
          <Gamepad2 className="w-4 h-4 text-slate-500" />
        </div>
      </div>
      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
        {featuredProducts.map((product, pi) => {
          const prodSizes = Array.isArray(product.sizes)
            ? product.sizes
            : (product.sizes ? String(product.sizes).split(',').map(s => s.trim()) : [])
          const prodColors = Array.isArray(product.colors)
            ? product.colors
            : (product.colors ? String(product.colors).split(',').map(c => c.trim()) : [])
          const colorMap = { Black: '#000000', White: '#FFFFFF', Charcoal: '#3F3F46', Lime: '#84CC16', Beige: '#D97706', Cream: '#FAF5FF', Blue: '#3B82F6', Purple: '#8B5CF6' }
          const prodImage = product.imageFront || product.image || '/images/Regular-T.png'

          const badgeType = pi === 0 ? 'limited' : pi === 1 ? 'sale' : 'trending'
          const badgeText = pi === 0 ? 'Limited' : pi === 1 ? 'On Sale' : 'Trending'
          const statusText = pi === 0 ? 'Coming Soon' : pi === 1 ? 'Sale' : 'New Arrivals'

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: pi * 0.08 }}
              className="hud-card"
            >
              {/* Image and badges wrapper */}
              <div className="hud-card-image-wrap">
                <Link to={`/product/${product.id}`} className="w-full h-full block">
                  <img
                    src={prodImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    style={{
                      opacity: activeFeaturedImageIndexes[product.id] === 1 ? 0 : 1
                    }}
                    onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                  />
                  {product.imageBack && (
                    <img
                      src={product.imageBack}
                      alt={`${product.name} Back`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      style={{
                        opacity: activeFeaturedImageIndexes[product.id] === 1 ? 1 : 0
                      }}
                      onError={(e) => { e.target.src = '/images/Regular-T.png' }}
                    />
                  )}
                </Link>

                {/* Left Badge */}
                <div className={`hud-card-badge ${badgeType}`}>
                  {pi === 0 ? <Sparkles className="w-3 h-3 text-[#EC4899] fill-[#EC4899]" /> : pi === 1 ? <Zap className="w-3 h-3 text-[#84CC16] fill-[#84CC16]" /> : <Flame className="w-3 h-3 text-[#8B5CF6] fill-[#8B5CF6]" />}
                  <span className="ml-1.5">{badgeText}</span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleWishlist({ ...product, image: prodImage })
                    toast.success(
                      isInWishlist(product.id) ? 'Removed from wishlist.' : 'Added to wishlist!',
                      { style: { background: '#161616', color: '#FAF9F6' } }
                    )
                  }}
                  className="hud-card-fav"
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                </button>

                {/* Rating Badge */}
                <div className="hud-card-rating">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{getProductRating(product.name) ? getProductRating(product.name).toFixed(1) : '0.0'}</span>
                </div>
              </div>

              {/* Info and action area */}
              <div className="px-1 py-3 flex flex-col justify-between">
                <div>
                  {/* Coming soon / Sale label */}
                  <div className={`hud-card-status ${badgeType}`}>
                    {statusText}
                  </div>

                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="hud-card-title font-black">{product.name}</h3>
                    <div className="flex flex-col items-end shrink-0">
                      <div className="hud-card-price-pill purple">
                        ₹{product.price}
                      </div>
                      {(product.originalPrice || (product.price && Math.round(product.price * 1.3))) && (
                        <span className="text-[15px] line-through text-slate-400 font-mono mt-1">
                          ₹{product.originalPrice || Math.round(product.price * 1.3)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Color Dot Swatches */}
                  <div className="flex items-center gap-2 mb-4">
                    {prodColors.length > 0 ? (
                      prodColors.slice(0, 5).map((col, ci) => {
                        const cName = col.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                        const hexMatch = col.match(/#([0-9a-fA-F]{3,6})/)
                        const bg = hexMatch ? `#${hexMatch[1]}` : (colorMap[cName] || '#94A3B8')
                        return (
                          <span
                            key={ci}
                            title={cName}
                            style={{ backgroundColor: bg }}
                            className={`hud-color-dot ${ci === 0 ? 'active' : ''}`}
                          />
                        )
                      })
                    ) : (
                      ['#000000', '#38BDF8', '#F5E6C9', '#F87171'].map((bg, ci) => (
                        <span
                          key={ci}
                          style={{ backgroundColor: bg }}
                          className={`hud-color-dot ${ci === 0 ? 'active' : ''}`}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Add to Bag Action CTA */}
                <div className="min-h-[42px]">
                  {selectingSizeForFeatured === product.id ? (
                    <div className="space-y-2 text-center animate-fadeIn">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-bold">Select Size</span>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {prodSizes.map(sz => (
                          <button
                            key={sz}
                            onClick={() => {
                              addToCart({ ...product, image: prodImage }, sz)
                              toast.success(`${product.name} [Size ${sz}] added to bag!`, {
                                style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
                              })
                              setSelectingSizeForFeatured(null)
                            }}
                            className="h-8 w-8 border border-slate-200 text-slate-800 hover:bg-slate-900 hover:text-lime-400 hover:border-slate-900 transition-all text-xs font-bold rounded-lg cursor-pointer bg-white"
                          >
                            {sz}
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectingSizeForFeatured(null)}
                          className="h-8 w-8 border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all text-xs font-bold rounded-lg cursor-pointer bg-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : product.available === false ? (
                    <button
                      disabled
                      className="w-full h-10 px-4 bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest rounded-lg cursor-not-allowed flex items-center justify-center border border-slate-200"
                    >
                      SOLD OUT
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (prodSizes.length === 0) {
                          addToCart({ ...product, image: prodImage }, 'M')
                          toast.success(`${product.name} added to bag!`, {
                            style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }
                          })
                        } else {
                          setSelectingSizeForFeatured(product.id)
                        }
                      }}
                      className="hud-add-btn"
                    >
                      <ShoppingBag />
                      <span>Add To Bag</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
