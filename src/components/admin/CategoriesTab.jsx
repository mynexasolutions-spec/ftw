import React from 'react'
import { Layers, Plus, Search, Edit, Trash2 } from 'lucide-react'

export default function CategoriesTab({
  filteredCategories,
  categoriesList,
  products,
  searchQuery,
  setSearchQuery,
  setNewCategoryName,
  setNewCategoryParent,
  setNewCategoryDescription,
  setNewCategorySortOrder,
  setCategoryModalMode,
  setSelectedCategory,
  setShowCategoryModal,
  handleDeleteCategory
}) {
  const mainCategories = filteredCategories.filter(c => !c.parent)
  const standaloneSubs = filteredCategories.filter(c => c.parent && !mainCategories.some(parent => parent.name === c.parent))

  return (
    <div className="space-y-8 animate-fade-in font-sans text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Layers className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Categories Management
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Create product categories, organize sub-categories, and structure catalog layers.</p>
        </div>
        <button
          onClick={() => {
            setNewCategoryName('')
            setNewCategoryParent('')
            setNewCategoryDescription('')
            setNewCategorySortOrder('0')
            setCategoryModalMode('add')
            setSelectedCategory(null)
            setShowCategoryModal(true)
          }}
          className="w-full sm:w-auto px-4 lg:px-5 py-2.5 lg:py-3 bg-dark text-cream hover:bg-accent hover:text-dark transition-all text-xs lg:text-sm font-sans font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border-none"
        >
          <Plus className="w-4 h-4 lg:w-4.5 lg:h-4.5" /> Add Category
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-4.5 lg:h-4.5 text-dark2/45" />
          <input
            type="text" 
            placeholder="Search categories by name or description..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-xl border border-cream3 bg-white text-xs lg:text-sm focus:outline-none font-sans shadow-xs focus:shadow-md transition-all duration-300 placeholder-dark/30 font-semibold text-dark hover:border-neutral-300 focus:border-dark"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-dark2/50 bg-white border border-cream3 rounded-2xl text-xs lg:text-sm font-sans">
            {categoriesList.length === 0 ? 'No categories found.' : 'No matching categories found.'}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white border border-cream3 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs lg:text-sm font-sans">
                <thead>
                  <tr className="bg-cream/40 border-b border-cream3 text-[10px] lg:text-xs uppercase font-bold text-dark2/60 tracking-wider">
                    <th className="p-4 lg:p-4.5">Category Name</th>
                    <th className="p-4 lg:p-4.5">Type</th>
                    <th className="p-4 lg:p-4.5">Slug</th>
                    <th className="p-4 lg:p-4.5">Description</th>
                    <th className="p-4 lg:p-4.5">Sort Order</th>
                    <th className="p-4 lg:p-4.5">Products</th>
                    <th className="p-4 lg:p-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream3">
                  {filteredCategories.map(cat => {
                    const isParent = !cat.parent
                    const productCount = products.filter(p => 
                      isParent 
                        ? (p.category || '').toLowerCase() === (cat.name || '').toLowerCase()
                        : (p.subcategory || '').toLowerCase() === (cat.name || '').toLowerCase()
                    ).length

                    return (
                      <tr key={cat.id} className="hover:bg-cream/20 transition-colors group">
                        <td className="p-4 lg:p-4.5">
                          <span className="font-bold text-dark block text-xs lg:text-sm">{cat.name}</span>
                        </td>
                        <td className="p-4 lg:p-4.5">
                          {isParent ? (
                            <span className="text-[8px] lg:text-[9.5px] bg-dark text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
                              Main Category
                            </span>
                          ) : (
                            <span className="text-[8px] lg:text-[9.5px] bg-cream text-dark2/60 border border-cream3 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Sub of {cat.parent}
                            </span>
                          )}
                        </td>
                        <td className="p-4 lg:p-4.5 font-mono text-[10px] lg:text-xs text-dark2/50">
                          {cat.slug}
                        </td>
                        <td className="p-4 lg:p-4.5 text-dark2/60 max-w-[200px] truncate text-xs lg:text-sm" title={cat.description}>
                          {cat.description || '—'}
                        </td>
                        <td className="p-4 lg:p-4.5 font-bold text-dark text-xs lg:text-sm">
                          {cat.sort_order ?? 0}
                        </td>
                        <td className="p-4 lg:p-4.5">
                          <span className="font-bold text-dark text-xs lg:text-sm">{productCount} items</span>
                        </td>
                        <td className="p-4 lg:p-4.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setNewCategoryName(cat.name || '')
                                setNewCategoryParent(cat.parent || '')
                                setNewCategoryDescription(cat.description || '')
                                setNewCategorySortOrder(String(cat.sort_order ?? 0))
                                setCategoryModalMode('edit')
                                setSelectedCategory(cat)
                                setShowCategoryModal(true)
                              }}
                              className="p-1.5 lg:p-2 bg-cream hover:bg-dark hover:text-white rounded-lg text-dark2 transition-all cursor-pointer border-none flex items-center justify-center shadow-xs"
                              title="Edit Category"
                            >
                              <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 lg:p-2 bg-red-50 hover:bg-red-650 hover:text-white rounded-lg text-red-550 transition-all cursor-pointer border-none flex items-center justify-center shadow-xs"
                              title="Delete Category"
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredCategories.map(cat => {
                const isParent = !cat.parent
                const productCount = products.filter(p => 
                  isParent 
                    ? (p.category || '').toLowerCase() === (cat.name || '').toLowerCase()
                    : (p.subcategory || '').toLowerCase() === (cat.name || '').toLowerCase()
                ).length

                return (
                  <div key={cat.id} className="bg-white border border-cream3 p-4 rounded-2xl shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-dark text-xs uppercase tracking-wide">{cat.name}</h3>
                        <p className="text-[9px] text-dark2/45 font-mono mt-0.5">Slug: {cat.slug}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setNewCategoryName(cat.name || '')
                            setNewCategoryParent(cat.parent || '')
                            setNewCategoryDescription(cat.description || '')
                            setNewCategorySortOrder(String(cat.sort_order ?? 0))
                            setCategoryModalMode('edit')
                            setSelectedCategory(cat)
                            setShowCategoryModal(true)
                          }}
                          className="p-1.5 bg-cream hover:bg-dark hover:text-white rounded-lg text-dark2 border-none transition-all cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-650 hover:text-white rounded-lg text-red-550 border-none transition-all cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-cream3/50 text-xs">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[9px] uppercase font-mono font-bold">
                          {isParent ? (
                            <span className="bg-dark text-white px-2 py-0.5 rounded">Main Category</span>
                          ) : (
                            <span className="bg-cream text-dark2/60 border border-cream3 px-2 py-0.5 rounded">Sub of {cat.parent}</span>
                          )}
                        </span>
                        <span className="text-[9px] bg-cream font-mono font-bold text-dark2/60 border border-cream3 px-2 py-0.5 rounded">
                          Order: {cat.sort_order ?? 0}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-dark bg-cream2 px-2 py-0.5 rounded-lg border border-cream3/60">
                        {productCount} Products
                      </span>
                    </div>

                    {cat.description && (
                      <p className="text-[11px] text-dark2/60 italic leading-relaxed pt-1">
                        "{cat.description}"
                      </p>
                    )}
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
