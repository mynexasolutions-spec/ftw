import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { getProducts, getProductRating, getCategories } from '../lib/supabase'
import { ShoppingBag, Eye, Upload, Palette, Calculator, Check, ArrowRight, ShieldAlert, Heart, SlidersHorizontal, X, Star, Zap, Gamepad2, Swords, Target, Trophy, Laptop, Crown, Flame, Sparkles } from 'lucide-react'

// Full dataset for filters
const DATASET = [
  {
    id: 'ftw-sig-01',
    name: 'Signature Heavyweight Oversized Tee',
    price: 1899,
    category: 'current-drop',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    image: '/images/1.1.jpeg',
    available: true,
    tag: 'New'
  },
  {
    id: 'ftw-cyber-02',
    name: 'Cyber-Neon Oversized Tee',
    price: 1999,
    category: 'current-drop',
    sizes: ['M', 'L', 'XL'],
    colors: ['Black', 'Lime'],
    image: '/images/2.1.jpeg',
    available: true,
    tag: 'Drop Flagship'
  },
  {
    id: 'ftw-acid-03',
    name: 'Retro Acid-Wash Drop Tee',
    price: 2199,
    category: 'current-drop',
    sizes: ['S', 'M', 'L'],
    colors: ['Charcoal'],
    image: '/images/3.1.jpeg',
    available: true,
    tag: 'Vintage Drop'
  },
  {
    id: 'ftw-box-04',
    name: 'Minimalist Monogram Box Tee',
    price: 1799,
    category: 'new-arrivals',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Black'],
    image: '/images/4.1.jpeg',
    available: true,
    tag: 'Limited Run'
  },
  {
    id: 'ftw-sale-01',
    name: 'Vanguard Drop-Shoulder Tee',
    price: 1299,
    originalPrice: 1899,
    category: 'sale',
    sizes: ['S', 'M'],
    colors: ['Black'],
    image: '/images/1.1.jpeg',
    available: true,
    tag: '31% OFF'
  },
  {
    id: 'ftw-sale-02',
    name: 'Core Logo Classic Fit Tee',
    price: 999,
    originalPrice: 1599,
    category: 'sale',
    sizes: ['M', 'L'],
    colors: ['White'],
    image: '/images/2.1.jpeg',
    available: false,
    tag: 'Sold Out'
  }
]

const SHOP_PRODUCT_STYLES = [
  { id: 'regular', name: 'Regular Tee', shortName: 'Regular', price: 380, image: '/images/Regular-T.png' },
  { id: 'oversize', name: 'Oversize Tee', shortName: 'Oversize', price: 450, image: '/images/oversize T.png' },
  { id: 'polo', name: 'Collared Tee', shortName: 'Polo', price: 480, image: '/images/Collered T.png' },
]

