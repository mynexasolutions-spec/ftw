import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle, Trash2, Upload, AlertCircle, Sparkles, Plus, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ProductFormModal({
  show,
  onClose,
  mode,
  productForm,
  setProductForm,
  onSave,
  categoriesList
}) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [customSizeInput, setCustomSizeInput] = useState('')
  const [colorNameInput, setColorNameInput] = useState('')
  const [selectedColorHex, setSelectedColorHex] = useState('#8A1525')

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div onClick={onClose} className="absolute inset-0 bg-dark/70 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-[#FAFAF7] border-2 border-cream3 w-full max-w-5xl p-4 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-2xl relative z-10 text-sm font-sans max-h-[92vh] overflow-y-auto"
      >
        {/* Header Title Bar */}
        <div className="flex justify-between items-center border-b border-cream3 pb-4 mb-6 select-none">
          <div>
            <span className="text-[10px] text-accent font-black uppercase tracking-widest font-mono">Catalog Operations</span>
            <h3 className="font-display text-2xl font-black uppercase text-dark tracking-tight leading-none mt-1">
              {mode === 'add' ? 'Publish Product' : 'Modify Product'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-cream3 border border-cream3 text-dark transition-all cursor-pointer bg-white shadow-xs flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Media, Pricing, Status (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Media Section */}
              <div className="bg-white border border-cream3 p-5 rounded-2xl space-y-4 shadow-sm hover:border-dark/10 transition-colors">
                <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest font-black block border-b border-cream2 pb-1.5">Product Gallery</span>
                
                {/* File Drop Area */}
                <label className="group border border-dashed border-cream3/80 hover:border-accent hover:bg-cream2/20 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-350">
                  <div className="w-9 h-9 bg-dark text-white rounded-lg flex items-center justify-center group-hover:bg-accent shadow-sm transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-dark block">{uploadingImage ? 'Uploading assets...' : 'Choose Product Images'}</span>
                    <span className="text-[8px] text-dark/35 font-mono uppercase tracking-wider block mt-0.5">JPEG/PNG up to 10MB</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                  />
                </label>

                {/* Previews grid */}
                {productForm.images && productForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 bg-cream2/30 p-2 rounded-xl border border-cream3/60">
                    {productForm.images.map((img, index) => {
                      const isPrimary = productForm.image === img
                      return (
                        <div key={index} className={`relative aspect-[4/5] rounded-lg overflow-hidden border group bg-white ${isPrimary ? 'border-dark shadow-sm ring-1 ring-dark' : 'border-cream3'}`}>
                          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          
                          {isPrimary && (
                            <span className="absolute top-1 left-1 bg-dark text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider scale-90 origin-top-left">
                              Main
                            </span>
                          )}

                          <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, image: img })}
                                className="w-full py-1 bg-white hover:bg-cream text-dark text-[8px] font-black rounded uppercase tracking-wider border-none cursor-pointer"
                              >
                                Set Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = productForm.images.filter(i => i !== img)
                                const newPrimary = productForm.image === img ? (newImages[0] || '') : productForm.image
                                setProductForm({
                                  ...productForm,
                                  images: newImages,
                                  image: newPrimary
                                })
                              }}
                              className="w-full py-1 bg-red-650 hover:bg-red-700 text-white text-[8px] font-black rounded uppercase tracking-wider border-none cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Pricing Section */}
              <div className="bg-white border border-cream3 p-5 rounded-2xl space-y-4 shadow-sm hover:border-dark/10 transition-colors">
                <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest font-black block border-b border-cream2 pb-1.5">Pricing & Valuation</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">MRP (INR) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-dark/35 font-mono font-bold">₹</span>
                      <input
                        type="number" required value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-bold text-dark transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Sale Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-dark/35 font-mono font-bold">₹</span>
                      <input
                        type="number" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-black text-accent transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-white border border-cream3 p-5 rounded-2xl space-y-4 shadow-sm hover:border-dark/10 transition-colors">
                <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest font-black block border-b border-cream2 pb-1.5">Store Visibility</span>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-dark uppercase block">Catalog Active</span>
                    <span className="text-[9px] text-dark2/45 uppercase font-medium block mt-0.5">Is visible to customers?</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={productForm.available}
                      onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-cream3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dark"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Info, Classification, Variables (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Product Info Block */}
              <div className="bg-white border border-cream3 p-5 rounded-2xl space-y-4 shadow-sm hover:border-dark/10 transition-colors">
                <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest font-black block border-b border-cream2 pb-1.5">1. Details & Logistics</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Product Name *</label>
                    <input
                      type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans font-bold text-dark transition-all"
                      placeholder="e.g. Vintage Heavy Tee"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">SKU Reference *</label>
                    <input
                      type="text" required value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-bold text-dark transition-all"
                      placeholder="e.g. TEE-HVY-BLK"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Parent Category *</label>
                    <select
                      value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans font-bold text-dark transition-all"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Subcategory Label *</label>
                    <input
                      type="text" required value={productForm.subcategory} onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans font-bold text-dark transition-all"
                      placeholder="e.g. Tee, Oversized"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Weight (kg) *</label>
                    <input
                      type="number" step="0.01" required value={productForm.weight} onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-bold text-dark transition-all"
                      placeholder="0.25"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Stock Qty *</label>
                    <input
                      type="number" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-mono font-bold text-dark transition-all"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications Block */}
              <div className="bg-white border border-cream3 p-5 rounded-2xl space-y-4 shadow-sm hover:border-dark/10 transition-colors">
                <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest font-black block border-b border-cream2 pb-1.5">2. Specifications & Guide</span>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Short Description *</label>
                    <textarea
                      required value={productForm.short_description} onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                      rows="5"
                      className="w-full px-3.5 py-2 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans text-dark transition-all"
                      placeholder="e.g. Heavyweight luxury tee tailored with dropped shoulders..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Fabric & Fit Info *</label>
                    <textarea
                      required value={productForm.fabric_info || ''} onChange={(e) => setProductForm({ ...productForm, fabric_info: e.target.value })}
                      rows="5"
                      className="w-full px-3.5 py-2 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans text-dark transition-all"
                      placeholder="e.g. 240 GSM organic loopback combed cotton."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Care/Wash Notes *</label>
                    <textarea
                      required value={productForm.washing_instructions || ''} onChange={(e) => setProductForm({ ...productForm, washing_instructions: e.target.value })}
                      rows="5"
                      className="w-full px-3.5 py-2 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans text-dark transition-all"
                      placeholder="e.g. Wash cold inside out."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">Size Guide Notes</label>
                    <textarea
                      value={productForm.size_guide || ''} onChange={(e) => setProductForm({ ...productForm, size_guide: e.target.value })}
                      rows="5"
                      className="w-full px-3.5 py-2 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans text-dark transition-all"
                      placeholder="e.g. Boxy fit. Buy one size smaller for regular fit."
                    />
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="bg-[#FAF9F5] border-2 border-cream3 p-6 rounded-3xl space-y-6 shadow-sm hover:border-dark/15 transition-all">
                <div className="flex items-center gap-2 border-b border-cream3 pb-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-mono text-dark font-black uppercase tracking-widest">3. Size & Color Matrices</span>
                </div>
                
                {/* Size list selector */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-black text-dark/65 tracking-wider block">Available Sizes</label>
                    <span className="text-[9px] font-mono text-dark/40 uppercase">{productForm.sizes.length} Selected</span>
                  </div>
                  
                  {/* Preset Standard Sizes */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-mono text-dark/35 uppercase tracking-wider block">Standard Sizes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                        const isChecked = productForm.sizes.includes(sz)
                        return (
                          <label key={sz} className={`flex items-center justify-center min-w-[42px] h-[36px] px-3 rounded-xl border cursor-pointer select-none text-[10px] font-mono font-black transition-all ${
                            isChecked ? 'bg-dark border-dark text-white shadow-sm scale-[1.03]' : 'bg-white border-cream3 text-dark/70 hover:border-dark/30 hover:bg-cream2/20'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const newSizes = isChecked
                                  ? productForm.sizes.filter(s => s !== sz)
                                  : [...productForm.sizes, sz]
                                setProductForm({ ...productForm, sizes: newSizes })
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
                    <span className="text-[8px] font-mono text-dark/35 uppercase tracking-wider block">Waist / Numerical Sizes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['30', '32', '34', '36', '38', '40', '42'].map(sz => {
                        const isChecked = productForm.sizes.includes(sz)
                        return (
                          <label key={sz} className={`flex items-center justify-center min-w-[42px] h-[36px] px-3 rounded-xl border cursor-pointer select-none text-[10px] font-mono font-black transition-all ${
                            isChecked ? 'bg-dark border-dark text-white shadow-sm scale-[1.03]' : 'bg-white border-cream3 text-dark/70 hover:border-dark/30 hover:bg-cream2/20'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const newSizes = isChecked
                                  ? productForm.sizes.filter(s => s !== sz)
                                  : [...productForm.sizes, sz]
                                setProductForm({ ...productForm, sizes: newSizes })
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
                  <div className="pt-2">
                    <span className="text-[8px] font-mono text-dark/35 uppercase tracking-wider block mb-1.5">Add Custom Size</span>
                    <div className="flex gap-2 items-center max-w-sm">
                      <input
                        type="text"
                        placeholder="e.g. OS, One Size, Custom"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        className="px-3.5 py-2 bg-white border-2 border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs font-sans flex-grow transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customSizeInput.trim() && !productForm.sizes.includes(customSizeInput.trim())) {
                            setProductForm({ ...productForm, sizes: [...productForm.sizes, customSizeInput.trim()] })
                            setCustomSizeInput('')
                          }
                        }}
                        className="px-4 py-2 bg-[#161616] text-white hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border-none shrink-0 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Size Chart measurements */}
                  {productForm.sizes && productForm.sizes.length > 0 && (
                    <div className="space-y-3 pt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-black text-dark/65 tracking-wider block">Size Chart Measurements</label>
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
                          className="text-[9px] font-mono uppercase text-accent hover:text-dark font-black tracking-widest border-none bg-transparent cursor-pointer underline"
                        >
                          Auto-fill Defaults
                        </button>
                      </div>
                      <div className="border border-cream3 rounded-2xl bg-white overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-cream2 text-dark/65 font-bold border-b border-cream3 font-mono text-[9px] uppercase tracking-wider">
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
                                  <td className="p-3 font-bold font-mono text-dark text-sm">{sz}</td>
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
                                      className="w-full px-2 py-1.5 border border-cream3 rounded-lg focus:outline-none focus:border-dark text-xs"
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
                                      className="w-full px-2 py-1.5 border border-cream3 rounded-lg focus:outline-none focus:border-dark text-xs"
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
                                      className="w-full px-2 py-1.5 border border-cream3 rounded-lg focus:outline-none focus:border-dark text-xs"
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

                {/* Divider */}
                <div className="border-t border-cream3/80 my-4" />

                {/* Color swatches list */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-black text-dark/65 tracking-wider block">Active Colors</label>
                    <span className="text-[9px] font-mono text-dark/40 uppercase">{productForm.colors.length} Variants</span>
                  </div>

                  {productForm.colors.length === 0 ? (
                    <div className="text-center py-4 bg-white/50 border border-dashed border-cream3 rounded-2xl text-xs text-dark/40 font-medium">
                      No colors added yet. Select presets or create a custom variant color.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {productForm.colors.map(col => {
                        let hexValue = '#CCCCCC'
                        const hexMatch = col.match(/#([0-9a-fA-F]{3,6})/)
                        if (hexMatch) {
                          hexValue = `#${hexMatch[1]}`
                        } else {
                          const COLOR_MAP = {
                            'Black': '#0F0F0F', 'White': '#FFFFFF', 'Lime': '#CCFF00', 'Charcoal': '#3E3E3E',
                            'Beige': '#E1D9C1', 'Cream': '#FDF6E2', 'Navy': '#1A2536', 'Olive': '#4D5844',
                            'Cyber Blue': '#00E5FF', 'Acid Purple': '#583F72', 'Acid Olive': '#595C43',
                            'Sand': '#D2C4A8', 'Off-White': '#FAF9F6'
                          }
                          hexValue = COLOR_MAP[col] || COLOR_MAP[col.charAt(0).toUpperCase() + col.slice(1).toLowerCase()] || '#CCCCCC'
                        }

                        return (
                          <div key={col} className="group inline-flex items-center gap-2.5 pl-2.5 pr-1.5 py-1.5 bg-white border border-cream3 rounded-2xl text-[10px] font-black font-sans shadow-xs hover:border-dark/25 transition-all">
                            <span className="w-4 h-4 rounded-full border border-cream3 shrink-0 shadow-inner" style={{ backgroundColor: hexValue }} />
                            <span className="text-dark tracking-tight">{col}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm({ ...productForm, colors: productForm.colors.filter(c => c !== col) })
                              }}
                              className="text-dark/40 hover:text-red-500 font-bold border-none bg-cream2 hover:bg-red-50 rounded-lg cursor-pointer flex items-center justify-center p-1.5 transition-all"
                              title="Delete variant color"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Preset Colors Grid */}
                  <div className="space-y-2 bg-white/70 p-4 rounded-2xl border border-cream3/80">
                    <span className="text-[8px] uppercase font-mono font-black text-dark/40 tracking-wider block mb-1">Quick Add Preset Colors</span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
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
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-[9px] font-bold text-left cursor-pointer transition-all ${
                              isAdded ? 'bg-dark/5 border-dark text-dark font-black' : 'bg-white border-cream3 text-dark2/70 hover:border-dark/20 hover:bg-cream2/10'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-cream3 shrink-0" style={{ backgroundColor: preset.hex }} />
                            <span className="truncate">{preset.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Add Color variant picker panel */}
                  <div className="bg-cream2/30 p-4 rounded-2xl border-2 border-cream3 space-y-3">
                    <span className="text-[8px] uppercase font-mono font-black text-dark/40 tracking-wider block">Custom Color Creator</span>
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                      <div className="flex gap-2.5 items-center flex-grow">
                        <div className="relative w-10 h-10 border-2 border-cream3 rounded-2xl flex items-center justify-center bg-white cursor-pointer hover:border-dark shrink-0 shadow-xs transition-colors">
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
                          <div className="w-7 h-7 rounded-xl border border-cream3/50 shadow-inner" style={{ backgroundColor: selectedColorHex }} />
                        </div>

                        <div className="flex-grow space-y-0.5">
                          <input
                            type="text"
                            placeholder="Variant name e.g. Sage Green"
                            value={colorNameInput}
                            onChange={(e) => setColorNameInput(e.target.value)}
                            className="w-full px-3 py-2 bg-white border-2 border-cream3 rounded-xl focus:outline-none focus:border-dark text-[11px] font-sans transition-all"
                          />
                        </div>
                      </div>

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
                          }
                        }}
                        className="px-4 py-2.5 bg-[#161616] hover:bg-accent text-white font-black rounded-xl text-[10px] uppercase tracking-wider cursor-pointer border-none shrink-0 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Color</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO and Badges */}
              <div className="bg-white border border-cream3 p-5 rounded-2xl space-y-4 shadow-sm hover:border-dark/10 transition-colors">
                <span className="text-[9px] font-mono text-dark2/45 uppercase tracking-widest font-black block border-b border-cream2 pb-1.5">4. Discoverability & SEO</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">SEO Title Tag</label>
                    <input
                      type="text" value={productForm.seo_title} onChange={(e) => setProductForm({ ...productForm, seo_title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans text-dark"
                      placeholder="e.g. Classic Trench Coat | FTW"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-dark2/50 block">SEO Meta Description</label>
                    <input
                      type="text" value={productForm.seo_description} onChange={(e) => setProductForm({ ...productForm, seo_description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans text-dark"
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] uppercase font-black text-dark2/50 block">Badge Tag (e.g. New, Limited)</label>
                  <input
                    type="text" value={productForm.tag} onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs font-sans font-bold text-dark"
                    placeholder="e.g. New Season"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Action Trigger Save */}
          <div className="pt-6 border-t border-cream3 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-8 py-3.5 bg-[#161616] hover:bg-[#ff3b30] hover:text-white text-white font-sans font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-glow cursor-pointer border-none flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Catalog Product</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
