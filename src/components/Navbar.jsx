import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { ShoppingBag, X, Trash2, User, Menu, Heart, LogOut, Home, ShoppingCart, Info, HelpCircle, Shield, Package, Palette, Minus, Plus, Lock, Search, BookOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { getStoreSettings } from '../lib/supabase'

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

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { items, removeFromCart, updateQty, cartCount, cartTotal, cartOpen, setCartOpen } = useCart()
  const { user, isAdmin, signOut } = useAuth()
  const { wishlistCount } = useWishlist()

  const [searchParams] = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const q = searchParams.get('search') || ''
    setSearchQuery(q)
    if (q) setSearchOpen(true)
  }, [searchParams])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const [dbSettings, setDbSettings] = useState({
    shipping_threshold: 1499,
    shipping_flat_rate: 99
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsData = await getStoreSettings()
        if (settingsData) setDbSettings(settingsData)
      } catch (e) {
        console.error("Cart drawer settings load failed:", e)
      }
    }
    loadSettings()
  }, [])

  const location = useLocation()
  const isHome = location.pathname === '/'
  const [revealed, setRevealed] = useState(!isHome)

  useEffect(() => {
    if (isHome) {
      setRevealed(false)
      const timer = setTimeout(() => {
        setRevealed(true)
      }, 2250)
      return () => clearTimeout(timer)
    } else {
      setRevealed(true)
    }
  }, [isHome, location.pathname])

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Successfully logged out!', {
        style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }
      })
      navigate('/')
    } catch (err) {
      toast.error('Logout failed: ' + err.message)
    }
  }

  // Generate navigation links dynamically based on admin status
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/customizer', label: '+ Custom Tee' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/about', label: 'About Us' },
    { path: '/helpline', label: 'Helpline' }
  ]



  return (
    <>
      <header className={
        isHome
          ? `transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] px-6 py-3.5 z-40 fixed top-0 left-0 right-0 ${revealed
            ? 'bg-white/95 backdrop-blur-md'
            : 'bg-transparent'
          }`
          : 'sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#8B5CF6]/30 px-6 py-3.5'
      }>
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group select-none relative h-10">
            <img src="/images/ftw-logo.webp" alt="For The Win Logo" className="h-[64px] w-auto object-contain transition-all duration-300 group-hover:scale-105 absolute top-1/2 -translate-y-1/2 left-0" style={{ maxWidth: 'none' }} />
            <span className="font-display text-[13px] leading-none tracking-[0.22em] font-black uppercase transition-colors duration-300 pl-20 flex items-center gap-1 text-gray-900">
              <span>FOR THE</span>
              <span className="text-purple-600 italic transform -skew-x-6 inline-block">WIN</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className={`hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider font-sans transition-opacity duration-700 ${isHome && !revealed ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `relative py-1.5 hover:text-purple-600 transition-colors duration-300 font-extrabold ${isActive ? 'text-blue-600 font-black' : 'text-gray-800'
                  }`}
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600"
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Cart Icon & Avatar & Wishlist — Desktop only */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {/* Desktop Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center h-9 justify-end">
                <div
                  className="overflow-hidden flex items-center absolute right-full mr-2 transition-all duration-300 origin-right"
                  style={{ width: searchOpen ? '180px' : '0px', opacity: searchOpen ? 1 : 0 }}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search drops..."
                    className="h-9 px-3 rounded-lg border text-xs font-mono bg-cream2 border-cream3 text-dark focus:outline-none focus:border-purple-600 w-[180px]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        const newParams = new URLSearchParams(searchParams)
                        newParams.delete('search')
                        navigate({ pathname: '/shop', search: newParams.toString() })
                      }}
                      className="absolute right-2 text-dark2/45 hover:text-dark p-1 cursor-pointer flex items-center justify-center bg-transparent border-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (searchOpen) {
                      if (searchQuery.trim()) {
                        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
                      } else {
                        setSearchOpen(false)
                      }
                    } else {
                      setSearchOpen(true)
                    }
                  }}
                  className="p-2 text-gray-700 hover:text-purple-600 transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none shrink-0"
                  title="Search Catalog"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {!user ? (
                <Link
                  to="/auth"
                  className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none group"
                  title="Auth Access"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 select-none">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-[0_2px_10px_rgba(139,92,246,0.3)] hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/my-orders"
                    className="px-3.5 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span>Orders</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-950 text-white rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] border-none cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <Link
                  to="/wishlist"
                  className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none group"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none group"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </div>

            {/* Mobile Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCartOpen(true)}
              className={
                isHome && !revealed
                  ? "md:hidden relative p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer text-cream"
                  : "md:hidden relative p-2.5 hover:bg-cream3 rounded-full border border-cream3/50 flex items-center justify-center cursor-pointer text-dark"
              }
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-dark text-primary text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-cream shadow-neon"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Hamburger button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen(true)}
              className={
                isHome && !revealed
                  ? "md:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer text-cream"
                  : "md:hidden p-2.5 hover:bg-cream3 rounded-full border border-cream3/50 flex items-center justify-center cursor-pointer text-dark"
              }
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          onClick={() => setCartOpen(false)}
          className="absolute inset-0 bg-dark/65 backdrop-blur-md"
        />

        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#FAF9F6]/95 backdrop-blur-xl border-l border-[#E8E5DC] shadow-2xl bg-grain flex flex-col transition-transform duration-300 transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E8E5DC] flex justify-between items-center bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="font-display text-base uppercase tracking-wider font-black text-dark">Drop Bag ({cartCount})</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCartOpen(false)}
              className="p-2 rounded-full hover:bg-purple-600 hover:text-white text-dark transition-all duration-300 border-none cursor-pointer flex items-center justify-center bg-transparent"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Items */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .cart-items-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .cart-items-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .cart-items-scroll::-webkit-scrollbar-thumb {
                background: #8B5CF6;
                border-radius: 9999px;
              }
              .cart-items-scroll::-webkit-scrollbar-thumb:hover {
                background: #7C3AED;
              }
            `
          }} />
          <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 cart-items-scroll">
            {items.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-20 font-sans">
                <div className="w-16 h-16 rounded-full bg-[#F5F3EC] flex items-center justify-center text-dark/30 mb-4 border border-[#E8E5DC]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-wider mb-2">Drop bag is empty</h3>
                <Link
                  to="/shop"
                  onClick={() => { setCartOpen(false); }}
                  className="px-6 py-3 bg-dark text-[#D6FF40] font-bold uppercase tracking-widest text-xs rounded hover:bg-purple-600 hover:text-white transition-all font-mono inline-block text-center decoration-none"
                >
                  Shop drop series
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const standardProductId = item.id && item.id.startsWith('ftw-') ? (item.id.split('-').length >= 4 ? item.id.split('-').slice(0, -2).join('-') : item.id) : null;
                return (
                  <div
                    key={`${item.id}-${item.size}-${item.color || ''}`}
                    className="flex gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#E8E5DC] shadow-sm hover:shadow-md hover:border-purple-600/30 transition-all duration-300 group"
                  >
                    {standardProductId ? (
                      <Link
                        to={`/product/${standardProductId}`}
                        onClick={() => setCartOpen(false)}
                        className="w-16 h-20 overflow-hidden rounded-xl border border-[#E8E5DC] bg-[#FAF9F6] shrink-0 block"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform" />
                      </Link>
                    ) : (
                      <div className="w-16 h-20 overflow-hidden rounded-xl border border-[#E8E5DC] bg-[#FAF9F6] shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                      </div>
                    )}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          {standardProductId ? (
                            <Link
                              to={`/product/${standardProductId}`}
                              onClick={() => setCartOpen(false)}
                              className="group block decoration-none flex-grow min-w-0"
                            >
                              <h4 className="font-bold text-sm uppercase font-sans text-dark group-hover:text-purple-600 transition-colors">{item.name}</h4>
                            </Link>
                          ) : (
                            <h4 className="font-bold text-sm uppercase font-sans text-dark flex-grow">{item.name}</h4>
                          )}
                          <span className="text-sm font-mono font-black text-dark shrink-0">₹{item.price * item.qty}</span>
                        </div>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                          <span className="inline-block text-[11px] bg-dark text-[#D6FF40] px-2 py-0.5 rounded-lg font-mono font-black uppercase">
                            SIZE: {item.size}
                          </span>
                          {item.color && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#E8E5DC]/80 text-dark px-2.5 py-0.5 rounded-lg font-mono font-black uppercase">
                              <span
                                style={{ backgroundColor: getColorHex(item.color) }}
                                className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0"
                              />
                              COLOR: {item.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-1.5 border border-[#E8E5DC] rounded-xl bg-[#FAF9F6]/60 p-0.5">
                          <button
                            onClick={() => updateQty(item.id, item.size, item.color, item.qty - 1)}
                            className="w-5 h-5 rounded-lg text-dark hover:bg-[#F5F3EC] hover:text-purple-600 border-none bg-transparent cursor-pointer font-bold flex items-center justify-center text-xs transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-mono font-black px-1 min-w-[12px] text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}
                            className="w-5 h-5 rounded-lg text-dark hover:bg-[#F5F3EC] hover:text-purple-600 border-none bg-transparent cursor-pointer font-bold flex items-center justify-center text-xs transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="text-dark/30 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E8E5DC] bg-white/70 backdrop-blur-md font-sans">
              {/* Shipping Threshold Progress */}
              <div className="mb-4 pb-4 border-b border-[#E8E5DC]/60 font-mono text-xs">
                {cartTotal >= dbSettings.shipping_threshold ? (
                  <div className="flex items-center gap-2 text-green-700 font-bold uppercase tracking-wider text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    You qualify for free shipping!
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] uppercase font-black tracking-wider text-dark2/50">
                      <span>Free Shipping Goal</span>
                      <span>Add <span className="font-extrabold text-dark">₹{dbSettings.shipping_threshold - cartTotal}</span> more</span>
                    </div>
                    <div className="w-full h-2 bg-[#F5F3EC]/60 border border-[#E8E5DC]/30 rounded-full overflow-hidden shadow-inner p-[1px]">
                      <div
                        style={{ width: `${Math.min((cartTotal / dbSettings.shipping_threshold) * 100, 100)}%` }}
                        className="h-full bg-gradient-to-r from-dark via-dark/90 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mb-4 border-b border-[#E8E5DC]/60 pb-3">
                <span className="font-display font-black text-sm uppercase tracking-widest text-dark">Total Value</span>
                <span className="text-lg font-mono font-black text-dark">₹{cartTotal}</span>
              </div>

              <Link
                to="/checkout"
                onClick={(e) => {
                  setCartOpen(false)
                  if (!user) {
                    e.preventDefault()
                    toast.error("Please login to proceed to checkout!", {
                      id: 'auth-required-cart-checkout',
                      style: { background: '#161616', color: '#FAF9F6' }
                    })
                    navigate('/auth?redirect=/checkout')
                  }
                }}
                className="w-full py-4 bg-dark hover:bg-purple-600 hover:text-white text-[#D6FF40] font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-xl border border-dark hover:border-purple-600 transition-all duration-300 cursor-pointer decoration-none"
              >
                <Lock className="w-3.5 h-3.5" />
                Secure Checkout
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-dark/40 backdrop-blur-xs"
        />

        {/* Sidebar Panel (slides in from right) */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-[340px] bg-[#FAF9F6] border-l border-[#E8E5DC] shadow-2xl flex flex-col transition-transform duration-300 transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-[#E8E5DC] flex justify-between items-center bg-white h-[72px]">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 group select-none relative h-10 flex-grow"
            >
              <img
                src="/images/ftw-logo.webp"
                alt="For The Win Logo"
                className="h-[55px] w-auto object-contain transition-all duration-300 group-hover:scale-105 absolute top-1/2 -translate-y-1/2 left-0"
                style={{ maxWidth: 'none' }}
              />
              <span className="font-display text-[11px] leading-none tracking-[0.22em] font-black uppercase text-gray-900 pl-16 flex items-center gap-1">
                <span>FOR THE</span>
                <span className="text-[#8B5CF6] italic transform -skew-x-6 inline-block">WIN</span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1 rounded-full hover:bg-neutral-100 text-gray-700 transition-all border-none bg-transparent cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-grow p-6 flex flex-col gap-6 font-mono text-sm font-bold uppercase tracking-wider overflow-y-auto">
            {/* Mobile Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
                  setMenuOpen(false)
                }
              }}
              className="relative flex items-center w-full"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH CATALOG..."
                className="w-full h-10 pl-10 pr-10 rounded-xl border text-[11px] font-mono tracking-wider bg-[#F5F3EC]/80 border-[#E8E5DC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8B5CF6]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('search')
                    navigate({ pathname: '/shop', search: newParams.toString() })
                  }}
                  className="absolute right-3 text-gray-400 hover:text-gray-700 p-1 cursor-pointer flex items-center justify-center bg-transparent border-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Collector Profile Card */}
            {user ? (
              <div className="bg-white text-gray-800 rounded-2xl py-4.5 px-4 mb-2 flex items-center gap-3 border border-[#E8E5DC] shadow-sm relative">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center font-display font-black text-sm uppercase tracking-tight shrink-0 shadow-sm z-10">
                  {user.user_metadata?.full_name ? user.user_metadata.full_name[0] : (user.email ? user.email[0] : 'U')}
                </div>
                <div className="min-w-0 flex-1 z-10">
                  <span className="text-[11px] font-mono text-[#8B5CF6] uppercase tracking-widest block font-black mb-0.5">PROFILE</span>
                  <h4 className="text-[14px] font-black uppercase tracking-tight text-gray-900 truncate leading-tight">
                    {user.user_metadata?.full_name || 'STREETWEAR COLLECTOR'}
                  </h4>
                  <p className="text-[12px] font-mono text-gray-500 truncate mt-1 normal-case tracking-normal leading-normal font-normal">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E8E5DC] rounded-2xl p-4 mb-2 flex flex-col gap-2.5">
                <div>
                  <h4 className="text-[12.5px] font-mono font-black uppercase text-gray-800 tracking-widest">LOCK IN YOUR FIT</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-mono uppercase mt-1">LOG IN FOR EXCLUSIVE COLLECTION DROPS & DESIGN VAULT</p>
                </div>
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-mono font-black text-[11px] uppercase tracking-wider rounded-xl text-center shadow-xs block"
                >
                  Log In / Register
                </Link>
              </div>
            )}

            {(() => {
              const mobileNavItems = [
                { path: '/', label: 'Home', icon: Home },
                { path: '/shop', label: 'Shop', icon: ShoppingBag },
                { path: '/customizer', label: 'Custom Tee', icon: Palette },
                { path: '/blogs', label: 'Blogs', icon: BookOpen },
                { path: '/wishlist', label: `Wishlist ${wishlistCount > 0 ? `(${wishlistCount})` : ''}`, icon: Heart },
              ]
              return mobileNavItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `hover:text-[#8B5CF6] transition-colors duration-300 flex items-center gap-3 ${isActive ? 'text-[#8B5CF6] font-black' : 'text-gray-800'}`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })
            })()}

            {/* Cart Link in Mobile Menu */}
            <button
              onClick={() => {
                setMenuOpen(false)
                setCartOpen(true)
              }}
              className="text-left hover:text-[#8B5CF6] transition-colors duration-300 font-bold uppercase tracking-wider border-none bg-transparent cursor-pointer font-mono text-sm p-0 text-gray-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span>Cart {cartCount > 0 ? `(${cartCount})` : ''}</span>
              </div>
            </button>

            {(() => {
              const mobileNavItems2 = [
                { path: '/about', label: 'About Us', icon: Info },
                { path: '/helpline', label: 'Helpline', icon: HelpCircle }
              ]
              return mobileNavItems2.map((item) => {
                const IconComponent = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `hover:text-[#8B5CF6] transition-colors duration-300 flex items-center gap-3 ${isActive ? 'text-[#8B5CF6] font-black' : 'text-gray-800'}`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })
            })()}

            <div className="border-t border-[#E8E5DC] pt-4 mt-2 space-y-4">
              {user && (
                <>
                  {isAdmin ? (
                    <div className="grid grid-cols-2 gap-4">
                      <NavLink
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="text-[#8B5CF6] font-black hover:text-[#7C3AED] transition-colors duration-300 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                        <span className="whitespace-nowrap">Admin Panel</span>
                      </NavLink>
                      <NavLink
                        to="/my-orders"
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) => `hover:text-[#8B5CF6] transition-colors duration-300 flex items-center gap-2 ${isActive ? 'text-[#8B5CF6] font-black' : 'text-gray-800'}`}
                      >
                        <Package className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">My Orders</span>
                      </NavLink>
                    </div>
                  ) : (
                    <NavLink
                      to="/my-orders"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) => `hover:text-[#8B5CF6] transition-colors duration-300 flex items-center gap-3 ${isActive ? 'text-[#8B5CF6] font-black' : 'text-gray-800'}`}
                    >
                      <Package className="w-4 h-4 shrink-0" />
                      <span>My Orders</span>
                    </NavLink>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setMenuOpen(false)
                    }}
                    className="text-left text-[#8B5CF6] hover:text-[#7C3AED] transition-colors duration-300 font-bold uppercase tracking-wider border-none bg-transparent cursor-pointer font-mono text-sm p-0 w-full flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