export default function Shop() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'
  const searchQuery = searchParams.get('search') || ''
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  // Dynamic Products List
  const [productsList, setProductsList] = useState([])
  const [dbCategories, setDbCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectingSizeProduct, setSelectingSizeProduct] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const loadStoreProducts = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ])

        if (productsData && productsData.length > 0) {
          setProductsList(productsData)
        } else {
          setProductsList(DATASET)
        }

        if (categoriesData && categoriesData.length > 0) {
          setDbCategories(categoriesData)
        } else {
          setDbCategories([
            { id: 'cat-01', name: 'Men', slug: 'men' },
            { id: 'cat-02', name: 'Women', slug: 'women' },
            { id: 'cat-03', name: 'Unisex', slug: 'unisex' },
            { id: 'cat-04', name: 'Accessories', slug: 'accessories' }
          ])
        }
      } catch (err) {
        console.error("Failed to load catalog products and categories:", err)
        setProductsList(DATASET)
        setDbCategories([
          { id: 'cat-01', name: 'Men', slug: 'men' },
          { id: 'cat-02', name: 'Women', slug: 'women' },
          { id: 'cat-03', name: 'Unisex', slug: 'unisex' },
          { id: 'cat-04', name: 'Accessories', slug: 'accessories' }
        ])
      } finally {
        setLoadingProducts(false)
      }
    }
    loadStoreProducts()
  }, [])

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to bag!`, {
      style: { background: '#161616', color: '#FAF9F6' }
    })
  }

  // Dynamic filter limits/options computed from productsList
  const [minProductPrice, setMinProductPrice] = useState(900)
  const [maxProductPrice, setMaxProductPrice] = useState(2500)

  // Filters State
  const [filterSizes, setFilterSizes] = useState([])
  const [filterColors, setFilterColors] = useState([])
  const [filterPrice, setFilterPrice] = useState(2500)
  const [filterAvailability, setFilterAvailability] = useState('all')

  // Derive unique sizes and colors dynamically from productsList
  const uniqueSizes = new Set()
  const uniqueColors = new Set()
  productsList.forEach(p => {
    const sizes = Array.isArray(p.sizes) ? p.sizes : (p.sizes ? String(p.sizes).split(',').map(s => s.trim()) : [])
    const colors = Array.isArray(p.colors) ? p.colors : (p.colors ? String(p.colors).split(',').map(c => c.trim()) : [])
    sizes.forEach(s => { if (s) uniqueSizes.add(s) })
    colors.forEach(c => { if (c) uniqueColors.add(c) })
  })

  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
  const sortedSizes = Array.from(uniqueSizes).sort((a, b) => {
    const idxA = sizeOrder.indexOf(a)
    const idxB = sizeOrder.indexOf(b)
    if (idxA === -1 && idxB === -1) return a.localeCompare(b)
    if (idxA === -1) return 1
    if (idxB === -1) return -1
    return idxA - idxB
  })
  const availableSizes = ['all', ...sortedSizes]
  const availableColors = ['all', ...Array.from(uniqueColors)]

  // Adjust price range filter when products are loaded
  useEffect(() => {
    if (productsList.length > 0) {
      const prices = productsList.map(p => p.price || 0)
      const maxP = Math.ceil(Math.max(...prices, 2500) / 100) * 100
      const minP = Math.floor(Math.min(...prices, 900) / 100) * 100
      setMaxProductPrice(maxP)
      setMinProductPrice(minP)
      setFilterPrice(maxP)
    }
  }, [productsList])

  // Handle Tab Switch
  const setTab = (tab) => {
    setSearchParams({ tab })
  }

  // Filter Logic
  const filteredProducts = productsList.filter(p => {
    const pSizes = Array.isArray(p.sizes) ? p.sizes : (p.sizes ? p.sizes.split(',').map(s => s.trim()) : [])
    const pColors = Array.isArray(p.colors) ? p.colors : (p.colors ? p.colors.split(',').map(c => c.trim()) : [])

    // Search query check
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim()
      const matchesName = (p.name || '').toLowerCase().includes(q)
      const matchesCategory = (p.category || '').toLowerCase().includes(q)
      const matchesTag = (p.tag || '').toLowerCase().includes(q)
      const matchesColors = pColors.some(c => c.toLowerCase().includes(q))

      if (!matchesName && !matchesCategory && !matchesTag && !matchesColors) return false
    }

    // Category check
    if (activeTab !== 'all' && p.category !== activeTab) return false
    // Size check
    if (filterSizes.length > 0 && !pSizes.some(s => filterSizes.includes(s))) return false
    // Color check
    if (filterColors.length > 0 && !pColors.some(c => filterColors.includes(c))) return false
    // Price check
    if (p.price > filterPrice) return false
    // Availability check
    if (filterAvailability === 'in-stock' && !p.available) return false
    if (filterAvailability === 'out-of-stock' && p.available) return false
    return true
  })

  const categoryOrderMap = {}
  dbCategories.forEach(cat => {
    if (cat.name) {
      categoryOrderMap[cat.name.toLowerCase()] = cat.sort_order ?? 0
    }
  })

  const sortedFilteredProducts = [...filteredProducts].sort((a, b) => {
    const orderA = categoryOrderMap[(a.category || '').toLowerCase()] ?? 9999
    const orderB = categoryOrderMap[(b.category || '').toLowerCase()] ?? 9999
    if (orderA !== orderB) {
      return orderA - orderB
    }
    return (a.name || '').localeCompare(b.name || '')
  })

  const renderFiltersContent = () => {
    return (
      <div className="space-y-6">
        {/* Filter Size */}
        <div>
          <span className="text-[12.5px] text-dark font-mono uppercase tracking-[0.15em] font-black block mb-3">Size</span>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(sz => {
              const isSelected = sz === 'all' ? filterSizes.length === 0 : filterSizes.includes(sz);
              return (
                <button
                  key={sz}
                  onClick={() => {
                    if (sz === 'all') {
                      setFilterSizes([])
                    } else {
                      setFilterSizes(prev =>
                        prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
                      )
                    }
                  }}
                  className={`w-10 h-10 border text-[11.5px] font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold ${isSelected
                    ? 'bg-dark border-dark text-[#D6FF40] shadow-md'
                    : 'border-[#E8E5DC] text-dark hover:bg-[#F5F3EC] hover:border-dark/20 bg-white font-extrabold'
                    }`}
                >
                  {sz === 'all' ? 'All' : sz}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Color */}
        <div>
          <span className="text-[12.5px] text-dark font-mono uppercase tracking-[0.15em] font-black block mb-3">Color</span>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(col => {
              const colorMap = {
                Black: '#161616',
                White: '#FFFFFF',
                Charcoal: '#4A4A4A',
                Lime: '#A3E635',
                Beige: '#E6D3B3',
                Cream: '#F5F2E9'
              }
              const displayName = col.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')
              const hexMatch = col.match(/#([0-9a-fA-F]{3,6})/)
              const hex = hexMatch ? `#${hexMatch[1]}` : (colorMap[displayName] || null)
              const isSelected = col === 'all' ? filterColors.length === 0 : filterColors.includes(col);

              return (
                <button
                  key={col}
                  onClick={() => {
                    if (col === 'all') {
                      setFilterColors([])
                    } else {
                      setFilterColors(prev =>
                        prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                      )
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 border text-[10.5px] font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold ${isSelected
                    ? 'bg-dark border-dark text-[#D6FF40] font-black shadow-sm'
                    : 'border-[#E8E5DC] text-dark hover:bg-[#F5F3EC] bg-white font-extrabold'
                    }`}
                >
                  {col !== 'all' && hex && (
                    <span
                      style={{ backgroundColor: hex }}
                      className={`w-2.5 h-2.5 rounded-full border inline-block shrink-0 ${isSelected ? 'border-white/50' : 'border-black/10'
                        }`}
                    />
                  )}
                  {col === 'all' ? 'All' : displayName}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Price */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12.5px] text-dark font-mono uppercase tracking-[0.15em] font-black">Max Price</span>
            <span className="text-[13.5px] text-dark font-mono font-black">₹{filterPrice.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={minProductPrice}
            max={maxProductPrice}
            step="100"
            value={filterPrice}
            onChange={(e) => setFilterPrice(Number(e.target.value))}
            className="w-full accent-dark cursor-pointer h-1.5 rounded-lg appearance-none bg-[#E8E5DC]"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10.5px] font-mono text-dark font-bold">₹{minProductPrice}</span>
            <span className="text-[10.5px] font-mono text-dark font-bold">₹{maxProductPrice}</span>
          </div>
        </div>

        {/* Availability */}
        <div>
          <span className="text-[12.5px] text-dark font-mono uppercase tracking-[0.15em] font-black block mb-3">Availability</span>
          <div className="flex flex-col gap-1.5">
            {[
              { key: 'all', label: 'Show All', icon: '◉' },
              { key: 'in-stock', label: 'In Stock Only', icon: '✓' },
              { key: 'out-of-stock', label: 'Sold Out Archive', icon: '✗' }
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilterAvailability(opt.key)}
                className={`w-full py-2.5 px-3.5 border text-left rounded-xl transition-all cursor-pointer flex items-center gap-2 font-bold ${filterAvailability === opt.key
                  ? 'bg-dark border-dark text-[#D6FF40] font-black shadow-sm'
                  : 'border-[#E8E5DC] text-dark hover:bg-[#F5F3EC] bg-white font-extrabold'
                  }`}
              >
                <span className="text-[11.5px] font-mono font-black">{opt.icon}</span>
                <span className="text-[11.5px] font-mono uppercase tracking-wider font-black">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FAF9F6] text-[#161616] min-h-screen relative overflow-hidden font-sans bg-grain pb-12">

      {/* Large Decorative Gaming Backdrop Icons (Reduced to 5, spaced further apart) */}
      <div className="absolute right-[2%] top-[22%] opacity-[0.2] md:opacity-[0.28] text-purple-600 pointer-events-none z-0">
        <Gamepad2 className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] rotate-[15deg]" />
      </div>
      <div className="absolute left-[2%] top-[38%] opacity-[0.16] md:opacity-[0.24] text-purple-600 pointer-events-none z-0">
        <Swords className="w-[70px] h-[70px] md:w-[130px] md:h-[130px] rotate-[-20deg]" />
      </div>
      <div className="absolute right-[2%] top-[55%] opacity-[0.18] md:opacity-[0.26] text-purple-600 pointer-events-none z-0">
        <Target className="w-[75px] h-[75px] md:w-[140px] md:h-[140px] rotate-[35deg]" />
      </div>
      <div className="absolute left-[2%] top-[72%] opacity-[0.16] md:opacity-[0.24] text-purple-600 pointer-events-none z-0">
        <Trophy className="w-[70px] h-[70px] md:w-[130px] md:h-[130px] rotate-[-10deg]" />
      </div>
      <div className="absolute right-[2%] top-[88%] opacity-[0.15] md:opacity-[0.22] text-purple-600 pointer-events-none z-0">
        <Sparkles className="w-[70px] h-[70px] md:w-[130px] md:h-[130px] rotate-[25deg]" />
      </div>

      {/* Gaming UI grid lines, scanlines, and glowing effects in light theme */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grain {
            background-image: 
              radial-gradient(rgba(139, 92, 246, 0.08) 1.2px, transparent 1.2px),
              radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
            background-size: 20px 20px, 100% 100%, 100% 100%;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          /* Full subtle scanline overlay */
          .shop-scanlines {
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
            box-shadow: 0 12px 30px rgba(139,92,246,0.12), 0 0 12px rgba(139,92,246,0.08);
          }

          /* HUD Card layout matching screenshot */
          .hud-shop-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
          }
          .hud-shop-card::before {
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

          .hud-shop-title {
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 1000;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.1;
            color: #161616;
          }

          /* Tech submit button styled exact */
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
          .hud-shop-title span {
            background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-style: italic;
          }
        `
      }} />

      <div className="shop-scanlines" />

      {/* Decorative vertical texts */}
      <div className="absolute left-6 top-[30%] rotate-[-90deg] origin-left text-[9px] font-mono text-gray-400 tracking-[0.3em] uppercase select-none pointer-events-none">
        FTW // WEAPONS_CATALOG // DEPOT
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-8 sm:pb-16 relative z-10 text-dark">

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="hud-shop-title text-4xl sm:text-5xl">
              THE <span>CATALOG</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-[15.5px] text-dark2/50 mt-2 font-mono uppercase tracking-wider font-bold">Premium streetwear, limited tactical drops & custom gaming apparel.</p>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="w-full mb-8 sm:mb-10">
          <div className="flex overflow-x-auto gap-2 pb-1 scroll-smooth no-scrollbar select-none border-b border-purple-500/15">
            {[
              { key: 'all', label: 'All Catalog' },
              ...dbCategories
                .filter(cat => !['custom dtf', 'dtf', 'custom+dtf'].includes(cat.name?.toLowerCase()))
                .map(cat => ({ key: cat.name, label: cat.name })),
              { key: 'Custom DTF', label: '✦ CUSTOM CUSTOMIZER' }
            ].map(tab => {
              const isTabActive = activeTab === tab.key || (tab.key === 'Custom DTF' && (activeTab === 'dtf' || activeTab === 'Custom+DTF'));
              const isDTF = tab.key === 'Custom DTF';
              return (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={`px-4 sm:px-5 py-3 text-[12px] sm:text-[13px] font-mono font-black uppercase tracking-widest transition-all duration-200 shrink-0 cursor-pointer border-b-2 whitespace-nowrap ${isTabActive
                    ? isDTF
                      ? 'border-purple-600 text-purple-600 bg-purple-500/5'
                      : 'border-dark text-dark bg-dark/5'
                    : 'border-transparent text-gray-400 hover:text-dark'
                    }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Filter Chips */}
        {(filterSizes.length > 0 || filterColors.length > 0 || filterPrice < maxProductPrice || filterAvailability !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in text-[10px] font-sans">
            <span className="text-dark2/50 uppercase tracking-widest font-bold mr-2 select-none">Active Filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark text-[#D6FF40] rounded-lg font-bold">
                Search: "{searchQuery}"
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('search')
                    setSearchParams(newParams)
                  }}
                  className="text-[#D6FF40] hover:text-white font-bold ml-1 border-none bg-transparent cursor-pointer flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              </span>
            )}

            {filterSizes.map(sz => (
              <span key={sz} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark text-[#D6FF40] rounded-lg font-bold">
                Size: {sz}
                <button
                  onClick={() => setFilterSizes(prev => prev.filter(s => s !== sz))}
                  className="text-[#D6FF40] hover:text-white font-bold ml-1 border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  ✕
                </button>
              </span>
            ))}

            {filterColors.map(col => (
              <span key={col} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark text-[#D6FF40] rounded-lg font-bold">
                Color: {col.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}
                <button
                  onClick={() => setFilterColors(prev => prev.filter(c => c !== col))}
                  className="text-[#D6FF40] hover:text-white font-bold ml-1 border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  ✕
                </button>
              </span>
            ))}

            {filterPrice < maxProductPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark text-[#D6FF40] rounded-lg font-bold">
                Max: ₹{filterPrice}
                <button
                  onClick={() => setFilterPrice(maxProductPrice)}
                  className="text-[#D6FF40] hover:text-white font-bold ml-1 border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  ✕
                </button>
              </span>
            )}

            {filterAvailability !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark text-[#D6FF40] rounded-lg font-bold">
                Status: {filterAvailability === 'in-stock' ? 'In Stock' : 'Sold Out'}
                <button
                  onClick={() => setFilterAvailability('all')}
                  className="text-[#D6FF40] hover:text-white font-bold ml-1 border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setFilterSizes([])
                setFilterColors([])
                setFilterPrice(maxProductPrice)
                setFilterAvailability('all')
                const newParams = new URLSearchParams(searchParams)
                newParams.delete('search')
                setSearchParams(newParams)
              }}
              className="text-red-500 hover:text-red-700 underline font-bold ml-2 border-none bg-transparent cursor-pointer uppercase tracking-wider text-[10px]"
            >
              Clear All
            </button>
          </div>
        )}

        {activeTab === 'coming-soon' ? (
          <div className="text-center py-24 bg-white border border-[#E8E5DC] rounded-3xl shadow-sm">
            <span className="text-4xl block mb-5">⌛</span>
            <h2 className="font-display text-2xl font-black uppercase text-dark mb-3">SATORI SHADOW COLLECTION</h2>
            <p className="text-xs text-dark2/55 max-w-sm mx-auto mb-8 leading-relaxed font-sans">
              Previews will open shortly. Join our alerts list on the home page to be first in line.
            </p>
            <Link to="/" className="inline-block px-7 py-3 bg-dark text-[#D6FF40] text-[11px] font-sans font-bold uppercase tracking-widest rounded-xl hover:bg-[#8B5CF6] hover:text-white transition-all shadow-md">Go Home</Link>
          </div>
        ) : (activeTab === 'dtf' || activeTab === 'Custom DTF' || activeTab === 'Custom+DTF') ? (
          /* Customizer promo block - Light HUD theme */
          <div className="space-y-8 animate-fadeIn">
            <div className="relative bg-white border border-[#E8E5DC] rounded-3xl p-6 sm:p-10 md:p-14 overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center">
              <div className="absolute -top-16 -right-16 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <span className="relative z-10 inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 border border-purple-500/20 font-mono uppercase tracking-[0.2em] text-[9px] sm:text-[10px] font-black px-4 py-2 rounded-full mb-4">
                <Palette className="w-3 h-3" /> FTW Customizer Studio
              </span>
              <h2 className="relative z-10 font-display text-3xl sm:text-4xl md:text-6xl font-black uppercase text-dark tracking-tight mb-4 leading-none">
                Create Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Custom Drop</span>
              </h2>
              <p className="relative z-10 text-[12px] sm:text-sm text-dark2/50 max-w-lg mx-auto mb-10 leading-relaxed font-sans">
                Upload any artwork and build your premium streetwear design in real-time. No minimum order.
              </p>

              {/* Steps */}
              <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full mt-4">
                {[
                  { step: '01', icon: ShoppingBag, title: 'CHOOSE BLANK & COLOR', desc: 'Pick your blank t-shirt and choose your favorite color.' },
                  { step: '02', icon: Upload, title: 'UPLOAD & ADD TEXT', desc: 'Upload your design image and write custom text on the canvas.' },
                  { step: '03', icon: Palette, title: 'SAVE & SELECT SIZE', desc: 'Save your design and select your size and quantity.' },
                  { step: '04', icon: Check, title: 'PRINT & SHIP', desc: 'We print your custom order with premium DTF and ship it to you.' }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#E8E5DC] rounded-[24px] p-4 sm:p-6 text-left group hover:border-purple-500 hover:shadow-[0_12px_36px_rgba(139,92,246,0.08)] hover:-translate-y-1.5 transition-all duration-500 cursor-default flex flex-col justify-between relative overflow-hidden min-h-[165px] sm:min-h-[190px]"
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    <div>
                      <div className="flex items-center justify-between mb-3 sm:mb-5">
                        <div className="p-2 sm:p-3 bg-[#F5F3EC] text-purple-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#8B5CF6] group-hover:text-white group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                          <s.icon className="w-4 h-4 sm:w-5 h-5" />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-widest text-dark2/40 bg-neutral-100/80 border border-neutral-200/50 px-2.5 py-1 rounded-full group-hover:bg-purple-500/10 group-hover:text-purple-600 group-hover:border-purple-500/20 transition-all duration-300">
                          STEP {s.step}
                        </span>
                      </div>
                      <h4 className="font-display text-xs sm:text-sm font-black uppercase tracking-wide text-dark mb-1 sm:mb-2.5 group-hover:text-purple-600 transition-colors duration-300">
                        {s.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-dark2/55 group-hover:text-dark2/75 font-sans leading-relaxed transition-colors duration-300">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Launch Customizer Action Button */}
              <div className="relative z-10 w-full mt-10 flex flex-col items-center justify-center">
                <Link
                  to="/customizer"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault()
                      toast.error("Please login to access the customizer!", {
                        id: 'auth-required-shop-dtf',
                        style: { background: '#161616', color: '#FAF9F6' }
                      })
                      navigate('/auth?redirect=/customizer')
                    }
                  }}
                  className="w-fit px-6 sm:px-8 py-3.5 sm:py-4 bg-dark text-[#D6FF40] hover:bg-purple-600 hover:text-white transition-all duration-300 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-2xl shadow-md hover:shadow-[0_8px_25px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 cursor-pointer border-none text-center decoration-none"
                >
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                  Launch Customizer Studio
                </Link>
                <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
                  <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> No minimum order
                  </span>
                  <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> High-density DTF print
                  </span>
                  <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Ships in 7–10 days
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : loadingProducts ? (
          <div className="text-center py-28 font-sans text-dark2/50 text-xs">
            <div className="w-8 h-8 border-2 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <span className="font-mono uppercase tracking-widest text-[10px]">Loading catalog...</span>
          </div>
        ) : (
          /* Regular Shop Layout with Filters */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-start">
            {/* Side Filters Panel (Desktop only) */}
            <div className="hidden lg:block lg:col-span-1 hud-card-border">
              <div className="hud-shop-card p-5">
                
                <div className="pb-3 mb-4 border-b border-[#EDEADE] flex items-center justify-between">
                  <span className="text-[12.5px] text-dark font-mono uppercase tracking-widest font-black">Refine Results</span>
                  <span className="hud-hex font-mono text-[7px] text-purple-600/50">0xFILTER</span>
                </div>
                {renderFiltersContent()}
              </div>
            </div>

            {/* Product Grid Area */}
            <div className="lg:col-span-3">
              {/* Mobile Filters Toggle Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden w-full h-11 px-4 mb-6 bg-white border border-[#E8E5DC] hover:border-dark/30 text-dark font-sans text-[11px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                Filter Products
              </button>
              {filteredProducts.length === 0 ? (
                <div className="hud-card-border max-w-md mx-auto">
                  <div className="hud-shop-card text-center py-20 px-5">
                    <span className="text-3xl block mb-4">🔍</span>
                    <p className="text-xs text-dark2/50 font-mono uppercase">No products match your filters. Try adjusting your selection.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedFilteredProducts.map((product, pi) => {
                    const categoryStr = (product.category || '').toLowerCase().replace(/[\s-_]+/g, ' ').trim()
                    const tagStr = (product.tag || '').toLowerCase().replace(/[\s-_]+/g, ' ').trim()
                    const isComingSoon = categoryStr === 'coming soon' || tagStr === 'coming soon'

                    const defaultColorCleaned = product.default_color ? product.default_color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim() : '';
                    const defaultColorVariant = defaultColorCleaned
                      ? (product.variants || []).find(v => v.color && v.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim() === defaultColorCleaned)
                      : null;

                    const firstVariantWithPrice = defaultColorVariant && defaultColorVariant.price !== undefined
                      ? defaultColorVariant
                      : ((product.variants || []).find(v => v.price !== undefined) || {});

                    const firstVariantWithImages = defaultColorVariant && defaultColorVariant.images && defaultColorVariant.images.length > 0
                      ? defaultColorVariant
                      : ((product.variants || []).find(v => v.images && v.images.length > 0) || {});

                    const displayPrice = product.price !== undefined && product.price !== null && product.price !== 0 ? product.price : (firstVariantWithPrice.price || 0)
                    const displayOriginalPrice = product.originalPrice ? product.originalPrice : firstVariantWithPrice.originalPrice
                    const displayImage = product.image ? product.image : ((firstVariantWithImages.images && firstVariantWithImages.images[0]) || '/images/1.1.jpeg')

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: pi * 0.04, ease: 'easeOut' }}
                        className="hud-card-border"
                      >
                        <div className="hud-shop-card">

                          {/* Telemetry Hex tag */}
                          <span className="hud-hex hud-hex-tl">ITEM_REF_{product.id.substring(0,5).toUpperCase()}</span>
                          <span className="hud-hex hud-hex-tr">0x{displayPrice.toString(16).toUpperCase()}</span>

                          <Link to={`/product/${product.id}`} className="relative aspect-[4/5] bg-[#F5F3EC] overflow-hidden block border-b border-purple-500/10">
                            <img
                              src={displayImage}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                            />
                            {product.tag && (
                              <span className={`absolute top-3 left-3 text-[8px] font-mono uppercase tracking-widest font-black px-2.5 py-1.5 rounded-lg shadow-sm ${product.tag.includes('OFF') || product.tag.includes('Sale') ? 'bg-[#D6FF40] text-dark' : 'bg-dark text-[#D6FF40]'
                                }`}>
                                {product.tag}
                              </span>
                            )}

                            {/* Rating Badge */}
                            <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-dark border border-white/60 flex items-center gap-1 shadow-sm z-10">
                              <Star className="w-3 h-3 fill-purple-600 text-purple-600 shrink-0" />
                              <span>{getProductRating(product.name) || '0.0'}</span>
                            </div>

                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleWishlist(product)
                                toast.success(
                                  isInWishlist(product.id) ? `Removed from wishlist.` : `Added to wishlist!`,
                                  { style: { background: '#161616', color: '#FAF9F6' } }
                                )
                              }}
                              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md border border-white/60 flex items-center justify-center hover:scale-110 transition-all cursor-pointer shadow-sm text-dark"
                              title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(product.id) ? 'fill-purple-600 text-purple-600' : 'text-dark/50'}`} />
                            </button>

                            {!product.available && (
                              <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-dark text-[#D6FF40] px-3 py-1.5 rounded-lg text-[9px] uppercase font-mono tracking-widest font-black shadow-md">SOLD OUT</span>
                              </div>
                            )}
                          </Link>

                          <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between relative z-10">
                            <div>
                              {/* Name + Price */}
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-sans text-[13px] sm:text-base font-bold text-dark leading-snug">{product.name}</h3>
                                <div className="flex flex-col items-end shrink-0">
                                  <span className="text-[13px] sm:text-base font-mono font-black text-dark">₹{displayPrice}</span>
                                  {displayOriginalPrice && (
                                    <span className="text-[10px] sm:text-xs line-through font-mono text-gray-400">₹{displayOriginalPrice}</span>
                                  )}
                                </div>
                              </div>

                              {/* Color Swatches */}
                              <div className="flex items-center gap-1.5 mb-3">
                                {(Array.isArray(product.colors)
                                  ? product.colors
                                  : (product.colors ? String(product.colors).split(',').map(c => c.trim()) : [])
                                ).slice(0, 6).map((col, ci) => {
                                  const cName = col.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                                  const hexMatch = col.match(/#([0-9a-fA-F]{3,6})/)
                                  const colorMap = { Black: '#161616', White: '#FAFAFA', Charcoal: '#4A4A4A', Lime: '#A3E635', Beige: '#E6D3B3', Cream: '#F5F2E9' }
                                  const bg = hexMatch ? `#${hexMatch[1]}` : (colorMap[cName] || '#ccc')
                                  return (
                                    <span
                                      key={ci}
                                      title={cName}
                                      style={{ backgroundColor: bg }}
                                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 inline-block"
                                    />
                                  )
                                })}
                              </div>
                            </div>

                            {/* CTA */}
                            <div className="mt-1 min-h-[36px] sm:min-h-[40px]">
                              {selectingSizeProduct === product.id ? (
                                <div className="space-y-1.5 text-center">
                                  <span className="text-[11px] text-gray-500 font-mono uppercase tracking-widest block">Pick a Size</span>
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {(Array.isArray(product.sizes) ? product.sizes : (product.sizes ? String(product.sizes).split(',').map(s => s.trim()) : [])).map(sz => (
                                      <button
                                        key={sz}
                                        onClick={() => {
                                          addToCart(product, sz)
                                          toast.success(`${product.name} [${sz}] added!`, { style: { background: '#161616', color: '#FAF9F6' } })
                                          setSelectingSizeProduct(null)
                                        }}
                                        className="h-7.5 px-3 border border-dark text-dark hover:bg-dark hover:text-[#D6FF40] transition-all text-[10px] font-mono font-black rounded-lg cursor-pointer bg-transparent"
                                      >
                                        {sz}
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => setSelectingSizeProduct(null)}
                                      className="h-7.5 px-2 border border-dark/15 text-dark/30 hover:border-red-400 hover:text-red-400 transition-all text-[10px] font-mono font-bold rounded-lg cursor-pointer bg-transparent"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ) : product.available ? (
                              <button
                                onClick={() => {
                                  const sizes = Array.isArray(product.sizes) ? product.sizes : (product.sizes ? String(product.sizes).split(',').map(s => s.trim()) : [])
                                  if (sizes.length === 0) {
                                    addToCart(product, 'M')
                                    toast.success(`${product.name} added to bag!`, { style: { background: '#161616', color: '#FAF9F6' } })
                                  } else {
                                    setSelectingSizeProduct(product.id)
                                  }
                                }}
                                className="w-full h-9 sm:h-10 px-2 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 text-[11px] sm:text-[12px] font-mono font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Add to Bag
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full h-9 px-4 bg-[#F0EEE7] text-dark2/30 text-[9px] font-mono font-bold uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 border-none"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                No Stock
                              </button>
                            )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-0 z-[999] bg-dark/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`} onClick={() => setMobileFiltersOpen(false)} />

        {/* Mobile Sidebar Drawer */}
        <div className={`fixed top-0 right-0 bottom-0 z-[1000] w-80 max-w-[85vw] bg-white border-l border-[#E8E5DC] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col p-6 lg:hidden ${mobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="flex justify-between items-center pb-4 border-b border-[#E8E5DC] mb-6">
            <h3 className="font-sans text-xs uppercase tracking-widest text-dark font-black">Catalog Filters</h3>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-1 rounded-full hover:bg-neutral-100 text-dark border-none bg-transparent cursor-pointer flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-8 pr-1 scrollbar-none">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setFilterSizes([])
                  setFilterColors([])
                  setFilterPrice(maxProductPrice)
                  setFilterAvailability('all')
                  setMobileFiltersOpen(false)
                }}
                className="text-[10px] text-red-500 hover:text-red-700 underline font-sans cursor-pointer border-none bg-transparent"
              >
                Reset All
              </button>
            </div>
            {renderFiltersContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
