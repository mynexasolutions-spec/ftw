import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, X, ArrowRight, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function Wishlist() {
  const { wishlistItems, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleAddToCart = (product) => {
    // Default to first size if available, or 'M'
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M'
    addToCart(product, defaultSize)
    toast.success(`${product.name} (Size: ${defaultSize}) added to bag!`, {
      style: {
        background: '#161616',
        color: '#FAF9F6',
        border: '1px solid #8B5CF6',
      }
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  }

  return (
    <div className="min-h-[80vh] bg-[#FAF9F6] py-16 px-6 font-sans bg-grain relative">
      
      {/* Gaming UI grid lines and glowing effects in light theme */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grain {
            background-image: 
              radial-gradient(rgba(139, 92, 246, 0.08) 1.2px, transparent 1.2px),
              radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
            background-size: 20px 20px, 100% 100%, 100% 100%;
          }

          /* Full subtle scanline overlay */
          .wishlist-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.02) 2px,
              rgba(139,92,246,0.02) 4px
            );
          }

          .hud-wishlist-title {
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 1000;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.1;
            color: #161616;
          }

          .hud-wishlist-title span {
            background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-style: italic;
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
            box-shadow: 0 12px 30px rgba(139,92,246,0.12), 0 0 12px rgba(139,92,246,0.08);
          }

          /* HUD Card layout matching screenshot */
          .hud-wishlist-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
          }
          .hud-wishlist-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2.5px;
            background: linear-gradient(90deg, transparent, #8B5CF6 20%, #C084FC 50%, #6D28D9 80%, transparent);
            z-index: 5;
          }
          
          /* HUD corner ticks */
          .hud-corner { position: absolute; width: 12px; height: 12px; border-color: rgba(139,92,246,0.45); border-style: solid; z-index: 10; }
          .hud-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }

          /* Hex values for tech gaming vibe */
          .hud-hex { position: absolute; font-size: 7px; font-family: monospace; color: rgba(139,92,246,0.45); letter-spacing: 0.05em; font-weight: bold; z-index: 10; }
          .hud-hex-tl { top: 4px; left: 24px; }
          .hud-hex-tr { top: 4px; right: 24px; }

          .hud-action-btn {
            background: linear-gradient(90deg, #7C3AED 0%, #9333EA 50%, #6D28D9 100%);
            color: #FFFFFF;
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 900;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-size: 11px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 28px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
            box-shadow: 0 4px 15px rgba(124,58,237,0.25);
            text-decoration: none;
          }
          .hud-action-btn:hover {
            box-shadow: 0 8px 20px rgba(124,58,237,0.38);
          }
        `
      }} />

      <div className="wishlist-scanlines" />

      {/* Decorative vertical texts */}
      <div className="absolute left-6 top-[30%] rotate-[-90deg] origin-left text-[9px] font-mono text-gray-400 tracking-[0.3em] uppercase select-none pointer-events-none">
        FTW // SECURED_VAULT // PROFILE
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-10 border-b border-[#E8E5DC] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black rounded mb-4">
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" /> FTW_WISHLIST_SYS
          </div>
          <h1 className="hud-wishlist-title text-4xl sm:text-5xl">
            WISHLIST <span>VAULT</span>
          </h1>
          <p className="text-xs sm:text-sm text-dark2/50 mt-2 font-mono uppercase tracking-wider font-bold">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved in your locked storage.
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {wishlistItems.length === 0 ? (
            <div className="hud-card-border max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="hud-wishlist-card text-center py-20 px-6"
              >
                <div className="hud-corner hud-tl" />
                <div className="hud-corner hud-tr" />
                <div className="hud-corner hud-bl" />
                <div className="hud-corner hud-br" />

                <div className="relative mb-6 mx-auto">
                  <div className="w-20 h-20 rounded-full bg-[#FAF9F6] flex items-center justify-center text-dark/30 border border-[#E8E5DC]">
                    <Heart className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-black">
                    0
                  </div>
                </div>
                <h2 className="font-display text-2xl font-black uppercase text-dark mb-3">Your wishlist is empty</h2>
                <p className="text-sm sm:text-[14.5px] text-dark2/60 max-w-sm mx-auto mb-8 leading-relaxed font-mono font-bold">
                  Bookmark items you love from the latest collection to keep them lock-in certified.
                </p>
                <Link 
                  to="/shop" 
                  className="hud-action-btn w-fit mx-auto"
                >
                  Explore Shop 
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {wishlistItems.map((product) => (
                  <motion.div 
                    key={product.id}
                    variants={itemVariants}
                    exit="exit"
                    layout
                    className="hud-card-border"
                  >
                    <div className="hud-wishlist-card">
                      {/* Telemetry Hex values */}
                      <span className="hud-hex hud-hex-tl">VAULT_LOCK_ID_{product.id.substring(0,4).toUpperCase()}</span>
                      <span className="hud-hex hud-hex-tr">0x{product.price.toString(16).toUpperCase()}</span>

                      {/* Floating Remove Button */}
                      <button
                        onClick={() => {
                          toggleWishlist(product)
                          toast.success(`${product.name} removed from wishlist.`, {
                            style: { background: '#161616', color: '#FAF9F6' }
                          })
                        }}
                        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-[#E8E5DC] flex items-center justify-center text-dark/60 hover:text-purple-600 hover:bg-white transition-all cursor-pointer shadow-sm"
                        title="Remove from wishlist"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Image */}
                      <div className="relative aspect-[4/5] bg-[#F5F3EC] overflow-hidden border-b border-purple-500/10">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
                        />
                        {product.tag && (
                          <span className="absolute top-4 left-4 bg-dark text-[#D6FF40] text-[8px] font-mono uppercase tracking-widest font-black px-2.5 py-1.5 rounded shadow-sm">
                            {product.tag}
                          </span>
                        )}
                        {!product.available && (
                          <div className="absolute inset-0 bg-white/55 backdrop-blur-xs flex items-center justify-center">
                            <span className="bg-dark text-[#D6FF40] px-3 py-1.5 rounded text-xs uppercase font-mono tracking-widest font-bold">SOLD OUT</span>
                          </div>
                        )}
                      </div>

                      {/* Info and Actions */}
                      <div className="p-6 flex-grow flex flex-col justify-between relative z-10 bg-white">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <Link 
                              to={`/product/${product.id}`}
                              className="font-sans text-[13px] sm:text-base font-bold text-dark hover:text-purple-600 transition-colors line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <span className="text-[13px] sm:text-base font-mono font-bold text-dark">₹{product.price}</span>
                          </div>
                          {product.colors && (
                            <p className="text-[10px] text-dark2/40 font-mono uppercase tracking-wider mb-4 font-bold">
                              Color options: {Array.isArray(product.colors) ? product.colors.join(', ') : product.colors}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Link 
                            to={`/product/${product.id}`}
                            className="flex-1 py-3 border border-[#E8E5DC] text-dark hover:bg-[#F5F3EC] hover:border-dark/30 transition-all text-center text-xs font-mono font-bold uppercase tracking-widest rounded-xl"
                          >
                            Details
                          </Link>
                          {product.available ? (
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 py-3 bg-dark text-[#D6FF40] hover:bg-purple-600 hover:text-white transition-all text-xs font-mono font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 border-none cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Add to Bag
                            </button>
                          ) : (
                            <button 
                              disabled 
                              className="flex-1 py-3 bg-[#F0EEE7] text-dark2/40 text-xs font-mono font-bold uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center justify-center gap-1 border-none"
                            >
                              No Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
