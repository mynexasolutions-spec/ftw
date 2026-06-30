import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Plus, Trash2, Edit2, Search, Check, X, FileText, User, Calendar, Globe, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function BlogsTab({
  blogs = [],
  onInsertBlog,
  onUpdateBlog,
  onDeleteBlog
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
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
        setImage(data.url)
        toast.success("Image uploaded successfully!")
      } catch (err) {
        console.error('Cloudinary upload error:', err)
        toast.error(`Upload failed: ${err.message}`)
      } finally {
        setUploadingImage(false)
      }
    }
    reader.onerror = () => {
      toast.error("Failed to read file")
      setUploadingImage(false)
    }
  }

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [author, setAuthor] = useState('FTW Team')
  const [tag, setTag] = useState('')
  const [published, setPublished] = useState(true)

  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)
    if (modalMode === 'add') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setSlug(generatedSlug)
    }
  }

  const handleOpenAdd = () => {
    setModalMode('add')
    setSelectedBlog(null)
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setImage('')
    setAuthor('FTW Team')
    setTag('')
    setPublished(true)
    setShowModal(true)
  }

  const handleOpenEdit = (blog) => {
    setModalMode('edit')
    setSelectedBlog(blog)
    setTitle(blog.title || '')
    setSlug(blog.slug || '')
    setExcerpt(blog.excerpt || '')
    setContent(blog.content || '')
    setImage(blog.image || '')
    setAuthor(blog.author || 'FTW Team')
    setTag(blog.tag || '')
    setPublished(blog.published ?? true)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error("Please fill in Title, Slug, and Content.")
      return
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      image: image.trim() || null,
      author: author.trim() || 'FTW Team',
      tag: tag.trim() || null,
      published
    }

    try {
      if (modalMode === 'add') {
        await onInsertBlog(payload)
      } else {
        await onUpdateBlog(selectedBlog.id, payload)
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPosts = blogs.length
  const publishedPosts = blogs.filter(b => b.published).length
  const draftPosts = totalPosts - publishedPosts

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-display text-2xl lg:text-3xl xl:text-4xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <BookOpen className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent fill-accent" />
            </div>
            Blog Management
          </h2>
          <p className="text-xs lg:text-sm xl:text-base text-dark2/50 mt-1 font-medium">Publish drop campaigns, designer logs, lifestyle articles, and release notices.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-3.5 bg-dark hover:bg-accent text-cream hover:text-dark border-none transition-all duration-300 font-sans font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer hover:scale-103"
        >
          <Plus className="w-4 h-4" /> Add Post
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Posts */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-neutral-50 border border-neutral-200/60 p-5 rounded-2xl flex flex-col justify-between min-h-[110px]"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-mono font-black text-dark2/50 uppercase tracking-widest block">Total Posts</span>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark mt-1 font-mono">{totalPosts}</p>
          </div>
          <span className="text-[8px] sm:text-[9px] lg:text-[10px] xl:text-xs font-mono text-dark/30 mt-2">All Drop Stories</span>
        </motion.div>

        {/* Published */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl flex flex-col justify-between min-h-[110px]"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-mono font-black text-accent uppercase tracking-widest block">Published</span>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark mt-1 font-mono">{publishedPosts}</p>
          </div>
          <span className="text-[8px] sm:text-[9px] lg:text-[10px] xl:text-xs font-mono text-[#FF4E20] mt-2">Live on Shop Portal</span>
        </motion.div>

        {/* Drafts */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-neutral-55/50 border border-neutral-200/40 p-5 rounded-2xl flex flex-col justify-between min-h-[110px]"
        >
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-mono font-black text-dark2/40 uppercase tracking-widest block">Drafts</span>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark mt-1 font-mono">{draftPosts}</p>
          </div>
          <span className="text-[8px] sm:text-[9px] lg:text-[10px] xl:text-xs font-mono text-neutral-400 mt-2">Private offline notes</span>
        </motion.div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-cream2 border border-cream3 rounded-2xl px-4 py-3 max-w-md">
        <Search className="w-4 h-4 text-dark2/40 shrink-0" />
        <input
          type="text"
          placeholder="Filter stories by title, body, or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs lg:text-sm font-medium text-dark"
        />
      </div>

      {/* Main List */}
      <div className="bg-white border border-cream3 rounded-[28px] overflow-hidden shadow-xs">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 text-dark2/50 text-xs sm:text-sm lg:text-base font-medium">
            <FileText className="w-8 h-8 text-dark2/20 mx-auto mb-3" />
            No drop articles or posts found. Publish one to start your feed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-cream2/60 border-b border-cream3 text-[9px] sm:text-[10px] lg:text-xs font-mono font-black uppercase text-dark2/50">
                  <th className="px-6 py-4">Cover Image</th>
                  <th className="px-6 py-4">Story details</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream3">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-cream2/20 transition-colors text-xs lg:text-sm font-bold">
                    <td className="px-6 py-4">
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-cream3 bg-cream flex items-center justify-center shrink-0">
                        {blog.image ? (
                          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-dark2/30" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-dark block font-sans font-black text-sm uppercase tracking-tight">{blog.title}</span>
                        <span className="text-dark2/40 font-mono text-[9px] block mt-0.5">slug: {blog.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-dark2/75 font-mono">
                        <User className="w-3.5 h-3.5 text-dark2/40" />
                        <span>{blog.author}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {blog.published ? (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-[#FF4E20] border border-orange-100 text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          <Globe className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-400 border border-neutral-200 text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-dark2/60 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-dark2/40" />
                        <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          title="Modify Post"
                          className="w-8 h-8 rounded-lg border border-cream3 bg-white text-dark hover:bg-[#161616] hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBlog(blog.id)}
                          title="Delete Post"
                          className="w-8 h-8 rounded-lg border border-red-100 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div onClick={() => setShowModal(false)} className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-md" />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="bg-[#FAFAF7] border-2 border-cream3 w-full max-w-2xl p-6 sm:p-8 rounded-[32px] shadow-2xl relative z-10 text-sm font-sans max-h-[95vh] overflow-y-auto"
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="absolute top-5 right-5 p-2 rounded-xl hover:bg-cream3 border border-cream3 text-dark transition-all cursor-pointer bg-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="border-b border-cream3 pb-4 mb-6 select-none">
                  <span className="text-[10px] text-accent font-black uppercase tracking-widest font-mono">Blog Feed Operations</span>
                  <h3 className="font-display text-xl lg:text-2xl font-black uppercase text-dark tracking-tight mt-0.5">
                    {modalMode === 'add' ? 'Publish Blog Story' : 'Modify Blog Story'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs uppercase font-black text-dark2/50 block">Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Introducing The Cyber drop"
                        value={title}
                        onChange={handleTitleChange}
                        className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs md:text-sm font-bold text-dark transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs uppercase font-black text-dark2/50 block">Slug *</label>
                      <input
                        type="text"
                        required
                        placeholder="introducing-the-cyber-drop"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs md:text-sm font-bold text-dark transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left Column: Cover Image */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs uppercase font-black text-dark2/50 block">Cover Image</label>
                      <div>
                        {image ? (
                          <div className="relative w-full aspect-[16/10] md:aspect-square lg:aspect-[16/11] rounded-2xl overflow-hidden border border-cream3 bg-cream group">
                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImage('')}
                              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer border-none flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full aspect-[16/10] md:aspect-square lg:aspect-[16/11] rounded-2xl border-2 border-dashed border-cream3 bg-cream2/30 hover:bg-white hover:border-[#FF4E20]/60 transition-all cursor-pointer relative group min-h-[160px]">
                            {uploadingImage ? (
                              <div className="flex flex-col items-center gap-2">
                                <span className="animate-spin w-5 h-5 border-2 border-[#161616] border-t-transparent rounded-full" />
                                <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-dark/50">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Plus className="w-6 h-6 text-dark2/35 group-hover:text-[#FF4E20] transition-colors" />
                                <span className="text-[10px] md:text-xs font-mono font-black uppercase tracking-widest text-dark2/50 group-hover:text-dark transition-colors">Upload Cover</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Author and Tag (stacked) */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] md:text-xs uppercase font-black text-dark2/50 block">Author</label>
                        <input
                          type="text"
                          placeholder="FTW Team"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs md:text-sm font-bold text-dark transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] md:text-xs uppercase font-black text-dark2/50 block">Tag / Label</label>
                        <input
                          type="text"
                          placeholder="EDITORIAL"
                          value={tag}
                          onChange={(e) => setTag(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs md:text-sm font-bold text-dark transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs uppercase font-black text-dark2/50 block">Excerpt / Summary</label>
                    <input
                      type="text"
                      placeholder="Provide a brief 1-2 sentence hook for catalog feed preview cards..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs md:text-sm font-bold text-dark transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs uppercase font-black text-dark2/50 block">Content *</label>
                    <textarea
                      required
                      rows="8"
                      placeholder="Write your article narrative here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-3 bg-cream2/50 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs md:text-sm font-sans text-dark transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="published"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-accent focus:ring-accent border-cream3"
                    />
                    <label htmlFor="published" className="text-xs md:text-sm uppercase font-black text-dark2/60 cursor-pointer select-none">
                      Publish immediately (Show to public on shop feed)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-cream3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3.5 bg-white hover:bg-cream3 text-dark font-sans font-bold uppercase tracking-wider rounded-2xl border border-cream3 transition-colors cursor-pointer text-center text-xs md:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#161616] hover:bg-accent text-white font-sans font-black uppercase tracking-wider rounded-2xl transition-colors cursor-pointer text-center shadow-md text-xs md:text-sm border-none"
                    >
                      Save Story
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
