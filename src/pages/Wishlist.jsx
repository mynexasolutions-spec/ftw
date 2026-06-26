import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, X, ArrowRight } from 'lucide-react'
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
        border: '1px solid #222222',
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
    <div className="min-h-[80vh] bg-cream py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <span className="text-[10px] text-accent font-mono uppercase tracking-[0.25em] font-black">
            YOUR SELECTIONS
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-dark mt-1 leading-none">
            WISHLIST <span className="text-accent italic transform skew-x-3 inline-block">VAULT</span>
          </h1>
          <p className="text-xs text-dark2/50 mt-1.5 font-sans">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved in your wishlist vault.
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 bg-cream2 border border-cream3 rounded-3xl flex flex-col items-center justify-center max-w-2xl mx-auto px-6 shadow-sm"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-cream3 flex items-center justify-center text-dark/30 border border-cream3">
                  <Heart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-[10px] text-cream font-black">
                  0
                </div>
              </div>
              <h2 className="font-display text-2xl font-black uppercase text-dark mb-3">Your wishlist is empty</h2>
              <p className="text-xs text-dark2/60 max-w-sm mx-auto mb-8 leading-relaxed font-mono">
                Bookmark items you love from the latest collection to keep them lock-in certified.
              </p>
              <Link 
                to="/shop" 
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-dark text-primary font-mono font-bold uppercase text-xs rounded hover:bg-accent hover:text-cream transition-all duration-300 shadow-lg"
              >
                Explore Shop 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
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
                    className="bg-cream2 border border-cream3 rounded-2xl overflow-hidden hover:border-dark/25 transition-all flex flex-col justify-between group/card relative"
                  >
                    {/* Floating Remove Button */}
                    <button
                      onClick={() => {
                        toggleWishlist(product)
                        toast.success(`${product.name} removed from wishlist.`, {
                          style: { background: '#161616', color: '#FAF9F6' }
                        })
                      }}
                      className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream/90 backdrop-blur-md border border-cream3 flex items-center justify-center text-dark/60 hover:text-accent hover:bg-cream transition-all cursor-pointer shadow-sm"
                      title="Remove from wishlist"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-[4/5] bg-cream3 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
                      />
                      {product.tag && (
                        <span className="absolute top-4 left-4 bg-dark text-primary text-[8px] font-mono uppercase tracking-widest font-black px-2.5 py-1.5 rounded shadow-sm">
                          {product.tag}
                        </span>
                      )}
                      {!product.available && (
                        <div className="absolute inset-0 bg-dark/40 backdrop-blur-xs flex items-center justify-center">
                          <span className="bg-accent text-cream px-3 py-1.5 rounded text-xs uppercase font-mono tracking-widest font-bold">SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    {/* Info and Actions */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <Link 
                            to={`/product/${product.id}`}
                            className="font-display text-sm font-black uppercase text-dark hover:text-accent transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <span className="text-sm font-mono font-bold text-dark">₹{product.price}</span>
                        </div>
                        {product.colors && (
                          <p className="text-[10px] text-dark2/40 font-mono uppercase tracking-wider mb-4">
                            Color options: {product.colors.join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link 
                          to={`/product/${product.id}`}
                          className="flex-1 py-3 border border-cream3 hover:bg-cream3 transition-colors text-center text-xs font-mono font-bold uppercase tracking-widest rounded"
                        >
                          Details
                        </Link>
                        {product.available ? (
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 py-3 bg-dark text-cream hover:bg-accent transition-colors text-xs font-mono font-black uppercase tracking-widest rounded flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add to Bag
                          </button>
                        ) : (
                          <button 
                            disabled 
                            className="flex-1 py-3 bg-cream3 text-dark2/40 text-xs font-mono font-bold uppercase tracking-widest rounded cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            No Stock
                          </button>
                        )}
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
