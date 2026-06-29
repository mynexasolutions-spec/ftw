import React from 'react'
import { Package, Plus, Search, Edit, Trash2, ShieldAlert, CheckCircle, AlertTriangle, Coins, Eye } from 'lucide-react'

export default function ProductsTab({
  filteredProducts,
  searchQuery,
  setSearchQuery,
  handleAddProduct,
  handleEditProduct,
  handleDeleteProduct
}) {
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
        const cleanName = displayName.replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim();
        colorMap[cleanName] = (colorMap[cleanName] || 0) + (v.stock !== undefined ? Number(v.stock) : 0);
      }
    });
    return Object.entries(colorMap).map(([color, qty]) => ({ color, qty }));
  }

  // Compute inventory KPIs
  const totalProducts = filteredProducts.length
  const outOfStock = filteredProducts.filter(p => !p.available || getProductTotalStock(p) === 0)
  const lowStock = filteredProducts.filter(p => {
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
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono text-dark2/45 uppercase tracking-widest font-black block">Catalog Size</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl lg:text-2xl font-sans font-black text-dark">{totalProducts}</span>
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-mono font-bold text-dark2/50">Items</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-xl border border-cream3/60 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono text-dark2/45 uppercase tracking-widest font-black block">Out of Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl lg:text-2xl font-sans font-black text-red-650">{outOfStock.length}</span>
            {outOfStock.length > 0 ? (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded font-black font-mono animate-pulse">Alert</span>
            ) : (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-mono font-bold text-dark2/40">Clean</span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-xl border border-cream3/60 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono text-dark2/45 uppercase tracking-widest font-black block">Low Stock Warn</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl lg:text-2xl font-sans font-black text-amber-600">{lowStock.length}</span>
            {lowStock.length > 0 ? (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded font-black font-mono">Restock</span>
            ) : (
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-mono font-bold text-dark2/40">Healthy</span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-xl border border-cream3/60 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono text-dark2/45 uppercase tracking-widest font-black block">Stock Valuation</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base sm:text-lg lg:text-xl font-sans font-black text-emerald-600">₹{totalStockValue.toLocaleString('en-IN')}</span>
            <Coins className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
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
      </div>

      {/* Products Table Wrapper */}
      <div className="bg-white border border-cream3 rounded-2xl overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-dark2/50 font-sans text-xs lg:text-sm">
            No products found matching your search.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs lg:text-sm font-sans">
                <thead>
                  <tr className="bg-cream/40 border-b border-cream3 text-[10px] lg:text-xs uppercase font-bold text-dark2/60 tracking-wider">
                    <th className="p-4 lg:p-4.5">Product Info</th>
                    <th className="p-4 lg:p-4.5">Category</th>
                    <th className="p-4 lg:p-4.5">SKU Code</th>
                    <th className="p-4 lg:p-4.5">Price</th>
                    <th className="p-4 lg:p-4.5">Stock Status</th>
                    <th className="p-4 lg:p-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream3">
                  {filteredProducts.map(prod => {
                    const stockQty = getProductTotalStock(prod)
                    const isOutOfStock = !prod.available || stockQty === 0
                    const isLowStock = !isOutOfStock && stockQty <= 5
                    const variantItems = getStockVariantItems(prod)

                    return (
                      <tr key={prod.id} className="hover:bg-cream/20 transition-colors group">
                        {/* Product details */}
                        <td className="p-4 lg:p-4.5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0 overflow-hidden rounded-xl border border-cream3 w-10 h-12 lg:w-11 lg:h-13 bg-cream flex items-center justify-center">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              {!prod.available && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                                  <span className="text-[7px] lg:text-[8px] bg-red-650 text-white font-black uppercase px-1 py-0.5 rounded scale-90">Off</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-dark block text-xs lg:text-sm truncate max-w-[180px] lg:max-w-[220px]" title={prod.name}>
                                {prod.name}
                              </span>
                              <span className="text-[9px] lg:text-[10px] text-dark2/45 font-mono block">ID: {prod.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 lg:p-4.5">
                          <span className="text-[10px] lg:text-xs bg-cream text-dark2/75 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-cream3/60">
                            {prod.category}
                          </span>
                        </td>

                        {/* SKU */}
                        <td className="p-4 lg:p-4.5 font-mono text-dark2/50 text-[10px] lg:text-xs uppercase font-bold">
                          {prod.sku || '—'}
                        </td>

                        {/* Price */}
                        <td className="p-4 lg:p-4.5">
                          <span className="font-bold text-dark block text-xs lg:text-sm">₹{prod.price.toLocaleString('en-IN')}</span>
                          {prod.originalPrice ? (
                            <span className="text-dark2/45 line-through font-normal text-[10px] lg:text-xs">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                          ) : null}
                        </td>

                        {/* Stock Level status */}
                        <td className="p-4 lg:p-4.5">
                          <div className="space-y-1.5">
                            <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-2xs ${
                              isOutOfStock 
                                ? 'bg-red-50 text-red-750 border-red-150' 
                                : isLowStock 
                                  ? 'bg-amber-50 text-amber-700 border-amber-150' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                            }`}>
                              {isOutOfStock ? (
                                <>
                                  <ShieldAlert className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-red-650" />
                                  <span>Out of Stock</span>
                                </>
                              ) : isLowStock ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-600 animate-pulse" />
                                  <span>Low: {stockQty} left</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-emerald-500" />
                                  <span>Stock: {stockQty}</span>
                                </>
                              )}
                            </span>

                            {variantItems.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 max-w-[220px] lg:max-w-[260px]">
                                {variantItems.slice(0, 2).map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 text-[8.5px] lg:text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-cream2 text-dark2/70 border border-cream3/80 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-dark/40 shrink-0" />
                                    <span>{item.color}:</span>
                                    <span className="font-black text-dark">{item.qty}</span>
                                  </span>
                                ))}
                                {variantItems.length > 2 && (
                                  <span 
                                    className="inline-flex items-center text-[8.5px] lg:text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-dark text-white shadow-2xs cursor-help"
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
                        <td className="p-4 lg:p-4.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => window.open(`/product/${prod.id}`, '_blank')}
                              className="p-2 lg:p-2.5 bg-cream hover:bg-dark hover:text-white rounded-xl text-dark2 transition-all cursor-pointer border-none flex items-center justify-center shadow-xs"
                              title="See Product on storefront"
                            >
                              <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-2 lg:p-2.5 bg-cream hover:bg-dark hover:text-white rounded-xl text-dark2 transition-all cursor-pointer border-none flex items-center justify-center shadow-xs"
                              title="Edit Product Details"
                            >
                              <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 lg:p-2.5 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl text-red-550 transition-all cursor-pointer border-none flex items-center justify-center shadow-xs"
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
             <div className="md:hidden divide-y divide-cream3">
               {filteredProducts.map(prod => {
                 const stockQty = getProductTotalStock(prod)
                 const isOutOfStock = !prod.available || stockQty === 0
                 const isLowStock = !isOutOfStock && stockQty <= 5
                 const variantItems = getStockVariantItems(prod)

                 return (
                   <div key={prod.id} className="p-4 space-y-3 hover:bg-cream2/20 transition-all">
                     {/* Upper row: image + name + id */}
                     <div className="flex items-center gap-3">
                       <div className="relative shrink-0 overflow-hidden rounded-xl border border-cream3 w-12 h-14 bg-cream flex items-center justify-center">
                         <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                         {!prod.available && (
                           <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                             <span className="text-[7px] bg-red-650 text-white font-black uppercase px-1 py-0.5 rounded scale-90">Off</span>
                           </div>
                         )}
                       </div>
                       <div className="min-w-0 flex-1">
                         <span className="font-bold text-dark block text-xs truncate" title={prod.name}>
                           {prod.name}
                         </span>
                         <span className="text-[9px] text-dark2/45 font-mono block mt-0.5">ID: {prod.id}</span>
                         <span className="inline-block text-[9px] bg-cream text-dark2/75 px-1.5 py-0.5 rounded font-black uppercase tracking-wider border border-cream3/60 mt-1">
                           {prod.category}
                         </span>
                       </div>
                     </div>

                     {/* Middle row: Price & Stock Status */}
                     <div className="flex flex-col gap-2 bg-cream2/30 p-2.5 rounded-xl border border-cream3/50 text-xs">
                       <div className="flex justify-between items-center">
                         <div>
                           <span className="text-[8px] uppercase font-black text-dark2/45 block">Price</span>
                           <span className="font-bold text-dark">₹{prod.price.toLocaleString('en-IN')}</span>
                           {prod.originalPrice && (
                             <span className="text-dark2/45 line-through font-normal text-[10px] ml-1.5">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                           )}
                         </div>
                         
                         <div className="text-right">
                           <span className="text-[8px] uppercase font-black text-dark2/45 block mb-0.5">Stock</span>
                           <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                             isOutOfStock 
                               ? 'bg-red-50 text-red-750 border-red-150' 
                               : isLowStock 
                                 ? 'bg-amber-50 text-amber-700 border-amber-150' 
                                 : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                           }`}>
                             {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low: ${stockQty}` : `Stock: ${stockQty}`}
                           </span>
                         </div>
                       </div>

                       {variantItems.length > 0 && (
                         <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-cream3/50">
                           {variantItems.slice(0, 2).map((item, idx) => (
                             <span key={idx} className="inline-flex items-center gap-1 text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-cream2 text-dark2/70 border border-cream3/80">
                               <span className="w-1.5 h-1.5 rounded-full bg-dark/40 shrink-0" />
                               <span>{item.color}:</span>
                               <span className="font-black text-dark">{item.qty}</span>
                             </span>
                           ))}
                           {variantItems.length > 2 && (
                             <span 
                               className="inline-flex items-center text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-dark text-white shadow-2xs"
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
                        className="flex-1 py-2 bg-cream hover:bg-dark hover:text-white rounded-xl text-dark2 transition-all cursor-pointer border border-cream3/60 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-xs"
                        title="See Product on storefront"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className="flex-1 py-2 bg-cream hover:bg-dark hover:text-white rounded-xl text-dark2 transition-all cursor-pointer border border-cream3/60 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-xs"
                        title="Edit Product Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="py-2 px-3.5 bg-red-50 hover:bg-red-650 hover:text-white rounded-xl text-red-550 transition-all cursor-pointer border-none flex items-center justify-center shadow-xs"
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
