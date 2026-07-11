import React, { useState, useEffect } from 'react'
import { Palette, Plus, Trash2, Save, Upload, Sparkles, AlertCircle, X, Eye, Edit2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { getCustomizerConfig, saveCustomizerConfig, getStoreSettings, saveStoreSettings } from '../../lib/supabase'

export default function CustomizerTab({ onPreviewImage }) {
  const [config, setConfig] = useState({ colors: [] })
  const [sizeChart, setSizeChart] = useState({
    S: { chest: '38"', length: '27"', sleeve: '8"' },
    M: { chest: '40"', length: '28"', sleeve: '8.5"' },
    L: { chest: '42"', length: '29"', sleeve: '9"' },
    XL: { chest: '44"', length: '30"', sleeve: '9.5"' },
    XXL: { chest: '46"', length: '31"', sleeve: '10"' }
  })
  const [pricing, setPricing] = useState({
    customizer_blank_price: 380,
    customizer_print_cost_front: 99,
    customizer_print_cost_back: 99,
    customizer_print_cost_left_sleeve: 99,
    customizer_print_cost_right_sleeve: 99
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#FFFFFF')
  const [mockupFront, setMockupFront] = useState('')
  const [mockupBack, setMockupBack] = useState('')
  const [mockupLeftSleeve, setMockupLeftSleeve] = useState('')
  const [mockupRightSleeve, setMockupRightSleeve] = useState('')

  // Edit state
  const [editingColorName, setEditingColorName] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const fetched = await getCustomizerConfig()
      if (fetched && fetched.colors) {
        setConfig(fetched)
      }

      // Load pricing from customizer_mockups (__pricing__ row)
      const p = fetched?.pricing || {}
      setPricing({
        customizer_blank_price: p.customizer_blank_price !== undefined ? Number(p.customizer_blank_price) : 380,
        customizer_print_cost_front: p.customizer_print_cost_front !== undefined ? Number(p.customizer_print_cost_front) : 99,
        customizer_print_cost_back: p.customizer_print_cost_back !== undefined ? Number(p.customizer_print_cost_back) : 99,
        customizer_print_cost_left_sleeve: p.customizer_print_cost_left_sleeve !== undefined ? Number(p.customizer_print_cost_left_sleeve) : 99,
        customizer_print_cost_right_sleeve: p.customizer_print_cost_right_sleeve !== undefined ? Number(p.customizer_print_cost_right_sleeve) : 99,
      })

      // Size chart still lives in store_settings
      const storeSettings = await getStoreSettings()
      if (storeSettings?.customizer_size_chart) {
        setSizeChart(storeSettings.customizer_size_chart)
      }
    } catch (e) {
      toast.error("Failed to load customizer configurations.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e, setMockup) => {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = toast.loading(`Uploading ${file.name} to Cloudinary...`)

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
        setMockup(data.url)
        toast.success(`Mockup uploaded to Cloudinary successfully!`, { id: toastId })
      } catch (err) {
        console.error('Mockup upload error:', err)
        toast.error(`Upload failed: ${err.message || 'Server error'}`, { id: toastId })
      }
    }
    reader.onerror = () => {
      toast.close(toastId)
      toast.error('Failed to read file local data.')
    }
  }

  const handleAddColor = (e) => {
    e.preventDefault()
    if (!newColorName.trim()) {
      toast.error("Color name is required!")
      return
    }

    if (!mockupFront || !mockupBack) {
      toast.error("At least Front and Back mockup images are required!")
      return
    }

    const newColor = {
      name: newColorName.trim(),
      hex: newColorHex,
      mockups: {
        front: mockupFront,
        back: mockupBack,
        left_sleeve: mockupLeftSleeve || '/images/media__1782208444237.png',
        right_sleeve: mockupRightSleeve || '/images/media__1782208452503.png'
      }
    }

    if (editingColorName) {
      if (
        newColor.name.toLowerCase() !== editingColorName.toLowerCase() &&
        config.colors.some(c => c.name.toLowerCase() === newColor.name.toLowerCase())
      ) {
        toast.error("A color with this name already exists!")
        return
      }

      setConfig(prev => ({
        ...prev,
        colors: prev.colors.map(c => c.name === editingColorName ? newColor : c)
      }))
      setEditingColorName(null)
      toast.success(`Updated "${newColor.name}" in pending list. Save to persist!`)
    } else {
      if (config.colors.some(c => c.name.toLowerCase() === newColor.name.toLowerCase())) {
        toast.error("A color with this name already exists!")
        return
      }

      setConfig(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }))
      toast.success(`Added "${newColor.name}" to pending list. Save to persist!`)
    }

    // Reset form
    setNewColorName('')
    setNewColorHex('#FFFFFF')
    setMockupFront('')
    setMockupBack('')
    setMockupLeftSleeve('')
    setMockupRightSleeve('')
  }

  const handleStartEdit = (col) => {
    setEditingColorName(col.name)
    setNewColorName(col.name)
    setNewColorHex(col.hex)
    setMockupFront(col.mockups.front || '')
    setMockupBack(col.mockups.back || '')
    setMockupLeftSleeve(col.mockups.left_sleeve || '')
    setMockupRightSleeve(col.mockups.right_sleeve || '')

    // Smooth scroll to form container
    const formEl = document.getElementById('color-form-card')
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCancelEdit = () => {
    setEditingColorName(null)
    setNewColorName('')
    setNewColorHex('#FFFFFF')
    setMockupFront('')
    setMockupBack('')
    setMockupLeftSleeve('')
    setMockupRightSleeve('')
  }

  const handleDeleteColor = (name) => {
    if (editingColorName === name) {
      handleCancelEdit()
    }
    setConfig(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c.name !== name)
    }))
    toast.success("Removed color. Save to persist!")
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    const toastId = toast.loading("Saving configuration to database...")
    try {
      // Save colors + pricing together into customizer_mockups
      await saveCustomizerConfig({ ...config, pricing })

      // Size chart stays in store_settings
      const storeSettings = await getStoreSettings()
      await saveStoreSettings({ ...storeSettings, customizer_size_chart: sizeChart })

      toast.success("Customizer configurations saved successfully!", { id: toastId })
    } catch (e) {
      console.error("Save config error:", e)
      toast.error(`Failed to save configurations: ${e.message || e}`, { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center font-sans text-xs uppercase text-dark2/50 tracking-widest animate-pulse">
        Fetching Customizer config...
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Palette className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Customizer Mockups & Colors
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Define active blank t-shirt mockups and colors available inside the customer Studio Customizer tool.</p>
        </div>
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-6 py-3 bg-dark hover:bg-accent hover:text-dark text-cream font-sans font-bold uppercase tracking-widest text-[10px] lg:text-xs rounded-xl shadow-md flex items-center justify-center gap-2 border-none cursor-pointer transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Save className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Add/Edit Colors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Color Form */}
          <div id="color-form-card" className="bg-white border border-cream3 rounded-3xl p-6 shadow-sm space-y-5">
            <span className="text-[10px] lg:text-xs text-accent font-black uppercase tracking-widest block border-b border-cream3 pb-2 font-sans">
              {editingColorName ? `1. Edit Customizer Color: ${editingColorName}` : '1. Define New Customizer Color Mockups'}
            </span>
            <form onSubmit={handleAddColor} className="space-y-6 text-xs lg:text-sm font-sans">
              
              {/* Quick Preset Color Swatches */}
              <div className="bg-cream/40 border border-cream3 p-4 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] lg:text-xs font-sans font-bold text-dark/70 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" /> Quick Pick Color Palette
                  </span>
                  <span className="text-[9px] font-sans text-dark/40 uppercase">1-Click Auto Fill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Black', hex: '#0F0F0F' },
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Acid Wash Gray', hex: '#333333' },
                    { name: 'Charcoal', hex: '#222222' },
                    { name: 'Beige', hex: '#E1D9C1' },
                    { name: 'Cream', hex: '#FDF6E2' },
                    { name: 'Navy Blue', hex: '#1A2536' },
                    { name: 'Olive Green', hex: '#4D5844' },
                    { name: 'Sage Green', hex: '#9CAF88' },
                    { name: 'Cyber Blue', hex: '#00E5FF' },
                    { name: 'Crimson Red', hex: '#B22222' },
                    { name: 'Pastel Lavender', hex: '#D2B4DE' }
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setNewColorName(preset.name)
                        setNewColorHex(preset.hex)
                      }}
                      className="px-2.5 py-1.5 bg-white border border-cream3 hover:border-dark/30 rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-2xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-inner"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-[10px] lg:text-xs font-bold text-dark uppercase">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Color Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acid Wash Gray"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="w-full px-4 py-2.5 lg:py-3 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:border-dark focus:bg-white text-xs lg:text-sm font-sans font-bold transition-all placeholder-dark/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Color Hex Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-10 h-9 lg:h-10 p-0.5 bg-white border border-cream3 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      placeholder="#333333"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="flex-1 px-4 py-2.5 lg:py-3 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:border-dark focus:bg-white text-xs lg:text-sm font-sans font-bold transition-all placeholder-dark/30"
                    />
                  </div>
                </div>
              </div>

              {/* Copy Mockups Helper */}
              {config.colors.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-cream2/50 border border-cream3 rounded-2xl gap-3">
                  <span className="text-[10px] lg:text-xs font-sans text-dark/70 font-bold uppercase">⚡ Quick Fill Mockup Images from Active Color:</span>
                  <select
                    onChange={(e) => {
                      const found = config.colors.find(c => c.name === e.target.value)
                      if (found && found.mockups) {
                        setMockupFront(found.mockups.front || '')
                        setMockupBack(found.mockups.back || '')
                        setMockupLeftSleeve(found.mockups.left_sleeve || '')
                        setMockupRightSleeve(found.mockups.right_sleeve || '')
                        toast.success(`Copied mockup files from "${found.name}"`)
                      }
                    }}
                    defaultValue=""
                    className="px-3 py-1.5 bg-white border border-cream3 rounded-xl text-xs font-sans font-bold text-dark cursor-pointer focus:outline-none focus:border-dark"
                  >
                    <option value="" disabled>Select active color to copy...</option>
                    {config.colors.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Upload sections for mockup files */}
              <div className="space-y-2">
                <div className="mb-1">
                  <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Upload Blank Mockups *</label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Front */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] lg:text-[10px] uppercase font-bold text-dark2/60 block text-center">Front View *</span>
                    {mockupFront ? (
                      <div className="border-2 border-cream3 rounded-xl p-3.5 flex flex-col items-center justify-center bg-cream2/30 aspect-square relative overflow-hidden group">
                        <img src={mockupFront} alt="Front" className="w-full h-full object-contain mix-blend-multiply" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMockupFront('') }}
                          className="absolute top-1 right-1 p-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-full border-none cursor-pointer flex items-center justify-center shadow-sm z-20 transition-all"
                          title="Remove Front mockup"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-cream3 hover:border-accent rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-cream2/30 transition-all aspect-square relative overflow-hidden">
                        <Upload className="w-4 h-4 text-dark2/40" />
                        <span className="text-[8px] font-bold text-dark2/40 text-center uppercase tracking-wider">Select</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setMockupFront)} />
                      </label>
                    )}
                  </div>

                  {/* Back */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] lg:text-[10px] uppercase font-bold text-dark2/60 block text-center">Back View *</span>
                    {mockupBack ? (
                      <div className="border-2 border-cream3 rounded-xl p-3.5 flex flex-col items-center justify-center bg-cream2/30 aspect-square relative overflow-hidden group">
                        <img src={mockupBack} alt="Back" className="w-full h-full object-contain mix-blend-multiply" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMockupBack('') }}
                          className="absolute top-1 right-1 p-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-full border-none cursor-pointer flex items-center justify-center shadow-sm z-20 transition-all"
                          title="Remove Back mockup"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-cream3 hover:border-accent rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-cream2/30 transition-all aspect-square relative overflow-hidden">
                        <Upload className="w-4 h-4 text-dark2/40" />
                        <span className="text-[8px] font-bold text-dark2/40 text-center uppercase tracking-wider">Select</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setMockupBack)} />
                      </label>
                    )}
                  </div>

                  {/* Left Sleeve */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] lg:text-[10px] uppercase font-bold text-dark2/40 block text-center">Left Sleeve</span>
                    {mockupLeftSleeve ? (
                      <div className="border-2 border-cream3 rounded-xl p-3.5 flex flex-col items-center justify-center bg-cream2/30 aspect-square relative overflow-hidden group">
                        <img src={mockupLeftSleeve} alt="Left Sleeve" className="w-full h-full object-contain mix-blend-multiply" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMockupLeftSleeve('') }}
                          className="absolute top-1 right-1 p-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-full border-none cursor-pointer flex items-center justify-center shadow-sm z-20 transition-all"
                          title="Remove Left Sleeve mockup"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-cream3 hover:border-accent rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-cream2/30 transition-all aspect-square relative overflow-hidden">
                        <Upload className="w-4 h-4 text-dark2/40" />
                        <span className="text-[8px] font-bold text-dark2/40 text-center uppercase tracking-wider">Select</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setMockupLeftSleeve)} />
                      </label>
                    )}
                  </div>

                  {/* Right Sleeve */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] lg:text-[10px] uppercase font-bold text-dark2/40 block text-center">Right Sleeve</span>
                    {mockupRightSleeve ? (
                      <div className="border-2 border-cream3 rounded-xl p-3.5 flex flex-col items-center justify-center bg-cream2/30 aspect-square relative overflow-hidden group">
                        <img src={mockupRightSleeve} alt="Right Sleeve" className="w-full h-full object-contain mix-blend-multiply" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMockupRightSleeve('') }}
                          className="absolute top-1 right-1 p-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-full border-none cursor-pointer flex items-center justify-center shadow-sm z-20 transition-all"
                          title="Remove Right Sleeve mockup"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-cream3 hover:border-accent rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-cream2/30 transition-all aspect-square relative overflow-hidden">
                        <Upload className="w-4 h-4 text-dark2/40" />
                        <span className="text-[8px] font-bold text-dark2/40 text-center uppercase tracking-wider">Select</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setMockupRightSleeve)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-2">
                {editingColorName && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-3 bg-cream2 hover:bg-cream3 text-dark2 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer transition-all border-none font-sans"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 bg-dark hover:bg-accent hover:text-dark text-white rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer transition-all border-none flex items-center gap-2"
                >
                  {editingColorName ? (
                    <>
                      <Save className="w-4 h-4" /> Update Color Mockup
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Color Mockup
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Customizer Size Chart Editor */}
          <div className="bg-white border border-cream3 rounded-3xl p-6 lg:p-7 shadow-sm space-y-5">
            <span className="text-[10px] lg:text-xs text-accent font-black uppercase tracking-widest block border-b border-cream3 pb-2 font-sans">
              Size Chart for All Mockup T-shirts
            </span>
            <div className="text-xs lg:text-sm font-sans space-y-4">
              <p className="text-dark2/60 text-xs lg:text-sm">Configure the measurements (Chest, Length, Sleeve) shown to customers on the customizer page's size chart.</p>
              <div className="border border-cream3 rounded-2xl bg-white overflow-hidden">
                <table className="w-full text-left border-collapse text-xs lg:text-sm font-sans">
                  <thead>
                    <tr className="bg-cream2 text-dark/65 font-bold border-b border-cream3 font-sans text-[9px] lg:text-[10px] uppercase tracking-wider">
                      <th className="p-3.5 lg:p-4">Size</th>
                      <th className="p-3.5 lg:p-4 text-accent">A (Chest Width)</th>
                      <th className="p-3.5 lg:p-4 text-dark/85">B (Length)</th>
                      <th className="p-3.5 lg:p-4 text-purple-600">C (Sleeve Length)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream3 text-dark/75">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                      const szData = sizeChart[sz] || { chest: '', length: '', sleeve: '' }
                      return (
                        <tr key={sz} className="hover:bg-cream2/20">
                          <td className="p-3.5 lg:p-4 font-bold font-sans text-dark text-sm lg:text-base">{sz}</td>
                          <td className="p-3.5 lg:p-4">
                            <input
                              type="text"
                              value={szData.chest || ''}
                              onChange={(e) => {
                                const newChart = { ...sizeChart }
                                newChart[sz] = { ...szData, chest: e.target.value }
                                setSizeChart(newChart)
                              }}
                              className="w-full px-3.5 py-2 lg:py-2.5 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs lg:text-sm font-semibold"
                              placeholder='e.g. 38"'
                            />
                          </td>
                          <td className="p-3.5 lg:p-4">
                            <input
                              type="text"
                              value={szData.length || ''}
                              onChange={(e) => {
                                const newChart = { ...sizeChart }
                                newChart[sz] = { ...szData, length: e.target.value }
                                setSizeChart(newChart)
                              }}
                              className="w-full px-3.5 py-2 lg:py-2.5 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs lg:text-sm font-semibold"
                              placeholder='e.g. 27"'
                            />
                          </td>
                          <td className="p-3.5 lg:p-4">
                            <input
                              type="text"
                              value={szData.sleeve || ''}
                              onChange={(e) => {
                                const newChart = { ...sizeChart }
                                newChart[sz] = { ...szData, sleeve: e.target.value }
                                setSizeChart(newChart)
                              }}
                              className="w-full px-3.5 py-2 lg:py-2.5 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs lg:text-sm font-semibold"
                              placeholder='e.g. 8"'
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Customizer Pricing Settings */}
          <div className="bg-white border border-cream3 rounded-3xl p-6 lg:p-7 shadow-sm space-y-5">
            <span className="text-[10px] lg:text-xs text-accent font-black uppercase tracking-widest block border-b border-cream3 pb-2 font-sans">
              Customizer Pricing Settings
            </span>
            <div className="text-xs lg:text-sm font-sans space-y-5">
              <p className="text-dark2/60 text-xs lg:text-sm font-medium">Set the base blank T-shirt price and individual printing costs per print zone.</p>

              {/* Blank T-shirt price — full width */}
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Blank T-shirt Price (₹)</label>
                <input
                  type="number"
                  value={pricing.customizer_blank_price}
                  onChange={(e) => setPricing(prev => ({ ...prev, customizer_blank_price: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 lg:py-3 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs lg:text-sm font-sans font-bold"
                  placeholder="e.g. 380"
                />
              </div>

              {/* Zone-wise printing costs — 2×2 grid */}
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/60">Print Cost per Zone (₹)</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '🖨️ Front Zone', key: 'customizer_print_cost_front' },
                    { label: '🖨️ Back Zone', key: 'customizer_print_cost_back' },
                    { label: '🖨️ Left Sleeve', key: 'customizer_print_cost_left_sleeve' },
                    { label: '🖨️ Right Sleeve', key: 'customizer_print_cost_right_sleeve' },
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[10px] lg:text-xs uppercase tracking-wider block font-bold text-dark2/50">{label}</label>
                      <input
                        type="number"
                        value={pricing[key]}
                        onChange={(e) => setPricing(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 lg:py-3 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs lg:text-sm font-sans font-bold"
                        placeholder="e.g. 99"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Colors Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-cream3 rounded-3xl p-6 lg:p-7 shadow-sm space-y-4">
            <span className="text-[10px] lg:text-xs text-accent font-black uppercase tracking-widest block border-b border-cream3 pb-2 font-sans">2. Active Customizer Colors ({config.colors.length})</span>

            {config.colors.length === 0 ? (
              <div className="text-center py-8 text-dark2/40 text-xs lg:text-sm flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-dark2/30" />
                <span>No customizer colors defined yet.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                {config.colors.map(col => (
                  <div key={col.name} className="flex flex-col gap-3.5 p-4 lg:p-5 bg-cream2 rounded-2xl border border-cream3 hover:border-dark/15 hover:shadow-xs transition-all duration-300">
                    {/* Top Row: Color circle, Name/Hex, Delete Button */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 lg:w-8 lg:h-8 rounded-full shrink-0 border border-neutral-200/50 shadow-inner"
                          style={{ backgroundColor: col.hex }}
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs lg:text-sm block text-dark leading-tight uppercase tracking-tight">{col.name}</span>
                          <span className="text-[9px] lg:text-[10px] font-sans text-dark2/40 font-bold uppercase tracking-wider block mt-0.5">{col.hex}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStartEdit(col)}
                          className="p-1.5 lg:p-2 bg-cream3 hover:bg-dark hover:text-white text-dark/70 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center shadow-xs"
                          title="Edit Color"
                        >
                          <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteColor(col.name)}
                          className="p-1.5 lg:p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all border-none cursor-pointer flex items-center justify-center shadow-xs"
                          title="Remove Color"
                        >
                          <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Mockups Preview & Count */}
                    {col.mockups && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-cream3/60">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(col.mockups).map(([key, url]) => {
                            if (!url) return null
                            return (
                              <div
                                key={key}
                                className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-white border border-cream3 overflow-hidden flex items-center justify-center p-0.5 relative group/thumb cursor-pointer hover:border-dark/25 transition-all shadow-xs"
                                title={`${key.replace('_', ' ')} view`}
                                onClick={() => onPreviewImage(url, `${col.name} — ${key.replace('_', ' ')} view`)}
                              >
                                <img src={url} alt={key} className="w-full h-full object-contain mix-blend-multiply" />
                                <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <span className="text-[8px] lg:text-[9px] font-sans bg-dark/5 px-2 py-0.5 rounded border border-cream3 uppercase text-dark2/60 font-bold shrink-0">
                          {Object.values(col.mockups || {}).filter(Boolean).length} mockups
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
