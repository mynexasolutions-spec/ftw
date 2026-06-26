import React from 'react'
import { Sparkles, Eye, Trash2 } from 'lucide-react'

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

export default function CustomDesignsTab({
  customDesigns,
  setSelectedDesignForPreview,
  setPreviewZone,
  handleDeleteDesign
}) {
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex justify-between items-center border-b border-cream3 pb-4">
        <h2 className="font-sans text-2xl font-extrabold uppercase tracking-tight text-dark flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          Custom T-Shirt Designs
        </h2>
        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          {customDesigns.length} Saved Designs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customDesigns.length === 0 ? (
          <div className="col-span-full text-center py-12 text-dark2/50 bg-white border border-cream3 rounded-2xl text-xs font-sans">
            No custom T-shirt designs saved yet.
          </div>
        ) : (
          customDesigns.map(design => {
            const styleName = PRODUCT_STYLES[design.style_id] || 'Custom Tee'
            const formattedPrice = design.total_price ? `₹${design.total_price.toLocaleString('en-IN')}` : 'N/A'
            const createdDate = new Date(design.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })

            return (
              <div key={design.id} className="bg-white border border-cream3 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-dark/30 hover:shadow-md transition-all duration-200 group">
                {/* Visual Shirt Thumbnail */}
                <div className="relative h-60 bg-cream/40 flex items-center justify-center border-b border-cream3 overflow-hidden select-none">
                  <div style={{
                    width: 420,
                    height: 500,
                    transform: 'scale(0.48)',
                    transformOrigin: 'center center',
                    position: 'absolute',
                    backgroundColor: design.color_hex || '#FAF9F6',
                    borderRadius: '1rem',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05)'
                  }}>
                    <img
                      src={MOCKUPS.front}
                      alt="Shirt Preview"
                      className="absolute inset-0 w-full h-full object-contain mix-blend-multiply pointer-events-none"
                    />
                    <div className="absolute overflow-hidden" style={{
                      top: ZONE_BOXES.front.top,
                      left: ZONE_BOXES.front.left,
                      width: ZONE_BOXES.front.width,
                      height: ZONE_BOXES.front.height
                    }}>
                      {design.canvas_elements?.front?.map((el, idx) => (
                        <div key={el.id} style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation || 0}deg) scale(${el.scale || 1})`,
                          transformOrigin: 'top left',
                          zIndex: 10 + idx
                        }}>
                          {el.type === 'text' && (
                            <span style={{
                              fontFamily: el.fontFamily || 'Inter',
                              color: el.color || '#000',
                              fontSize: el.size || 16,
                              fontWeight: el.bold ? 'bold' : 'normal',
                              fontStyle: el.italic ? 'italic' : 'normal',
                              textDecoration: el.underline ? 'underline' : 'none',
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap'
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

                {/* Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="font-extrabold text-dark uppercase truncate text-sm">{styleName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="w-3 h-3 rounded-full border border-dark/20 block"
                        style={{ backgroundColor: design.color_hex }}
                        title={design.color_name}
                      />
                      <span className="text-[11px] text-dark2/60 font-semibold">{design.color_name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-dark2/45 font-mono pt-2 border-t border-cream3">
                    <span>Saved on: {createdDate}</span>
                    <span className="font-bold text-dark text-xs">{formattedPrice}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedDesignForPreview(design)
                        setPreviewZone('front')
                      }}
                      className="flex-1 py-2 bg-dark hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 border-none"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => handleDeleteDesign(design.id)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-650 rounded-xl text-red-500 hover:text-white transition-all cursor-pointer border border-red-100"
                      title="Delete Design"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
