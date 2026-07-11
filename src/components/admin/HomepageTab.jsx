import React, { useState } from 'react'
import { Globe, Save, Plus, Trash, Image, Link, Clock, Sparkles, Upload, Search, X, Check, Link2, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function HomepageTab({
  products,
  homepageConfig,
  handleSaveHomepageConfig
}) {
  const normalizeHeroImages = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map(item => {
      if (typeof item === 'string') {
        try {
          if (item.trim().startsWith('{')) {
            const parsed = JSON.parse(item);
            return { url: parsed.url || '', productId: parsed.productId || '' };
          }
        } catch (e) {
          // ignore error if plain url string
        }
        return { url: item, productId: '' };
      }
      return { url: item?.url || '', productId: item?.productId || '' };
    });
  }

  const [config, setConfig] = useState({
    hero_images: normalizeHeroImages(homepageConfig?.hero_images),
    featured_product_ids: homepageConfig?.featured_product_ids || [],
    sale_product_ids: homepageConfig?.sale_product_ids || [],
    coming_soon_title: homepageConfig?.coming_soon_title || '',
    coming_soon_subtitle: homepageConfig?.coming_soon_subtitle || '',
    coming_soon_description: homepageConfig?.coming_soon_description || '',
    coming_soon_countdown: homepageConfig?.coming_soon_countdown ? new Date(homepageConfig.coming_soon_countdown).toISOString().substring(0, 16) : '',
    coming_soon_images: homepageConfig?.coming_soon_images || [
      { url: '', label: '' },
      { url: '', label: '' },
      { url: '', label: '' }
    ],
    hero_bg_banner: homepageConfig?.hero_bg_banner || '',
    hero_bg_banner_mobile: homepageConfig?.hero_bg_banner_mobile || ''
  })

  React.useEffect(() => {
    if (homepageConfig) {
      setConfig({
        hero_images: normalizeHeroImages(homepageConfig.hero_images),
        featured_product_ids: homepageConfig.featured_product_ids || [],
        sale_product_ids: homepageConfig.sale_product_ids || [],
        coming_soon_title: homepageConfig.coming_soon_title || '',
        coming_soon_subtitle: homepageConfig.coming_soon_subtitle || '',
        coming_soon_description: homepageConfig.coming_soon_description || '',
        coming_soon_countdown: homepageConfig.coming_soon_countdown ? new Date(homepageConfig.coming_soon_countdown).toISOString().substring(0, 16) : '',
        coming_soon_images: homepageConfig.coming_soon_images || [
          { url: '', label: '' },
          { url: '', label: '' },
          { url: '', label: '' }
        ],
        hero_bg_banner: homepageConfig.hero_bg_banner || '',
        hero_bg_banner_mobile: homepageConfig.hero_bg_banner_mobile || ''
      })
    }
  }, [homepageConfig])

  const [pickerModalOpen, setPickerModalOpen] = useState(false)
  const [pickerBannerIdx, setPickerBannerIdx] = useState(null)
  const [pickerSearchQuery, setPickerSearchQuery] = useState('')

  const [uploading, setUploading] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [uploadingBgMobile, setUploadingBgMobile] = useState(false)
  const [uploadingTeasers, setUploadingTeasers] = useState([false, false, false])

  const uploadFile = (file) => {
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
  }

  const handleRemoveHeroImage = (idx) => {
    setConfig(prev => ({
      ...prev,
      hero_images: prev.hero_images.filter((_, i) => i !== idx)
    }))
  }

  const handleHeroProductChange = (idx, productId) => {
    setConfig(prev => {
      const updated = [...prev.hero_images]
      const currentItem = updated[idx]
      const currentUrl = typeof currentItem === 'string' ? currentItem : (currentItem?.url || '')
      updated[idx] = { url: currentUrl, productId }
      return { ...prev, hero_images: updated }
    })
  }

  const toggleFeaturedProduct = (id) => {
    setConfig(prev => {
      const isFeatured = prev.featured_product_ids.includes(id)
      return {
        ...prev,
        featured_product_ids: isFeatured
          ? prev.featured_product_ids.filter(x => x !== id)
          : [...prev.featured_product_ids, id]
      }
    })
  }

  const toggleSaleProduct = (id) => {
    setConfig(prev => {
      const isSale = prev.sale_product_ids.includes(id)
      return {
        ...prev,
        sale_product_ids: isSale
          ? prev.sale_product_ids.filter(x => x !== id)
          : [...prev.sale_product_ids, id]
      }
    })
  }

  const handleSneakPeekChange = (idx, field, val) => {
    setConfig(prev => {
      const updated = [...prev.coming_soon_images]
      updated[idx] = { ...updated[idx], [field]: val }
      return { ...prev, coming_soon_images: updated }
    })
  }

  const handleRemoveTeaserImage = (idx) => {
    setConfig(prev => {
      const updated = [...prev.coming_soon_images]
      updated[idx] = { ...updated[idx], url: '' }
      return { ...prev, coming_soon_images: updated }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Transform countdown date back to ISO string
    const finalPayload = {
      ...config,
      coming_soon_countdown: config.coming_soon_countdown ? new Date(config.coming_soon_countdown).toISOString() : null
    }
    handleSaveHomepageConfig(finalPayload)
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Globe className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Homepage Customizer
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Configure images, featured drops, sales items, and the next drop countdown timer.</p>
        </div>
      </div>

      <div className="space-y-8 text-xs lg:text-sm font-sans">

        {/* Section 1: Hero Carousel Images */}
        <form onSubmit={handleSubmit} className="bg-white border border-cream3 p-5 sm:p-6 rounded-3xl space-y-5 hover:border-dark/25 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 border-b border-cream3 pb-3">
            <div className="p-2.5 bg-dark/5 text-dark rounded-xl">
              <Image className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-black uppercase text-dark tracking-wider">1. Hero Section Slider</h3>
              <p className="text-[9px] lg:text-xs text-dark2/45 uppercase mt-0.5 font-bold font-sans">Manage carousel photos rotating on the landing slide banner (Max 5 images)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {config.hero_images.map((item, idx) => {
                const imgUrl = typeof item === 'string' ? item : item.url;
                const selectedProdId = typeof item === 'object' ? (item.productId || '') : '';
                const matchedProduct = (products || []).find(p => p.id === selectedProdId);

                return (
                  <div key={idx} className="border border-cream3 rounded-2xl overflow-hidden bg-cream/20 flex flex-col group relative shadow-2xs hover:border-dark/30 transition-all">
                    <div className="aspect-[3/4] w-full bg-cream3 relative overflow-hidden">
                      <img src={imgUrl} alt="Hero Banner" className="w-full h-full object-contain bg-cream3" onError={(e) => { e.target.src = '/images/Regular-T.png' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow cursor-pointer transition-colors z-10"
                        title="Remove image"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2.5 space-y-2 border-t border-cream3 bg-white flex-1 flex flex-col justify-between">
                      <div className="font-sans font-black text-[9.5px] text-dark/80 uppercase tracking-wider text-center">
                        Banner #{idx + 1}
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-sans font-black text-dark2/45 block mb-1">Target Product</label>
                        {matchedProduct ? (
                          <div className="bg-cream2/70 border border-cream3/80 rounded-xl p-1.5 flex items-center justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-[9.5px] text-dark block truncate">{matchedProduct.name}</span>
                              <span className="text-[8px] font-sans text-dark2/50 block">₹{matchedProduct.price}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPickerBannerIdx(idx);
                                setPickerSearchQuery('');
                                setPickerModalOpen(true);
                              }}
                              className="p-1.5 text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer shrink-0 border-none transition-all active:scale-95 shadow-xs flex items-center justify-center"
                              title="Change linked product"
                            >
                              <Pencil className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setPickerBannerIdx(idx);
                              setPickerSearchQuery('');
                              setPickerModalOpen(true);
                            }}
                            className="w-full bg-cream2 hover:bg-dark hover:text-white border border-cream3 rounded-xl py-2 px-2 text-[9px] font-sans font-bold uppercase tracking-wider text-dark/70 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Link2 className="w-3 h-3 text-accent" />
                            <span>Link Product</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {config.hero_images.length === 0 && (
                <div className="col-span-full py-8 text-center text-dark/40 font-sans text-[10px]">
                  No slider banners added. Please add image URLs.
                </div>
              )}
            </div>

            {config.hero_images.length < 5 ? (
              <label className="group border border-dashed border-cream3 hover:border-accent hover:bg-cream/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 select-none">
                <div className="w-10 h-10 bg-dark text-white rounded-xl flex items-center justify-center group-hover:bg-accent shadow-sm transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-dark block">{uploading ? 'Uploading image...' : `Upload New Hero Banner (${config.hero_images.length}/5)`}</span>
                  <span className="text-[9px] text-dark/40 font-sans uppercase tracking-wider block mt-0.5">JPEG, PNG, WEBP files</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (config.hero_images.length >= 5) {
                      toast.error('You can only add up to 5 hero slider images.')
                      return
                    }
                    setUploading(true)
                    try {
                      const url = await uploadFile(file)
                      setConfig(prev => ({
                        ...prev,
                        hero_images: [...prev.hero_images, { url, productId: '' }]
                      }))
                      toast.success('Hero image uploaded successfully!')
                    } catch (err) {
                      toast.error(`Upload failed: ${err.message}`)
                    } finally {
                      setUploading(false)
                    }
                  }}
                />
              </label>
            ) : (
              <div className="border border-cream3 bg-cream/10 rounded-2xl p-6 text-center text-dark2/50 font-sans text-[10px] uppercase font-bold">
                🔒 Maximum of 5 hero slider images uploaded. Delete some images to upload more.
              </div>
            )}
          </div>

          {/* Hero Background Banner Upload */}
          <div className="border-t border-cream3 pt-5 space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider font-bold block text-dark2/60">Hero Background Banner Image</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="aspect-[16/9] w-full bg-cream3 relative overflow-hidden rounded-xl border border-cream3">
                {config.hero_bg_banner ? (
                  <>
                    <img src={config.hero_bg_banner} alt="Background Banner" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/images/banner.webp' }} />
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, hero_bg_banner: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow cursor-pointer transition-colors z-10"
                      title="Remove image"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark/30 font-sans text-[9px] uppercase">Default Background Banner</div>
                )}
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] text-dark2/50 leading-relaxed font-sans">
                  Upload a high-resolution banner image (minimum 1920x1080 recommended) to display behind the rotating product slider. Defaults to the standard grid pattern banner.
                </p>
                <label className="w-fit px-4 py-2 bg-dark hover:bg-accent hover:text-dark text-white transition-colors font-bold uppercase rounded-lg cursor-pointer text-[9px] flex items-center gap-1.5 select-none shadow-sm border-none">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBg ? 'Uploading Banner...' : 'Upload Background Banner'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingBg}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploadingBg(true)
                      try {
                        const url = await uploadFile(file)
                        setConfig(prev => ({ ...prev, hero_bg_banner: url }))
                        toast.success('Hero background banner uploaded successfully!')
                      } catch (err) {
                        toast.error(`Upload failed: ${err.message}`)
                      } finally {
                        setUploadingBg(false)
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Hero Mobile Banner Upload */}
          <div className="border-t border-cream3 pt-5 space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider font-bold block text-dark2/60">Hero Mobile Banner Image (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="aspect-[3/4] max-w-[250px] w-full mx-auto bg-cream3 relative overflow-hidden rounded-xl border border-cream3">
                {config.hero_bg_banner_mobile ? (
                  <>
                    <img src={config.hero_bg_banner_mobile} alt="Mobile Banner" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/images/banner.webp' }} />
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, hero_bg_banner_mobile: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow cursor-pointer transition-colors z-10"
                      title="Remove image"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark/30 font-sans text-[9px] uppercase text-center p-4">No Mobile Banner</div>
                )}
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] text-dark2/50 leading-relaxed font-sans">
                  Upload a mobile banner image designed for the 62vh layout (e.g. 1080x1440 or 3:4 aspect ratio). If empty, it will fall back to the desktop banner.
                </p>
                <label className="w-fit px-4 py-2 bg-dark hover:bg-accent hover:text-dark text-white transition-colors font-bold uppercase rounded-lg cursor-pointer text-[9px] flex items-center gap-1.5 select-none shadow-sm border-none">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBgMobile ? 'Uploading...' : 'Upload Mobile Banner'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingBgMobile}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploadingBgMobile(true)
                      try {
                        const url = await uploadFile(file)
                        setConfig(prev => ({ ...prev, hero_bg_banner_mobile: url }))
                        toast.success('Mobile banner uploaded successfully!')
                      } catch (err) {
                        toast.error(`Upload failed: ${err.message}`)
                      } finally {
                        setUploadingBgMobile(false)
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-cream3 mt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-dark text-cream hover:bg-accent hover:text-dark font-sans font-bold uppercase tracking-wider text-[10px] lg:text-xs xl:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Save className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" /> Save Hero Slider
            </button>
          </div>
        </form>

        {/* Section 2: Featured Collection Selection */}
        <form onSubmit={handleSubmit} className="bg-white border border-cream3 p-5 sm:p-6 rounded-3xl space-y-5 hover:border-dark/25 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 border-b border-cream3 pb-3">
            <div className="p-2.5 bg-dark/5 text-dark rounded-xl">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-black uppercase text-dark tracking-wider">2. Featured Collection Products</h3>
              <p className="text-[9px] lg:text-xs text-dark2/45 uppercase mt-0.5 font-bold font-sans">Select products to render in the CATALOG SERIES 01 catalog grid</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
            {products.map(prod => {
              const checked = config.featured_product_ids.includes(prod.id)
              return (
                <button
                  type="button"
                  key={prod.id}
                  onClick={() => toggleFeaturedProduct(prod.id)}
                  className={`flex items-center gap-3 p-3 bg-cream/15 border rounded-2xl text-left transition-all cursor-pointer hover:shadow-sm ${checked ? 'border-accent bg-accent/5' : 'border-cream3 hover:border-dark/20'
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-cream3 overflow-hidden shrink-0">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <span className="font-bold text-dark text-xs block truncate uppercase">{prod.name}</span>
                    <span className="text-[9px] lg:text-[10px] text-dark/50 block font-sans">₹{prod.price} • ID: {prod.id}</span>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-accent border-accent text-white' : 'border-cream3'
                    }`}>
                    {checked && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </button>
              )
            })}
            {products.length === 0 && (
              <div className="col-span-full py-8 text-center text-dark/40 font-sans text-[10px]">
                No inventory products found. Add products first.
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2 border-t border-cream3 mt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-dark text-cream hover:bg-accent hover:text-dark font-sans font-bold uppercase tracking-wider text-[10px] lg:text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Save className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Save Featured Collection
            </button>
          </div>
        </form>

        {/* Section 3: Sale Archive Selection */}
        <form onSubmit={handleSubmit} className="bg-white border border-cream3 p-5 sm:p-6 rounded-3xl space-y-5 hover:border-dark/25 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 border-b border-cream3 pb-3">
            <div className="p-2.5 bg-dark/5 text-dark rounded-xl">
              <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-black uppercase text-dark tracking-wider">3. Sale Archive Products</h3>
              <p className="text-[9px] lg:text-xs text-dark2/45 uppercase mt-0.5 font-bold font-sans">Select products to show inside the exclusive SALE ARCHIVE grid</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
            {products.map(prod => {
              const checked = config.sale_product_ids.includes(prod.id)
              return (
                <button
                  type="button"
                  key={prod.id}
                  onClick={() => toggleSaleProduct(prod.id)}
                  className={`flex items-center gap-3 p-3 bg-cream/15 border rounded-2xl text-left transition-all cursor-pointer hover:shadow-sm ${checked ? 'border-accent bg-accent/5' : 'border-cream3 hover:border-dark/20'
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-cream3 overflow-hidden shrink-0">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <span className="font-bold text-dark text-xs block truncate uppercase">{prod.name}</span>
                    <span className="text-[9px] lg:text-[10px] text-dark/50 block font-sans">₹{prod.price} {prod.originalPrice ? `(Was: ₹${prod.originalPrice})` : ''}</span>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-accent border-accent text-white' : 'border-cream3'
                    }`}>
                    {checked && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="flex justify-end pt-2 border-t border-cream3 mt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-dark text-cream hover:bg-accent hover:text-dark font-sans font-bold uppercase tracking-wider text-[10px] lg:text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Save className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Save Sale Archive
            </button>
          </div>
        </form>

        {/* Section 4: Coming Soon & Countdown Section */}
        <form onSubmit={handleSubmit} className="bg-white border border-cream3 p-5 sm:p-6 rounded-3xl space-y-6 hover:border-dark/25 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 border-b border-cream3 pb-3">
            <div className="p-2.5 bg-dark/5 text-dark rounded-xl">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-black uppercase text-dark tracking-wider">4. Next Drop Teaser & Countdown</h3>
              <p className="text-[9px] lg:text-xs text-dark2/45 uppercase mt-0.5 font-bold font-sans">Update the next drop name, description, date countdown, and teaser images</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider font-bold block text-dark2/60">Collection Title</label>
                <input
                  type="text"
                  required
                  value={config.coming_soon_title}
                  onChange={(e) => setConfig({ ...config, coming_soon_title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark font-sans text-xs lg:text-sm xl:text-base font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider font-bold block text-dark2/60">Collection Subtitle/Tagline</label>
                <input
                  type="text"
                  required
                  value={config.coming_soon_subtitle}
                  onChange={(e) => setConfig({ ...config, coming_soon_subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark font-sans text-xs lg:text-sm xl:text-base font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider font-bold block text-dark2/60">Countdown Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={config.coming_soon_countdown}
                  onChange={(e) => setConfig({ ...config, coming_soon_countdown: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark font-sans text-xs lg:text-sm xl:text-base font-bold transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider font-bold block text-dark2/60">Teaser Description Paragraph</label>
              <textarea
                rows={3}
                required
                value={config.coming_soon_description}
                onChange={(e) => setConfig({ ...config, coming_soon_description: e.target.value })}
                className="w-full px-4 py-2.5 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark font-sans text-xs lg:text-sm xl:text-base font-bold transition-all resize-none"
              />
            </div>

            {/* Sneak Peek Teasers */}
            <div className="space-y-4 pt-4 border-t border-cream3">
              <label className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider font-bold block text-dark2/60 pb-1.5">Sneak Peek Teaser Images (3 Required)</label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {config.coming_soon_images.map((img, idx) => (
                  <div key={idx} className="border border-cream3 rounded-2xl overflow-hidden bg-cream/20 flex flex-col group relative p-3 space-y-3">
                    <div className="aspect-[3/4] w-full bg-cream3 relative overflow-hidden rounded-xl">
                      {img.url ? (
                        <>
                          <img src={img.url} alt={`Teaser #${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/images/Regular-T.png' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveTeaserImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow cursor-pointer transition-colors z-10"
                            title="Remove image"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark/30 font-sans text-[9px] lg:text-xs uppercase">No Image</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-sans text-[8px] lg:text-[10px] text-accent uppercase font-black">Teaser #{idx + 1}</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Short Label"
                        value={img.label}
                        onChange={(e) => handleSneakPeekChange(idx, 'label', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-cream3 rounded-lg focus:outline-none focus:border-dark font-sans text-[10px] lg:text-xs"
                      />
                      <label className="w-full py-2 bg-dark/10 hover:bg-dark hover:text-white transition-colors font-bold uppercase rounded-lg cursor-pointer text-[9px] lg:text-xs flex items-center justify-center gap-1 select-none">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingTeasers[idx] ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingTeasers[idx]}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setUploadingTeasers(prev => {
                              const updated = [...prev]
                              updated[idx] = true
                              return updated
                            })
                            try {
                              const url = await uploadFile(file)
                              handleSneakPeekChange(idx, 'url', url)
                              toast.success(`Teaser image #${idx + 1} uploaded successfully!`)
                            } catch (err) {
                              toast.error(`Upload failed: ${err.message}`)
                            } finally {
                              setUploadingTeasers(prev => {
                                const updated = [...prev]
                                updated[idx] = false
                                return updated
                              })
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-3 border-t border-cream3 mt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-dark text-cream hover:bg-accent hover:text-dark font-sans font-bold uppercase tracking-wider text-[10px] lg:text-xs xl:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Save className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" /> Save Teaser & Countdown
            </button>
          </div>
        </form>
      </div>

      {/* Searchable Product Picker Modal */}
      {pickerModalOpen && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-cream3 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 animate-scale-in">
            <div className="flex justify-between items-center border-b border-cream3 pb-3">
              <div>
                <h3 className="font-sans text-sm font-black uppercase text-dark">Select Target Product</h3>
                <p className="text-[9px] text-dark2/50 font-sans">Attach a product for Banner #{pickerBannerIdx !== null ? pickerBannerIdx + 1 : 1}</p>
              </div>
              <button
                type="button"
                onClick={() => setPickerModalOpen(false)}
                className="p-1.5 rounded-xl bg-cream2 hover:bg-dark hover:text-white transition-colors cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/30" />
              <input
                type="text"
                placeholder="Search products by name, SKU or ID..."
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cream2/60 border border-cream3 rounded-xl text-xs font-sans text-dark focus:outline-none focus:border-dark"
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-cream3/60 pr-1 space-y-1 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  handleHeroProductChange(pickerBannerIdx, '')
                  setPickerModalOpen(false)
                }}
                className="w-full text-left p-2.5 hover:bg-cream2 rounded-xl flex items-center justify-between transition-colors cursor-pointer border-none"
              >
                <span className="text-xs font-bold text-dark/60">-- Auto Match / Default Shop --</span>
                {!(config.hero_images[pickerBannerIdx]?.productId) && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {(products || []).filter(p =>
                p.name.toLowerCase().includes(pickerSearchQuery.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(pickerSearchQuery.toLowerCase())) ||
                (p.id && p.id.toLowerCase().includes(pickerSearchQuery.toLowerCase()))
              ).map(p => {
                const isSelected = config.hero_images[pickerBannerIdx]?.productId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      handleHeroProductChange(pickerBannerIdx, p.id)
                      setPickerModalOpen(false)
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer border-none ${isSelected ? 'bg-accent/15 border border-accent/30' : 'hover:bg-cream2'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.images?.[0] || p.image} alt="" className="w-8 h-10 object-cover rounded-lg bg-cream3 shrink-0" onError={(e) => { e.target.src = '/images/Regular-T.png' }} />
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-dark block truncate">{p.name}</span>
                        <span className="text-[9px] font-sans text-dark2/50 block">₹{p.price} • ID: {p.id}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-dark shrink-0 ml-2" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
