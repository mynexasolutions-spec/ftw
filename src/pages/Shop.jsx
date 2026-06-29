import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { getProducts, getProductRating, getCategories } from '../lib/supabase'
import { ShoppingBag, Eye, Upload, Palette, Calculator, Check, ArrowRight, ShieldAlert, Heart, SlidersHorizontal, X, Star } from 'lucide-react'

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

// High-fidelity vector preview of blank crewneck streetwear t-shirts (Front and Back)
function TShirtVector({ color, side }) {
  const fill = color === 'Black' ? '#161616' : color === 'White' ? '#FAF9F6' : '#F5F2E9'
  const stroke = color === 'Black' ? '#2A2A2A' : color === 'White' ? '#E6E4DD' : '#E2DEC8'
  const creaseColor = color === 'Black' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const shadowColor = color === 'Black' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'

  return (
    <svg viewBox="0 0 400 450" className="w-full h-full select-none pointer-events-none drop-shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
      {/* Dynamic base t-shirt shape outline */}
      <path
        d="M 120 40 
           C 150 40, 155 58, 200 58 
           C 245 58, 250 40, 280 40
           L 380 90
           L 345 190
           L 300 178
           L 305 420
           L 95 420
           L 100 178
           L 55 190
           L 20 90 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Crewneck Ribbed Collar */}
      {side === 'front' ? (
        <>
          <path
            d="M 120 40 C 150 64, 250 64, 280 40"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M 120 40 C 150 60, 250 60, 280 40"
            fill="none"
            stroke={creaseColor}
            strokeWidth="2.5"
          />
        </>
      ) : (
        <>
          <path
            d="M 120 40 C 150 46, 250 46, 280 40"
            fill="none"
            stroke={stroke}
            strokeWidth="5.5"
          />
          <path
            d="M 120 40 C 150 45, 250 45, 280 40"
            fill="none"
            stroke={creaseColor}
            strokeWidth="2"
          />
          <path
            d="M 100 85 C 200 110, 300 85, 300 85"
            fill="none"
            stroke={creaseColor}
            strokeWidth="1"
            strokeDasharray="4 3"
          />
        </>
      )}

      {/* Drop Shoulder seam lines */}
      <path d="M 100 80 L 100 178" fill="none" stroke={creaseColor} strokeWidth="1" />
      <path d="M 300 80 L 300 178" fill="none" stroke={creaseColor} strokeWidth="1" />

      {/* Shoulder stitching */}
      <path d="M 120 40 L 100 80" fill="none" stroke={creaseColor} strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 280 40 L 300 80" fill="none" stroke={creaseColor} strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Sleeve Hem stitching lines */}
      <path d="M 55 190 L 28 108" fill="none" stroke={creaseColor} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M 345 190 L 372 108" fill="none" stroke={creaseColor} strokeWidth="1" strokeDasharray="3 3" />

      {/* Bottom Hem stitching */}
      <path d="M 95 410 L 305 410" fill="none" stroke={creaseColor} strokeWidth="1" strokeDasharray="3 2" />

      {/* Armpit and Side fold creases for realistic depth */}
      <path d="M 100 178 Q 115 190, 130 185" fill="none" stroke={shadowColor} strokeWidth="1.5" />
      <path d="M 300 178 Q 285 190, 270 185" fill="none" stroke={shadowColor} strokeWidth="1.5" />
      <path d="M 100 130 Q 120 140, 125 155" fill="none" stroke={shadowColor} strokeWidth="1" opacity="0.7" />
      <path d="M 300 130 Q 280 140, 275 155" fill="none" stroke={shadowColor} strokeWidth="1" opacity="0.7" />
    </svg>
  )
}

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

  // DTF Pre-selection states
  const [customStyle, setCustomStyle] = useState('regular')
  const [customColor, setCustomColor] = useState('White')

  // DTF Config state
  const CLIENT_PRESETS = {
    CN001: {
      name: 'Vanguard Core Classic',
      pdf: 'FTW_TS_CN001.pdf',
      color: 'Black',
      position: 'Front Center',
      technique: 'Cut & Sew + High-Density Screen Print',
      fabric: '240 GSM Heavy Cotton',
      content: '100% Cotton',
      preview: '/images/1.1.jpeg'
    },
    CN002: {
      name: 'Cyber Sigil Reflective',
      pdf: 'FTW_TS_CN002.pdf',
      color: 'Black',
      position: 'Front Center',
      technique: 'Screen Print + Reflective Neon Overlay',
      fabric: '260 GSM French Terry',
      content: '100% Cotton',
      preview: '/images/2.1.jpeg'
    },
    CN003: {
      name: 'Sunset Meditation Art',
      pdf: 'FTW_TS_CN003.pdf',
      color: 'Cream',
      position: 'Large Back',
      technique: 'Screen Print + Puff Print Art',
      fabric: '220 GSM French Terry',
      content: '100% Cotton',
      preview: '/images/design_cn003.png'
    },
    CN004: {
      name: 'Minimalist Debossed Monogram',
      pdf: 'FTW_TS_CN004.pdf',
      color: 'Cream',
      position: 'Left Chest',
      technique: 'Debossed Rubber Logo',
      fabric: '240 GSM Soft Compact Cotton',
      content: '100% Cotton',
      preview: '/images/4.1.jpeg'
    },
    CN005: {
      name: 'Gaming Controller Lossless Art',
      pdf: 'FTW_TS_CN005.pdf',
      color: 'Cream',
      position: 'Large Back',
      technique: 'Cut & Sew + Screen Print + Puff Print + Contrast Neck Band',
      fabric: '220 GSM French Terry',
      content: '100% Cotton',
      preview: '/images/design_cn005.png'
    }
  }

  const [dtfSourceType, setDtfSourceType] = useState('custom')
  const [dtfColor, setDtfColor] = useState('Black')
  const [dtfSize, setDtfSize] = useState('M')
  const [dtfQty, setDtfQty] = useState(1)
  const [dtfUploadedFile, setDtfUploadedFile] = useState(null)
  const [dtfArtwork, setDtfArtwork] = useState('Front Center')
  const [dtfPreviewUrl, setDtfPreviewUrl] = useState(null)

  // Drag-and-scale canvas customization states (Dual-Sided Crewneck Blanks)
  const [activeSide, setActiveSide] = useState('front') // 'front' | 'back'
  const [frontPrintSize, setFrontPrintSize] = useState(112)
  const [frontPrintRotation, setFrontPrintRotation] = useState(0)
  const [frontPreviewUrl, setFrontPreviewUrl] = useState(null)
  const [frontUploadedFile, setFrontUploadedFile] = useState(null)

  const [backPrintSize, setBackPrintSize] = useState(112)
  const [backPrintRotation, setBackPrintRotation] = useState(0)
  const [backPreviewUrl, setBackPreviewUrl] = useState(null)
  const [backUploadedFile, setBackUploadedFile] = useState(null)

  const mockupContainerRef = useRef(null)

  const baseDtfPrice = 1499
  const printDtfPrice = 500
  const totalDtfEstimate = (baseDtfPrice + printDtfPrice) * dtfQty

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (activeSide === 'front') {
        setFrontUploadedFile(file.name)
        setFrontPreviewUrl(url)
      } else {
        setBackUploadedFile(file.name)
        setBackPreviewUrl(url)
      }
      toast.success(`Design "${file.name}" applied to T-shirt ${activeSide}!`, {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
    }
  }

  const handleOrderDtf = () => {
    if (dtfSourceType === 'custom' && !frontPreviewUrl && !backPreviewUrl) {
      toast.error("Please upload or drag a design file to the front or back first.", {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return
    }

    const isPreset = dtfSourceType !== 'custom'
    const preset = isPreset ? CLIENT_PRESETS[dtfSourceType] : null

    let printDetails = ''
    if (!isPreset) {
      let details = []
      if (frontPreviewUrl) {
        details.push(`Front: Size ${Math.round((frontPrintSize / 112) * 100)}% / Rot: ${frontPrintRotation}°`)
      }
      if (backPreviewUrl) {
        details.push(`Back: Size ${Math.round((backPrintSize / 112) * 100)}% / Rot: ${backPrintRotation}°`)
      }
      printDetails = ` (${details.join(' | ')})`
    }

    const customProduct = {
      id: isPreset ? `client-preset-${dtfSourceType}-${Date.now()}` : `custom-dtf-${Date.now()}`,
      name: isPreset
        ? `Client Design Preset (${preset.pdf})`
        : `Custom DTF Tee (${dtfColor}${printDetails})`,
      price: baseDtfPrice + printDtfPrice,
      image: isPreset
        ? (dtfSourceType === 'CN003' || dtfSourceType === 'CN005' ? `/images/design_cn003.png` : preset.preview)
        : (dtfColor === 'Black'
          ? '/images/1.1.jpeg'
          : '/images/2.1.jpeg')
    }

    for (let i = 0; i < dtfQty; i++) {
      addToCart(customProduct, dtfSize)
    }

    toast.success(
      isPreset
        ? `${dtfQty}x Client Design "${preset.pdf}" added to bag!`
        : `${dtfQty}x Custom DTF Print T-shirts added to bag!`,
      { style: { background: '#0B0B0B', color: '#FFFFFF' } }
    )
  }

  const renderFiltersContent = () => {
    return (
      <>
        {/* Filter Size */}
        <div>
          <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-[0.15em] font-black block mb-3">Size</span>
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
                  className={`w-9 h-9 border text-[10px] font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold ${isSelected
                      ? 'bg-dark border-dark text-[#D6FF40] shadow-md'
                      : 'border-[#E8E5DC] text-dark2/70 hover:bg-[#F5F3EC] hover:border-dark/20 bg-white'
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
          <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-[0.15em] font-black block mb-3">Color</span>
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
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer ${isSelected
                      ? 'bg-dark border-dark text-[#D6FF40] font-black shadow-sm'
                      : 'border-[#E8E5DC] text-dark2/60 hover:bg-[#F5F3EC] bg-white'
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
            <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-[0.15em] font-black">Max Price</span>
            <span className="text-[11px] text-dark font-mono font-black">₹{filterPrice.toLocaleString()}</span>
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
            <span className="text-[8px] font-mono text-dark2/30">₹{minProductPrice}</span>
            <span className="text-[8px] font-mono text-dark2/30">₹{maxProductPrice}</span>
          </div>
        </div>

        {/* Availability */}
        <div>
          <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-[0.15em] font-black block mb-3">Availability</span>
          <div className="flex flex-col gap-1.5">
            {[
              { key: 'all', label: 'Show All', icon: '◉' },
              { key: 'in-stock', label: 'In Stock Only', icon: '✓' },
              { key: 'out-of-stock', label: 'Sold Out Archive', icon: '✗' }
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilterAvailability(opt.key)}
                className={`w-full py-2.5 px-3.5 border text-left rounded-xl transition-all cursor-pointer flex items-center gap-2 ${filterAvailability === opt.key
                    ? 'bg-dark border-dark text-[#D6FF40] font-black shadow-sm'
                    : 'border-[#E8E5DC] text-dark2/60 hover:bg-[#F5F3EC] bg-white'
                  }`}
              >
                <span className="text-[10px] font-mono">{opt.icon}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="bg-[#FAF9F6] text-[#161616] min-h-screen relative overflow-hidden font-sans bg-grid-dots bg-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-8 sm:pt-4 sm:pb-12 text-dark">

      {/* Page Header */}
      <div className="mb-8 sm:mb-10">
        <span className="text-[10px] text-accent font-mono uppercase tracking-[0.2em] font-black">ForTheWin Studio</span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-dark mt-1 leading-none">
          THE <span className="text-orange-500 italic transform skew-x-3 inline-block">CATALOG</span>
        </h1>
        <p className="text-xs text-dark2/50 mt-1.5 font-sans">Premium streetwear, limited runs & custom DTF printing.</p>
      </div>

      {/* Category Navigation Tabs */}
      <div className="w-full mb-8 sm:mb-10">
        <div className="flex overflow-x-auto gap-2 pb-1 scroll-smooth no-scrollbar select-none">
          {[
            { key: 'all', label: 'All Catalog' },
            ...dbCategories
              .filter(cat => !['custom dtf', 'dtf', 'custom+dtf'].includes(cat.name?.toLowerCase()))
              .map(cat => ({ key: cat.name, label: cat.name })),
            { key: 'Custom DTF', label: '\u2726 Custom DTF' }
          ].map(tab => {
            const isTabActive = activeTab === tab.key || (tab.key === 'Custom DTF' && (activeTab === 'dtf' || activeTab === 'Custom+DTF'));
            const isDTF = tab.key === 'Custom DTF';
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`px-4 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-widest rounded-xl transition-all duration-200 shrink-0 cursor-pointer border whitespace-nowrap ${isTabActive
                    ? isDTF
                      ? 'bg-accent border-accent text-dark shadow-lg shadow-accent/25'
                      : 'bg-dark border-dark text-[#D6FF40] shadow-lg shadow-dark/20'
                    : isDTF
                      ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50'
                      : 'bg-transparent border-transparent text-[#888] hover:text-dark'
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
          <Link to="/" className="inline-block px-7 py-3 bg-dark text-[#D6FF40] text-[11px] font-sans font-bold uppercase tracking-widest rounded-xl hover:bg-accent hover:text-dark transition-all">Go Home</Link>
        </div>
      ) : (activeTab === 'dtf' || activeTab === 'Custom DTF' || activeTab === 'Custom+DTF') ? (
        /* Customizer Studio — Light Theme matching Home.jsx */
        <div className="space-y-8 animate-fadeIn">
          <div className="relative bg-white border border-[#E8E5DC] rounded-3xl p-6 sm:p-10 md:p-14 overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
            {/* Decorative blobs */}
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-dark/5 rounded-full blur-3xl pointer-events-none" />

            <span className="relative z-10 inline-flex items-center gap-2 bg-accent/15 text-accent border border-accent/30 font-mono uppercase tracking-[0.2em] text-[9px] sm:text-[10px] font-black px-4 py-2 rounded-full mb-4">
              <Palette className="w-3 h-3" /> FTW Customizer Studio
            </span>
            <h2 className="relative z-10 font-display text-3xl sm:text-4xl md:text-6xl font-black uppercase text-dark tracking-tight mb-4 leading-none">
              Create Your<br /><span className="text-accent">Custom Drop</span>
            </h2>
            <p className="relative z-10 text-[12px] sm:text-sm text-dark/50 max-w-lg mx-auto mb-10 leading-relaxed font-sans">
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
                  className="bg-white/90 backdrop-blur-md border border-[#E8E5DC] rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-6 text-left group hover:border-accent hover:shadow-[0_20px_50px_rgba(214,255,64,0.12)] hover:-translate-y-1.5 transition-all duration-500 cursor-default flex flex-col justify-between relative overflow-hidden min-h-[165px] sm:min-h-[190px]"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-5">
                      <div className="p-2 sm:p-3 bg-[#F5F3EC] text-dark rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-dark group-hover:text-[#D6FF40] group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                        <s.icon className="w-4 h-4 sm:w-5 h-5" />
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-widest text-dark/40 bg-neutral-100/80 border border-neutral-200/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full group-hover:bg-accent/15 group-hover:text-accent group-hover:border-accent/25 transition-all duration-300">
                        STEP {s.step}
                      </span>
                    </div>
                    <h4 className="font-display text-xs sm:text-sm font-black uppercase tracking-wide text-dark mb-1 sm:mb-2.5 group-hover:text-accent transition-colors duration-300">
                      {s.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-dark/50 group-hover:text-dark/70 font-sans leading-relaxed transition-colors duration-300">
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
                className="w-fit px-6 sm:px-8 py-3.5 sm:py-4 bg-dark text-[#D6FF40] hover:bg-accent hover:text-dark transition-all duration-300 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(214,255,64,0.25)] flex items-center justify-center gap-2 cursor-pointer border-none text-center decoration-none"
              >
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                Launch Customizer Studio
              </Link>
              <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
                <span className="text-[9px] text-dark/40 font-mono uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span> No minimum order
                </span>
                <span className="text-[9px] text-dark/40 font-mono uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span> High-density DTF print
                </span>
                <span className="text-[9px] text-dark/40 font-mono uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span> Ships in 7–10 days
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : loadingProducts ? (
        <div className="text-center py-28 font-sans text-dark2/50 text-xs">
          <div className="w-8 h-8 border-2 border-dark/20 border-t-dark rounded-full animate-spin mx-auto mb-4" />
          <span className="font-mono uppercase tracking-widest text-[10px]">Loading catalog...</span>
        </div>
      ) : (
        /* Regular Shop Layout with Filters */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Side Filters Panel (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1 bg-white border border-[#E8E5DC] rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-[#EDEADE]">
              <span className="text-[10px] text-dark2/40 font-mono uppercase tracking-widest font-black">Refine Results</span>
            </div>
            <div className="p-5 space-y-7">
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
              <SlidersHorizontal className="w-3.5 h-3.5 text-dark" />
              Filter Products
            </button>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white border border-[#E8E5DC] rounded-3xl font-sans shadow-sm">
                <span className="text-3xl block mb-4">🔍</span>
                <p className="text-xs text-dark2/50">No products match your filters. Try adjusting your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-5">
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
                      className="bg-white border border-[#E8E5DC] rounded-2xl sm:rounded-3xl overflow-hidden hover:border-dark/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between group/card"
                    >
                      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] bg-[#F5F3EC] overflow-hidden block">
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                        />
                        {product.tag && (
                          <span className={`absolute top-3 left-3 text-[8px] font-mono uppercase tracking-widest font-black px-2.5 py-1.5 rounded-lg shadow-sm ${product.tag.includes('OFF') || product.tag.includes('Sale') ? 'bg-accent text-dark' : 'bg-dark text-[#D6FF40]'
                            }`}>
                            {product.tag}
                          </span>
                        )}

                        {/* Rating Badge */}
                        <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-dark border border-white/60 flex items-center gap-1 shadow-sm z-10">
                          <Star className="w-3 h-3 fill-accent text-accent shrink-0" />
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
                          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md border border-white/60 flex items-center justify-center hover:scale-110 transition-all cursor-pointer shadow-sm"
                          title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(product.id) ? 'fill-accent text-accent' : 'text-dark/50'}`} />
                        </button>

                        {!product.available && (
                          <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-dark text-[#D6FF40] px-3 py-1.5 rounded-lg text-[9px] uppercase font-mono tracking-widest font-black shadow-md">SOLD OUT</span>
                          </div>
                        )}
                      </Link>

                      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
                        <div>
                          {/* Name + Price */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="font-sans text-[11px] sm:text-sm font-bold text-dark leading-snug">{product.name}</h3>
                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-[11px] sm:text-sm font-mono font-black text-dark">₹{displayPrice}</span>
                              {displayOriginalPrice && (
                                <span className="text-[9px] line-through font-mono" style={{ color: '#aaa' }}>₹{displayOriginalPrice}</span>
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
                              <span className="text-[9px] text-dark2/40 font-mono uppercase tracking-widest block">Pick a Size</span>
                              <div className="flex flex-wrap gap-1 justify-center">
                                {(Array.isArray(product.sizes) ? product.sizes : (product.sizes ? String(product.sizes).split(',').map(s => s.trim()) : [])).map(sz => (
                                  <button
                                    key={sz}
                                    onClick={() => {
                                      addToCart(product, sz)
                                      toast.success(`${product.name} [${sz}] added!`, { style: { background: '#161616', color: '#FAF9F6' } })
                                      setSelectingSizeProduct(null)
                                    }}
                                    className="h-7 px-2.5 border border-dark text-dark hover:bg-dark hover:text-[#D6FF40] transition-all text-[9px] font-mono font-black rounded-lg cursor-pointer bg-transparent"
                                  >
                                    {sz}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setSelectingSizeProduct(null)}
                                  className="h-7 px-2 border border-dark/15 text-dark/30 hover:border-red-400 hover:text-red-400 transition-all text-[9px] font-mono font-bold rounded-lg cursor-pointer bg-transparent"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : isComingSoon ? (
                            <button
                              disabled
                              className="w-full h-9 px-4 bg-amber-50/50 text-amber-700/60 border border-amber-200/50 text-[9px] font-mono font-bold uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              Coming Soon
                            </button>
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
                              className="w-full h-9 sm:h-10 px-2 bg-dark text-[#D6FF40] hover:bg-accent hover:text-dark transition-all duration-200 text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none"
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
      <div className={`fixed top-0 right-0 bottom-0 z-[1000] w-80 max-w-[85vw] bg-white border-l border-cream3 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col p-6 lg:hidden ${mobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex justify-between items-center pb-4 border-b border-cream3 mb-6">
          <h3 className="font-sans text-xs uppercase tracking-widest text-dark font-black">Catalog Filters</h3>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="p-1 rounded-full hover:bg-cream2 text-dark border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-8 pr-1 scrollbar-none">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setFilterSize('all')
                setFilterColor('all')
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
