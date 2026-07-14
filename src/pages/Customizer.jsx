import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { saveCustomDesign, getUserCustomDesigns, deleteCustomDesign, getCustomDesign, getCustomizerConfig, getStoreSettings } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import {
  X, Plus, Minus, Check, ShoppingBag, Type, Image as ImageIcon,
  Sparkles, Upload, Trash2, RotateCw, Copy, Download,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Undo2, Redo2,
  Palette, Grid3X3, Layers, ArrowLeft, ArrowRight
} from 'lucide-react'

/* ─────────────────── DATA ─────────────────── */
const PRODUCT_STYLES = [
  { id: 'regular', name: 'Regular Tee', shortName: 'Regular', price: 380, icon: '👕', image: '/images/Regular-T.png' },
  { id: 'oversize', name: 'Oversize Tee', shortName: 'Oversize', price: 450, icon: '👚', image: '/images/oversize T.png' },
  { id: 'polo', name: 'Collared Tee', shortName: 'Polo', price: 480, icon: '👔', image: '/images/Collered T.png' },
]

const MOCKUPS = {
  front: '/images/media__1782208425084.png',
  back: '/images/media__1782208435752.png',
  left_sleeve: '/images/media__1782208444237.png',
  right_sleeve: '/images/media__1782208452503.png',
}

const PRINT_ZONES = [
  { id: 'front', name: 'Front', thumb: MOCKUPS.front },
  { id: 'back', name: 'Back', thumb: MOCKUPS.back },
  { id: 'left_sleeve', name: 'Left Sleeve', thumb: MOCKUPS.left_sleeve },
  { id: 'right_sleeve', name: 'Right Sleeve', thumb: MOCKUPS.right_sleeve },
]

const ZONE_BOXES = {
  front: { top: '26%', left: '27.5%', width: '45%', height: '52%' },
  back: { top: '20%', left: '27.5%', width: '45%', height: '62%' },
  left_sleeve: { top: '48%', left: '60%', width: '22%', height: '16%' },
  right_sleeve: { top: '48%', left: '32%', width: '22%', height: '16%' },
}

const COLOR_PALETTE = [
  { name: 'White', hex: '#FAF9F6' },
  { name: 'Black', hex: '#333333' },
  { name: 'Lavender', hex: '#D2B4DE' },
  { name: 'Pista', hex: '#A9DFBF' },
  { name: 'Light Blue', hex: '#AED6F1' },
  { name: 'Beige', hex: '#FAD7A0' },
  { name: 'Plum', hex: '#F1948A' },
  { name: 'Wine', hex: '#6B1E1E' },
  { name: 'Chocolate Brown', hex: '#5E3A1A' },
  { name: 'Teal Blue', hex: '#1F618D' },
  { name: 'Sage Green', hex: '#B7C9A8' },
  { name: 'Dusty Pink', hex: '#E8B4B8' },
]

const FONTS = ['Inter', 'Bebas Neue', 'Space Grotesk', 'Courier New', 'Montserrat', 'Playfair Display']

const TEXT_COLORS = [
  '#161616', '#FFFFFF', '#CCFF00', '#FF3B30', '#007AFF',
  '#34C759', '#AF52DE', '#FF9500', '#FF2D55', '#5AC8FA',
]

const READY_DESIGNS = [
  { id: 'abstract', name: 'Abstract Faces', emoji: '👤', category: 'Abstract', text: 'ABSTRACT FACES' },
  { id: 'adventure', name: 'Adventure is Out There', emoji: '🏔️', category: 'Adventure', text: 'ADVENTURE' },
  { id: 'butterfly', name: 'Anti-Social Butterfly', emoji: '🦋', category: 'Anti Social', text: 'ANTI-SOCIAL' },
  { id: 'astronaut', name: 'Astronaut Space', emoji: '👨‍🚀', category: 'Astronaut', text: 'ASTRONAUT' },
  { id: 'attitude', name: 'Classy & Hood', emoji: '🔥', category: 'Attitude', text: 'CLASSY & HOOD' },
  { id: 'beach', name: 'Eat Sleep Beach', emoji: '🏖️', category: 'Nature', text: 'EAT SLEEP BEACH' },
  { id: 'midnight', name: 'Midnight Rider', emoji: '🌙', category: 'Night', text: 'MIDNIGHT RIDER' },
  { id: 'tiger', name: 'Tiger Eyes', emoji: '🐯', category: 'Animal', text: 'TIGER EYES' },
]

const getClipPath = (box) => {
  if (!box) return 'none'
  const top = parseFloat(box.top)
  const left = parseFloat(box.left)
  const width = parseFloat(box.width)
  const height = parseFloat(box.height)
  const right = 100 - left - width
  const bottom = 100 - top - height
  return `inset(${top}% ${right}% ${bottom}% ${left}%)`
}

