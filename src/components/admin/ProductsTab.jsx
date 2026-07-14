import React, { useState, useEffect } from 'react'
import { Package, Plus, Search, Edit, Trash2, ShieldAlert, CheckCircle, AlertTriangle, Coins, Eye } from 'lucide-react'
import { getCategories } from '../../lib/supabase'

const COLOR_MAP = {
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
  if (COLOR_MAP[clean]) return COLOR_MAP[clean];

  for (const key in COLOR_MAP) {
    if (clean.includes(key)) return COLOR_MAP[key];
  }
  return '#CCCCCC';
}

// Helper to resolve display image for products in the admin inventory list
const getProductDisplayImage = (prod) => {
  if (!prod) return null;
  const cleanColor = (c) => c ? c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';

  const colorsArr = Array.isArray(prod.colors)
    ? prod.colors
    : (typeof prod.colors === 'string' ? prod.colors.split(',').map(c => c.trim()) : []);

  const defaultColorName = prod.default_color
    ? cleanColor(prod.default_color)
    : (colorsArr.length > 0 ? cleanColor(colorsArr[0]) : '');

  let resolvedVariants = prod.variants || [];
  if (typeof resolvedVariants === 'string') {
    try {
      resolvedVariants = JSON.parse(resolvedVariants);
    } catch (e) {
      resolvedVariants = [];
    }
  }

  const defaultVariant = Array.isArray(resolvedVariants)
    ? resolvedVariants.find(v => cleanColor(v.color) === defaultColorName && Array.isArray(v.images) && v.images.length > 0)
    : null;

  if (defaultVariant && defaultVariant.images[0]) {
    return defaultVariant.images[0];
  }
  if (prod.image) {
    return prod.image;
  }
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    return prod.images[0];
  }
  return null;
};

