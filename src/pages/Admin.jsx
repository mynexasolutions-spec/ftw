import { useState, useEffect } from 'react'
import { getProducts, getOrders, getInquiries, insertProduct, updateProduct, deleteProduct, updateOrderStatus, insertInquiry, getCategories, insertCategory, deleteCategory, getUsers, updateCategory, getAdminCustomDesigns, deleteCustomDesign, getCoupons, insertCoupon, deleteCoupon, getReviews, approveReview, deleteReview, getStoreSettings, saveStoreSettings, deleteInquiry, getCustomizerConfig, getHomepageConfig, saveHomepageConfig, getCustomDesign, getBlogs, insertBlog, updateBlog, deleteBlog } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import ProductFormModal from '../components/ProductFormModal'
import DashboardTab from '../components/admin/DashboardTab'
import ProductsTab from '../components/admin/ProductsTab'
import CategoriesTab from '../components/admin/CategoriesTab'
import OrdersTab from '../components/admin/OrdersTab'
import ReviewsTab from '../components/admin/ReviewsTab'
import UsersTab from '../components/admin/UsersTab'
import CouponsTab from '../components/admin/CouponsTab'
import ContactsTab from '../components/admin/ContactsTab'
import SettingsTab from '../components/admin/SettingsTab'
import CustomizerTab from '../components/admin/CustomizerTab'
import HomepageTab from '../components/admin/HomepageTab'
import BlogsTab from '../components/admin/BlogsTab'
import {
  TrendingUp, Package, ShoppingBag, Star, Users, Tag, Mail, Settings, Palette,
  LogOut, Globe, Plus, Trash2, Edit, CreditCard, CheckCircle, Clock,
  XCircle, Search, Percent, ChevronRight, Eye, IndianRupee, Check, X, ShieldAlert, ArrowRight, Layers, Sparkles, Truck, MapPin, Menu,
  Type, Image as ImageIcon, Download, Printer, BookOpen
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


const MOCKUPS = {
  front: '/images/media__1782208425084.png',
  back: '/images/media__1782208435752.png',
  left_sleeve: '/images/media__1782208444237.png',
  right_sleeve: '/images/media__1782208452503.png',
}

const ZONE_BOXES = {
  front: { top: '26%', left: '27.5%', width: '45%', height: '52%' },
  back: { top: '20%', left: '27.5%', width: '45%', height: '62%' },
  left_sleeve: { top: '48%', left: '60%', width: '22%', height: '16%' },
  right_sleeve: { top: '48%', left: '32%', width: '22%', height: '16%' },
}

const PRODUCT_STYLES = {
  regular: 'Regular Tee',
  oversize: 'Oversize Tee',
  polo: 'Collared Tee'
}

export default function Admin() {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Datasets State
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [usersList, setUsersList] = useState([])
  const [customDesigns, setCustomDesigns] = useState([])
  const [coupons, setCoupons] = useState([])
  const [reviews, setReviews] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [blogs, setBlogs] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryParent, setNewCategoryParent] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newCategorySortOrder, setNewCategorySortOrder] = useState('0')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState('add') // 'add' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  // Custom Design Preview State
  const [selectedDesignForPreview, setSelectedDesignForPreview] = useState(null)
  const [previewZone, setPreviewZone] = useState('front')

  // Settings State
  const [settings, setSettings] = useState({
    shipping_threshold: 1499,
    shipping_flat_rate: 99,
    enable_razorpay: true,
    enable_cod: true,
    store_address: 'FTW Streetwear Lab, Mumbai, IN'
  })

  const [customizerConfig, setCustomizerConfig] = useState(null)
  const [homepageConfig, setHomepageConfig] = useState(null)

  // Search State
  const [searchQuery, setSearchQuery] = useState('')

  // Mockup preview modal states
  const [previewImage, setPreviewImage] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')

  // Add/Edit Product Form Modal state
  const [showProductModal, setShowProductModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    mrp: '',
    price: '',
    category: 'Men',
    subcategory: '',
    collection: '',
    brand: 'FTW',
    weight: '0.25',
    stock: 10,
    image: '',
    images: [],
    short_description: '',
    long_details: '',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    available: true,
    tag: 'New',
    seo_title: '',
    seo_description: ''
  })


  // Add Coupon Form State
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState('')
  const [couponType, setCouponType] = useState('percent') // 'percent' | 'flat'

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin, activeTab])

  const loadAdminData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'dashboard': {
          const [prods, ords, usrs] = await Promise.all([
            getProducts(),
            getOrders(),
            getUsers()
          ])
          setProducts(prods || [])
          setOrders(ords || [])
          if (usrs && usrs.length > 0) {
            setUsersList(usrs.map(u => ({
              id: u.id || 'N/A',
              email: u.email || 'No email registered',
              name: u.full_name || 'Anonymous Client',
              role: u.is_admin ? 'Administrator' : 'Customer'
            })))
          } else {
            const users = ords ? Array.from(new Set(ords.map(o => o.email))).map(email => {
              const matchingOrder = ords.find(o => o.email === email)
              return {
                id: matchingOrder?.id || 'N/A',
                email,
                name: matchingOrder?.customer_name || 'Anonymous Client',
                role: 'Customer'
              }
            }) : []
            setUsersList(users)
          }
          break
        }
        case 'products': {
          const [prods, cats] = await Promise.all([
            getProducts(),
            getCategories()
          ])
          setProducts(prods || [])
          setCategoriesList(cats || [])
          break
        }
        case 'categories': {
          const [cats, prods] = await Promise.all([
            getCategories(),
            getProducts()
          ])
          setCategoriesList(cats || [])
          setProducts(prods || [])
          break
        }
        case 'orders': {
          const [ords, designs] = await Promise.all([
            getOrders(),
            getAdminCustomDesigns()
          ])
          setOrders(ords || [])
          setCustomDesigns(designs || [])
          break
        }
        case 'reviews': {
          const dbReviews = await getReviews()
          setReviews(dbReviews || [])
          break
        }
        case 'users': {
          const [usrs, ords] = await Promise.all([
            getUsers(),
            getOrders()
          ])
          if (usrs && usrs.length > 0) {
            setUsersList(usrs.map(u => ({
              id: u.id || 'N/A',
              email: u.email || 'No email registered',
              name: u.full_name || 'Anonymous Client',
              role: u.is_admin ? 'Administrator' : 'Customer'
            })))
          } else {
            const users = ords ? Array.from(new Set(ords.map(o => o.email))).map(email => {
              const matchingOrder = ords.find(o => o.email === email)
              return {
                id: matchingOrder?.id || 'N/A',
                email,
                name: matchingOrder?.customer_name || 'Anonymous Client',
                role: 'Customer'
              }
            }) : []
            setUsersList(users)
          }
          break
        }
        case 'coupons': {
          const dbCoupons = await getCoupons()
          setCoupons(dbCoupons || [])
          break
        }
        case 'blogs': {
          const dbBlogs = await getBlogs(true)
          setBlogs(dbBlogs || [])
          break
        }
        case 'contacts': {
          const inqs = await getInquiries()
          setInquiries(inqs || [])
          break
        }
        case 'customizer': {
          const dbCust = await getCustomizerConfig()
          if (dbCust) setCustomizerConfig(dbCust)
          break
        }
        case 'settings': {
          const dbSettings = await getStoreSettings()
          if (dbSettings) setSettings(dbSettings)
          break
        }
        case 'homepage': {
          const [prods, config] = await Promise.all([
            getProducts(),
            getHomepageConfig()
          ])
          setProducts(prods || [])
          setHomepageConfig(config)
          break
        }
        default:
          break
      }
    } catch (err) {
      console.error("Failed to load administration data:", err)
      toast.error(`Failed to load ${activeTab} data.`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Logged out successfully.")
      navigate('/auth')
    } catch (err) {
      toast.error("Logout failed: " + err.message)
    }
  }

  const handleAddProduct = () => {
    setModalMode('add')
    setProductForm({
      name: '',
      sku: '',
      mrp: '',
      price: '',
      category: 'Men',
      subcategory: '',
      collection: '',
      brand: 'FTW',
      weight: '0.25',
      stock: 10,
      image: '',
      images: [],
      short_description: '',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
      available: true,
      tag: 'New',
      seo_title: '',
      seo_description: '',
      fabric_info: '',
      washing_instructions: '',
      size_guide: '',
      size_chart: {},
      variants: []
    })
    setShowProductModal(true)
  }

  const handleEditProduct = (prod) => {
    setModalMode('edit')
    setSelectedProduct(prod)
    setProductForm({
      name: prod.name || '',
      sku: prod.sku || '',
      mrp: prod.originalPrice || prod.mrp || '',
      price: prod.price || '',
      category: prod.category || 'Men',
      subcategory: prod.subcategory || '',
      collection: prod.collection || '',
      brand: prod.brand || 'FTW',
      weight: prod.weight || '0.25',
      stock: prod.stock ?? prod.stock_qty ?? 10,
      image: prod.image || '',
      images: Array.isArray(prod.images) ? prod.images : (prod.image ? [prod.image] : []),
      short_description: prod.description || prod.short_description || '',
      sizes: Array.isArray(prod.sizes) ? prod.sizes : (prod.sizes ? prod.sizes.split(',').map(s => s.trim()) : []),
      colors: Array.isArray(prod.colors) ? prod.colors : (prod.colors ? prod.colors.split(',').map(c => c.trim()) : []),
      available: prod.available ?? true,
      tag: prod.tag || '',
      seo_title: prod.seo_title || prod.meta_title || '',
      seo_description: prod.seo_description || prod.meta_description || '',
      fabric_info: prod.fabric_info || prod.fabric || '',
      washing_instructions: prod.washing_instructions || prod.washing || '',
      size_guide: prod.size_guide || '',
      size_chart: prod.size_chart || {},
      variants: Array.isArray(prod.variants) ? prod.variants : []
    })
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()

    // Filter variants to keep ONLY active colors from the colors list
    const activeColorsCleaned = (productForm.colors || []).map(c => c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase());
    const variants = (productForm.variants || []).filter(v => {
      const vColorClean = v.color ? v.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';
      return activeColorsCleaned.includes(vColorClean);
    });

    const defaultColorClean = productForm.default_color
      ? productForm.default_color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
      : (productForm.colors && productForm.colors[0]
        ? productForm.colors[0].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
        : '');

    const defaultVariant = variants.find(v => v.color && v.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim() === defaultColorClean)
      || variants.find(v => v.price !== undefined)
      || {};

    const calcPrice = defaultVariant.price !== undefined ? Number(defaultVariant.price) : 0;
    const calcOriginalPrice = defaultVariant.originalPrice !== undefined ? Number(defaultVariant.originalPrice) : null;
    const calcStock = variants.reduce((sum, v) => sum + (v.stock !== undefined ? Number(v.stock) : 0), 0);

    const productPayload = {
      ...productForm,
      price: calcPrice,
      originalPrice: calcOriginalPrice,
      stock: calcStock,
      description: productForm.short_description,
      fabric_info: productForm.fabric_info,
      washing_instructions: productForm.washing_instructions,
      size_guide: productForm.size_guide,
      size_chart: productForm.size_chart || {},
      variants: variants
    }

    try {
      if (modalMode === 'add') {
        await insertProduct(productPayload)
        toast.success(`Published product "${productForm.name}"`)
      } else {
        await updateProduct(selectedProduct.id, productPayload)
        toast.success(`Updated product "${productForm.name}"`)
      }
      setShowProductModal(false)
      loadAdminData()
    } catch (err) {
      toast.error("Failed to save product changes.")
    }
  }

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id)
      toast.success("Product removed from inventory.")
      loadAdminData()
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus)
    toast.success(`Status updated to ${newStatus}`)
    loadAdminData()
  }

  // Coupon Logic
  const handleAddCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode || !couponDiscount) return
    const newC = {
      id: `c-${Date.now()}`,
      code: couponCode.toUpperCase().trim(),
      value: Number(couponDiscount),
      type: couponType,
      active: true
    }
    try {
      await insertCoupon(newC)
      setCouponCode('')
      setCouponDiscount('')
      toast.success(`Coupon ${newC.code} published.`)
      loadAdminData()
    } catch (err) {
      toast.error("Failed to publish coupon.")
    }
  }

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteCoupon(id)
      toast.success("Coupon removed.")
      loadAdminData()
    } catch (err) {
      toast.error("Failed to remove coupon.")
    }
  }

  // Category Logic
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    try {
      const payload = {
        name: newCategoryName.trim(),
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        parent: newCategoryParent || null,
        description: newCategoryDescription.trim() || null,
        sort_order: Number(newCategorySortOrder) || 0
      }
      if (categoryModalMode === 'edit' && selectedCategory) {
        await updateCategory(selectedCategory.id, payload)
        toast.success(`Updated category "${newCategoryName}"`)
      } else {
        await insertCategory(payload)
        toast.success(`Published category "${newCategoryName}"`)
      }
      setNewCategoryName('')
      setNewCategoryParent('')
      setNewCategoryDescription('')
      setNewCategorySortOrder('0')
      setShowCategoryModal(false)
      loadAdminData()
    } catch (err) {
      toast.error(categoryModalMode === 'edit' ? "Failed to update category." : "Failed to insert category.")
    }
  }

  const handleDeleteCategory = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id)
        toast.success("Category deleted.")
        loadAdminData()
      } catch (err) {
        toast.error("Failed to delete category.")
      }
    }
  }

  // Blogs Handlers
  const handleInsertBlog = async (blogPayload) => {
    try {
      await insertBlog(blogPayload)
      toast.success(`Published blog post "${blogPayload.title}"`)
      loadAdminData()
    } catch (err) {
      toast.error("Failed to publish blog post.")
      throw err
    }
  }

  const handleUpdateBlog = async (id, blogPayload) => {
    try {
      await updateBlog(id, blogPayload)
      toast.success(`Updated blog post "${blogPayload.title}"`)
      loadAdminData()
    } catch (err) {
      toast.error("Failed to update blog post.")
      throw err
    }
  }

  const handleDeleteBlog = async (id) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteBlog(id)
        toast.success("Blog post removed successfully.")
        loadAdminData()
      } catch (err) {
        toast.error("Failed to delete blog post.")
      }
    }
  }

  // Custom Designs handlers
  const handleDeleteDesign = async (id) => {
    if (confirm("Are you sure you want to delete this custom design?")) {
      try {
        await deleteCustomDesign(id)
        toast.success("Custom design deleted successfully.")
        loadAdminData()
      } catch (err) {
        toast.error("Failed to delete custom design.")
      }
    }
  }

  const handleViewOrderItemDesign = async (item) => {
    let customDesignObj = item.customDesign
    if (customDesignObj && typeof customDesignObj === 'string') {
      try {
        customDesignObj = JSON.parse(customDesignObj)
      } catch (e) {
        console.error("Error parsing customDesign:", e)
      }
    }

    if (customDesignObj) {
      setSelectedDesignForPreview({
        id: item.designId || `des-unsaved-${Date.now()}`,
        style_id: customDesignObj.style_id || 'regular',
        color_name: customDesignObj.color_name || 'White',
        color_hex: customDesignObj.color_hex || '#FAF9F6',
        canvas_elements: customDesignObj.canvas_elements || { front: [], back: [], left_sleeve: [], right_sleeve: [] },
        total_price: customDesignObj.total_price || item.price,
        created_at: new Date().toISOString()
      })
      setPreviewZone('front')
      return
    }

    if (item.designId) {
      const found = customDesigns.find(d => d.id === item.designId)
      if (found) {
        setSelectedDesignForPreview(found)
        setPreviewZone('front')
        return
      }

      try {
        const loadToast = toast.loading("Loading custom design details...")
        const loaded = await getCustomDesign(item.designId)
        toast.dismiss(loadToast)
        if (loaded) {
          setSelectedDesignForPreview(loaded)
          setPreviewZone('front')
        } else {
          toast.error("Custom design not found.")
        }
      } catch (err) {
        toast.error("Failed to load design details.")
      }
    }
  }

  // Review Logic
  const handleApproveReview = async (id) => {
    try {
      await approveReview(id)
      toast.success("Review approved.")
      loadAdminData()
    } catch (err) {
      toast.error("Failed to approve review.")
    }
  }

  const handleDeleteReview = async (id) => {
    try {
      await deleteReview(id)
      toast.success("Review deleted.")
      loadAdminData()
    } catch (err) {
      toast.error("Failed to delete review.")
    }
  }

  const handleDeleteInquiry = async (id) => {
    if (confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await deleteInquiry(id)
        toast.success("Inquiry deleted successfully.")
        loadAdminData()
      } catch (err) {
        toast.error("Failed to delete inquiry.")
      }
    }
  }

  const handlePrintSpecSheet = (design) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1100')
    const dateStr = new Date(design.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const zoneLabels = { front: 'F', back: 'B', left_sleeve: 'LS', right_sleeve: 'RS' }
    const zoneColors = { front: '#FF4E20', back: '#161616', left_sleeve: '#3b82f6', right_sleeve: '#8b5cf6' }
    const zoneNames = { front: 'Front Zone', back: 'Back Zone', left_sleeve: 'Left Sleeve Zone', right_sleeve: 'Right Sleeve Zone' }

    const zonesHTML = ['front', 'back', 'left_sleeve', 'right_sleeve'].map(zone => {
      const els = design.canvas_elements?.[zone] || []
      if (els.length === 0) return ''

      const elementRows = els.map((el, idx) => {
        if (el.type === 'text') {
          return `
            <tr>
              <td style="padding:12px 16px; vertical-align:top;">
                <div style="width:36px;height:36px;background:#161616;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;font-weight:900;">T</div>
              </td>
              <td style="padding:12px 16px;vertical-align:top;">
                <div style="font-size:13px;font-weight:700;color:#111;">"${el.content}"</div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${el.color || '#161616'};border:1px solid #ddd;"></span>
                  <span style="font-size:10px;font-family:monospace;color:#888;">${el.fontFamily || 'Inter'} &bull; ${el.color || '#161616'} &bull; ${el.size || 28}px${el.bold ? ' &bull; Bold' : ''}${el.italic ? ' &bull; Italic' : ''}${el.underline ? ' &bull; Underline' : ''}</span>
                </div>
              </td>
              <td style="padding:12px 16px;vertical-align:top;text-align:right;">
                <span style="font-size:10px;font-family:monospace;background:#f5f5f3;padding:3px 8px;border-radius:6px;color:#666;">TEXT</span>
              </td>
            </tr>`
        } else if (el.type === 'image') {
          return `
            <tr>
              <td style="padding:12px 16px;vertical-align:top;">
                ${el.url
              ? `<img src="${el.url}" style="width:48px;height:48px;object-fit:cover;border-radius:10px;border:1px solid #e5e5e5;display:block;" />`
              : `<div style="width:48px;height:48px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">🖼</div>`}
              </td>
              <td style="padding:12px 16px;vertical-align:top;">
                <div style="font-size:13px;font-weight:700;color:#111;">Custom Graphic</div>
                <div style="font-size:10px;font-family:monospace;color:#888;margin-top:3px;">${el.name || 'Uploaded image'}</div>
              </td>
              <td style="padding:12px 16px;vertical-align:top;text-align:right;">
                <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
                  ${el.url ? `<a href="${el.url}" target="_blank" style="display:inline-block;padding:5px 10px;background:#f5f5f3;border:1px solid #e5e5e5;border-radius:6px;font-size:10px;font-weight:700;font-family:monospace;color:#333;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">View</a>` : ''}
                  ${el.url ? `<a href="${el.url}" download="${el.name || `ftw-graphic-${idx + 1}.png`}" style="display:inline-block;padding:5px 10px;background:#161616;border-radius:6px;font-size:10px;font-weight:700;font-family:monospace;color:#fff;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">Download</a>` : ''}
                </div>
              </td>
            </tr>`
        } else {
          return `
            <tr>
              <td style="padding:12px 16px;vertical-align:top;">
                <div style="width:36px;height:36px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;">✦</div>
              </td>
              <td style="padding:12px 16px;vertical-align:top;">
                <div style="font-size:13px;font-weight:700;color:#111;">${el.name || 'Preset'}</div>
                <div style="font-size:10px;font-family:monospace;color:#888;margin-top:3px;">${el.text || ''}</div>
              </td>
              <td style="padding:12px 16px;vertical-align:top;text-align:right;">
                <span style="font-size:10px;font-family:monospace;background:#fff7ed;padding:3px 8px;border-radius:6px;color:#c2410c;">PRESET</span>
              </td>
            </tr>`
        }
      }).join('')

      return `
        <div style="margin-bottom:20px;border-radius:14px;overflow:hidden;border:1px solid #e5e5e5;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <div style="background:#f9f9f7;border-bottom:1px solid #e5e5e5;padding:10px 16px;display:flex;align-items:center;gap:10px;">
            <div style="width:26px;height:26px;background:${zoneColors[zone]};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;font-family:monospace;letter-spacing:0.05em;">${zoneLabels[zone]}</div>
            <span style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#333;">${zoneNames[zone]}</span>
            <span style="margin-left:auto;font-size:10px;font-family:monospace;color:#999;background:#efefed;padding:2px 8px;border-radius:20px;">${els.length} element${els.length > 1 ? 's' : ''}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;">
            <colgroup><col style="width:60px"><col><col style="width:150px"></colgroup>
            ${elementRows}
          </table>
        </div>`
    }).join('')

    const origin = window.location.origin

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FTW Print Job Sheet — ${design.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f3; color: #111; }
    .page { max-width: 820px; margin: 0 auto; background: #fff; }
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .page { box-shadow: none; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div style="background:#161616;padding:24px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:14px;">
        <img src="${origin}/images/ftw-logo.webp" style="height:40px;width:auto;" onerror="this.style.display='none'" />
        <div>
          <div style="color:#FF4E20;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;font-family:monospace;">For The Win</div>
          <div style="color:#fff;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;margin-top:1px;">Custom Print Job Sheet</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="color:#888;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">Generated</div>
        <div style="color:#fff;font-size:12px;font-weight:700;margin-top:2px;">${dateStr}</div>
        <button onclick="window.print()" class="no-print" style="margin-top:10px;padding:8px 16px;background:#FF4E20;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:900;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;">🖨 Print</button>
      </div>
    </div>

    <!-- Accent Bar -->
    <div style="height:4px;background:linear-gradient(90deg,#FF4E20,#ff8c00,#FF4E20);"></div>

    <!-- Metadata Grid -->
    <div style="padding:24px 32px;border-bottom:1px solid #e5e5e5;">
      <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:#999;margin-bottom:14px;">Order Specifications</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
        <div style="background:#f9f9f7;border:1px solid #e5e5e5;border-radius:12px;padding:14px 16px;">
          <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:6px;">Design Reference ID</div>
          <div style="font-family:monospace;font-size:12px;font-weight:700;color:#111;word-break:break-all;">${design.id}</div>
        </div>
        <div style="background:#f9f9f7;border:1px solid #e5e5e5;border-radius:12px;padding:14px 16px;">
          <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:6px;">Garment Style</div>
          <div style="font-size:13px;font-weight:700;color:#111;">${PRODUCT_STYLES[design.style_id] || 'Custom Tee'}</div>
        </div>
        <div style="background:#f9f9f7;border:1px solid #e5e5e5;border-radius:12px;padding:14px 16px;">
          <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:6px;">Base Colour</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${design.color_hex};border:1px solid #ddd;flex-shrink:0;"></span>
            <span style="font-size:13px;font-weight:700;color:#111;">${design.color_name} <span style="font-family:monospace;font-weight:400;font-size:11px;color:#888;">${design.color_hex}</span></span>
          </div>
        </div>
        <div style="background:#f9f9f7;border:1px solid #e5e5e5;border-radius:12px;padding:14px 16px;">
          <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:6px;">Quoted Value</div>
          <div style="font-size:16px;font-weight:900;font-family:monospace;color:#FF4E20;">&#8377;${(design.total_price || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>
    </div>

    <!-- Design Elements -->
    <div style="padding:24px 32px;">
      <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:#999;margin-bottom:16px;">Design Specifications &amp; Placement</div>
      ${zonesHTML || `<div style="text-align:center;padding:40px;color:#bbb;font-family:monospace;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;">No graphic elements applied to this design.</div>`}
    </div>

    <!-- Sign-off -->
    <div style="margin:0 32px 32px;border:1px dashed #e5e5e5;border-radius:12px;padding:20px 24px;display:flex;gap:24px;">
      <div style="flex:1;">
        <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:8px;">Production Sign-off</div>
        <div style="height:32px;border-bottom:1px solid #ddd;"></div>
        <div style="font-size:9px;color:#ccc;margin-top:4px;font-family:monospace;">Approved by</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:8px;">QC Check</div>
        <div style="height:32px;border-bottom:1px solid #ddd;"></div>
        <div style="font-size:9px;color:#ccc;margin-top:4px;font-family:monospace;">Checked by</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:8px;">Date</div>
        <div style="height:32px;border-bottom:1px solid #ddd;"></div>
        <div style="font-size:9px;color:#ccc;margin-top:4px;font-family:monospace;">Completion date</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f7;border-top:1px solid #e5e5e5;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div style="font-size:9px;font-family:monospace;color:#bbb;text-transform:uppercase;letter-spacing:0.12em;">FOR THE WIN STREETWEAR LABS &bull; CONFIDENTIAL</div>
      <div style="font-size:9px;font-family:monospace;color:#bbb;">${design.id}</div>
    </div>
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 600); }
  </script>
</body>
</html>`)
    printWindow.document.close()
  }

  // Settings Logic
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      await saveStoreSettings(settings)
      toast.success("Portal settings saved to database.")
      loadAdminData()
    } catch (err) {
      toast.error("Failed to save settings.")
    }
  }

  const handleSaveHomepageConfig = async (configPayload) => {
    try {
      const loadToast = toast.loading("Saving homepage configurations...")
      await saveHomepageConfig(configPayload)
      toast.dismiss(loadToast)
      toast.success("Homepage configuration saved and published!")
      loadAdminData()
    } catch (err) {
      toast.error("Failed to save homepage configurations.")
    }
  }

  // KPIs
  const totalSalesVal = orders
    .filter(o => o.payment_status === 'Paid' || o.status === 'Delivered')
    .reduce((acc, curr) => acc + curr.total, 0)

  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const avgOrderVal = orders.length > 0 ? Math.round(totalSalesVal / orders.length) : 0

  // Filter lists based on search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInquiries = inquiries.filter(inq =>
    (inq.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inq.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inq.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inq.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inq.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = usersList.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCategories = categoriesList.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.parent || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center font-sans text-dark2/60 text-sm">
        <span className="animate-spin w-6 h-6 border-2 border-dark border-t-transparent rounded-full inline-block mb-3" />
        Verifying credentials...
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-96px)] bg-cream flex items-center justify-center py-24 px-6 relative selection:bg-accent selection:text-cream">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-cream3 rounded-3xl p-8 md:p-10 shadow-lg relative z-10 text-center"
        >
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider mb-6 border border-red-100">
            <ShieldAlert className="w-3.5 h-3.5" />
            Access Restricted
          </div>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-dark mb-2">Access Denied</h2>
          <p className="text-sm text-dark2/60 font-sans mb-8">Administrator credentials are required to view this panel.</p>

          <Link
            to="/auth"
            className="w-full py-4 bg-dark text-cream hover:bg-neutral-800 transition-colors font-sans font-bold uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            Log In as Admin
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Sales Overview', icon: TrendingUp },
    { id: 'homepage', label: 'Homepage Customizer', icon: Globe },
    { id: 'products', label: 'Products & Stock', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'blogs', label: 'Blog Posts', icon: BookOpen },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'users', label: 'Accounts', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'contacts', label: 'Inquiries', icon: Mail },
    { id: 'customizer', label: 'Customizer Mockups', icon: Palette },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ]

  return (
    <div className="bg-cream text-dark font-sans min-h-screen relative selection:bg-accent selection:text-cream pt-28 pb-12 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto">

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-cream3 z-40 px-4 sm:px-6 md:px-12 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-1 sm:gap-3 group select-none h-10">
              <img src="/images/ftw-logo.webp" alt="For The Win Logo" className="h-[50px] sm:h-[60px] w-auto object-contain transition-all duration-300 group-hover:scale-105 shrink-0" />
              <span className="font-display text-[10px] sm:text-[12px] leading-none tracking-[0.22em] font-black uppercase text-dark flex items-center gap-1 shrink-0">
                <span>FOR THE</span>
                <span className="text-accent italic transform -skew-x-6 inline-block">WIN</span>
              </span>
            </Link>
            <span className="h-5 w-px bg-cream3 hidden xs:inline-block" />
            <span className="text-[10px] sm:text-xs font-mono font-bold text-dark2/60 uppercase tracking-widest hidden md:inline-block">Management Dashboard</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              title="View Site"
              className="p-2.5 sm:px-4 sm:py-2 bg-white sm:bg-dark text-dark sm:text-cream hover:bg-cream/40 hover:sm:bg-accent hover:sm:text-dark border border-cream3 sm:border-none transition-all duration-300 font-sans font-bold uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs sm:shadow-md hover:scale-105 active:scale-95"
            >
              <Globe className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-dark sm:text-cream hover:text-inherit" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2.5 text-red-500 hover:text-white hover:bg-red-600 bg-white border border-cream3 hover:border-red-600 transition-all duration-300 cursor-pointer rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Sign Out</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-cream3 text-dark hover:bg-cream/40 transition-colors bg-white shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Sidebar from Right) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Sidebar Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] max-w-[85vw] bg-white border-l border-cream3 p-6 z-50 shadow-2xl flex flex-col justify-between font-sans lg:hidden"
            >
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
                {/* Header Badge */}
                <div className="flex justify-between items-center pb-3 border-b border-cream3">
                  <span className="text-[13px] font-mono uppercase tracking-[0.2em] text-accent font-black">Admin Panel</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-cream3 border-none bg-transparent cursor-pointer text-dark flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs List */}
                <nav className="flex flex-col gap-1">
                  {tabs.map(tab => {
                    const Icon = tab.icon
                    const isTabActive = activeTab === tab.id

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSearchQuery('');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-none text-left transition-all duration-200 cursor-pointer relative overflow-hidden group outline-none bg-transparent ${isTabActive
                          ? 'text-white font-bold'
                          : 'text-dark2 hover:text-dark hover:bg-cream2/60'
                          }`}
                      >
                        {isTabActive && (
                          <div className="absolute inset-0 bg-dark z-0 rounded-2xl shadow-md" />
                        )}
                        {isTabActive && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-r-full z-10" />
                        )}
                        <div className="relative z-10 flex items-center gap-3">
                          <Icon className={`w-[18px] h-[18px] shrink-0 ${isTabActive ? 'text-accent' : 'text-dark2/50'
                            }`} />
                          <span className="text-[12px] font-bold uppercase tracking-wider font-sans">{tab.label}</span>
                        </div>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className={`relative z-10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${isTabActive
                            ? 'bg-accent text-white'
                            : tab.badgeType === 'alert' ? 'bg-red-500 text-white' : tab.badgeType === 'info' ? 'bg-blue-550 text-white' : 'bg-cream3 text-dark2'
                            }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Sidebar Footer Actions */}
              <div className="pt-4 border-t border-cream3 flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-2.5 bg-dark text-cream hover:bg-accent hover:text-dark transition-all duration-300 font-sans font-bold uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Globe className="w-3.5 h-3.5" /> View Site
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 border border-red-200 text-red-500 hover:bg-red-550 hover:text-white transition-all duration-300 font-sans font-bold uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1.5 bg-transparent cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-12 items-start">

        {/* Navigation Sidebar Panel */}
        <aside className="hidden lg:flex w-full lg:w-[290px] shrink-0 lg:sticky lg:top-24 bg-white/90 backdrop-blur-md border border-cream3 p-5 rounded-3xl shadow-sm flex-col gap-1.5 font-sans">
          {/* Header Console Badge */}
          <div className="px-3.5 py-3 mb-3 border-b border-cream3/80 flex items-center select-none">
            <span className="text-[13px] font-mono uppercase tracking-[0.2em] text-accent font-black">Admin Panel</span>
          </div>

          {tabs.map(tab => {
            const Icon = tab.icon
            const hasBadge = tab.badge !== undefined && tab.badge > 0
            const isTabActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-none text-left transition-all duration-200 cursor-pointer relative overflow-hidden group outline-none bg-transparent ${isTabActive
                  ? 'text-white font-bold'
                  : 'text-dark2 hover:text-dark hover:bg-cream2/60'
                  }`}
              >
                {/* Sliding active background tab */}
                {isTabActive && (
                  <motion.div
                    layoutId="activeAdminTabBg"
                    className="absolute inset-0 bg-dark z-0 rounded-2xl shadow-md shadow-dark/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Active edge highlight */}
                {isTabActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-r-full z-10" />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-105 duration-200 ${isTabActive ? 'text-accent' : 'text-dark2/50 group-hover:text-dark'
                    }`} />
                  <span className="text-[13px] font-bold uppercase tracking-wider font-sans">{tab.label}</span>
                </div>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`relative z-10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${isTabActive
                    ? 'bg-accent text-white'
                    : tab.badgeType === 'alert' ? 'bg-red-500 text-white' : tab.badgeType === 'info' ? 'bg-blue-550 text-white' : 'bg-cream3 text-dark2'
                    }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </aside>

        {/* Dynamic Display Panel */}
        <main className="flex-1 w-full bg-white border border-cream3 p-4 sm:p-8 lg:p-10 rounded-3xl shadow-sm min-h-[500px]">

          {loading ? (
            <div className="text-center py-24 font-sans text-dark2/60 text-sm">
              <span className="animate-spin w-6 h-6 border-2 border-dark border-t-transparent rounded-full inline-block mb-3" /><br />
              Loading database records...
            </div>
          ) : (
            <div>

              {activeTab === 'dashboard' && (
                <DashboardTab
                  orders={orders}
                  totalSalesVal={totalSalesVal}
                  pendingOrders={pendingOrders}
                  avgOrderVal={avgOrderVal}
                />
              )}

              {activeTab === 'products' && (
                <ProductsTab
                  filteredProducts={filteredProducts}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleAddProduct={handleAddProduct}
                  handleEditProduct={handleEditProduct}
                  handleDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'categories' && (
                <CategoriesTab
                  filteredCategories={filteredCategories}
                  categoriesList={categoriesList}
                  products={products}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setNewCategoryName={setNewCategoryName}
                  setNewCategoryParent={setNewCategoryParent}
                  setNewCategoryDescription={setNewCategoryDescription}
                  setNewCategorySortOrder={setNewCategorySortOrder}
                  setCategoryModalMode={setCategoryModalMode}
                  setSelectedCategory={setSelectedCategory}
                  setShowCategoryModal={setShowCategoryModal}
                  handleDeleteCategory={handleDeleteCategory}
                />
              )}

              {activeTab === 'blogs' && (
                <BlogsTab
                  blogs={blogs}
                  onInsertBlog={handleInsertBlog}
                  onUpdateBlog={handleUpdateBlog}
                  onDeleteBlog={handleDeleteBlog}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersTab
                  filteredOrders={filteredOrders}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleStatusChange={handleStatusChange}
                  handleViewOrderItemDesign={handleViewOrderItemDesign}
                />
              )}


              {activeTab === 'reviews' && (
                <ReviewsTab
                  reviews={reviews}
                  products={products}
                  handleApproveReview={handleApproveReview}
                  handleDeleteReview={handleDeleteReview}
                />
              )}

              {activeTab === 'users' && (
                <UsersTab
                  filteredUsers={filteredUsers}
                  usersList={usersList}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  orders={orders}
                />
              )}

              {activeTab === 'coupons' && (
                <CouponsTab
                  coupons={coupons}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  couponDiscount={couponDiscount}
                  setCouponDiscount={setCouponDiscount}
                  couponType={couponType}
                  setCouponType={setCouponType}
                  handleAddCoupon={handleAddCoupon}
                  handleDeleteCoupon={handleDeleteCoupon}
                />
              )}

              {activeTab === 'contacts' && (
                <ContactsTab
                  filteredInquiries={filteredInquiries}
                  inquiries={inquiries}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleDeleteInquiry={handleDeleteInquiry}
                />
              )}

              {activeTab === 'customizer' && (
                <CustomizerTab
                  onPreviewImage={(url, title) => {
                    setPreviewImage(url)
                    setPreviewTitle(title)
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  setSettings={setSettings}
                  handleSaveSettings={handleSaveSettings}
                />
              )}

              {activeTab === 'homepage' && homepageConfig && (
                <HomepageTab
                  products={products}
                  homepageConfig={homepageConfig}
                  handleSaveHomepageConfig={handleSaveHomepageConfig}
                />
              )}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showProductModal && (
          <ProductFormModal
            show={showProductModal}
            onClose={() => setShowProductModal(false)}
            mode={modalMode}
            productForm={productForm}
            setProductForm={setProductForm}
            onSave={handleSaveProduct}
            categoriesList={categoriesList}
          />
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-[#FAF9F6] text-dark rounded-3xl p-6 shadow-2xl border border-cream3 flex flex-col items-center gap-4 max-h-[85vh] z-10"
            >
              <div className="flex justify-between items-center w-full border-b border-cream3 pb-2.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-dark">{previewTitle}</span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-cream2 border border-cream3 hover:bg-cream3 cursor-pointer transition-colors border-none"
                >
                  <X className="w-4 h-4 text-dark/75" />
                </button>
              </div>

              <div className="w-full flex-1 min-h-0 bg-white border border-cream3 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                <img src={previewImage} alt="Mockup Preview" className="max-w-full max-h-[50vh] object-contain mix-blend-multiply" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-dark/70 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#FAFAF7] border-2 border-cream3 w-full max-w-md p-6 sm:p-8 rounded-[32px] shadow-2xl relative z-10 text-sm font-sans max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-cream3 border border-cream3 text-dark transition-all cursor-pointer bg-white shadow-xs flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-cream3 pb-4 mb-6 select-none">
                <span className="text-[9px] lg:text-[10.5px] text-accent font-black uppercase tracking-widest font-mono">Catalog Operations</span>
                <h3 className="font-display text-xl lg:text-2xl font-black uppercase text-dark tracking-tight mt-0.5">
                  {categoryModalMode === 'add' ? 'Publish Category' : 'Modify Category'}
                </h3>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs uppercase font-black text-dark2/50 block">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Men, Women, Accessories"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3.5 lg:px-4 py-2.5 lg:py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-sm font-sans font-bold text-dark transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs uppercase font-black text-dark2/50 block">Parent Category (optional)</label>
                  <select
                    value={newCategoryParent}
                    onChange={(e) => setNewCategoryParent(e.target.value)}
                    className="w-full px-3.5 lg:px-4 py-2.5 lg:py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-sm font-sans font-bold text-dark transition-all"
                  >
                    <option value="">— Main category (no parent) —</option>
                    {categoriesList.filter(c => !c.parent).map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <span className="text-[9px] lg:text-[10.5px] text-dark/35 font-medium block leading-relaxed mt-1">
                    Leave empty for main categories. Only pick a parent if this is a subcategory.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs uppercase font-black text-dark2/50 block">Description (optional)</label>
                  <textarea
                    placeholder="Provide a brief summary of catalog items under this label..."
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows="4"
                    className="w-full px-3.5 lg:px-4 py-2.5 lg:py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-sm font-sans text-dark transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs uppercase font-black text-dark2/50 block">Sort Order Index (optional)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCategorySortOrder}
                    onChange={(e) => setNewCategorySortOrder(e.target.value)}
                    className="w-full px-3.5 lg:px-4 py-2.5 lg:py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-sm font-sans font-bold text-dark transition-all"
                  />
                  <span className="text-[9px] lg:text-[10.5px] text-dark/35 font-medium block leading-relaxed mt-1">
                    Used to define category display sequence. Lower values appear first.
                  </span>
                </div>

                <div className="flex gap-3 pt-4 border-t border-cream3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 py-3.5 lg:py-4 bg-white hover:bg-cream3 text-dark font-sans font-bold uppercase tracking-wider rounded-2xl border border-cream3 transition-colors cursor-pointer text-center text-xs lg:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 lg:py-4 bg-[#161616] hover:bg-accent text-white font-sans font-black uppercase tracking-wider rounded-2xl transition-colors cursor-pointer text-center shadow-md text-xs lg:text-sm border-none"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedDesignForPreview && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div onClick={() => setSelectedDesignForPreview(null)} className="absolute inset-0 bg-dark/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#FAFAF7] border-2 border-cream3 w-full max-w-5xl p-6 sm:p-8 rounded-[32px] shadow-2xl relative z-10 text-sm font-sans flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDesignForPreview(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream3 border-none bg-transparent cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-dark" />
              </button>

              {/* Visual Canvas Block */}
              <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-cream2/30 rounded-2xl p-6 border border-cream3">
                {/* Zone Selectors with print element counts */}
                <div className="flex flex-wrap justify-center gap-1.5 bg-cream3/60 p-1.5 rounded-2xl border border-cream3">
                  {[
                    { id: 'front', label: 'Front' },
                    { id: 'back', label: 'Back' },
                    { id: 'left_sleeve', label: 'L Sleeve' },
                    { id: 'right_sleeve', label: 'R Sleeve' }
                  ].map(z => {
                    const count = (selectedDesignForPreview.canvas_elements?.[z.id] || []).length
                    const isActive = previewZone === z.id
                    return (
                      <button
                        key={z.id}
                        onClick={() => setPreviewZone(z.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border-none ${isActive
                          ? 'bg-dark text-white shadow-md'
                          : 'text-dark2/60 hover:text-dark hover:bg-cream2 bg-transparent'
                          }`}
                      >
                        <span>{z.label}</span>
                        {count > 0 && (
                          <span className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold ${isActive ? 'bg-primary text-dark' : 'bg-accent text-white animate-pulse'
                            }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* The Shirt Preview Box */}
                <div className="relative rounded-[24px] overflow-hidden shadow-xl border-4 border-white bg-white" style={{
                  width: 320,
                  height: 380,
                  flexShrink: 0
                }}>
                  {/* Scaled Inner Shirt Canvas */}
                  <div style={{
                    width: 420,
                    height: 500,
                    transform: 'scale(0.76)',
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}>
                    {/* Colour background underlay */}
                    <div className="absolute inset-0 z-0 transition-colors duration-300" style={{ backgroundColor: selectedDesignForPreview.color_hex || '#FAF9F6' }} />
                    {/* Mockup base photo */}
                    {(() => {
                      const matchedColor = customizerConfig?.colors?.find(c => c.name.toLowerCase() === selectedDesignForPreview.color_name?.toLowerCase())
                      const previewMockupSrc = matchedColor?.mockups?.[previewZone] || MOCKUPS[previewZone]
                      return (
                        <img
                          src={previewMockupSrc}
                          alt="Mockup Shirt"
                          className="absolute inset-0 z-10 w-full h-full object-contain mix-blend-multiply select-none pointer-events-none"
                        />
                      )
                    })()}
                    {/* Elements container */}
                    <div className="absolute overflow-hidden z-20" style={{
                      top: ZONE_BOXES[previewZone].top,
                      left: ZONE_BOXES[previewZone].left,
                      width: ZONE_BOXES[previewZone].width,
                      height: ZONE_BOXES[previewZone].height,
                    }}>
                      {selectedDesignForPreview.canvas_elements?.[previewZone]?.map((el, idx) => (
                        <div key={el.id} style={{
                          position: 'absolute',
                          left: el.x,
                          top: el.y,
                          transform: `rotate(${el.rotation || 0}deg) scale(${el.scale || 1})`,
                          transformOrigin: 'center',
                          zIndex: 10 + idx,
                          pointerEvents: 'none'
                        }}
                          className="flex items-center justify-center p-1.5"
                        >
                          {el.type === 'text' && (
                            <span style={{
                              fontFamily: el.fontFamily || 'Inter',
                              color: el.color || '#000',
                              fontSize: el.size || 16,
                              fontWeight: el.bold ? 'bold' : 'normal',
                              fontStyle: el.italic ? 'italic' : 'normal',
                              textDecoration: el.underline ? 'underline' : 'none',
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}>{el.content}</span>
                          )}
                          {el.type === 'image' && (
                            <img src={el.url} alt="custom" className="max-w-[100px] max-h-[100px] object-contain" />
                          )}
                          {el.type === 'preset' && (
                            <div className="flex flex-col items-center gap-0.5 bg-white/85 rounded-lg px-2 py-1 shadow-sm border border-white/60">
                              <span className="text-2xl leading-none">{el.emoji}</span>
                              <span className="text-[6px] font-black uppercase tracking-widest text-dark/70 font-mono">{el.text}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-between space-y-6 pt-4 md:pt-0 font-sans">
                <div className="space-y-5">
                  <div className="border-b border-cream3 pb-3.5">
                    <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest block mb-1">Custom Design Reference</span>
                    <div className="flex gap-2 items-center">
                      <span className="font-mono text-[10px] font-bold text-dark bg-white px-3 py-2 rounded-xl border border-cream3 select-all block w-full truncate shadow-inner" title={selectedDesignForPreview.id}>
                        {selectedDesignForPreview.id}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedDesignForPreview.id)
                          toast.success("Design ID copied!")
                        }}
                        className="p-2.5 rounded-xl hover:bg-cream3 border border-cream3 bg-transparent cursor-pointer text-dark/60 shrink-0 transition-colors"
                        title="Copy ID"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <h3 className="font-sans text-2xl font-black uppercase text-dark tracking-tight leading-none">
                      {PRODUCT_STYLES[selectedDesignForPreview.style_id] || 'Custom Tee'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-cream3 shadow-xs">
                        <span className="text-[9px] text-dark2/40 uppercase font-black block mb-1 tracking-wider">Base Blank</span>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-dark/15 shadow-inner" style={{ backgroundColor: selectedDesignForPreview.color_hex }} />
                          <span className="font-extrabold text-dark truncate uppercase tracking-tight">{selectedDesignForPreview.color_name}</span>
                        </div>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-cream3 shadow-xs">
                        <span className="text-[9px] text-dark2/40 uppercase font-black block mb-1 tracking-wider">Base Price</span>
                        <span className="font-mono font-black text-dark text-sm block">₹{(selectedDesignForPreview.total_price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Print Elements Summary */}
                  <div className="rounded-2xl border border-cream3 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-dark px-4 py-3 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <span className="text-[10px] text-white font-black uppercase tracking-widest">Print Production Assets</span>
                    </div>

                    <div className="bg-white divide-y divide-cream3 max-h-[300px] overflow-y-auto scrollbar-none">
                      {['front', 'back', 'left_sleeve', 'right_sleeve'].map(z => {
                        const els = selectedDesignForPreview.canvas_elements?.[z] || []
                        if (els.length === 0) return null
                        const zoneLabels = { front: 'F', back: 'B', left_sleeve: 'LS', right_sleeve: 'RS' }
                        const zoneColors = { front: 'bg-accent', back: 'bg-dark', left_sleeve: 'bg-blue-500', right_sleeve: 'bg-purple-500' }
                        return (
                          <div key={z}>
                            {/* Zone header */}
                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-cream2/60">
                              <div className={`w-6 h-6 rounded-lg ${zoneColors[z]} flex items-center justify-center shrink-0`}>
                                <span className="text-[9px] font-black text-white tracking-wider">{zoneLabels[z]}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-dark">
                                {z.replace('_', ' ')} Zone
                              </span>
                              <span className="ml-auto text-[9px] font-mono text-dark/30 bg-cream3/60 px-2 py-0.5 rounded-full">
                                {els.length} element{els.length > 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Elements */}
                            <div className="divide-y divide-cream3/60">
                              {els.map((el, index) => (
                                <div key={index} className="flex items-center gap-3 px-4 py-3 hover:bg-cream2/40 transition-colors">

                                  {/* Type icon / image thumbnail */}
                                  {el.type === 'text' && (
                                    <div className="w-8 h-8 rounded-xl bg-dark flex items-center justify-center shrink-0">
                                      <Type className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                  {el.type === 'image' && (
                                    el.url
                                      ? <img src={el.url} alt="" className="w-8 h-8 rounded-xl object-cover border border-cream3 shrink-0 bg-cream2" />
                                      : <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"><ImageIcon className="w-3.5 h-3.5 text-blue-400" /></div>
                                  )}
                                  {el.type === 'preset' && (
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                                    </div>
                                  )}

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    {el.type === 'text' && (
                                      <>
                                        <p className="text-[11px] font-bold text-dark truncate">"{el.content}"</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full border border-dark/10 shrink-0"
                                            style={{ backgroundColor: el.color }}
                                          />
                                          <span className="text-[9px] font-mono text-dark/40 truncate">{el.fontFamily} · {el.color}</span>
                                        </div>
                                      </>
                                    )}
                                    {el.type === 'image' && (
                                      <>
                                        <p className="text-[11px] font-bold text-dark truncate">Custom Image</p>
                                        <p className="text-[9px] font-mono text-dark/40 truncate mt-0.5">{el.name || 'Uploaded file'}</p>
                                      </>
                                    )}
                                    {el.type === 'preset' && (
                                      <>
                                        <p className="text-[11px] font-bold text-dark truncate">{el.name}</p>
                                        <p className="text-[9px] font-mono text-dark/40 truncate mt-0.5">Preset · {el.text}</p>
                                      </>
                                    )}
                                  </div>

                                  {/* Download btn for images */}
                                  {el.type === 'image' && el.url && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(el.url)
                                          const blob = await res.blob()
                                          const blobUrl = URL.createObjectURL(blob)
                                          const a = document.createElement('a')
                                          a.href = blobUrl
                                          a.download = el.name || `ftw-design-image-${index + 1}.png`
                                          a.click()
                                          URL.revokeObjectURL(blobUrl)
                                        } catch {
                                          window.open(el.url, '_blank')
                                        }
                                      }}
                                      className="w-7 h-7 rounded-lg bg-dark hover:bg-accent text-white flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors"
                                      title="Download image"
                                    >
                                      <Download className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}

                      {!['front', 'back', 'left_sleeve', 'right_sleeve'].some(z => (selectedDesignForPreview.canvas_elements?.[z] || []).length > 0) && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <Layers className="w-6 h-6 text-dark/15" />
                          <span className="text-xs text-dark/35 font-mono uppercase tracking-widest">No design elements applied</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {/* Two main actions on one row */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrintSpecSheet(selectedDesignForPreview)}
                      className="flex-1 py-3 bg-accent text-dark hover:bg-dark hover:text-accent border-none text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Printer className="w-3.5 h-3.5 shrink-0" />
                      Print Sheet
                    </button>

                    <Link
                      to={`/customizer?designId=${selectedDesignForPreview.id}&readOnly=true`}
                      className="flex-1 py-3 bg-dark text-white hover:bg-neutral-800 border-none text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-98 decoration-none"
                    >
                      <Eye className="w-3.5 h-3.5 text-accent shrink-0" />
                      View in Studio
                    </Link>
                  </div>

                  <button
                    onClick={() => setSelectedDesignForPreview(null)}
                    className="w-full py-3 bg-cream hover:bg-cream3 text-dark2 hover:text-dark text-[10px] font-bold uppercase tracking-widest rounded-xl border border-cream3 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" /> Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