/* ─────────────────── COMPONENT ─────────────────── */
export default function Customizer() {
  const navigate = useNavigate()
  const { addToCart, updateQty } = useCart()
  const { user, loading } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to access the customizer!", {
        id: 'auth-required-customizer',
        style: { background: '#161616', color: '#FAF9F6' }
      })
      navigate('/auth?redirect=/customizer')
    }
  }, [loading, user, navigate])

  const styleParam = searchParams.get('style')
  const colorParam = searchParams.get('color')
  const designIdParam = searchParams.get('designId')
  const recreateParam = searchParams.get('recreate') === 'true'
  const isReadOnly = searchParams.get('readOnly') === 'true'
  const initialStyle = PRODUCT_STYLES.find(s => s.id === styleParam) || PRODUCT_STYLES[0]
  const initialColor = COLOR_PALETTE.find(c => c.name.toLowerCase() === colorParam?.toLowerCase()) || COLOR_PALETTE[0]

  /* ── state ── */
  const [blankPrice, setBlankPrice] = useState(380)
  const [zonePrices, setZonePrices] = useState({ front: 99, back: 99, left_sleeve: 99, right_sleeve: 99 })
  const [productStyles, setProductStyles] = useState(PRODUCT_STYLES)
  const [colorPalette, setColorPalette] = useState(COLOR_PALETTE)
  const [selectedStyle, setSelectedStyle] = useState(initialStyle)
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [activeZone, setActiveZone] = useState('front')
  const [zoom, setZoom] = useState(1)
  const [gridOn, setGridOn] = useState(false)
  const [sizeChart, setSizeChart] = useState({
    S: { chest: '38"', length: '27"', sleeve: '8"' },
    M: { chest: '40"', length: '28"', sleeve: '8.5"' },
    L: { chest: '42"', length: '29"', sleeve: '9"' },
    XL: { chest: '44"', length: '30"', sleeve: '9.5"' },
    XXL: { chest: '46"', length: '31"', sleeve: '10"' }
  })

  // Fetch dynamic customizer configurations on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const custConfig = await getCustomizerConfig()
        // Load color palette
        if (custConfig?.colors?.length > 0) {
          setColorPalette(custConfig.colors)
          const matched = custConfig.colors.find(c => c.name.toLowerCase() === colorParam?.toLowerCase())
          setSelectedColor(matched || custConfig.colors[0])
        }
        // Load zone pricing from __pricing__ row in customizer_mockups
        const p = custConfig?.pricing || {}
        if (p.customizer_blank_price !== undefined) {
          setBlankPrice(Number(p.customizer_blank_price))
        }
        setZonePrices({
          front: p.customizer_print_cost_front !== undefined ? Number(p.customizer_print_cost_front) : 99,
          back: p.customizer_print_cost_back !== undefined ? Number(p.customizer_print_cost_back) : 99,
          left_sleeve: p.customizer_print_cost_left_sleeve !== undefined ? Number(p.customizer_print_cost_left_sleeve) : 99,
          right_sleeve: p.customizer_print_cost_right_sleeve !== undefined ? Number(p.customizer_print_cost_right_sleeve) : 99,
        })
        // Load size chart from store_settings
        const storeSettings = await getStoreSettings()
        if (storeSettings?.customizer_size_chart) {
          setSizeChart(storeSettings.customizer_size_chart)
        }
      } catch (err) {
        console.error("Failed to load customizer configurations:", err)
      }
    }
    fetchConfig()
  }, [colorParam, searchParams, designIdParam])

  // Custom designs database states
  const [userDesigns, setUserDesigns] = useState([])
  const [loadedDesignId, setLoadedDesignId] = useState(null)
  const [loadedDesignUserId, setLoadedDesignUserId] = useState(null)
  const [designLoading, setDesignLoading] = useState(false)

  const loadUserDesigns = useCallback(async () => {
    if (user?.id) {
      setDesignLoading(true)
      try {
        const list = await getUserCustomDesigns(user.id)
        setUserDesigns(list || [])
      } catch (err) {
        console.error("Error loading custom designs:", err)
      } finally {
        setDesignLoading(false)
      }
    } else {
      // LocalStorage fallback for anonymous users
      const localList = JSON.parse(localStorage.getItem('ftw_db_custom_designs') || '[]')
      setUserDesigns(localList.filter(d => !d.user_id))
    }
  }, [user?.id])

  useEffect(() => {
    loadUserDesigns()
  }, [loadUserDesigns])

  // Load design from query param if provided
  useEffect(() => {
    if (designIdParam) {
      const fetchAndLoad = async () => {
        const design = await getCustomDesign(designIdParam)
        if (design) {
          // Resolve style (just for id/name/icon — pricing is now zone-based)
          const matchedStyle = PRODUCT_STYLES.find(s => s.id === design.style_id)
          if (matchedStyle) setSelectedStyle(matchedStyle)

          // Resolve color from customizer palette
          let currentPalette = colorPalette
          if (colorPalette === COLOR_PALETTE) {
            try {
              const fetched = await getCustomizerConfig()
              if (fetched?.colors?.length > 0) currentPalette = fetched.colors
            } catch (e) { console.error(e) }
          }
          const matchedColor = currentPalette.find(c => c.name === design.color_name)
          if (matchedColor) setSelectedColor(matchedColor || currentPalette[0])

          setCanvasElements(design.canvas_elements)
          setLoadedDesignId(design.id)
          setLoadedDesignUserId(design.user_id)

          // Pre-populate gallery with all image-type elements from the loaded design
          const imageUrls = Object.values(design.canvas_elements || {})
            .flat()
            .filter(el => el.type === 'image' && el.url)
            .map(el => el.url)
          if (imageUrls.length > 0) {
            setUploadedImages(imageUrls)
            setUploadTab('gallery') // auto-switch to gallery tab
          }

          toast.success("Loaded saved design successfully!")
        }
      }
      fetchAndLoad()
    }
  }, [designIdParam])

  const isOwner = !loadedDesignId || !loadedDesignUserId || (user && user.id === loadedDesignUserId)

  // Mobile: which bottom drawer is open
  const [mobileDrawer, setMobileDrawer] = useState(null) // 'color'|'text'|'image'|'presets'
  // Desktop: which right-panel tab is active
  const [desktopTab, setDesktopTab] = useState('color') // 'color'|'text'|'image'|'presets'|'layers'
  // Mobile-only: subtotal accordion
  const [subtotalOpen, setSubtotalOpen] = useState(false)
  // Desktop: subtotal accordion
  const [desktopSubtotalOpen, setDesktopSubtotalOpen] = useState(false)

  // Canvas elements per zone
  const [canvasElements, setCanvasElements] = useState(
    Object.fromEntries(PRINT_ZONES.map(z => [z.id, []]))
  )
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [isResizing, setIsResizing] = useState(false)

  // Undo / redo
  const [history, setHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)

  // Text editor state
  const [textInput, setTextInput] = useState('')
  const [textFont, setTextFont] = useState('Inter')
  const [textColor, setTextColor] = useState('#161616')
  const [textSize, setTextSize] = useState(28)
  const [textBold, setTextBold] = useState(false)
  const [textItalic, setTextItalic] = useState(false)
  const [textUnderline, setTextUnderline] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)

  const [uploadedImages, setUploadedImages] = useState([])
  const [uploadTab, setUploadTab] = useState('upload')
  const [imageUploading, setImageUploading] = useState(false)

  // Summary review & checkout states
  const [showSummary, setShowSummary] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState({})
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [previewZoneIdx, setPreviewZoneIdx] = useState(0)

  const canvasRef = useRef(null)

  /* ── computed ── */
  const activeElement = canvasElements[activeZone]?.find(e => e.id === selectedElementId)
  const printingSubtotal = Object.entries(canvasElements)
    .filter(([, v]) => v.length > 0)
    .reduce((sum, [k]) => sum + (zonePrices[k] || 0), 0)
  const totalPrice = blankPrice + printingSubtotal

  // Sync selected text element properties to text editor panel and auto-switch tabs
  useEffect(() => {
    if (activeElement) {
      if (activeElement.type === 'text') {
        setTextInput(activeElement.content || '')
        setTextFont(activeElement.fontFamily || 'Inter')
        setTextColor(activeElement.color || '#161616')
        setTextSize(activeElement.size || 28)
        setTextBold(activeElement.bold || false)
        setTextItalic(activeElement.italic || false)
        setTextUnderline(activeElement.underline || false)

        // Auto-switch tabs to expose text controls (font, style, size)
        setDesktopTab('text')
        setMobileDrawer('text')
      } else if (activeElement.type === 'image') {
        // Auto-switch tabs to expose image controls
        setDesktopTab('image')
        setMobileDrawer('image')
      }
    }
  }, [selectedElementId, activeElement?.size, activeElement?.fontFamily, activeElement?.color, activeElement?.bold, activeElement?.italic, activeElement?.underline])

  /* ── helpers ── */
  const saveHistory = useCallback((els) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIdx + 1)
      const next = [...trimmed, JSON.parse(JSON.stringify(els))]
      setHistoryIdx(next.length - 1)
      return next
    })
  }, [historyIdx])

  const updateZone = useCallback((zone, updater) => {
    setCanvasElements(prev => {
      const next = { ...prev, [zone]: typeof updater === 'function' ? updater(prev[zone]) : updater }
      saveHistory(next)
      return next
    })
  }, [saveHistory])

  const undo = () => {
    if (historyIdx > 0) {
      const i = historyIdx - 1
      setHistoryIdx(i)
      setCanvasElements(JSON.parse(JSON.stringify(history[i])))
      setSelectedElementId(null)
    }
  }
  const redo = () => {
    if (historyIdx < history.length - 1) {
      const i = historyIdx + 1
      setHistoryIdx(i)
      setCanvasElements(JSON.parse(JSON.stringify(history[i])))
      setSelectedElementId(null)
    }
  }

  const addElement = (el) => {
    // Calculate print zone dimensions based on activeZone
    const zoneWidth = (activeZone === 'left_sleeve' || activeZone === 'right_sleeve') ? 420 * 0.22 : 420 * 0.45;
    const zoneHeight = (activeZone === 'left_sleeve' || activeZone === 'right_sleeve')
      ? 500 * 0.16
      : (activeZone === 'front' ? 500 * 0.52 : 500 * 0.62);

    // Approximate size of new element to center it accurately
    const estWidth = el.type === 'text' ? (el.content ? el.content.length * 10 : 80) : 80;
    const estHeight = el.type === 'text' ? (el.size || 28) : 80;

    const x = Math.max(0, (zoneWidth - estWidth) / 2);
    const y = Math.max(0, (zoneHeight - estHeight) / 2);

    const newEl = { id: `el-${Date.now()}`, x, y, scale: 1, rotation: 0, ...el }
    updateZone(activeZone, prev => [...prev, newEl])
    setSelectedElementId(newEl.id)
    setMobileDrawer(null)
  }

  const deleteElement = (id) => {
    updateZone(activeZone, prev => prev.filter(e => e.id !== id))
    if (selectedElementId === id) setSelectedElementId(null)
  }

  const updateElement = (updater) => {
    if (!selectedElementId) return
    updateZone(activeZone, prev => prev.map(e => e.id === selectedElementId ? { ...e, ...updater } : e))
  }

  const duplicateElement = (id) => {
    const el = canvasElements[activeZone].find(e => e.id === id)
    if (!el) return
    const dup = { ...JSON.parse(JSON.stringify(el)), id: `el-${Date.now()}`, x: el.x + 14, y: el.y + 14 }
    updateZone(activeZone, prev => [...prev, dup])
    setSelectedElementId(dup.id)
    toast.success('Duplicated!', { style: { background: '#111', color: '#fff' }, duration: 1200 })
  }

  const shiftLayer = (id, dir) => {
    const list = [...canvasElements[activeZone]]
    const idx = list.findIndex(e => e.id === id)
    const target = idx + dir
    if (target < 0 || target >= list.length) return
      ;[list[idx], list[target]] = [list[target], list[idx]]
    updateZone(activeZone, list)
  }

  const handleResizeStart = (e, el) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startY = e.touches ? e.touches[0].clientY : e.clientY;
    const startScale = el.scale || 1;
    const startSize = el.size || 28;

    const handleMouseMove = (moveEvent) => {
      const currentX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const dx = currentX - startX;
      const dy = currentY - startY;
      // Proportional scale factor
      const delta = (dx + dy) / 2;

      if (el.type === 'text') {
        const nextSize = Math.max(12, Math.min(120, Math.round(startSize + delta / 2)));
        updateElement({ size: nextSize });
      } else {
        const nextScale = Math.max(0.2, Math.min(2.5, +(startScale + delta / 100).toFixed(2)));
        updateElement({ scale: nextScale });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
  };

  const handleAddText = () => {
    const textToAdd = textInput.trim() || 'ADD TEXT'
    addElement({
      type: 'text', content: textToAdd, fontFamily: textFont,
      color: textColor, size: textSize, bold: textBold,
      italic: textItalic, underline: textUnderline,
    })
    setTextInput('')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so same file can be re-selected if needed
    e.target.value = ''

    setImageUploading(true)
    const uploadingToast = toast.loading('Uploading image to cloud...', {
      style: { background: '#161616', color: '#FAF9F6' }
    })

    try {
      // Convert file to base64 data URL
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = ev => resolve(ev.target?.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Upload to Cloudinary via Netlify function
      const res = await fetch('/.netlify/functions/cloudinary-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, folder: 'ftw_customizer' })
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed')
      }

      const cloudinaryUrl = data.url
      setUploadedImages(prev => [cloudinaryUrl, ...prev])
      addElement({ type: 'image', url: cloudinaryUrl, name: file.name })

      toast.success('Image uploaded! ✅', {
        id: uploadingToast,
        style: { background: '#161616', color: '#FAF9F6' }
      })
    } catch (err) {
      console.error('Cloudinary image upload error:', err)
      toast.error(`Upload failed: ${err.message}`, {
        id: uploadingToast,
        style: { background: '#161616', color: '#FAF9F6' }
      })
    } finally {
      setImageUploading(false)
    }
  }

  const handleAddPreset = (d) => {
    addElement({ type: 'preset', presetId: d.id, name: d.name, emoji: d.emoji, text: d.text })
  }

  const handleSaveAndContinue = async () => {
    const usedZonesCount = Object.values(canvasElements).filter(arr => arr.length > 0).length
    if (usedZonesCount === 0) {
      toast.error('Add at least one design element first!', { style: { background: '#111', color: '#fff' } })
      return
    }

    setDesignLoading(true)
    try {
      // If recreateParam is true, or if loadedDesignId matches the query param, we are recreating/editing
      // a template or order design. We must save it as a new design to prevent overwriting. Once saved,
      // loadedDesignId updates to the new ID, and subsequent saves will update that new design record.
      const isRecreationTemplate = recreateParam || (designIdParam && loadedDesignId === designIdParam)
      const finalDesignId = isRecreationTemplate ? `des-${Date.now()}` : (loadedDesignId || `des-${Date.now()}`)

      const designPayload = {
        id: finalDesignId,
        user_id: user?.id || null,
        style_id: selectedStyle.id,
        color_name: selectedColor.name,
        color_hex: selectedColor.hex,
        canvas_elements: canvasElements,
        total_price: totalPrice
      }

      const saved = await saveCustomDesign(designPayload)
      setLoadedDesignId(saved.id)

      setUserDesigns(prev => {
        const list = [...prev]
        const idx = list.findIndex(d => d.id === saved.id)
        if (idx !== -1) {
          list[idx] = saved
        } else {
          list.unshift(saved)
        }
        return list
      })

      toast.success('Design saved successfully! Proceeding...', { style: { background: '#111', color: '#fff' } })
      setShowSummary(true)
    } catch (err) {
      console.error("Failed to save custom design:", err)
      toast.error("Failed to save custom design. Continuing to summary anyway...")
      setShowSummary(true)
    } finally {
      setDesignLoading(false)
    }
  }

  const handleConfirmAddToCart = () => {
    const sizeKeys = Object.keys(selectedSizes)
    if (sizeKeys.length === 0) {
      toast.error('Please select at least one size!', { style: { background: '#111', color: '#fff' } })
      return
    }
    const zonesStr = Object.entries(canvasElements)
      .filter(([, v]) => v.length > 0)
      .map(([k]) => PRINT_ZONES.find(z => z.id === k)?.name)
      .join(', ')

    const designId = loadedDesignId || `des-unsaved-${Date.now()}`

    // Add each selected size to cart
    sizeKeys.forEach(size => {
      const qty = selectedSizes[size]
      const productId = `custom-${designId}-${size}`
      addToCart({
        id: productId,
        name: `Custom Tee — ${selectedColor.name} · ${zonesStr}`,
        price: totalPrice,
        image: selectedColor?.mockups?.front || MOCKUPS.front,
        designId: designId, // Attached for admin view and DB lookup
        customDesign: {
          style_id: selectedStyle.id,
          color_name: selectedColor.name,
          color_hex: selectedColor.hex,
          canvas_elements: canvasElements,
          total_price: totalPrice
        }
      }, size, selectedColor.name)

      if (qty > 1) {
        updateQty(productId, size, qty)
      }
    })

    toast.success('Custom items added to bag! 🎉', { style: { background: '#111', color: '#fff' } })
    navigate('/checkout')
  }

  /* ─── Canvas Element Renderer ─── */
  const renderElement = (el) => {
    const isSel = el.id === selectedElementId
    const zoneElements = canvasElements[activeZone] || []
    const idx = zoneElements.findIndex(item => item.id === el.id)
    const elementZIndex = isSel ? 50 : (10 + (idx !== -1 ? idx : 0))
    return (
      <motion.div
        key={el.id}
        drag={!isResizing} dragMomentum={false}
        onClick={e => { e.stopPropagation(); setSelectedElementId(el.id) }}
        onDragStart={() => setSelectedElementId(el.id)}
        onDrag={(_, info) => {
          setCanvasElements(prev => ({
            ...prev,
            [activeZone]: prev[activeZone].map(item =>
              item.id === el.id ? { ...item, x: item.x + info.delta.x, y: item.y + info.delta.y } : item
            )
          }))
        }}
        style={{ x: el.x, y: el.y, rotate: el.rotation, scale: el.scale, position: 'absolute', zIndex: elementZIndex }}
        className={`cursor-move flex items-center justify-center p-1.5 ${isSel ? 'outline-dashed outline-2 outline-purple-600 rounded-sm' : ''}`}
      >
        {isSel && (
          <motion.div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-purple-600 rounded-full border border-white cursor-se-resize z-[60] shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, el)}
            onTouchStart={(e) => handleResizeStart(e, el)}
            onClick={e => e.stopPropagation()}
            style={{ scale: el.type === 'text' ? 1 : 1 / (el.scale || 1), transformOrigin: 'center' }}
          />
        )}
        {el.type === 'text' && (
          <span style={{
            fontFamily: el.fontFamily, color: el.color,
            fontSize: el.size, fontWeight: el.bold ? 700 : 400,
            fontStyle: el.italic ? 'italic' : 'normal',
            textDecoration: el.underline ? 'underline' : 'none',
            userSelect: 'none', lineHeight: 1.1, whiteSpace: 'nowrap',
          }}>{el.content}</span>
        )}
        {el.type === 'image' && (
          <img src={el.url} alt="custom" className="max-w-[100px] max-h-[100px] object-contain pointer-events-none" />
        )}
        {el.type === 'preset' && (
          <div className="flex flex-col items-center gap-0.5 bg-white/85 rounded-lg px-2 py-1.5 shadow-sm border border-white/60">
            <span className="text-3xl leading-none">{el.emoji}</span>
            <span className="text-[7px] font-black uppercase tracking-widest text-dark/70 font-mono">{el.text}</span>
          </div>
        )}

        {/* Floating mini-toolbar when selected */}
        {isSel && (
          <motion.div
            className="absolute -top-9 left-1/2 flex items-center gap-0.5 bg-[#161616] rounded-2xl px-2 py-1.5 shadow-xl"
            onClick={e => e.stopPropagation()}
            style={{ x: '-50%', scale: el.type === 'text' ? 1 : 1 / (el.scale || 1), transformOrigin: 'center bottom' }}
          >
            <button
              onClick={() => {
                if (el.type === 'text') {
                  updateElement({ size: Math.min(120, (el.size || 28) + 4) })
                } else {
                  updateElement({ scale: Math.min(2.5, +(el.scale + 0.15).toFixed(2)) })
                }
              }}
              title="Increase Size"
              className="p-1 text-white/70 hover:text-orange-400 border-none bg-transparent cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (el.type === 'text') {
                  updateElement({ size: Math.max(12, (el.size || 28) - 4) })
                } else {
                  updateElement({ scale: Math.max(0.2, +(el.scale - 0.15).toFixed(2)) })
                }
              }}
              title="Decrease Size"
              className="p-1 text-white/70 hover:text-orange-400 border-none bg-transparent cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => updateElement({ rotation: (el.rotation + 15) % 360 })} title="Rotate" className="p-1 text-white/70 hover:text-orange-400 border-none bg-transparent cursor-pointer"><RotateCw className="w-3.5 h-3.5" /></button>
            <button onClick={() => duplicateElement(el.id)} title="Duplicate" className="p-1 text-white/70 hover:text-orange-400 border-none bg-transparent cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
            <div className="w-px h-3.5 bg-white/20" />
            <button onClick={() => deleteElement(el.id)} title="Delete" className="p-1 text-white/70 hover:text-red-400  border-none bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </motion.div>
    )
  }

  /* ─── Shared Drawer / Panel Content ─── */
  const ColorPanel = () => (
    <div className="space-y-5">
      {/* Colors */}
      <div>
        <p className="text-[12px] font-sans uppercase text-dark2/60 font-black mb-3 tracking-wider block">Base Color</p>
        <div className="flex flex-wrap gap-2.5">
          {colorPalette.map(col => {
            const isSel = selectedColor.name === col.name
            const isWhiteOrBeige = col.hex === '#FAF9F6' || col.hex === '#FAD7A0'
            return (
              <button
                key={col.name}
                onClick={() => setSelectedColor(col)}
                title={col.name}
                className={`w-9 h-9 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center relative ${isSel
                  ? 'ring-2 ring-offset-2 ring-accent scale-110 shadow-md'
                  : 'border border-neutral-200/60 hover:scale-105 hover:shadow-sm'
                  }`}
                style={{ backgroundColor: col.hex }}
              >
                {isSel && (
                  <span className={`w-2.5 h-2.5 rounded-full ${isWhiteOrBeige ? 'bg-dark' : 'bg-white'
                    }`} />
                )}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex justify-center">
          <span className="bg-dark text-white px-3.5 py-1.5 rounded-full text-[10.5px] font-sans uppercase tracking-wider font-bold shadow-sm">
            {selectedColor.name}
          </span>
        </div>
      </div>
    </div>
  )

  const TextPanel = () => (
    <div className="space-y-5">
      <div>
        <label className="text-[12px] font-sans uppercase text-dark2/60 font-black block mb-2 tracking-wider">Your Text</label>
        <input
          type="text"
          value={textInput}
          onChange={e => {
            setTextInput(e.target.value)
            if (activeElement && activeElement.type === 'text') {
              updateElement({ content: e.target.value })
            }
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleAddText() }}
          className="w-full px-4 py-3.5 border border-cream3 bg-cream2 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:bg-white text-dark transition-all duration-200 placeholder-dark/30 font-semibold"
          placeholder="e.g. FOR THE WIN"
          autoFocus
        />
      </div>

      <div>
        <label className="text-[12px] font-sans uppercase text-dark2/60 font-black block mb-2 tracking-wider">Font Family</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setFontDropdownOpen(v => !v)}
            className="w-full px-4 py-3 bg-white border border-cream3/80 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer hover:border-neutral-400 transition-all"
            style={{ fontFamily: textFont }}
          >
            <span>{textFont}</span>
            <ChevronDown className={`w-4 h-4 text-dark/50 transition-transform duration-200 ${fontDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {fontDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-[200] left-0 right-0 mt-1.5 bg-white border border-cream3 rounded-xl shadow-xl max-h-[220px] overflow-y-auto p-1.5 scrollbar-none"
              >
                {FONTS.map(font => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => {
                      setTextFont(font)
                      if (activeElement && activeElement.type === 'text') {
                        updateElement({ fontFamily: font })
                      }
                      setFontDropdownOpen(false)
                    }}
                    style={{ fontFamily: font }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border-none cursor-pointer text-left transition-all flex items-center justify-between ${textFont === font
                      ? 'bg-dark text-white font-bold'
                      : 'bg-transparent text-dark/80 hover:bg-neutral-100'
                      }`}
                  >
                    <span>{font}</span>
                    {textFont === font && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2.5 items-center">
        {[
          { label: 'B', key: 'bold', val: textBold, set: setTextBold, cls: 'font-black' },
          { label: 'I', key: 'italic', val: textItalic, set: setTextItalic, cls: 'italic' },
          { label: 'U', key: 'underline', val: textUnderline, set: setTextUnderline, cls: 'underline' },
        ].map(f => (
          <button key={f.key} onClick={() => {
            f.set(v => {
              const next = !v
              if (activeElement && activeElement.type === 'text') {
                updateElement({ [f.key]: next })
              }
              return next
            })
          }}
            className={`w-11 h-11 rounded-xl border border-cream3/80 text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center ${f.cls} ${f.val
              ? 'bg-dark text-white border-dark shadow-sm scale-105'
              : 'bg-white text-dark/70 hover:text-dark hover:border-neutral-400'
              }`}
          >{f.label}</button>
        ))}
        <div className="flex-1 ml-1.5">
          <div className="flex justify-between text-[10.5px] font-sans text-dark2/60 mb-1.5 tracking-wider uppercase font-black">
            <span>Size</span><span className="font-black text-dark">{textSize}px</span>
          </div>
          <input type="range" min="12" max="72" value={textSize} onChange={e => {
            const val = +e.target.value
            setTextSize(val)
            if (activeElement && activeElement.type === 'text') {
              updateElement({ size: val })
            }
          }}
            className="w-full h-1.5 rounded-full appearance-none bg-cream3 accent-purple-600 cursor-pointer" />
        </div>
      </div>

      <div>
        <label className="text-[12px] font-sans uppercase text-dark2/60 font-black block mb-2.5 tracking-wider">Text Color</label>
        <div className="flex gap-2 flex-wrap">
          {TEXT_COLORS.map(c => {
            const isSel = textColor === c
            return (
              <button key={c} onClick={() => {
                setTextColor(c)
                if (activeElement && activeElement.type === 'text') {
                  updateElement({ color: c })
                }
              }}
                className={`w-8 h-8 rounded-full shrink-0 cursor-pointer border border-neutral-200/50 flex items-center justify-center transition-all duration-200 ${isSel
                  ? 'ring-2 ring-offset-2 ring-purple-600 scale-110 shadow-sm'
                  : 'hover:scale-105 hover:shadow-xs'
                  }`}
                style={{ backgroundColor: c }}
              >
                {isSel && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c === '#FFFFFF' ? '#0B0B0B' : '#FFFFFF' }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {textInput && (
        <div className="border border-cream3 bg-cream2 rounded-xl p-4 flex items-center justify-center min-h-[64px] shadow-inner">
          <span style={{
            fontFamily: textFont, color: textColor, fontSize: Math.min(textSize, 32),
            fontWeight: textBold ? 700 : 400, fontStyle: textItalic ? 'italic' : 'normal',
            textDecoration: textUnderline ? 'underline' : 'none',
            wordBreak: 'break-all', textAlign: 'center'
          }}>{textInput}</span>
        </div>
      )}

      <button onClick={handleAddText}
        className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest border-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 hover:shadow-glow shadow-md hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>Add Text to Canvas</span>
      </button>
    </div>
  )

  const ImagePanel = () => (
    <div className="space-y-5">
      {/* Hide upload tab in readOnly mode — only show the design's images */}
      {!isReadOnly && (
        <div className="flex bg-cream3/60 p-1 rounded-xl gap-1">
          {['upload', 'gallery'].map(tab => {
            const isA = uploadTab === tab
            return (
              <button key={tab} onClick={() => setUploadTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border-none cursor-pointer capitalize transition-all duration-200 ${isA ? 'bg-white text-dark shadow-sm' : 'bg-transparent text-dark/40 hover:text-dark'}`}
              >{tab}</button>
            )
          })}
        </div>
      )}

      {/* Upload tab (only in edit mode) */}
      {!isReadOnly && uploadTab === 'upload' && (
        <label className={`group border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3.5 transition-all duration-300 ${imageUploading ? 'border-accent/60 bg-accent/5 cursor-wait' : 'border-cream3/80 hover:border-accent hover:bg-cream2/40 cursor-pointer'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 ${imageUploading ? 'bg-accent text-white' : 'bg-dark text-white group-hover:bg-accent'}`}>
            {imageUploading
              ? <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              : <Upload className="w-5 h-5" />}
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-dark mb-1">
              {imageUploading ? 'Uploading to Cloudinary...' : 'Upload Your Design'}
            </p>
            <p className="text-[11.5px] text-dark2/50 font-sans font-bold uppercase tracking-wider">
              {imageUploading ? 'Please wait' : 'PNG with transparent bg works best'}
            </p>
          </div>
          {!imageUploading && (
            <span className="px-5 py-2.5 bg-dark text-white group-hover:bg-accent rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300">Browse Files</span>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageUploading} />
        </label>
      )}

      {/* Gallery: shown in both modes. In readOnly it's the only view. */}
      {(isReadOnly || uploadTab === 'gallery') && (
        uploadedImages.length === 0
          ? (
            <div className="text-center py-12 space-y-2">
              <ImageIcon className="w-8 h-8 text-dark/20 mx-auto" />
              <p className="text-xs font-mono text-dark/40 uppercase tracking-widest">
                {isReadOnly ? 'No custom images in this design' : 'No images uploaded yet'}
              </p>
            </div>
          ) : (
            <div>
              {isReadOnly && (
                <p className="text-[9px] font-mono text-dark/40 uppercase tracking-widest mb-3">
                  Images used in this design
                </p>
              )}
              <div className="grid grid-cols-3 gap-3">
                {uploadedImages.map((img, i) => (
                  <div
                    key={i}
                    className={`relative aspect-square border border-cream3 rounded-xl overflow-hidden transition-all duration-300 p-1 bg-cream2 group/img ${isReadOnly
                        ? 'cursor-default hover:border-accent/40'
                        : 'hover:border-accent cursor-pointer hover:scale-105 hover:shadow-md'
                      }`}
                    onClick={!isReadOnly ? () => addElement({ type: 'image', url: img, name: `gallery-${i}` }) : undefined}
                  >
                    <img src={img} alt={`Design image ${i + 1}`} className="w-full h-full object-contain" />

                    {/* Download button — hover overlay */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        try {
                          const res = await fetch(img)
                          const blob = await res.blob()
                          const blobUrl = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = blobUrl
                          a.download = `ftw-design-image-${i + 1}.png`
                          a.click()
                          URL.revokeObjectURL(blobUrl)
                        } catch {
                          window.open(img, '_blank')
                        }
                      }}
                      className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-dark/80 hover:bg-accent text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 border-none cursor-pointer shadow-md backdrop-blur-sm"
                      title="Download image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  )

  const SizeChartModal = () => (
    <AnimatePresence>
      {showSizeChart && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSizeChart(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#FAF9F6] text-dark rounded-3xl p-6 md:p-8 shadow-2xl z-10 border border-cream3 flex flex-col md:flex-row gap-6 md:gap-8 max-h-[90vh] overflow-y-auto scrollbar-none"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Technical SVG Diagram */}
            <div className="flex-1 flex flex-col items-center justify-center bg-cream2/50 rounded-2xl p-6 border border-cream3 relative">
              <span className="absolute top-3 left-3 text-[8px] font-mono text-dark/40 uppercase tracking-widest">Blueprint v1.0</span>
              <svg viewBox="-10 0 120 100" className="w-40 h-40 stroke-dark/35 fill-none stroke-[1.2] drop-shadow-xs">
                {/* Collar/Neckline */}
                <path d="M40,20 C43,24 57,24 60,20" className="stroke-dark/60 stroke-[1.5]" />
                {/* Shirt body outline */}
                <path d="M40,20 L30,20 L15,33 L25,43 L32,39 L32,85 L68,85 L68,39 L75,43 L85,33 L70,20 L60,20" />
                {/* Chest width measurement marker (A) */}
                <line x1="32" y1="52" x2="68" y2="52" className="stroke-accent stroke-[1] stroke-dasharray-[2,2]" />
                <path d="M32,50 L32,54 M68,50 L68,54" className="stroke-accent stroke-[1]" />
                <text x="50" y="47" className="fill-accent text-[5.5px] font-mono font-black text-center stroke-none" textAnchor="middle">A: CHEST</text>

                {/* Length measurement marker (B) */}
                <line x1="50" y1="21" x2="50" y2="85" className="stroke-dark/50 stroke-[1] stroke-dasharray-[2,2]" />
                <path d="M48,21 L52,21 M48,85 L52,85" className="stroke-dark/50 stroke-[1]" />
                <text x="54" y="68" className="fill-dark/70 text-[5.5px] font-mono font-black stroke-none" textAnchor="start">B: LENGTH</text>

                {/* Sleeve measurement marker (C) */}
                <line x1="70" y1="20" x2="85" y2="33" className="stroke-orange-500 stroke-[1] stroke-dasharray-[2,2]" />
                <text x="78" y="16" className="fill-orange-500 text-[5.5px] font-mono font-black stroke-none" textAnchor="middle">C: SLEEVE</text>
              </svg>

              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-mono uppercase text-dark/50">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> A: Pit-to-Pit width</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-dark/55" /> B: Top-to-Bottom length</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> C: Shoulder-to-Hem sleeve</span>
              </div>
            </div>

            {/* Right Column: Sleek Streetwear Matrix Table */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black font-mono uppercase tracking-wider text-dark">Size Chart</h3>
                    <span className="text-[9px] font-mono text-dark/40 uppercase tracking-widest">Measurements in Inches</span>
                  </div>
                  <button
                    onClick={() => setShowSizeChart(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-cream2 border border-cream3 hover:bg-cream3 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4 text-dark/75" />
                  </button>
                </div>

                <div className="overflow-hidden border border-cream3 rounded-2xl bg-white">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-cream2 text-dark/65 font-bold border-b border-cream3 font-mono text-[9px] uppercase tracking-wider">
                        <th className="p-3.5">Size</th>
                        <th className="p-3.5 text-accent">A (Chest)</th>
                        <th className="p-3.5 text-dark/80">B (Length)</th>
                        <th className="p-3.5 text-orange-500">C (Sleeve)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream3 text-dark/75">
                      {Object.entries(sizeChart).map(([sz, row]) => (
                        <tr key={sz} className="hover:bg-cream2/50 transition-colors group">
                          <td className="p-3.5 font-bold font-mono text-dark text-sm group-hover:text-accent transition-colors">{sz}</td>
                          <td className="p-3.5 font-semibold text-dark">{row.chest || '-'}</td>
                          <td className="p-3.5 text-dark/60">{row.length || '-'}</td>
                          <td className="p-3.5 text-dark/60">{row.sleeve || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 md:mt-0 pt-4 border-t border-cream3 flex justify-between items-center text-[9px] font-mono text-dark/45 uppercase tracking-wider">
                <span>* Flat-laid unisex fit</span>
                <span className="text-dark/45">FOR THE WIN © 2026</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  const PresetsPanel = () => (
    <div className="space-y-3">
      <input type="text"
        className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl text-sm bg-neutral-50 focus:outline-none focus:border-[#161616] font-sans"
        placeholder="Search designs..."
      />
      <div className="grid grid-cols-2 gap-2.5">
        {READY_DESIGNS.map(d => (
          <button key={d.id} onClick={() => handleAddPreset(d)}
            className="p-3.5 border-2 border-neutral-100 rounded-2xl flex flex-col items-center gap-2 hover:border-orange-400 hover:shadow-md cursor-pointer transition-all bg-white"
          >
            <span className="text-3xl">{d.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-dark text-center leading-tight">{d.name}</p>
              <p className="text-[8px] text-dark/40 uppercase tracking-widest text-center mt-0.5">{d.category}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const LayersPanel = () => (
    <div className="space-y-2">
      {canvasElements[activeZone].length === 0 ? (
        <div className="text-center py-10 text-sm text-dark/40">
          <Palette className="w-8 h-8 mx-auto mb-2 text-dark/30" />
          No elements on {activeZone} yet
        </div>
      ) : (
        [...canvasElements[activeZone]].reverse().map((el) => (
          <div
            key={el.id}
            onClick={() => setSelectedElementId(el.id)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${selectedElementId === el.id
              ? 'border-purple-600 bg-purple-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-dark/60 shrink-0">
                {el.type === 'text' && <Type className="w-3.5 h-3.5" />}
                {el.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                {el.type === 'preset' && <Sparkles className="w-3.5 h-3.5" />}
              </span>
              <span className="text-xs font-bold text-dark truncate">
                {el.type === 'text' ? `"${el.content}"` : el.type === 'preset' ? el.name : el.name || 'Image'}
              </span>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteElement(el.id) }}
              className="text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer p-1 shrink-0"
            ><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))
      )}

      {/* Quick-edit selected element */}
      {activeElement && (
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
          <p className="text-[10px] font-mono uppercase text-dark/50 font-bold tracking-widest">Edit Selected</p>
          <div>
            <div className="flex justify-between text-[9px] font-mono text-dark/50 mb-1"><span>Scale</span><span>{activeElement.scale.toFixed(2)}x</span></div>
            <input type="range" min="0.2" max="2.5" step="0.05" value={activeElement.scale}
              onChange={e => updateElement({ scale: +e.target.value })}
              className="w-full accent-purple-600 cursor-pointer" />
          </div>
          <div>
            <div className="flex justify-between text-[9px] font-mono text-dark/50 mb-1"><span>Rotation</span><span>{activeElement.rotation}°</span></div>
            <input type="range" min="0" max="359" step="5" value={activeElement.rotation}
              onChange={e => updateElement({ rotation: +e.target.value })}
              className="w-full accent-purple-600 cursor-pointer" />
          </div>
          {activeElement.type === 'text' && (
            <div className="space-y-2">
              <div>
                <label className="text-[9px] font-mono uppercase text-dark/50 font-bold block mb-1">Content</label>
                <input type="text" value={activeElement.content}
                  onChange={e => updateElement({ content: e.target.value })}
                  className="w-full px-2.5 py-1.5 border-2 border-neutral-200 rounded-lg text-xs font-sans focus:outline-none focus:border-dark"
                />
              </div>
              <div>
                <div className="flex justify-between text-[9px] font-mono text-dark/50 mb-1"><span>Font Size</span><span>{activeElement.size || 28}px</span></div>
                <input type="range" min="12" max="120" value={activeElement.size || 28}
                  onChange={e => updateElement({ size: +e.target.value })}
                  className="w-full accent-orange-500 cursor-pointer" />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => duplicateElement(activeElement.id)}
              className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-dark rounded-xl text-xs font-bold border-none cursor-pointer transition-colors">Clone</button>
            <button onClick={() => deleteElement(activeElement.id)}
              className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors">Delete</button>
          </div>
        </div>
      )}
    </div>
  )

  const DesignsPanel = () => {
    const handleLoadDesign = (design) => {
      const matchedStyle = productStyles.find(s => s.id === design.style_id)
      if (matchedStyle) setSelectedStyle(matchedStyle)
      const matchedColor = colorPalette.find(c => c.name === design.color_name)
      if (matchedColor) setSelectedColor(matchedColor || colorPalette[0])

      // Extract and add custom design images to the gallery tab
      const designImageUrls = []
      if (design.canvas_elements) {
        Object.values(design.canvas_elements).forEach(elements => {
          if (Array.isArray(elements)) {
            elements.forEach(el => {
              if (el.type === 'image' && el.url) {
                designImageUrls.push(el.url)
              }
            })
          }
        })
      }

      if (designImageUrls.length > 0) {
        setUploadedImages(prev => {
          const merged = [...designImageUrls, ...prev]
          return Array.from(new Set(merged))
        })
      }

      setCanvasElements(design.canvas_elements)
      setLoadedDesignId(design.id)
      setMobileDrawer(null)
      toast.success("Design loaded successfully!")
    }

    const handleDeleteDesign = async (id, e) => {
      e.stopPropagation()
      if (confirm("Are you sure you want to delete this saved design?")) {
        await deleteCustomDesign(id)
        setUserDesigns(prev => prev.filter(d => d.id !== id))
        if (loadedDesignId === id) setLoadedDesignId(null)
        toast.success("Design deleted!")
      }
    }

    return (
      <div className="space-y-4">
        <p className="text-[12px] font-sans uppercase text-dark2/60 font-black tracking-wider block">
          {user ? `${user.email}'s Saved Designs` : "Temporary Saved Designs"}
        </p>

        {designLoading ? (
          <div className="text-center py-8 text-xs font-mono text-dark/45 uppercase tracking-widest animate-pulse">
            Loading designs...
          </div>
        ) : userDesigns.length === 0 ? (
          <div className="text-center py-10 text-xs font-mono text-dark/40 uppercase tracking-widest">
            No saved designs found
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {userDesigns.map((design, idx) => {
              const matchedStyle = productStyles.find(s => s.id === design.style_id)
              const printZonesCount = Object.values(design.canvas_elements).filter(arr => arr.length > 0).length
              const isCurrentlyLoaded = loadedDesignId === design.id

              return (
                <div
                  key={design.id}
                  onClick={() => handleLoadDesign(design)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 group ${isCurrentlyLoaded
                    ? 'border-purple-600 bg-purple-500/5 shadow-xs'
                    : 'border-purple-100 bg-white hover:border-purple-500 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 border border-cream3 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: design.color_hex }}
                    >
                      <img src={matchedStyle?.image || MOCKUPS.front} alt="" className="w-8 h-8 object-contain mix-blend-multiply select-none pointer-events-none" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-dark truncate uppercase tracking-tight">
                        Design {idx + 1}
                      </p>
                      <p className="text-[11.5px] font-sans text-dark2/50 font-bold mt-0.5 normal-case">
                        {matchedStyle?.name || "Custom Tee"} • {design.color_name} • {printZonesCount} Zone(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-dark">₹{design.total_price}</span>
                    <button
                      onClick={(e) => handleDeleteDesign(design.id, e)}
                      className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      title="Delete Design"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const DESKTOP_TABS = [
    { key: 'color', label: 'Color', icon: <Palette className="w-4 h-4" /> },
    { key: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { key: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'layers', label: 'Layers', icon: <Layers className="w-4 h-4" /> },
    { key: 'designs', label: 'My Designs', icon: <Sparkles className="w-4 h-4" /> },
  ]

  /* ─────────────── The T-shirt Canvas ─────────────── */
  const printBox = ZONE_BOXES[activeZone]
  const mockupSrc = selectedColor?.mockups?.[activeZone] || MOCKUPS[activeZone]

  const TShirtCanvas = ({ isMobile = false }) => {
    const width = 420
    const height = 500
    const scaleFactor = isMobile ? 0.714 : 1
    return (
      <div
        ref={canvasRef}
        onClick={() => setSelectedElementId(null)}
        className="relative rounded-2xl overflow-hidden bg-white shadow-lg mx-auto animate-fadeIn"
        style={{
          width,
          height,
          transform: `scale(${zoom * scaleFactor})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease',
          flexShrink: 0
        }}
      >
        {/* Colour underlay */}
        <div className="absolute inset-0 z-0 transition-colors duration-300" style={{ backgroundColor: selectedColor?.mockups ? '#FFFFFF' : selectedColor.hex }} />
        {/* Mockup photo */}
        <img src={mockupSrc} alt="T-shirt" className={`absolute inset-0 z-10 w-full h-full object-contain select-none pointer-events-none ${selectedColor?.mockups ? '' : 'mix-blend-multiply'}`} draggable={false} />
        {/* Grid */}
        {gridOn && (
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.08]"
            style={{ backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)', backgroundSize: '20px 20px' }}
          />
        )}
        {/* Elements (placed and clipped inside printBox) */}
        <div className="absolute overflow-hidden z-40" style={{
          top: printBox.top, left: printBox.left, width: printBox.width, height: printBox.height,
        }}>
          {canvasElements[activeZone].map(el => renderElement(el))}
        </div>
        {/* Dual black & white contrast borders for universal visibility on all backgrounds */}
        <div className="absolute z-50 pointer-events-none" style={{
          top: printBox.top, left: printBox.left, width: printBox.width, height: printBox.height,
          border: '2.5px solid rgba(0, 0, 0, 0.85)', borderRadius: 2,
        }} />
        <div className="absolute z-55 pointer-events-none" style={{
          top: printBox.top, left: printBox.left, width: printBox.width, height: printBox.height,
          border: '2.5px dashed rgba(255, 255, 255, 0.95)', borderRadius: 2,
        }} />
      </div>
    )
  }

  /* ─────────────────────── JSX ─────────────────────── */
  return (
    <div className="fixed inset-0 bg-[#FAF9F6] text-[#161616] flex flex-col font-sans overflow-hidden bg-grain" style={{ zIndex: 9999 }}>

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
          .customizer-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.015) 2px,
              rgba(139,92,246,0.015) 4px
            );
          }

          /* Outer border wrapper for customizer console panels */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.7), rgba(99,58,214,0.5), rgba(37,99,235,0.5));
            clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }

          /* HUD Console inside container */
          .hud-customizer-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            height: 100%;
            clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
          }

          /* Corner ticks */
          .hud-corner { position: absolute; width: 8px; height: 8px; border-color: rgba(139,92,246,0.38); border-style: solid; z-index: 10; }
          .hud-tl { top: 4px; left: 4px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 4px; right: 4px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 4px; left: 4px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 4px; right: 4px; border-width: 0 2px 2px 0; }

          .hud-hex { font-family: monospace; font-size: 7px; color: rgba(139,92,246,0.5); letter-spacing: 0.05em; font-weight: bold; }
        `
      }} />

      <div className="customizer-scanlines" />

      {/* ────────── SHARED TOPBAR ────────── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-[#E8E5DC] shadow-sm relative z-10">
        {/* Left */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors border-none bg-transparent cursor-pointer"
          ><ArrowLeft className="w-5 h-5 text-dark" /></button>
          <div className="hidden sm:block">
            <h1 className="text-[16px] font-black uppercase tracking-tight text-dark leading-none font-sans">Studio Customizer</h1>
            <span className="text-[13px] font-sans text-purple-600 uppercase tracking-widest font-black block mt-1">FOR THE WIN • DTF Studio</span>
          </div>
        </div>

        {/* Centre toolbar */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIdx <= 0}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors border-none bg-transparent ${historyIdx > 0 ? 'hover:bg-neutral-100 cursor-pointer text-dark' : 'text-neutral-300 cursor-not-allowed'}`}
          ><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors border-none bg-transparent ${historyIdx < history.length - 1 ? 'hover:bg-neutral-100 cursor-pointer text-dark' : 'text-neutral-300 cursor-not-allowed'}`}
          ><Redo2 className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          <button onClick={() => setGridOn(v => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors border-none cursor-pointer ${gridOn ? 'bg-purple-100 text-purple-600' : 'hover:bg-neutral-100 text-dark bg-transparent'}`}
          ><Grid3X3 className="w-4 h-4" /></button>
        </div>

        {/* Right: price + Add-to-bag (desktop only) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <span className="text-[11px] font-sans uppercase text-dark2/50 block font-bold">Estimated Total</span>
            <span className="text-lg font-black font-mono text-dark">₹{totalPrice}</span>
          </div>
          {(!isReadOnly || isOwner) && (
            <button onClick={handleSaveAndContinue}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:gap-2 sm:px-5 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider cursor-pointer border-none transition-all shadow-md animate-pulse"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Save & Continue</span>
            </button>
          )}
        </div>
      </div>

      {/* ════════════ MOBILE LAYOUT (< lg) ════════════ */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
          {/* Zoom */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
            <button onClick={() => setZoom(z => Math.min(2, +(z + 0.15).toFixed(2)))}
              className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer font-bold text-dark"
              style={{ border: '1px solid #e5e7eb' }}
            ><Plus className="w-4 h-4" /></button>
            <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))}
              className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer font-bold text-dark"
              style={{ border: '1px solid #e5e7eb' }}
            ><Minus className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center justify-center overflow-visible" style={{ width: 300, height: 360 }}>
            <TShirtCanvas isMobile={true} />
          </div>
        </div>

        {/* Zone switcher */}
        <div className="shrink-0 px-3 pb-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-white/50 overflow-x-auto scrollbar-none select-none">
            {PRINT_ZONES.map(zone => {
              const isA = activeZone === zone.id
              const cnt = canvasElements[zone.id]?.length || 0
              return (
                <button
                  key={zone.id}
                  onClick={() => { setActiveZone(zone.id); setSelectedElementId(null) }}
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black cursor-pointer border-none shrink-0 min-w-[115px] justify-center bg-transparent transition-colors duration-300 outline-none"
                  style={{
                    color: isA ? '#FFFFFF' : '#404040',
                  }}
                >
                  {/* Sliding active background */}
                  {isA && (
                    <motion.div
                      layoutId="activeMobileZonePill"
                      className="absolute inset-0 bg-[#161616] rounded-xl shadow-xs z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}

                  {/* Content wrapper */}
                  <div className="relative z-10 flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full overflow-hidden shrink-0 bg-white flex items-center justify-center border transition-all duration-300 p-0.5 ${isA ? 'border-white/40 scale-105 shadow-sm' : 'border-neutral-200'
                      }`}>
                      <img src={selectedColor?.mockups?.[zone.id] || zone.thumb} alt="" className="w-full h-full object-contain select-none pointer-events-none" />
                    </div>
                    <span className="whitespace-nowrap font-sans font-bold uppercase tracking-wider text-[9px]">{zone.name}</span>
                    {cnt > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black flex items-center justify-center min-w-[14px] h-3.5 transition-all duration-300 ${isA ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-neutral-900 text-white'
                        }`}>
                        {cnt}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Subtotal accordion */}
        <div className="shrink-0 bg-white border-t border-neutral-100 relative">
          <button onClick={() => setSubtotalOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 border-none bg-transparent cursor-pointer relative z-40"
          >
            <div className="flex items-center gap-2">
              {subtotalOpen ? <ChevronUp className="w-4 h-4 text-dark" /> : <ChevronDown className="w-4 h-4 text-dark" />}
              <span className="text-sm font-bold text-dark">Total Price</span>
            </div>
            <span className="text-sm font-bold text-dark">₹ {totalPrice}</span>
          </button>
          <AnimatePresence>
            {subtotalOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-full left-0 right-0 bg-white border-t border-neutral-150 p-4 pb-5 space-y-1.5 text-xs font-sans text-dark/60 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-30 rounded-t-2xl"
              >
                <div className="flex justify-between"><span>T-shirt blank</span><span className="font-bold text-dark">₹{blankPrice}</span></div>
                {Object.entries(canvasElements).filter(([, v]) => v.length > 0).map(([k]) => (
                  <div key={k} className="flex justify-between"><span>{PRINT_ZONES.find(z => z.id === k)?.name} print</span><span className="font-bold text-dark">₹{zonePrices[k] || 0}</span></div>
                ))}
                <div className="flex justify-between pt-1.5 border-t border-neutral-100 font-black text-dark text-sm">
                  <span>Total Estimate</span><span>₹{totalPrice}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom toolbar */}
        <div className="shrink-0 bg-white border-t border-neutral-100 px-2 py-2.5">
          <div className="flex items-center justify-around">
            {[
              { key: 'color', label: 'Color', icon: <Palette className="w-6 h-6" /> },
              { key: 'text', label: 'Text', icon: <Type className="w-6 h-6" /> },
              { key: 'image', label: 'Image', icon: <ImageIcon className="w-6 h-6" /> },
              { key: 'layers', label: 'Layers', icon: <Layers className="w-6 h-6" /> },
              { key: 'designs', label: 'Designs', icon: <Sparkles className="w-6 h-6" /> },
            ].map(item => (
              <button key={item.key}
                onClick={() => setMobileDrawer(d => d === item.key ? null : item.key)}
                className={`flex flex-col items-center gap-0.5 relative border-none bg-transparent cursor-pointer px-3 py-1 rounded-xl transition-colors ${mobileDrawer === item.key ? 'text-purple-600' : 'text-dark/60 hover:text-dark'}`}
              >
                {item.badge && <span className="absolute -top-0.5 right-2 w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                {item.icon}
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════ DESKTOP LAYOUT (≥ lg) ════════════ */}
      <div className="hidden lg:flex flex-1 overflow-hidden">

        {/* LEFT: Canvas area */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#EFEFEF]">
          {/* Zoom controls */}
          <div className="absolute top-6 right-6 z-10 flex flex-col gap-1.5">
            <button onClick={() => setZoom(z => Math.min(2, +(z + 0.15).toFixed(2)))}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-neutral-50 text-dark shadow-md"
              style={{ border: '1px solid #e5e7eb' }}><Plus className="w-4 h-4" /></button>
            <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-neutral-50 text-dark shadow-md"
              style={{ border: '1px solid #e5e7eb' }}><Minus className="w-4 h-4" /></button>
            <div className="text-center mt-1">
              <span className="text-[12px] font-sans font-black text-dark2/60">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }} className="hud-card-border shadow-2xl">
            <div
              ref={canvasRef}
              onClick={() => setSelectedElementId(null)}
              className="hud-checkout-card"
              style={{ width: 420, height: 500 }}
            >
              <div className="hud-corner hud-tl" />
              <div className="hud-corner hud-tr" />
              <div className="hud-corner hud-bl" />
              <div className="hud-corner hud-br" />

              <div className="absolute inset-0 z-0 transition-colors duration-300" style={{ backgroundColor: selectedColor?.mockups ? '#FFFFFF' : selectedColor.hex }} />
              <img src={mockupSrc} alt="T-shirt" className={`absolute inset-0 z-10 w-full h-full object-contain select-none pointer-events-none ${selectedColor?.mockups ? '' : 'mix-blend-multiply'}`} draggable={false} />
              {gridOn && (
                <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.08]"
                  style={{ backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
              )}
              {/* Elements (placed and clipped inside printBox) */}
              <div className="absolute overflow-hidden z-40" style={{
                top: printBox.top, left: printBox.left, width: printBox.width, height: printBox.height,
              }}>
                {canvasElements[activeZone].map(el => renderElement(el))}
              </div>
              {/* Print-zone boundary border (dual black & white contrast borders) */}
              <div className="absolute z-50 pointer-events-none" style={{
                top: printBox.top, left: printBox.left, width: printBox.width, height: printBox.height,
                border: '3px solid rgba(0, 0, 0, 0.85)', borderRadius: 4,
              }} />
              <div className="absolute z-55 pointer-events-none" style={{
                top: printBox.top, left: printBox.left, width: printBox.width, height: printBox.height,
                border: '3px dashed rgba(255, 255, 255, 0.95)', borderRadius: 4,
              }} />
            </div>
          </div>

          {/* Desktop zone switcher — below canvas */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 gap-1 select-none">
            {PRINT_ZONES.map(zone => {
              const isA = activeZone === zone.id
              const cnt = canvasElements[zone.id]?.length || 0
              return (
                <button
                  key={zone.id}
                  onClick={() => { setActiveZone(zone.id); setSelectedElementId(null) }}
                  className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer border-none min-w-[130px] justify-center bg-transparent transition-colors duration-300 outline-none"
                  style={{
                    color: isA ? '#FFFFFF' : '#404040',
                  }}
                >
                  {/* Sliding active background */}
                  {isA && (
                    <motion.div
                      layoutId="activeZonePill"
                      className="absolute inset-0 bg-[#161616] rounded-xl shadow-md z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}

                  {/* Content wrapper */}
                  <div className="relative z-10 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white flex items-center justify-center border transition-all duration-300 p-0.5 ${isA ? 'border-white/40 scale-105 shadow-sm' : 'border-neutral-200'
                      }`}>
                      <img src={selectedColor?.mockups?.[zone.id] || zone.thumb} alt="" className="w-full h-full object-contain select-none pointer-events-none" />
                    </div>
                    <span className="whitespace-nowrap font-sans font-black uppercase tracking-wider text-[12px]">{zone.name}</span>
                    {cnt > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center justify-center min-w-[16px] h-4 transition-all duration-300 ${isA ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-neutral-900 text-white'
                        }`}>
                        {cnt}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT: Control panel */}
        <div className="w-[360px] xl:w-[400px] bg-white border-l border-[#E8E5DC] flex flex-col shadow-xl relative z-10">
          {/* Tab strip */}
          <div className="shrink-0 flex border-b border-[#E8E5DC]/80 bg-neutral-50 p-1.5 gap-1">
            {DESKTOP_TABS.map(tab => {
              const isA = desktopTab === tab.key
              return (
                <button key={tab.key}
                  onClick={() => setDesktopTab(tab.key)}
                  title={tab.label}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-none cursor-pointer transition-all duration-200 relative text-xs font-bold ${isA
                    ? 'text-dark bg-white shadow-sm font-black scale-[1.02]'
                    : 'text-dark/40 bg-transparent hover:text-dark hover:bg-white/40'
                    }`}
                >
                  {tab.badge && (
                    <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shadow-[0_0_6px_#8B5CF6]" />
                  )}
                  <div className={`transition-colors duration-200 ${isA ? 'text-purple-600' : 'text-current'}`}>
                    {tab.icon}
                  </div>
                  <span className="text-[11px] tracking-wider uppercase font-sans font-black whitespace-nowrap">{tab.label}</span>
                  {isA && (
                    <div className="absolute bottom-0 left-1/3 right-1/3 h-[2.5px] bg-purple-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-none">
            {desktopTab === 'color' && <ColorPanel />}
            {desktopTab === 'text' && <TextPanel />}
            {desktopTab === 'image' && <ImagePanel />}
            {desktopTab === 'presets' && <PresetsPanel />}
            {desktopTab === 'layers' && <LayersPanel />}
            {desktopTab === 'designs' && <DesignsPanel />}
          </div>

          {/* Sticky pricing + CTA footer */}
          <div className="shrink-0 border-t border-neutral-100 p-5 bg-white relative">
            <div className="border border-neutral-200/60 rounded-2xl overflow-hidden mb-3">
              <button
                type="button"
                onClick={() => setDesktopSubtotalOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 border-none bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  {desktopSubtotalOpen ? <ChevronUp className="w-4 h-4 text-dark" /> : <ChevronDown className="w-4 h-4 text-dark" />}
                  <span className="text-[12px] font-sans uppercase text-dark2/60 font-black tracking-wider">Pricing Estimate</span>
                </div>
                <span className="text-sm font-black text-dark">₹{totalPrice}</span>
              </button>

              <AnimatePresence>
                {desktopSubtotalOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden bg-white border-t border-neutral-100"
                  >
                    <div className="p-4 space-y-2 text-xs font-sans text-dark/60">
                      <div className="flex justify-between">
                        <span>T-shirt blank</span>
                        <span className="font-bold text-dark">₹{blankPrice}</span>
                      </div>
                      {Object.entries(canvasElements).filter(([, v]) => v.length > 0).map(([k]) => (
                        <div key={k} className="flex justify-between">
                          <span>{PRINT_ZONES.find(z => z.id === k)?.name} print</span>
                          <span className="font-bold text-dark">₹{zonePrices[k] || 0}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-neutral-100 text-sm font-black text-dark">
                        <span>Total Estimate</span>
                        <span>₹{totalPrice}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {(!isReadOnly || isOwner) && (
              <button onClick={handleSaveAndContinue}
                className="w-full py-4 bg-[#161616] hover:bg-neutral-800 active:scale-[0.98] text-white rounded-2xl font-bold text-sm border-none cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>Save & Continue</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ MOBILE BOTTOM SHEET DRAWERS ═══════ */}
      <AnimatePresence>
        {mobileDrawer && (
          <div className="fixed inset-0 z-[300] flex items-end lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileDrawer(null)} className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-neutral-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 pb-3 border-b border-neutral-100 shrink-0">
                <h3 className="font-bold text-base text-dark flex items-center gap-2">
                  {mobileDrawer === 'color' && <><Palette className="w-4 h-4 text-purple-600" /> <span>Color & Style</span></>}
                  {mobileDrawer === 'text' && <><Type className="w-4 h-4 text-purple-600" /> <span>Add Text</span></>}
                  {mobileDrawer === 'image' && <><ImageIcon className="w-4 h-4 text-purple-600" /> <span>Upload Image</span></>}
                  {mobileDrawer === 'presets' && <><Sparkles className="w-4 h-4 text-purple-600" /> <span>Ready Designs</span></>}
                  {mobileDrawer === 'layers' && <><Layers className="w-4 h-4 text-purple-600" /> <span>Layers</span></>}
                  {mobileDrawer === 'designs' && <><Sparkles className="w-4 h-4 text-purple-600" /> <span>My Designs</span></>}
                </h3>
                <button onClick={() => setMobileDrawer(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 border-none bg-transparent cursor-pointer"
                ><X className="w-4 h-4 text-dark" /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-5 scrollbar-none">
                {mobileDrawer === 'color' && <ColorPanel />}
                {mobileDrawer === 'text' && <TextPanel />}
                {mobileDrawer === 'image' && <ImagePanel />}
                {mobileDrawer === 'presets' && <PresetsPanel />}
                {mobileDrawer === 'layers' && <LayersPanel />}
                {mobileDrawer === 'designs' && <DesignsPanel />}
              </div>
              {mobileDrawer === 'color' && (
                <div className="shrink-0 px-5 pb-5">
                  <button onClick={() => setMobileDrawer(null)}
                    className="w-full py-3.5 bg-[#161616] text-white rounded-2xl font-bold text-sm border-none cursor-pointer"
                  >Apply</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════ SUMMARY / CHECKOUT PREVIEW SCREEN ════════════ */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-[#FAF9F6] z-[500] flex flex-col overflow-y-auto scrollbar-none font-sans"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-cream3 shadow-xs sticky top-0 z-50">
              <button
                onClick={() => setShowSummary(false)}
                className="flex items-center gap-2 px-4 py-2 bg-transparent text-purple-600 hover:bg-purple-50 rounded-xl border-none cursor-pointer text-[13px] font-sans font-black uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Design
              </button>

              <div className="text-center">
                <h2 className="text-sm font-black uppercase tracking-tight text-dark leading-none">Review Your Tee</h2>
                <span className="text-[12px] font-sans text-dark2/50 font-black uppercase tracking-wider block mt-1">FOR THE WIN • checkout studio</span>
              </div>

              <div className="w-20 hidden sm:block" /> {/* Spacer */}
            </div>

            {/* Main Content Split */}
            <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">

              {/* Left Side: Large Mockup Slideshow */}
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-[12px] font-sans uppercase text-dark2/60 font-black tracking-wider block">
                    Previewing: {PRINT_ZONES[previewZoneIdx].name} ({previewZoneIdx + 1}/{PRINT_ZONES.length})
                  </h3>

                  {/* Status Badges */}
                  {canvasElements[PRINT_ZONES[previewZoneIdx].id]?.length > 0 ? (
                    <span className="bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {canvasElements[PRINT_ZONES[previewZoneIdx].id].length} Applied Print(s)
                    </span>
                  ) : (
                    <span className="bg-neutral-100 text-neutral-400 px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-wider">
                      Blank
                    </span>
                  )}
                </div>

                {/* Slideshow Display Container */}
                <div className="flex-1 flex items-center justify-center relative min-h-[380px] md:min-h-[580px]">

                  {/* Left Arrow Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewZoneIdx(prev => (prev === 0 ? PRINT_ZONES.length - 1 : prev - 1))}
                    className="absolute left-0 sm:left-4 z-40 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-cream3 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 text-dark"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Large Preview Mockup Card */}
                  <div className="w-full max-w-[420px] aspect-[42/50] relative flex items-center justify-center overflow-hidden">
                    <div
                      style={{
                        width: 420,
                        height: 500,
                        transform: 'scale(var(--preview-scale, 1))',
                        transformOrigin: 'center',
                      }}
                      className="relative rounded-2xl overflow-hidden bg-white shadow-lg border border-cream3 [--preview-scale:0.7] xs:[--preview-scale:0.8] sm:[--preview-scale:1] flex-shrink-0"
                    >
                      {PRINT_ZONES.map((zone, idx) => {
                        if (previewZoneIdx !== idx) return null
                        const zoneBox = ZONE_BOXES[zone.id]
                        return (
                          <div key={zone.id} className="absolute inset-0" style={{ width: 420, height: 500 }}>
                            {/* Colour underlay */}
                            <div className="absolute inset-0 z-0" style={{ backgroundColor: selectedColor.hex }} />
                            {/* Mockup photo */}
                            <img src={MOCKUPS[zone.id]} alt={zone.name} className="absolute inset-0 z-10 w-full h-full object-contain mix-blend-multiply select-none pointer-events-none" />
                            {/* Applied Elements */}
                            <div className="absolute overflow-hidden z-20" style={{
                              top: zoneBox.top, left: zoneBox.left, width: zoneBox.width, height: zoneBox.height,
                            }}>
                              {canvasElements[zone.id]?.map(el => (
                                <div
                                  key={el.id}
                                  style={{
                                    position: 'absolute',
                                    left: el.x,
                                    top: el.y,
                                    transform: `rotate(${el.rotation}deg) scale(${el.scale})`,
                                    transformOrigin: 'center',
                                    zIndex: 10
                                  }}
                                  className="flex items-center justify-center p-1.5"
                                >
                                  {el.type === 'text' && (
                                    <span style={{
                                      fontFamily: el.fontFamily, color: el.color,
                                      fontSize: el.size, fontWeight: el.bold ? 700 : 400,
                                      fontStyle: el.italic ? 'italic' : 'normal',
                                      textDecoration: el.underline ? 'underline' : 'none',
                                      userSelect: 'none', lineHeight: 1.1, whiteSpace: 'nowrap',
                                    }}>{el.content}</span>
                                  )}
                                  {el.type === 'image' && (
                                    <img src={el.url} alt="custom" className="max-w-[100px] max-h-[100px] object-contain pointer-events-none" />
                                  )}
                                  {el.type === 'preset' && (
                                    <div className="flex flex-col items-center gap-0.5 bg-white/85 rounded-lg px-2 py-1.5 shadow-sm border border-white/60">
                                      <span className="text-3xl leading-none">{el.emoji}</span>
                                      <span className="text-[7px] font-black uppercase tracking-widest text-dark/70 font-mono">{el.text}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right Arrow Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewZoneIdx(prev => (prev === PRINT_ZONES.length - 1 ? 0 : prev + 1))}
                    className="absolute right-0 sm:right-4 z-40 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-cream3 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 text-dark"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                </div>

                {/* Dots Navigation Indicators */}
                <div className="flex justify-center gap-1.5 shrink-0">
                  {PRINT_ZONES.map((zone, idx) => (
                    <button
                      key={zone.id}
                      onClick={() => setPreviewZoneIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-none ${previewZoneIdx === idx ? 'w-6 bg-purple-600' : 'w-2 bg-cream3 hover:bg-neutral-300'
                        }`}
                      title={zone.name}
                    />
                  ))}
                </div>
              </div>

              {/* Right Side: Options & Checkout Summary Card */}
              <div className="w-full lg:w-[380px] bg-white border border-cream3 rounded-3xl p-6 shadow-md space-y-6 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                  {/* Style & Base Color Description */}
                  <div>
                    <h1 className="text-base font-black text-dark leading-tight mb-1 uppercase tracking-tight">Custom Tee</h1>
                    <p className="text-xs text-dark/50 font-medium">Color: <span className="font-bold text-dark">{selectedColor.name}</span></p>
                  </div>

                  <hr className="border-cream3" />

                  {/* Size Selection */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-sans uppercase text-dark2/60 font-black tracking-wider block">Select Size(s)</label>
                      <button
                        onClick={() => setShowSizeChart(true)}
                        className="text-[12px] font-sans uppercase text-purple-600 hover:text-purple-800 font-black tracking-wider border-none bg-transparent cursor-pointer underline"
                      >
                        Size Chart
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.keys(sizeChart).map(size => {
                        const isS = !!selectedSizes[size]
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              setSelectedSizes(prev => {
                                const next = { ...prev }
                                if (next[size]) {
                                  delete next[size]
                                } else {
                                  next[size] = 1
                                }
                                return next
                              })
                            }}
                            className={`py-3 rounded-xl text-xs font-black border cursor-pointer transition-all duration-200 ${isS
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-102 font-bold'
                              : 'bg-transparent text-dark/70 border-cream3 hover:border-neutral-400 hover:border-purple-300'
                              }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>

                    {/* Quantities per Size */}
                    {Object.keys(selectedSizes).length > 0 && (
                      <div className="space-y-2 mt-3 bg-cream2/60 p-3.5 rounded-2xl border border-cream3/50">
                        <span className="text-[11.5px] font-sans uppercase text-dark2/60 font-black tracking-wider block mb-1">Quantities per Size</span>
                        {Object.entries(selectedSizes).map(([size, qty]) => (
                          <div key={size} className="flex items-center justify-between text-xs py-0.5">
                            <span className="font-bold text-dark">Size {size}</span>
                            <div className="flex items-center gap-1.5 bg-white border border-cream3 rounded-xl p-0.5">
                              <button
                                onClick={() => {
                                  setSelectedSizes(prev => {
                                    const next = { ...prev }
                                    if (next[size] > 1) {
                                      next[size]--
                                    } else {
                                      delete next[size]
                                    }
                                    return next
                                  })
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-neutral-100 cursor-pointer text-dark/80 font-bold border-none bg-transparent"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-black font-mono text-dark">{qty}</span>
                              <button
                                onClick={() => {
                                  setSelectedSizes(prev => ({ ...prev, [size]: prev[size] + 1 }))
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-neutral-100 cursor-pointer text-dark/80 font-bold border-none bg-transparent"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <hr className="border-cream3" />

                  {/* Price Summary */}
                  <div className="space-y-3 bg-cream2/60 rounded-2xl p-4 border border-cream3/50">
                    <h4 className="text-[12px] font-sans uppercase text-dark2/60 font-black tracking-wider block">Pricing Summary</h4>
                    <div className="space-y-2 text-xs font-sans text-dark/60">
                      <div className="flex justify-between">
                        <span>T-shirt blank</span>
                        <span className="font-bold text-dark">₹{blankPrice}</span>
                      </div>
                      {Object.entries(canvasElements).filter(([, v]) => v.length > 0).map(([k]) => (
                        <div key={k} className="flex justify-between">
                          <span>{PRINT_ZONES.find(z => z.id === k)?.name} print</span>
                          <span className="font-bold text-dark">₹{zonePrices[k] || 0}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-cream3 font-medium text-dark/80">
                        <span>Unit Price</span>
                        <span className="font-bold">₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-dark/80">
                        <span>Total Quantity</span>
                        <span>{Object.values(selectedSizes).reduce((sum, q) => sum + q, 0)}x</span>
                      </div>
                      <div className="flex justify-between pt-2.5 border-t border-dark/20 text-base font-black text-dark">
                        <span>Total Price</span>
                        <span className="font-mono text-purple-600">₹{totalPrice * Object.values(selectedSizes).reduce((sum, q) => sum + q, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Add to Cart Button */}
                <button
                  onClick={handleConfirmAddToCart}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] mt-6 border-none"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  Confirm & Add to Bag
                </button>
              </div>

            </div>

            {/* Render Size Chart Modal */}
            <SizeChartModal />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