export default function ProductsTab({
  filteredProducts,
  searchQuery,
  setSearchQuery,
  handleAddProduct,
  handleEditProduct,
  handleDeleteProduct
}) {
  const [categories, setCategories] = useState([])
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (err) {
        console.error("Failed to load categories for filter:", err)
      }
    }
    loadCategories()
  }, [])
  // Helper to dynamically calculate total variant stocks (filter out inactive color variants)
  const getProductTotalStock = (prod) => {
    const activeColorsCleaned = (prod.colors || []).map(c => c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase());
    const activeVariants = (prod.variants || []).filter(v => {
      const vColorClean = v.color ? v.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';
      return activeColorsCleaned.includes(vColorClean);
    });

    if (activeVariants.length > 0) {
      return activeVariants.reduce((sum, v) => sum + (v.stock !== undefined ? Number(v.stock) : 0), 0)
    }
    return prod.stock ?? prod.stock_qty ?? 0
  }

  const getStockVariantItems = (prod) => {
    const activeColorsCleaned = (prod.colors || []).map(c => c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase());
    const activeVariants = (prod.variants || []).filter(v => {
      const vColorClean = v.color ? v.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() : '';
      return activeColorsCleaned.includes(vColorClean);
    });

    if (activeVariants.length === 0) return [];
    const colorMap = {};
    activeVariants.forEach(v => {
      if (v.color) {
        const displayName = (prod.colors || []).find(c => c.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase() === v.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim().toLowerCase()) || v.color;
        colorMap[displayName] = (colorMap[displayName] || 0) + (v.stock !== undefined ? Number(v.stock) : 0);
      }
    });
    return Object.entries(colorMap).map(([color, qty]) => ({ color, qty }));
  }

  // Filter locally by category
  const displayProducts = filteredProducts.filter(p => {
    if (selectedCategoryFilter === 'all') return true
    const cleanProdCat = (p.category || '').toLowerCase().replace(/[\s-_]+/g, '-').trim()
    const cleanFilterSlug = selectedCategoryFilter.toLowerCase().replace(/[\s-_]+/g, '-').trim()
    return cleanProdCat === cleanFilterSlug
  })

  // Compute inventory KPIs
  const totalProducts = displayProducts.length
  const outOfStock = displayProducts.filter(p => !p.available || getProductTotalStock(p) === 0)
  const lowStock = displayProducts.filter(p => {
    const qty = getProductTotalStock(p)
    return p.available && qty > 0 && qty <= 5
  })

  const totalStockValue = filteredProducts.reduce((acc, curr) => {
    const qty = getProductTotalStock(curr)
    return acc + (qty * curr.price)
  }, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Package className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Products & Stock
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Add streetwear articles, manage inventory alerts, and modify prices.</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="w-full sm:w-auto px-4 lg:px-5 py-2.5 lg:py-3 bg-dark text-cream hover:bg-accent hover:text-dark transition-all duration-300 text-xs lg:text-sm font-sans font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95 border-none"
        >
          <Plus className="w-4 h-4 lg:w-4.5 lg:h-4.5" /> Add Product
        </button>
      </div>

      {/* Inventory Dashboard Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-cream2/60 border border-cream3 rounded-2xl p-3 sm:p-4 shadow-inner">
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-cream3/60 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans text-dark2/45 uppercase tracking-widest font-black block">Catalog Size</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl lg:text-2xl font-sans font-black text-dark">{totalProducts}</span>
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-sans font-bold text-dark2/50">Items</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-xl border border-cream3/60 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans text-dark2/45 uppercase tracking-widest font-black block">Out of Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl lg:text-2xl font-sans font-black text-red-655">{outOfStock.length}</span>
            {outOfStock.length > 0 ? (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded font-black font-sans animate-pulse">Alert</span>
            ) : (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-sans font-bold text-dark2/40">Clean</span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-xl border border-cream3/60 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans text-dark2/45 uppercase tracking-widest font-black block">Low Stock Warn</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl lg:text-2xl font-sans font-black text-amber-600">{lowStock.length}</span>
            {lowStock.length > 0 ? (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded font-black font-sans">Restock</span>
            ) : (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-sans font-bold text-dark2/40">Healthy</span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-xl border border-cream3/60 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-sans text-dark2/45 uppercase tracking-widest font-black block">Stock Valuation</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base sm:text-lg lg:text-xl font-sans font-black text-emerald-600">₹{totalStockValue.toLocaleString('en-IN')}</span>
            <Coins className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-4.5 lg:h-4.5 text-dark/30 group-focus-within:text-dark transition-colors" />
          <input
            type="text"
            placeholder="Search catalog products by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border border-cream3 bg-white hover:border-neutral-300 focus:border-dark focus:bg-white text-xs lg:text-sm text-dark focus:outline-none font-sans transition-all duration-300 shadow-xs focus:shadow-md placeholder-dark/30 font-semibold"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="px-4 py-3 sm:py-3.5 rounded-2xl border border-cream3 bg-[#FAF9F6] hover:border-neutral-300 focus:border-dark text-xs lg:text-sm text-dark focus:outline-none font-sans font-bold transition-all duration-300 shadow-xs cursor-pointer min-w-[200px]"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>      {/* Products Table Wrapper */}
      <div className="bg-white border border-cream3 rounded-2xl overflow-hidden shadow-xs">
        {displayProducts.length === 0 ? (
          <div className="p-12 text-center text-dark2/50 font-sans text-xs lg:text-sm">
            No products found matching your search.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs lg:text-sm font-sans">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-cream3 text-[12.5px] lg:text-[13.5px] uppercase font-bold text-dark2/60 tracking-wider">
                    <th className="py-5 px-6">Product Info</th>
                    <th className="py-5 px-6">Category</th>
                    <th className="py-5 px-6">Price</th>
                    <th className="py-5 px-6">Stock Status</th>
                    <th className="py-5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream2">
                  {displayProducts.map(prod => {
                    const stockQty = getProductTotalStock(prod)
                    const isOutOfStock = !prod.available || stockQty === 0
                    const isLowStock = !isOutOfStock && stockQty <= 5
                    const variantItems = getStockVariantItems(prod)

                    return (
                      <tr key={prod.id} className="hover:bg-[#FAF9F6]/40 transition-all duration-200 group">
                        {/* Product details */}
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0 overflow-hidden rounded-xl border border-cream3/80 w-12 h-14 bg-[#FAF9F6] flex items-center justify-center shadow-2xs">
                              {getProductDisplayImage(prod) ? (
                                <img src={getProductDisplayImage(prod)} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              ) : (
                                <span className="text-[9px] font-sans font-bold text-dark/30 uppercase text-center px-1">No Image</span>
                              )}
                              {!prod.available && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                                  <span className="text-[8px] lg:text-[9px] bg-red-600 text-white font-bold uppercase px-1 py-0.5 rounded scale-90">Off</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-dark block text-[13.5px] lg:text-[15px] truncate max-w-[280px] lg:max-w-[380px] group-hover:text-[#8B5CF6] transition-colors whitespace-nowrap" title={prod.name}>
                                {prod.name}
                              </span>
                              <span className="text-[10px] lg:text-[11px] text-dark2/40 block mt-0.5 whitespace-nowrap">SKU: {prod.sku || prod.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-5 px-6">
                          <span className="text-[10.5px] bg-[#FAF9F6] text-dark/75 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border border-cream3/70">
                            {prod.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-5 px-6">
                          <span className="font-bold text-dark block text-[13.5px] lg:text-[15px]">₹{prod.price.toLocaleString('en-IN')}</span>
                          {prod.originalPrice ? (
                            <span className="text-dark/40 line-through font-normal text-[11px] lg:text-[12.5px] block mt-0.5">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                          ) : null}
                        </td>

                        {/* Stock Level status */}
                        <td className="py-5 px-6">
                          <div className="space-y-2">
                            <span className={`text-[10.5px] lg:text-[11.5px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border inline-flex items-center gap-1.5 shadow-3xs ${isOutOfStock
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : isLowStock
                                ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                              {isOutOfStock ? (
                                <>
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                                  <span>Out of Stock</span>
                                </>
                              ) : isLowStock ? (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Low: {stockQty} Left</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Stock: {stockQty}</span>
                                </>
                              )}
                            </span>

                            {variantItems.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 max-w-[240px] lg:max-w-[280px]">
                                {variantItems.slice(0, 2).map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1.5 text-[9.5px] lg:text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#FAF9F6] text-dark/70 border border-cream3 shadow-3xs">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-dark/10 shadow-3xs" style={{ backgroundColor: resolveColorHex(item.color) }} />
                                    <span>{item.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()}:</span>
                                    <span className="font-bold text-dark">{item.qty}</span>
                                  </span>
                                ))}
                                {variantItems.length > 2 && (
                                  <span
                                    className="inline-flex items-center text-[9.5px] lg:text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-dark text-white shadow-3xs cursor-help"
                                    title={variantItems.map(i => `${i.color}: ${i.qty}`).join('\n')}
                                  >
                                    +{variantItems.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-5 px-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => window.open(`/product/${prod.id}`, '_blank')}
                              className="p-2 bg-[#FAF9F6] hover:bg-dark border border-cream3 hover:border-dark hover:text-white rounded-xl text-dark transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
                              title="See Product on storefront"
                            >
                              <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-2 bg-[#FAF9F6] hover:bg-dark border border-cream3 hover:border-dark hover:text-white rounded-xl text-dark transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
                              title="Edit Product Details"
                            >
                              <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 bg-red-50 hover:bg-red-600 border border-red-100 hover:border-red-600 hover:text-white rounded-xl text-red-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-based List View */}
            <div className="md:hidden divide-y divide-cream2">
              {displayProducts.map(prod => {
                const stockQty = getProductTotalStock(prod)
                const isOutOfStock = !prod.available || stockQty === 0
                const isLowStock = !isOutOfStock && stockQty <= 5
                const variantItems = getStockVariantItems(prod)

                return (
                  <div key={prod.id} className="p-4 space-y-4 hover:bg-[#FAF9F6]/30 transition-all">
                    {/* Upper row: image + name + id */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0 overflow-hidden rounded-xl border border-cream3 w-12 h-14 bg-[#FAF9F6] flex items-center justify-center shadow-2xs">
                        {getProductDisplayImage(prod) ? (
                          <img src={getProductDisplayImage(prod)} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-sans font-bold text-dark/30 uppercase text-center px-1">No Image</span>
                        )}
                        {!prod.available && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="text-[8px] bg-red-650 text-white font-bold uppercase px-1 py-0.5 rounded scale-90">Off</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-dark block text-xs truncate" title={prod.name}>
                          {prod.name}
                        </span>
                        <span className="text-[9.5px] text-dark2/40 block mt-0.5">ID: {prod.id}</span>
                        <span className="inline-block text-[10px] bg-[#FAF9F6] text-dark/75 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider border border-cream3/60 mt-1.5">
                          {prod.category}
                        </span>
                      </div>
                    </div>

                    {/* Middle row: Price & Stock Status */}
                    <div className="flex flex-col gap-2.5 bg-[#FAF9F6] p-3 rounded-2xl border border-cream3/50 text-xs shadow-3xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[8px] uppercase font-bold text-dark2/45 block tracking-wider">Price</span>
                          <span className="font-bold text-dark">₹{prod.price.toLocaleString('en-IN')}</span>
                          {prod.originalPrice && (
                            <span className="text-dark2/45 line-through font-normal text-[10.5px] ml-1.5">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[8px] uppercase font-bold text-dark2/45 block tracking-wider mb-0.5">Stock</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border inline-flex items-center gap-1 shadow-3xs ${isOutOfStock
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : isLowStock
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low: ${stockQty}` : `Stock: ${stockQty}`}
                          </span>
                        </div>
                      </div>

                      {variantItems.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-cream3/30">
                          {variantItems.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 text-[8.5px] font-bold px-2 py-0.5 rounded bg-white text-dark/70 border border-cream3 shadow-3xs">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-dark/10 shadow-3xs" style={{ backgroundColor: resolveColorHex(item.color) }} />
                              <span>{item.color.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()}:</span>
                              <span className="font-bold text-dark">{item.qty}</span>
                            </span>
                          ))}
                          {variantItems.length > 2 && (
                            <span
                              className="inline-flex items-center text-[8.5px] font-bold px-2 py-0.5 rounded bg-dark text-white shadow-3xs"
                              title={variantItems.map(i => `${i.color}: ${i.qty}`).join('\n')}
                            >
                              +{variantItems.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lower row: Action buttons */}
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => window.open(`/product/${prod.id}`, '_blank')}
                        className="flex-1 py-2.5 bg-[#FAF9F6] hover:bg-dark hover:text-white rounded-xl text-dark transition-all cursor-pointer border border-cream3/60 hover:border-dark flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs hover:scale-103 active:scale-97"
                        title="See Product on storefront"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className="flex-1 py-2.5 bg-[#FAF9F6] hover:bg-dark hover:text-white rounded-xl text-dark transition-all cursor-pointer border border-cream3/60 hover:border-dark flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs hover:scale-103 active:scale-97"
                        title="Edit Product Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="py-2.5 px-4 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl text-red-650 transition-all border border-red-100 hover:border-red-600 cursor-pointer flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
