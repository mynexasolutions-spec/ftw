import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function RichTextEditor({ value, onChange, placeholder = "Write your article narrative here..." }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)
  const [quillLoaded, setQuillLoaded] = useState(false)

  useEffect(() => {
    // Load stylesheet
    const cssId = 'quill-cdn-css'
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css'
      document.head.appendChild(link)
    }

    // Load JS script
    const scriptId = 'quill-cdn-js'
    let script = document.getElementById(scriptId)

    const initQuill = () => {
      if (!containerRef.current || quillRef.current) return
      if (containerRef.current.classList.contains('ql-container')) return

      const wrapper = containerRef.current.parentElement
      if (wrapper) {
        const duplicateToolbars = wrapper.querySelectorAll('.ql-toolbar')
        duplicateToolbars.forEach(tb => tb.remove())
      }
      containerRef.current.innerHTML = ''

      // Shared upload function used by toolbar handler and DOM interceptor
      const uploadImageToCloudinary = async (file, quill) => {
        const loadingToast = toast.loading('Uploading image to Cloudinary...')
        try {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = async () => {
            try {
              const res = await fetch('/.netlify/functions/cloudinary-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: reader.result })
              })
              if (!res.ok) throw new Error((await res.text()) || 'Upload failed')
              const { url } = await res.json()
              const range = quill.getSelection(true)
              const index = range ? range.index : quill.getLength()
              quill.insertEmbed(index, 'image', url, 'user')
              quill.setSelection(index + 1, 'silent')
              toast.success('Image uploaded to Cloudinary!', { id: loadingToast })
            } catch (err) {
              toast.error(`Upload failed: ${err.message}`, { id: loadingToast })
            }
          }
          reader.onerror = () => toast.error('Failed to read file', { id: loadingToast })
        } catch (err) {
          toast.error('Unexpected error', { id: loadingToast })
        }
      }

      // LAYER 1: handlers in Quill modules config (Quill-level override)
      // 'let quill' declared BEFORE the handler so the closure captures the variable
      // (not the value) — by the time the user clicks, quill is already assigned
      let quill = null

      const imageHandler = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()
        input.onchange = () => {
          const file = input.files?.[0]
          if (file) uploadImageToCloudinary(file, quill)
        }
      }

      // Initialize Quill — imageHandler closes over 'quill' (let), safe because
      // the handler only runs on user click, after quill is assigned below
      quill = new window.Quill(containerRef.current, {
        theme: 'snow',
        placeholder: placeholder,
        modules: {
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['link', 'image', 'clean']
            ],
            handlers: {
              image: imageHandler  // ← closure ref, not yet-assigned value
            }
          }
        }
      })

      // LAYER 2: DOM capture interceptor on the .ql-image button
      // Runs in capture phase — fires BEFORE Quill's own click handler
      setTimeout(() => {
        const toolbarEl = wrapper?.querySelector('.ql-toolbar')
        if (toolbarEl) {
          toolbarEl.addEventListener('click', (e) => {
            const imgBtn = e.target.closest('.ql-image')
            if (!imgBtn) return
            e.preventDefault()
            e.stopImmediatePropagation()
            const input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.setAttribute('accept', 'image/*')
            input.click()
            input.onchange = () => {
              const file = input.files?.[0]
              if (file) uploadImageToCloudinary(file, quill)
            }
          }, true) // ← capture phase = highest priority
        }
      }, 0)

      // LAYER 3: Clipboard matcher — strips any base64 data: URI images that
      // slip through copy-paste, replacing them with a toast warning
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        delta.ops = delta.ops.filter(op => {
          if (op.insert?.image && typeof op.insert.image === 'string' && op.insert.image.startsWith('data:')) {
            toast.error('Paste blocked: Use the image button to upload images.')
            return false
          }
          return true
        })
        return delta
      })

      quillRef.current = quill

      // Set initial value
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value)
      }

      // Handle text changes
      quill.on('text-change', () => {
        const html = containerRef.current.querySelector('.ql-editor').innerHTML
        if (html === '<p><br></p>') {
          onChange('')
        } else {
          onChange(html)
        }
      })

      // Floating delete button logic (using document.body with fixed positioning)
      let overlay = document.getElementById('ql-img-delete-btn')
      if (!overlay) {
        overlay = document.createElement('div')
        overlay.id = 'ql-img-delete-btn'
        overlay.innerHTML = '&times;'
        overlay.style.cssText = `
          position: fixed;
          display: none;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          user-select: none;
        `
        document.body.appendChild(overlay)
      }

      let currentImg = null

      const positionOverlay = (img) => {
        const imgRect = img.getBoundingClientRect()

        // Position overlay at the top-right corner of the image
        const top = imgRect.top + 6
        const left = imgRect.right - 30

        overlay.style.top = `${top}px`
        overlay.style.left = `${left}px`
        overlay.style.display = 'flex'
      }

      const hideOverlay = () => {
        if (overlay) overlay.style.display = 'none'
        currentImg = null
      }

      // Always position overlay whenever user hovers or mouse is near an image
      const editorEl = containerRef.current.querySelector('.ql-editor')

      const handleImageTracking = (e) => {
        const img = e.target.closest('img')
        if (img) {
          currentImg = img
          positionOverlay(img)
        }
      }

      // Hide overlay if mouse leaves the editor entirely, unless it is over the delete button
      const handleMouseLeave = (e) => {
        if (e.relatedTarget !== overlay) {
          hideOverlay()
        }
      }

      overlay.addEventListener('mouseleave', () => {
        hideOverlay()
      })

      if (editorEl) {
        editorEl.addEventListener('mouseover', handleImageTracking)
        editorEl.addEventListener('mousemove', handleImageTracking)
        editorEl.addEventListener('mouseleave', handleMouseLeave)
        editorEl.addEventListener('scroll', () => {
          if (currentImg) {
            positionOverlay(currentImg)
          } else {
            hideOverlay()
          }
        })
      }

      const onDeleteClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!currentImg) return

        const imgSrc = currentImg.getAttribute('src')
        const ops = quill.getContents().ops
        let index = 0

        for (const op of ops) {
          if (op.insert?.image === imgSrc) {
            quill.deleteText(index, 1, 'user')
            break
          }
          index += typeof op.insert === 'string' ? op.insert.length : 1
        }
        hideOverlay()
      }

      // Remove existing listeners if any
      const newOverlay = overlay.cloneNode(true)
      overlay.parentNode.replaceChild(newOverlay, overlay)
      overlay = newOverlay
      overlay.addEventListener('click', onDeleteClick)

      // Hide overlay on window resize or window scroll (re-calculate on layout shifts)
      window.addEventListener('resize', () => {
        if (currentImg) positionOverlay(currentImg)
        else hideOverlay()
      })
      window.addEventListener('scroll', () => {
        if (currentImg) positionOverlay(currentImg)
        else hideOverlay()
      }, true)
    }

    // Define a cleanup controller using window references to safely unbind
    const handleGlobalHide = () => {
      const overlay = document.getElementById('ql-img-delete-btn')
      if (overlay) overlay.style.display = 'none'
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js'
      script.async = true
      script.onload = () => {
        setQuillLoaded(true)
        initQuill()
      }
      document.head.appendChild(script)
    } else if (window.Quill) {
      setQuillLoaded(true)
      initQuill()
    } else {
      script.addEventListener('load', () => {
        setQuillLoaded(true)
        initQuill()
      })
    }

    window.addEventListener('resize', handleGlobalHide)
    window.addEventListener('scroll', handleGlobalHide, true)

    return () => {
      quillRef.current = null
      const overlay = document.getElementById('ql-img-delete-btn')
      if (overlay) overlay.remove()
      window.removeEventListener('resize', handleGlobalHide)
      window.removeEventListener('scroll', handleGlobalHide, true)
    }
  }, [])

  // Sync value from parent if it changes outside (e.g. on load or reset)
  useEffect(() => {
    if (quillRef.current) {
      const currentHTML = containerRef.current.querySelector('.ql-editor').innerHTML
      if (value !== currentHTML && value !== undefined) {
        const editor = quillRef.current
        const selection = editor.getSelection()
        editor.clipboard.dangerouslyPasteHTML(value || '')
        if (selection) {
          editor.setSelection(selection)
        }
      }
    }
  }, [value])

  return (
    <div className="rich-text-editor-wrapper bg-white rounded-xl border border-cream3 focus-within:border-dark transition-all relative">
      <style>{`
        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #FAF9F6 !important;
          background: #FAF9F6;
          border-top-left-radius: 11px;
          border-top-right-radius: 11px;
        }
        .rich-text-editor-wrapper .ql-container.ql-snow {
          border: none !important;
          border-bottom-left-radius: 11px;
          border-bottom-right-radius: 11px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: 250px;
          font-size: 14px;
          line-height: 1.6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .rich-text-editor-wrapper .ql-editor img {
          max-width: 450px !important;
          width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 1.5rem auto !important;
          border-radius: 16px !important;
          border: 1px solid rgba(22, 22, 22, 0.08) !important;
        }
        .rich-text-editor-wrapper .ql-snow .ql-tooltip {
          z-index: 100 !important;
          border-radius: 10px !important;
          border: 1px solid #E1D9C1 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          background-color: #FAFAF7 !important;
          padding: 8px 12px !important;
        }
        .rich-text-editor-wrapper .ql-snow .ql-tooltip input[type=text] {
          border: 1px solid #E1D9C1 !important;
          border-radius: 6px !important;
          padding: 3px 6px !important;
          font-size: 11px !important;
          outline: none !important;
        }
        .rich-text-editor-wrapper .ql-snow .ql-tooltip a.ql-action::after {
          font-weight: bold;
        }
      `}</style>
      {!quillLoaded && (
        <div className="p-4 text-xs font-mono text-dark2/40 animate-pulse select-none">
          Loading Rich Text Editor Core...
        </div>
      )}
      <div ref={containerRef} style={{ minHeight: '250px' }} />
    </div>
  )
}
