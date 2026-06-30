import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle, Trash2, Upload, AlertCircle, Sparkles, Plus, Image as ImageIcon, Star, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

const GLOBAL_COLOR_MAP = {
  'black': '#0F0F0F',
  'white': '#FFFFFF',
  'off-white': '#FAF9F6',
  'cream': '#FDF6E2',
  'beige': '#E1D9C1',
  'sand': '#D2C4A8',
  'charcoal': '#3E3E3E',
  'navy': '#1A2536',
  'olive': '#4D5844',
  'acid olive': '#595C43',
  'lime': '#CCFF00',
  'cyber blue': '#00E5FF',
  'acid purple': '#583F72',
  'dusty rose': '#DCAE96',
  'rose': '#E8A5A5',
  'pastel lavender': '#D8B4F8',
  'lavender': '#E6E6FA',
  'sage green': '#9CAF88',
  'sage': '#9CAF88',
  'peach': '#FFDAB9',
  'pink': '#FFC0CB',
  'brown': '#8B4513',
  'maroon': '#800000',
  'burgundy': '#800020',
  'terracotta': '#E2725B',
  'rust': '#B7410E',
  'teal': '#008080',
  'mint': '#98FF98',
  'lilac': '#C8A2C8'
}

const resolveColorHex = (colorStr) => {
  if (!colorStr) return '#CCCCCC';
  const hexMatch = colorStr.match(/#([0-9a-fA-F]{3,6})/);
  if (hexMatch) return `#${hexMatch[1]}`;

  const clean = colorStr.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase();
  if (GLOBAL_COLOR_MAP[clean]) return GLOBAL_COLOR_MAP[clean];

  for (const key in GLOBAL_COLOR_MAP) {
    if (clean.includes(key)) return GLOBAL_COLOR_MAP[key];
  }
  return '#CCCCCC';
}

export default function ProductFormModal({
  show,
  onClose,
  mode,
  productForm,
  setProductForm,
  onSave,
  categoriesList
}) {
  const [activeStep, setActiveStep] = useState(1)
  const [stepErrors, setStepErrors] = useState({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [customSizeInput, setCustomSizeInput] = useState('')
  const [colorNameInput, setColorNameInput] = useState('')
  const [selectedColorHex, setSelectedColorHex] = useState('#8A1525')
  const [activeConfigColor, setActiveConfigColor] = useState('')
  const [uploadingColorImage, setUploadingColorImage] = useState(false)
  const [bulkOriginalPrice, setBulkOriginalPrice] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!productForm.name || !productForm.name.trim()) errors.name = "Product Name is required";
      if (!productForm.sku || !productForm.sku.trim()) errors.sku = "SKU Reference is required";
      if (!productForm.category) errors.category = "Parent Category is required";
      if (productForm.weight === undefined || productForm.weight === '' || isNaN(productForm.weight)) errors.weight = "Weight is required";
    }
    if (step === 2) {
      if (!productForm.short_description || !productForm.short_description.trim()) errors.short_description = "Short Description is required";
      if (!productForm.fabric_info || !productForm.fabric_info.trim()) errors.fabric_info = "Fabric & Fit Info is required";
      if (!productForm.washing_instructions || !productForm.washing_instructions.trim()) errors.washing_instructions = "Care/Wash Notes are required";
    }
    if (step === 3) {
      if (!productForm.sizes || productForm.sizes.length === 0) errors.sizes = "Select at least one available size";
    }
    if (step === 4) {
      if (!productForm.colors || productForm.colors.length === 0) errors.colors = "Select at least one active color variant";
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  if (!show) return null

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingImage(true)
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          try {
            const base64Image = reader.result
            const res = await fetch('/.netlify/functions/cloudinary-upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Image })
            })
            if (!res.ok) {
              const errText = await res.text()
              throw new Error(errText || 'Upload failed')
            }
            const data = await res.json()
            resolve(data.url)
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
      })
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      setProductForm(prev => {
        const currentImages = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : [])
        const newImages = [...currentImages, ...uploadedUrls]
        return {
          ...prev,
          images: newImages,
          image: (prev.image === '' || prev.image === '/images/1.1.jpeg') && uploadedUrls.length > 0 ? uploadedUrls[0] : prev.image
        }
      })
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`)
    } catch (err) {
      console.error('Cloudinary upload error:', err)
      toast.error(`Upload failed: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleColorImageUpload = async (e, cleanedColorName) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingColorImage(true)
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          try {
            const base64Image = reader.result
            const res = await fetch('/.netlify/functions/cloudinary-upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Image })
            })
            if (!res.ok) {
              const errText = await res.text()
              throw new Error(errText || 'Upload failed')
            }
            const data = await res.json()
            resolve(data.url)
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
      })
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      setProductForm(prev => {
        const currentImages = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : [])
        const newImages = [...currentImages, ...uploadedUrls]

        const activeSizes = prev.sizes || []
        let currentVariants = Array.isArray(prev.variants) ? [...prev.variants] : []

        const existingForColor = currentVariants.find(v => v.color === cleanedColorName)
        const oldSelectedImages = existingForColor?.images || []
        const newSelectedImages = [...oldSelectedImages, ...uploadedUrls]

        activeSizes.forEach(sz => {
          const idx = currentVariants.findIndex(v => v.color === cleanedColorName && v.size === sz)
          if (idx > -1) {
            currentVariants[idx] = { ...currentVariants[idx], images: newSelectedImages }
          } else {
            currentVariants.push({ color: cleanedColorName, size: sz, images: newSelectedImages })
          }
        })

        return {
          ...prev,
          images: newImages,
          variants: currentVariants,
          image: (prev.image === '' || prev.image === '/images/1.1.jpeg') && uploadedUrls.length > 0 ? uploadedUrls[0] : prev.image
        }
      })
      toast.success(`${uploadedUrls.length} image(s) uploaded and mapped to ${cleanedColorName} successfully!`)
    } catch (err) {
      console.error('Cloudinary color upload error:', err)
      toast.error(`Upload failed: ${err.message}`)
    } finally {
      setUploadingColorImage(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-dark/70 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-[#FAFAF7] border-2 border-cream3 w-full max-w-5xl p-4 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-2xl relative z-10 text-sm font-sans max-h-[92vh] overflow-y-auto"
      >
        {/* Header Title Bar */}
        <div className="flex justify-between items-center border-b border-cream3 pb-5 mb-8 select-none">
          <div>
            <span className="text-xs text-accent font-black uppercase tracking-widest font-mono">Catalog Operations</span>
            <h3 className="font-display text-3xl font-black uppercase text-dark tracking-tight leading-none mt-1.5">
              {mode === 'add' ? 'Publish Product' : 'Modify Product'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-cream3 border border-cream3 text-dark transition-all cursor-pointer bg-white shadow-xs flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="flex items-center justify-between gap-2 bg-[#F6F5EF] border border-cream3 p-3 rounded-2xl mb-8 select-none overflow-x-auto scrollbar-none">
          {[
            { step: 1, label: 'Core Info' },
            { step: 2, label: 'Specifications' },
            { step: 3, label: 'Sizes Chart' },
            { step: 4, label: 'Color Swatches' },
            { step: 5, label: 'Media & Pricing' }
          ].map(s => {
            const isCompleted = activeStep > s.step;
            const isActive = activeStep === s.step;
            return (
              <button
                type="button"
                key={s.step}
                onClick={() => {
                  if (s.step < activeStep || validateStep(activeStep)) {
                    setStepErrors({});
                    setActiveStep(s.step);
                  } else {
                    toast.error("Please fill in all required fields highlighted in red.");
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer border-none shrink-0 ${isActive
                  ? 'bg-dark text-white shadow-sm scale-[1.02]'
                  : isCompleted
                    ? 'bg-accent/10 text-accent font-black'
                    : 'bg-white/40 text-dark2/45 hover:bg-white/70'
                  }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-black ${isActive
                  ? 'bg-accent text-white'
                  : isCompleted
                    ? 'bg-accent text-white'
                    : 'bg-cream3 text-dark2/40'
                  }`}>
                  {isCompleted ? '✓' : s.step}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={onSave} className="space-y-8">
          <div className="w-full">

            {/* SINGLE COLUMN: Info, Classification, Variables */}
            <div className="space-y-8">

              {/* Step 1: Core Details */}
              {activeStep === 1 && (
                <div className="bg-[#FAF9F5] border-2 border-cream3 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm transition-all">
                  <div className="flex items-center justify-between border-b border-cream3 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-dark font-black uppercase tracking-widest block">1. Details & Logistics</span>
                        <span className="text-[11px] text-dark/50 uppercase font-medium block mt-0.5">Configure product identity, SKU reference, weight, category, and catalog status.</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Product Identity */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-black text-dark2/60 block">Product Name *</label>
                        <input
                          type="text" value={productForm.name} onChange={(e) => {
                            setProductForm({ ...productForm, name: e.target.value })
                            if (stepErrors.name) setStepErrors({ ...stepErrors, name: null })
                          }}
                          className={`w-full px-4 py-3 bg-cream2/50 border rounded-xl focus:outline-none focus:bg-white text-sm font-sans font-bold text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50 ${stepErrors.name ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-cream3 focus:border-dark'
                            }`}
                          placeholder="e.g. Vintage Heavy Tee"
                        />
                        {stepErrors.name && <span className="text-[10px] text-red-500 font-bold font-mono block mt-0.5">{stepErrors.name}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-black text-dark2/60 block">SKU Reference *</label>
                        <input
                          type="text" value={productForm.sku} onChange={(e) => {
                            setProductForm({ ...productForm, sku: e.target.value })
                            if (stepErrors.sku) setStepErrors({ ...stepErrors, sku: null })
                          }}
                          className={`w-full px-4 py-3 bg-cream2/50 border rounded-xl focus:outline-none focus:bg-white text-sm font-mono font-bold text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50 ${stepErrors.sku ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-cream3 focus:border-dark'
                            }`}
                          placeholder="e.g. TEE-HVY-BLK"
                        />
                        {stepErrors.sku && <span className="text-[10px] text-red-500 font-bold font-mono block mt-0.5">{stepErrors.sku}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-black text-dark2/60 block">Weight (kg) *</label>
                        <input
                          type="number" step="0.01" value={productForm.weight} onChange={(e) => {
                            setProductForm({ ...productForm, weight: e.target.value })
                            if (stepErrors.weight) setStepErrors({ ...stepErrors, weight: null })
                          }}
                          className={`w-full px-4 py-3 bg-cream2/50 border rounded-xl focus:outline-none focus:bg-white text-sm font-mono font-bold text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50 ${stepErrors.weight ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-cream3 focus:border-dark'
                            }`}
                          placeholder="0.25"
                        />
                        {stepErrors.weight && <span className="text-[10px] text-red-500 font-bold font-mono block mt-0.5">{stepErrors.weight}</span>}
                      </div>
                    </div>

                    {/* Right Column: Classification & Store Visibility */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-black text-dark2/60 block">Parent Category *</label>
                        <select
                          value={productForm.category} onChange={(e) => {
                            setProductForm({ ...productForm, category: e.target.value })
                            if (stepErrors.category) setStepErrors({ ...stepErrors, category: null })
                          }}
                          className={`w-full px-4 py-3 bg-cream2/50 border rounded-xl focus:outline-none focus:bg-white text-sm font-sans font-bold text-dark transition-all ${stepErrors.category ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-cream3 focus:border-dark'
                            }`}
                        >
                          {categoriesList.length > 0 ? (
                            categoriesList.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))
                          ) : (
                            <>
                              <option value="Men">Men</option>
                              <option value="Women">Women</option>
                              <option value="Unisex">Unisex</option>
                              <option value="Accessories">Accessories</option>
                            </>
                          )}
                        </select>
                        {stepErrors.category && <span className="text-[10px] text-red-500 font-bold font-mono block mt-0.5">{stepErrors.category}</span>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-black text-dark2/60 block">Subcategory Label <span className="text-[10px] font-normal text-dark/40 font-mono lower-case">(Optional)</span></label>
                        <input
                          type="text" value={productForm.subcategory || ''} onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                          className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-sm font-sans font-bold text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50"
                          placeholder="e.g. Tee, Oversized"
                        />
                      </div>

                      {/* Store Visibility Toggle */}
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-black text-dark2/60 block">Visibility Status</label>
                        <div className="bg-[#FAF9F5]/80 border border-cream3 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 h-[46px] select-none">
                          <div className="leading-tight">
                            <label className="text-xs uppercase font-black text-dark block">Catalog Active</label>
                            <span className="text-[9px] text-dark/40 font-mono uppercase block">Visible in storefront?</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 scale-95">
                            <input
                              type="checkbox"
                              checked={productForm.available}
                              onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-cream3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-dark"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Specifications & Guide */}
              {activeStep === 2 && (
                <div className="bg-[#FAF9F5] border-2 border-cream3 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm transition-all">
                  <div className="flex items-center justify-between border-b border-cream3 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-dark font-black uppercase tracking-widest block">2. Specifications & Guide</span>
                        <span className="text-[11px] text-dark/50 uppercase font-medium block mt-0.5">Configure product short description, size guide notes, fabric & fit info, and care instructions.</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-black text-dark2/60 block">Short Description *</label>
                          <textarea
                            value={productForm.short_description || ''} onChange={(e) => {
                              setProductForm({ ...productForm, short_description: e.target.value })
                              if (stepErrors.short_description) setStepErrors({ ...stepErrors, short_description: null })
                            }}
                            rows="4"
                            className={`w-full px-4 py-3 bg-cream2/50 border rounded-xl focus:outline-none focus:bg-white text-sm font-sans text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50 ${stepErrors.short_description ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-cream3 focus:border-dark'
                              }`}
                            placeholder="e.g. Heavyweight luxury tee tailored with dropped shoulders..."
                          />
                          {stepErrors.short_description && <span className="text-[10px] text-red-500 font-bold font-mono block mt-0.5">{stepErrors.short_description}</span>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-black text-dark2/60 block">Size Guide Notes <span className="text-[10px] font-normal text-dark/40 font-mono lower-case">(Optional)</span></label>
                          <textarea
                            value={productForm.size_guide || ''} onChange={(e) => setProductForm({ ...productForm, size_guide: e.target.value })}
                            rows="4"
                            className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-sm font-sans text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50"
                            placeholder="e.g. Boxy fit. Buy one size smaller for regular fit."
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-black text-dark2/60 block">Fabric & Fit Info *</label>
                          <textarea
                            value={productForm.fabric_info || ''} onChange={(e) => {
                              setProductForm({ ...productForm, fabric_info: e.target.value })
                              if (stepErrors.fabric_info) setStepErrors({ ...stepErrors, fabric_info: null })
                            }}
                            rows="4"
                            className={`w-full px-4 py-3 bg-cream2/50 border rounded-xl focus:outline-none focus:bg-white text-sm font-sans text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50 ${stepErrors.fabric_info ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-cream3 focus:border-dark'
                              }`}
                            placeholder="e.g. 240 GSM organic loopback combed cotton."
                          />
                          {stepErrors.fabric_info && <span className="text-[10px] text-red-500 font-bold font-mono block mt-0.5">{stepErrors.fabric_info}</span>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-black text-dark2/60 block">Care/Wash Notes *</label>
                          <textarea
                            value={productForm.washing_instructions || ''} onChange={(e) => {
                              setProductForm({ ...productForm, washing_instructions: e.target.value })
                              if (stepErrors.washing_instructions) setStepErrors({ ...stepErrors, washing_instructions: null })
                            }}
                            rows="4"
                            className={`w-full px-4 py-3 bg-cream2/50 border rounded-xl focus:outline-none focus:bg-white text-sm font-sans text-dark transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50 ${stepErrors.washing_instructions ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-cream3 focus:border-dark'
                              }`}
                            placeholder="e.g. Wash cold inside out."
                          />
                          {stepErrors.washing_instructions && <span className="text-[10px] text-red-500 font-bold font-mono block mt-0.5">{stepErrors.washing_instructions}</span>}
                        </div>
                      </div>
                    </div>
                </div>
              )}

              {/* Step 3: Size Matrix */}
              {activeStep === 3 && (
                <div className={`border-2 p-6 rounded-3xl space-y-6 shadow-sm transition-all ${stepErrors.sizes ? 'bg-red-50/15 border-red-500' : 'bg-[#FAF9F5] border-cream3 hover:border-dark/15'
                  }`}>
                  <div className="flex items-center gap-2 border-b border-cream3 pb-2.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs font-mono text-dark font-black uppercase tracking-widest">3. Sizes Matrix & Chart</span>
                  </div>

                  {/* Size list selector */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-xs uppercase font-black text-dark2/60 block">Available Sizes *</label>
                        {stepErrors.sizes && <span className="text-xs text-red-500 font-bold font-mono block mt-0.5">{stepErrors.sizes}</span>}
                      </div>
                      <span className="text-[10px] font-mono text-dark/40 uppercase">{productForm.sizes.length} Selected</span>
                    </div>

                    {/* Preset Standard Sizes */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-dark/35 uppercase tracking-wider block">Standard Sizes</span>
                      <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                          const isChecked = productForm.sizes.includes(sz)
                          return (
                            <label key={sz} className={`flex items-center justify-center min-w-[50px] h-[42px] px-3.5 rounded-xl border cursor-pointer select-none text-xs font-mono font-black transition-all ${isChecked ? 'bg-dark border-dark text-white shadow-sm scale-[1.03]' : 'bg-white border-cream3 text-dark/70 hover:border-dark/30 hover:bg-cream2/20'
                              }`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const newSizes = isChecked
                                    ? productForm.sizes.filter(s => s !== sz)
                                    : [...productForm.sizes, sz]
                                  setProductForm({ ...productForm, sizes: newSizes })
                                  if (stepErrors.sizes) setStepErrors({ ...stepErrors, sizes: null })
                                }}
                                className="hidden"
                              />
                              {sz}
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Waist / Number Sizes */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-mono text-dark/35 uppercase tracking-wider block">Waist / Numerical Sizes</span>
                      <div className="flex flex-wrap gap-2">
                        {['30', '32', '34', '36', '38', '40', '42'].map(sz => {
                          const isChecked = productForm.sizes.includes(sz)
                          return (
                            <label key={sz} className={`flex items-center justify-center min-w-[50px] h-[42px] px-3.5 rounded-xl border cursor-pointer select-none text-xs font-mono font-black transition-all ${isChecked ? 'bg-dark border-dark text-white shadow-sm scale-[1.03]' : 'bg-white border-cream3 text-dark/70 hover:border-dark/30 hover:bg-cream2/20'
                              }`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const newSizes = isChecked
                                    ? productForm.sizes.filter(s => s !== sz)
                                    : [...productForm.sizes, sz]
                                  setProductForm({ ...productForm, sizes: newSizes })
                                  if (stepErrors.sizes) setStepErrors({ ...stepErrors, sizes: null })
                                }}
                                className="hidden"
                              />
                              {sz}
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Custom Size box */}
                    <div className="pt-2.5">
                      <span className="text-[10px] font-mono text-dark/35 uppercase tracking-wider block mb-1.5">Add Custom Size</span>
                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center max-w-md">
                        <input
                          type="text"
                          placeholder="e.g. OS, One Size, Custom"
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          className="px-4 py-3 bg-white border-2 border-cream3 rounded-xl focus:outline-none focus:border-dark text-sm font-sans flex-grow transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customSizeInput.trim() && !productForm.sizes.includes(customSizeInput.trim())) {
                              setProductForm({ ...productForm, sizes: [...productForm.sizes, customSizeInput.trim()] })
                              setCustomSizeInput('')
                              if (stepErrors.sizes) setStepErrors({ ...stepErrors, sizes: null })
                            }
                          }}
                          className="px-5 py-3 bg-[#161616] text-white hover:bg-accent rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-none shrink-0 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Size Chart measurements */}
                    {productForm.sizes && productForm.sizes.length > 0 && (
                      <div className="space-y-3 pt-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <label className="text-xs uppercase font-black text-dark2/60 block">Size Chart Measurements</label>
                          <button
                            type="button"
                            onClick={() => {
                              const defaults = {
                                XS: { chest: '38"', length: '26.5"', fit: 'Standard' },
                                S: { chest: '40"', length: '27.5"', fit: 'Relaxed' },
                                M: { chest: '42"', length: '28.5"', fit: 'Oversized' },
                                L: { chest: '44"', length: '29.5"', fit: 'Heavy Oversized' },
                                XL: { chest: '46"', length: '30.5"', fit: 'Boxy Drop' },
                                XXL: { chest: '48"', length: '31.5"', fit: 'Extra Boxy' }
                              }
                              const newSizes = Array.from(new Set([...productForm.sizes, 'S', 'M', 'L', 'XL']))
                              const newChart = { ...(productForm.size_chart || {}) }
                              newSizes.forEach(sz => {
                                if (defaults[sz]) {
                                  newChart[sz] = {
                                    chest: defaults[sz].chest,
                                    length: defaults[sz].length,
                                    fit: defaults[sz].fit
                                  }
                                }
                              })
                              setProductForm({
                                ...productForm,
                                sizes: newSizes,
                                size_chart: newChart
                              })
                              toast.success("Loaded default size chart values!")
                            }}
                            className="text-[10px] font-mono uppercase text-accent hover:text-dark font-black tracking-widest border-none bg-transparent cursor-pointer underline"
                          >
                            Auto-fill Defaults
                          </button>
                        </div>
                        <div className="border border-cream3 rounded-2xl bg-white overflow-x-auto text-sm shadow-xs">
                          <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                              <tr className="bg-cream2 text-dark/65 font-bold border-b border-cream3 font-mono text-xs uppercase tracking-wider">
                                <th className="p-3">Size</th>
                                <th className="p-3">Chest Width</th>
                                <th className="p-3">Length</th>
                                <th className="p-3">Fit Profile</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-cream3 text-dark/75">
                              {productForm.sizes.map(sz => {
                                const chartData = (productForm.size_chart && productForm.size_chart[sz]) || { chest: '', length: '', fit: '' }
                                return (
                                  <tr key={sz} className="hover:bg-cream2/20">
                                    <td className="p-3 font-bold font-mono text-dark text-base">{sz}</td>
                                    <td className="p-3">
                                      <input
                                        type="text"
                                        placeholder='e.g. 40"'
                                        value={chartData.chest || ''}
                                        onChange={(e) => {
                                          const newChart = { ...(productForm.size_chart || {}) }
                                          newChart[sz] = { ...chartData, chest: e.target.value }
                                          setProductForm({ ...productForm, size_chart: newChart })
                                        }}
                                        className="w-full px-3 py-2 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-sm font-semibold placeholder:text-xs placeholder:font-normal placeholder:opacity-50"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <input
                                        type="text"
                                        placeholder='e.g. 27.5"'
                                        value={chartData.length || ''}
                                        onChange={(e) => {
                                          const newChart = { ...(productForm.size_chart || {}) }
                                          newChart[sz] = { ...chartData, length: e.target.value }
                                          setProductForm({ ...productForm, size_chart: newChart })
                                        }}
                                        className="w-full px-3 py-2 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-sm font-semibold placeholder:text-xs placeholder:font-normal placeholder:opacity-50"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <input
                                        type="text"
                                        placeholder="e.g. Relaxed, Oversized"
                                        value={chartData.fit || ''}
                                        onChange={(e) => {
                                          const newChart = { ...(productForm.size_chart || {}) }
                                          newChart[sz] = { ...chartData, fit: e.target.value }
                                          setProductForm({ ...productForm, size_chart: newChart })
                                        }}
                                        className="w-full px-3 py-2 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-sm font-semibold placeholder:text-xs placeholder:font-normal placeholder:opacity-50"
                                      />
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Colors Matrix */}
              {activeStep === 4 && (
                <div className={`border-2 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm transition-all ${stepErrors.colors ? 'bg-red-50/15 border-red-500' : 'bg-[#FAF9F5] border-cream3 hover:border-dark/15'
                  }`}>
                  {/* Step Header */}
                  <div className="flex items-center justify-between border-b border-cream3 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-dark font-black uppercase tracking-widest block">4. Colors Matrix & Swatches</span>
                        <span className="text-[11px] text-dark/50 uppercase font-medium block mt-0.5">Define color swatches and set landing defaults for this product.</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white border border-cream3 rounded-full text-[10px] font-mono font-black text-dark/70 uppercase shadow-xs">
                      {productForm.colors.length} {productForm.colors.length === 1 ? 'Variant' : 'Variants'}
                    </span>
                  </div>

                  {/* Active Selected Swatches Card */}
                  <div className="bg-white p-6 rounded-2xl border border-cream3 space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-cream2 pb-3">
                      <div>
                        <label className="text-xs uppercase font-black text-dark tracking-wider block">Selected Variant Swatches *</label>
                        <span className="text-[10px] text-dark/40 font-mono uppercase block mt-0.5">Click the star icon on any swatch to make it the landing default.</span>
                      </div>
                      {stepErrors.colors && <span className="text-xs text-red-500 font-bold font-mono block">{stepErrors.colors}</span>}
                    </div>

                    {productForm.colors.length === 0 ? (
                      <div className="text-center py-8 bg-cream2/20 border-2 border-dashed border-cream3 rounded-xl text-xs text-dark/40 font-medium font-mono">
                        No color variants added yet. Choose from quick presets below or create a custom color.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 pt-1">
                        {productForm.colors.map(col => {
                          const hexValue = resolveColorHex(col)
                          const cleanedName = col.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                          const isDefault = productForm.default_color === cleanedName || (!productForm.default_color && productForm.colors[0] === col)

                          return (
                            <div key={col} className={`group inline-flex items-center gap-3 pl-3.5 pr-2 py-2.5 bg-[#FAF9F6] border rounded-2xl text-xs font-sans shadow-xs transition-all ${isDefault ? 'border-accent bg-accent/[0.03] ring-2 ring-accent/15' : 'border-cream3 hover:border-dark/30 hover:bg-white'}`}>
                              <span className="w-5 h-5 rounded-full border border-dark/15 shrink-0 shadow-inner inline-block" style={{ backgroundColor: hexValue }} />
                              <span className="text-dark font-black tracking-tight text-sm">
                                {cleanedName}
                              </span>
                              <div className="flex items-center gap-1.5 ml-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductForm({ ...productForm, default_color: cleanedName })
                                  }}
                                  className={`px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1 shrink-0 ${isDefault
                                    ? 'bg-accent text-white border-accent font-black shadow-xs'
                                    : 'bg-white border-cream3 text-dark/40 hover:text-dark hover:border-dark/40'
                                    }`}
                                  title={isDefault ? 'Current landing default color' : 'Set as landing default color'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isDefault ? 'fill-white text-white' : ''}`} />
                                  {isDefault && <span className="text-[9px] font-mono font-black uppercase tracking-wider">Default</span>}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const remainingColors = productForm.colors.filter(c => c !== col)
                                    const nextDefault = productForm.default_color === cleanedName ? (remainingColors[0]?.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim() || '') : productForm.default_color
                                    setProductForm({
                                      ...productForm,
                                      colors: remainingColors,
                                      default_color: nextDefault
                                    })
                                  }}
                                  className="text-dark/40 hover:text-red-500 font-bold border-none bg-cream2 hover:bg-red-50 rounded-xl cursor-pointer flex items-center justify-center p-2 transition-all shrink-0"
                                  title="Delete variant color"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2-Column Selection & Custom Creator Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Quick Add Presets (Span 7) */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-cream3 space-y-4 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="border-b border-cream2 pb-3 mb-4">
                          <label className="text-xs uppercase font-black text-dark tracking-wider block">Quick Add Presets</label>
                          <span className="text-[10px] text-dark/40 font-mono uppercase block mt-0.5">Click any standard color swatch below to toggle in your catalog.</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {[
                            { name: 'Black', hex: '#0F0F0F' },
                            { name: 'White', hex: '#FFFFFF' },
                            { name: 'Off-White', hex: '#FAF9F6' },
                            { name: 'Cream', hex: '#FDF6E2' },
                            { name: 'Beige', hex: '#E1D9C1' },
                            { name: 'Sand', hex: '#D2C4A8' },
                            { name: 'Charcoal', hex: '#3E3E3E' },
                            { name: 'Navy', hex: '#1A2536' },
                            { name: 'Olive', hex: '#4D5844' },
                            { name: 'Lime', hex: '#CCFF00' },
                            { name: 'Cyber Blue', hex: '#00E5FF' },
                            { name: 'Acid Purple', hex: '#583F72' }
                          ].map(preset => {
                            const labelWithName = `${preset.name} (${preset.hex})`
                            const isAdded = productForm.colors.includes(labelWithName) || productForm.colors.includes(preset.name)
                            return (
                              <button
                                type="button"
                                key={preset.name}
                                onClick={() => {
                                  if (isAdded) {
                                    setProductForm({
                                      ...productForm,
                                      colors: productForm.colors.filter(c => c !== preset.name && c !== labelWithName)
                                    })
                                  } else {
                                    setProductForm({
                                      ...productForm,
                                      colors: [...productForm.colors, labelWithName]
                                    })
                                    if (stepErrors.colors) setStepErrors({ ...stepErrors, colors: null })
                                  }
                                }}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${isAdded
                                  ? 'bg-dark text-white border-dark shadow-sm scale-[1.02]'
                                  : 'bg-[#FAF9F6] border-cream3 text-dark/80 hover:border-dark/30 hover:bg-cream2/20'
                                  }`}
                              >
                                <span className={`w-4 h-4 rounded-full border shrink-0 shadow-inner ${isAdded ? 'border-white/40' : 'border-cream3'}`} style={{ backgroundColor: preset.hex }} />
                                <span className="truncate flex-grow">{preset.name}</span>
                                {isAdded && <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Custom Color Creator (Span 5) */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-cream3 space-y-4 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="border-b border-cream2 pb-3 mb-4">
                          <label className="text-xs uppercase font-black text-dark tracking-wider block">Custom Color Creator</label>
                          <span className="text-[10px] text-dark/40 font-mono uppercase block mt-0.5">Pick a color hex and define a custom swatch name.</span>
                        </div>

                        <div className="space-y-4">
                          {/* Color preview and hex box */}
                          <div className="flex items-center gap-3 bg-[#FAF9F6] p-3 rounded-xl border border-cream3">
                            <div className="relative w-12 h-12 border-2 border-cream3 rounded-xl flex items-center justify-center bg-white cursor-pointer hover:border-dark shrink-0 shadow-xs transition-colors overflow-hidden">
                              <input
                                type="color"
                                value={selectedColorHex}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                onChange={(e) => {
                                  const hex = e.target.value.toUpperCase()
                                  setSelectedColorHex(hex)
                                  if (!colorNameInput || colorNameInput.startsWith('Custom') || colorNameInput.includes('#')) {
                                    setColorNameInput(`Custom (${hex})`)
                                  }
                                }}
                              />
                              <div className="w-full h-full" style={{ backgroundColor: selectedColorHex }} />
                            </div>
                            <div className="space-y-0.5 flex-grow">
                              <span className="text-[9px] uppercase font-mono font-black text-dark/40 block">Hex Code</span>
                              <span className="text-sm font-mono font-black text-dark block">{selectedColorHex}</span>
                            </div>
                          </div>

                          {/* Variant Name Input */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-dark/60 block">Variant Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Sage Green, Acid Olive"
                              value={colorNameInput}
                              onChange={(e) => setColorNameInput(e.target.value)}
                              className="w-full px-4 py-3 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-sm font-semibold transition-all placeholder:text-xs placeholder:font-normal placeholder:opacity-50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            let finalName = colorNameInput.trim()
                            if (!finalName) {
                              finalName = `Custom (${selectedColorHex})`
                            } else if (!finalName.includes(selectedColorHex)) {
                              finalName = `${finalName} (${selectedColorHex})`
                            }
                            if (!productForm.colors.includes(finalName)) {
                              setProductForm({ ...productForm, colors: [...productForm.colors, finalName] })
                              setColorNameInput('')
                              if (stepErrors.colors) setStepErrors({ ...stepErrors, colors: null })
                            }
                          }}
                          className="w-full py-3.5 bg-[#161616] hover:bg-accent text-white font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer border-none transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Custom Color</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Variant Pricing, Media & SEO Studio */}
              {activeStep === 5 && (
                <div className="bg-[#FAF9F5] border-2 border-cream3 p-6 sm:p-8 rounded-3xl space-y-8 shadow-sm transition-all">
                  {/* Step Header */}
                  <div className="flex items-center justify-between border-b border-cream3 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-dark font-black uppercase tracking-widest block">5. Variant Pricing & Gallery Studio</span>
                        <span className="text-[11px] text-dark/50 uppercase font-medium block mt-0.5">Customize specific pricing, stock, and galleries for each color variant.</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white border border-cream3 rounded-full text-[10px] font-mono font-black text-dark/70 uppercase shadow-xs">
                      {(productForm.colors || []).length} Color Variants
                    </span>
                  </div>

                  {(!productForm.colors || productForm.colors.length === 0) ? (
                    <div className="text-center py-12 bg-white border-2 border-dashed border-cream3 rounded-2xl p-8 space-y-3">
                      <AlertCircle className="w-8 h-8 text-accent/50 mx-auto" />
                      <div className="text-sm font-bold text-dark uppercase tracking-tight">No Colors Configured</div>
                      <p className="text-xs text-dark/50 max-w-md mx-auto">
                        Please go back to Step 4 and add at least one Active Color Variant before configuring variation pricing and galleries.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveStep(4)}
                        className="mt-2 px-5 py-2.5 bg-dark text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-none inline-block hover:bg-accent transition-colors"
                      >
                        Go to Step 4 (Colors)
                      </button>
                    </div>
                  ) : (() => {
                    const resolvedColors = productForm.colors || [];
                    const activeColor = resolvedColors.includes(activeConfigColor)
                      ? activeConfigColor
                      : (resolvedColors[0] || '');

                    const cleanedColorName = activeColor.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim();
                    const hexValue = resolveColorHex(activeColor);

                    const existingForColor = (productForm.variants || []).find(v => v.color === cleanedColorName);
                    const selectedImages = existingForColor?.images || [];

                    return (
                      <div className="space-y-6">
                        {/* Premium Color Selection Tabs */}
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs uppercase font-black text-dark tracking-wider block">Select Color Variant to Configure</label>
                            <span className="text-[10px] font-mono text-dark/40 uppercase">Active Tab: {cleanedColorName}</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5 bg-white p-3 rounded-2xl border border-cream3 shadow-xs">
                            {resolvedColors.map(colorItem => {
                              const tabCleanName = colorItem.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim();
                              const tabHex = resolveColorHex(colorItem);
                              const isActive = activeColor === colorItem;
                              const isTabDefault = productForm.default_color === tabCleanName || (!productForm.default_color && resolvedColors[0] === colorItem);
                              return (
                                <button
                                  type="button"
                                  key={colorItem}
                                  onClick={() => setActiveConfigColor(colorItem)}
                                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${isActive
                                    ? 'bg-[#161616] text-white border-dark shadow-md scale-[1.02] ring-2 ring-dark/15'
                                    : 'bg-[#FAF9F6] text-dark/75 border-cream3 hover:border-dark/30 hover:bg-white'
                                    }`}
                                >
                                  <span className={`w-4 h-4 rounded-full border shrink-0 shadow-inner ${isActive ? 'border-white/40' : 'border-cream3'}`} style={{ backgroundColor: tabHex }} />
                                  <span>{tabCleanName}</span>
                                  {isTabDefault && (
                                    <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-accent text-accent' : 'fill-accent/70 text-accent'}`} title="Default Landing Color" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Active Color Config Workspace Card */}
                        <div className="bg-white border border-cream3 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
                          <div className="flex items-center justify-between border-b border-cream2 pb-4">
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full border border-dark/20 shrink-0 shadow-inner inline-block" style={{ backgroundColor: hexValue }} />
                              <div>
                                <h4 className="font-display text-base font-black uppercase text-dark tracking-tight">
                                  Configuring: <span className="text-accent">{cleanedColorName}</span>
                                </h4>
                                <span className="text-[10px] text-dark/40 font-mono uppercase block mt-0.5">Overrides assigned specifically to this color option</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-black uppercase px-3 py-1 bg-[#FAF9F6] border border-cream3 rounded-lg text-dark/60">
                              {selectedImages.length} {selectedImages.length === 1 ? 'Asset' : 'Assets'} Attached
                            </span>
                          </div>                          {/* TOP ROW: Upload Box (Left) & Gallery Images (Right) */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left side: Upload File Box (Span 4) */}
                            <div className="lg:col-span-4 space-y-3.5 flex flex-col justify-between">
                              <div className="border-b border-cream2 pb-2.5">
                                <label className="text-xs uppercase font-black text-dark tracking-wider block">Upload Variant Media</label>
                                <span className="text-[10px] text-dark/40 font-mono uppercase block mt-0.5">Upload new photos for {cleanedColorName}.</span>
                              </div>

                              {/* Color-wise Upload Box */}
                              <label className="group flex-grow border-2 border-dashed border-cream3 hover:border-dark hover:bg-[#FAF9F6] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 bg-[#FAF9F6]/50 min-h-[180px]">
                                <div className="w-10 h-10 bg-dark text-white rounded-xl flex items-center justify-center group-hover:bg-accent shadow-md transition-all group-hover:scale-110">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div className="text-center select-none">
                                  <span className="text-xs font-black text-dark block uppercase tracking-wider">
                                    {uploadingColorImage ? 'Uploading assets...' : `Upload Photos for ${cleanedColorName}`}
                                  </span>
                                  <span className="text-[9px] text-dark/40 font-mono uppercase tracking-wider block mt-1">PNG / JPG to Cloudinary</span>
                                </div>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingColorImage}
                                  onChange={(e) => handleColorImageUpload(e, cleanedColorName)}
                                />
                              </label>
                            </div>

                            {/* Right side: Gallery Photos Selector Grid (Span 8) */}
                            <div className="lg:col-span-8 space-y-3.5">
                              <div className="border-b border-cream2 pb-2.5 flex justify-between items-center">
                                <div>
                                  <label className="text-xs uppercase font-black text-dark tracking-wider block">Variant Image Gallery</label>
                                  <span className="text-[10px] text-dark/40 font-mono uppercase block mt-0.5">Select store media to link with {cleanedColorName}.</span>
                                </div>
                                <span className="text-[10px] font-mono font-black uppercase text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                                  {selectedImages.length} Selected
                                </span>
                              </div>

                              {(!productForm.images || productForm.images.length === 0) ? (
                                <div className="p-8 border border-dashed border-cream3 rounded-2xl text-center text-xs text-dark/30 font-medium font-mono bg-[#FAF9F6] min-h-[180px] flex items-center justify-center">
                                  No product images in catalog yet. Upload on the left box!
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-3 bg-[#FAF9F6] rounded-2xl border border-cream3/80 shadow-inner">
                                  {productForm.images.map((imgUrl, imgIdx) => {
                                    const isChecked = selectedImages.includes(imgUrl);
                                    return (
                                      <div
                                        key={imgIdx}
                                        onClick={() => {
                                          let newSelected;
                                          if (isChecked) {
                                            newSelected = selectedImages.filter(url => url !== imgUrl);
                                          } else {
                                            newSelected = [...selectedImages, imgUrl];
                                          }
                                          const activeSizes = productForm.sizes || [];
                                          let currentVariants = Array.isArray(productForm.variants) ? [...productForm.variants] : [];
                                          activeSizes.forEach(sz => {
                                            const idx = currentVariants.findIndex(v => v.color === cleanedColorName && v.size === sz);
                                            if (idx > -1) {
                                              currentVariants[idx] = { ...currentVariants[idx], images: newSelected };
                                            } else {
                                              currentVariants.push({ color: cleanedColorName, size: sz, images: newSelected });
                                            }
                                          });
                                          setProductForm({ ...productForm, variants: currentVariants });
                                        }}
                                        className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 bg-white ${isChecked
                                          ? 'border-dark ring-4 ring-dark/15 shadow-lg scale-[1.02]'
                                          : 'border-cream3/80 opacity-75 hover:opacity-100 hover:border-dark/40 hover:scale-[1.02]'
                                          }`}
                                      >
                                        <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={`Thumb ${imgIdx + 1}`} />
                                        
                                        {/* Delete Photo Button */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const updatedImages = (productForm.images || []).filter(url => url !== imgUrl);
                                            let updatedVariants = (productForm.variants || []).map(v => ({
                                              ...v,
                                              images: Array.isArray(v.images) ? v.images.filter(url => url !== imgUrl) : []
                                            }));
                                            setProductForm({ ...productForm, images: updatedImages, variants: updatedVariants });
                                            toast.success(`Removed Photo #${imgIdx + 1}`);
                                          }}
                                          className="absolute top-2 left-2 z-20 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center border border-white shadow-md transition-all duration-200 hover:scale-110 cursor-pointer"
                                          title="Delete this photo from product catalog"
                                        >
                                          <Trash2 className="w-3 h-3 text-white" />
                                        </button>

                                        {isChecked ? (
                                          <>
                                            <div className="absolute inset-0 bg-dark/20 transition-opacity" />
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-dark text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                                            </div>
                                          </>
                                        ) : (
                                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 backdrop-blur-xs text-dark/40 rounded-full flex items-center justify-center border border-cream3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-3.5 h-3.5" />
                                          </div>
                                        )}
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark/80 to-transparent p-1.5 text-left">
                                          <span className="text-[8px] font-mono font-black text-white/90 uppercase block">Photo #{imgIdx + 1}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* BOTTOM SECTION: Full Width Size Price & Stock Configuration Table */}
                          <div className="space-y-4 pt-6 border-t border-cream2">
                            <div className="flex justify-between items-center border-b border-cream2 pb-2">
                              <div>
                                <label className="text-[11px] lg:text-xs uppercase font-black text-dark tracking-wider block">Size-Wise Pricing & Stock Configuration</label>
                                <span className="text-[9.5px] lg:text-[10.5px] text-dark/40 font-mono uppercase block mt-0.5">Configure regular MRP, sale price, and available inventory count for each size of {cleanedColorName}.</span>
                              </div>
                            </div>

                            {/* 1-Click Fast Bulk Fill Card */}
                            {productForm.sizes && productForm.sizes.length > 0 && (
                              <div className="bg-[#FAF9F5] border border-cream3 p-4 rounded-2xl space-y-3 shadow-xs font-sans">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-cream3/60 pb-2">
                                  <span className="text-[10px] lg:text-xs font-mono font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-accent" /> 1-Click Fast Bulk Fill (Save Time)
                                  </span>
                                  <span className="text-[9px] font-mono text-dark/40 uppercase">Fill once & apply to all</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-dark/50 block font-mono">Bulk Regular MRP (₹)</span>
                                    <input
                                      type="number"
                                      placeholder="e.g. 2499"
                                      value={bulkOriginalPrice}
                                      onChange={(e) => setBulkOriginalPrice(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-cream3 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-dark placeholder:opacity-40"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-dark/50 block font-mono">Bulk Sale Price (₹)</span>
                                    <input
                                      type="number"
                                      placeholder="e.g. 1999"
                                      value={bulkPrice}
                                      onChange={(e) => setBulkPrice(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-cream3 rounded-xl text-xs font-mono font-bold text-accent focus:outline-none focus:border-dark placeholder:opacity-40"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-dark/50 block font-mono">Bulk Stock Count</span>
                                    <input
                                      type="number"
                                      placeholder="e.g. 10"
                                      value={bulkStock}
                                      onChange={(e) => setBulkStock(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-cream3 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-dark placeholder:opacity-40"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (bulkOriginalPrice === '' && bulkPrice === '' && bulkStock === '') {
                                        toast.error("Please enter MRP, Sale Price, or Stock to bulk apply.")
                                        return
                                      }
                                      let currentVariants = Array.isArray(productForm.variants) ? [...productForm.variants] : []
                                      const availableSizes = productForm.sizes || []
                                      availableSizes.forEach(sizeItem => {
                                        const idx = currentVariants.findIndex(v => v.color === cleanedColorName && v.size === sizeItem)
                                        const newFields = {}
                                        if (bulkOriginalPrice !== '') newFields.originalPrice = Number(bulkOriginalPrice)
                                        if (bulkPrice !== '') newFields.price = Number(bulkPrice)
                                        if (bulkStock !== '') newFields.stock = Number(bulkStock)

                                        if (idx > -1) {
                                          currentVariants[idx] = { ...currentVariants[idx], ...newFields }
                                        } else {
                                          currentVariants.push({ color: cleanedColorName, size: sizeItem, ...newFields })
                                        }
                                      })
                                      setProductForm({ ...productForm, variants: currentVariants })
                                      toast.success(`Applied bulk prices & stock to all sizes for "${cleanedColorName}"!`)
                                    }}
                                    className="px-3.5 py-2 bg-dark hover:bg-accent hover:text-dark text-white rounded-xl text-[10px] lg:text-xs font-mono font-black uppercase tracking-wider cursor-pointer border-none transition-all flex items-center gap-1.5 shadow-xs"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                                    <span>Apply to all sizes ({cleanedColorName})</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (bulkOriginalPrice === '' && bulkPrice === '' && bulkStock === '') {
                                        toast.error("Please enter MRP, Sale Price, or Stock to bulk apply.")
                                        return
                                      }
                                      let currentVariants = Array.isArray(productForm.variants) ? [...productForm.variants] : []
                                      const availableSizes = productForm.sizes || []
                                      const availableColors = productForm.colors || []
                                      availableColors.forEach(colorItem => {
                                        const cName = colorItem.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
                                        availableSizes.forEach(sizeItem => {
                                          const idx = currentVariants.findIndex(v => v.color === cName && v.size === sizeItem)
                                          const newFields = {}
                                          if (bulkOriginalPrice !== '') newFields.originalPrice = Number(bulkOriginalPrice)
                                          if (bulkPrice !== '') newFields.price = Number(bulkPrice)
                                          if (bulkStock !== '') newFields.stock = Number(bulkStock)

                                          if (idx > -1) {
                                            currentVariants[idx] = { ...currentVariants[idx], ...newFields }
                                          } else {
                                            currentVariants.push({ color: cName, size: sizeItem, ...newFields })
                                          }
                                        })
                                      })
                                      setProductForm({ ...productForm, variants: currentVariants })
                                      toast.success("Applied bulk prices & stock across ALL colors and sizes!")
                                    }}
                                    className="px-3.5 py-2 bg-white hover:bg-cream3 text-dark border border-cream3 rounded-xl text-[10px] lg:text-xs font-mono font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
                                  >
                                    <span>Apply to ALL Colors & Sizes</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {(!productForm.sizes || productForm.sizes.length === 0) ? (
                              <div className="p-6 border border-dashed border-cream3 rounded-2xl text-center text-xs text-dark/40 font-medium font-mono bg-[#FAF9F6]">
                                Please select available sizes in Step 3 to configure size pricing and stock.
                              </div>
                            ) : (
                              <div className="border border-cream3 rounded-2xl bg-white overflow-hidden shadow-xs">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                                    <thead>
                                      <tr className="bg-[#FAF9F6] text-dark/70 font-bold border-b border-cream3 font-mono text-[10px] lg:text-xs uppercase tracking-wider">
                                        <th className="p-3 lg:p-3.5 w-24">Size</th>
                                        <th className="p-3 lg:p-3.5">MRP (Regular Price)</th>
                                        <th className="p-3 lg:p-3.5">Sale Price</th>
                                        <th className="p-3 lg:p-3.5">Available Stock</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-cream3 text-dark">
                                      {productForm.sizes.map(sizeItem => {
                                        const variant = (productForm.variants || []).find(v => v.color === cleanedColorName && v.size === sizeItem) || {};
                                        const variantPrice = variant.price !== undefined ? variant.price : '';
                                        const variantOriginalPrice = variant.originalPrice !== undefined ? variant.originalPrice : '';
                                        const variantStock = variant.stock !== undefined ? variant.stock : '';

                                        return (
                                          <tr key={sizeItem} className="hover:bg-cream2/15 transition-colors">
                                            <td className="p-3 lg:p-3.5 font-black font-mono text-dark text-xs lg:text-sm">{sizeItem}</td>
                                            <td className="p-3 lg:p-3.5">
                                              <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-xs text-dark/40 font-mono font-bold">₹</span>
                                                <input
                                                  type="number"
                                                  placeholder="e.g. 2499"
                                                  value={variantOriginalPrice}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    let currentVariants = Array.isArray(productForm.variants) ? [...productForm.variants] : [];
                                                    const idx = currentVariants.findIndex(v => v.color === cleanedColorName && v.size === sizeItem);

                                                    if (idx > -1) {
                                                      if (val === '') {
                                                        const updated = { ...currentVariants[idx] };
                                                        delete updated.originalPrice;
                                                        currentVariants[idx] = updated;
                                                      } else {
                                                        currentVariants[idx] = { ...currentVariants[idx], originalPrice: Number(val) };
                                                      }
                                                    } else {
                                                      if (val !== '') {
                                                        currentVariants.push({ color: cleanedColorName, size: sizeItem, originalPrice: Number(val) });
                                                      }
                                                    }
                                                    setProductForm({ ...productForm, variants: currentVariants });
                                                  }}
                                                  className="w-full pl-7 pr-3 py-2 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-bold placeholder:opacity-40"
                                                />
                                              </div>
                                            </td>
                                            <td className="p-3 lg:p-3.5">
                                              <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-xs text-accent font-mono font-bold">₹</span>
                                                <input
                                                  type="number"
                                                  placeholder="e.g. 1999"
                                                  value={variantPrice}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    let currentVariants = Array.isArray(productForm.variants) ? [...productForm.variants] : [];
                                                    const idx = currentVariants.findIndex(v => v.color === cleanedColorName && v.size === sizeItem);

                                                    if (idx > -1) {
                                                      if (val === '') {
                                                        const updated = { ...currentVariants[idx] };
                                                        delete updated.price;
                                                        currentVariants[idx] = updated;
                                                      } else {
                                                        currentVariants[idx] = { ...currentVariants[idx], price: Number(val) };
                                                      }
                                                    } else {
                                                      if (val !== '') {
                                                        currentVariants.push({ color: cleanedColorName, size: sizeItem, price: Number(val) });
                                                      }
                                                    }
                                                    setProductForm({ ...productForm, variants: currentVariants });
                                                  }}
                                                  className="w-full pl-7 pr-3 py-2 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-black text-accent placeholder:opacity-40"
                                                />
                                              </div>
                                            </td>
                                            <td className="p-3 lg:p-3.5">
                                              <input
                                                type="number"
                                                placeholder="e.g. 10"
                                                value={variantStock}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  let currentVariants = Array.isArray(productForm.variants) ? [...productForm.variants] : [];
                                                  const idx = currentVariants.findIndex(v => v.color === cleanedColorName && v.size === sizeItem);

                                                  if (idx > -1) {
                                                    if (val === '') {
                                                      const updated = { ...currentVariants[idx] };
                                                      delete updated.stock;
                                                      currentVariants[idx] = updated;
                                                    } else {
                                                      currentVariants[idx] = { ...currentVariants[idx], stock: Number(val) };
                                                    }
                                                  } else {
                                                    if (val !== '') {
                                                      currentVariants.push({ color: cleanedColorName, size: sizeItem, stock: Number(val) });
                                                    }
                                                  }
                                                  setProductForm({ ...productForm, variants: currentVariants });
                                                }}
                                                className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-bold placeholder:opacity-40"
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SEO & Discoverability Card */}
                  <div className="bg-white border border-cream3 p-6 sm:p-7 rounded-2xl space-y-4 shadow-xs">
                    <div className="border-b border-cream2 pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase font-black text-dark tracking-wider block">SEO & Catalog Metadata</span>
                        <span className="text-[10px] text-dark/40 font-mono uppercase block mt-0.5">Configure Google search tags and storefront badges.</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase font-black text-accent bg-accent/10 px-2.5 py-1 rounded-md">Metadata Studio</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-dark/60 block">SEO Title Tag</label>
                        <input
                          type="text" value={productForm.seo_title || ''} onChange={(e) => setProductForm({ ...productForm, seo_title: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans font-medium text-dark transition-all placeholder:opacity-40"
                          placeholder="e.g. Vintage Heavyweight Tee | FTW Apparel"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-dark/60 block">Badge Tag (Storefront Badge)</label>
                        <input
                          type="text" value={productForm.tag || ''} onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans font-bold text-dark transition-all placeholder:opacity-40"
                          placeholder="e.g. New Drop, Bestseller, Limited"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] uppercase font-black text-dark/60 block">SEO Meta Description</label>
                      <input
                        type="text" value={productForm.seo_description || ''} onChange={(e) => setProductForm({ ...productForm, seo_description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans text-dark transition-all placeholder:opacity-40"
                        placeholder="Provide a concise description for search engines..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Trigger Wizard Navigation */}
              <div className="pt-6 border-t border-cream3 flex justify-between items-center gap-4">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="px-6 py-3 bg-white hover:bg-cream2 text-dark font-sans font-black text-xs uppercase tracking-widest rounded-2xl border border-cream3 transition-all cursor-pointer shadow-xs"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {activeStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(activeStep)) {
                        setStepErrors({});
                        setActiveStep(prev => prev + 1);
                      } else {
                        toast.error("Please fill in all required fields highlighted in red.");
                      }
                    }}
                    className="px-8 py-3.5 bg-[#161616] hover:bg-accent text-white font-sans font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all cursor-pointer border-none"
                  >
                    Next Step
                  </button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-8 py-3.5 bg-accent hover:bg-dark text-white font-sans font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-glow cursor-pointer border-none flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Catalog Product</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
