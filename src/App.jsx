import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Helpline from './pages/Helpline'
import Policies from './pages/Policies'
import Auth from './pages/Auth'
import Checkout from './pages/Checkout'
import Wishlist from './pages/Wishlist'
import Admin from './pages/Admin'
import BagAnimationOverlay from './components/BagAnimationOverlay'
import Customizer from './pages/Customizer'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'

import MyOrders from './pages/MyOrders'
import ResetPassword from './pages/ResetPassword'

function App() {
  
  const location = useLocation()
  const isCustomizer = location.pathname === '/customizer'
  const isAdmin = location.pathname === '/admin'
  const isHome = location.pathname === '/'

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname, location.search])

  return (
    <div className="flex flex-col min-h-screen bg-cream text-dark">

      
      {!isCustomizer && !isAdmin && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/helpline" element={<Helpline />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/customizer" element={<Customizer />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
      </main>
      {!isCustomizer && !isAdmin && <Footer />}
      <BagAnimationOverlay />
    </div>
  )
}

export default App
