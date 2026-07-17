import React, { useState } from 'react'
import { BookOpen, Plus, Trash2, Edit2, Search, Check, X, FileText, User, Calendar, Globe, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import RichTextEditor from './RichTextEditor'

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
  const [seoTitle, setSeoTitle] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

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
    setSeoTitle('')
    setSeoKeywords('')
    setSeoDescription('')
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
    setSeoTitle(blog.seo_title || '')
    setSeoKeywords(blog.seo_keywords || '')
    setSeoDescription(blog.seo_description || '')
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
      published,
      seo_title: seoTitle.trim() || null,
      seo_keywords: seoKeywords.trim() || null,
      seo_description: seoDescription.trim() || null
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

  const textOnly = content ? content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : ''
  const wordCount = textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0
  const charCount = textOnly.length

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {!showModal ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
            <div>
              <h2 className="font-sans text-2xl lg:text-3xl xl:text-4xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
                <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
                  <BookOpen className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent fill-accent" />
                </div>
                Blog Management
              </h2>
              <p className="text-xs lg:text-sm xl:text-base text-dark2/50 mt-1 font-medium">Publish drop campaigns, lifestyle articles, and release notices.</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-3.5 bg-dark hover:bg-accent text-cream hover:text-dark border-none transition-all duration-300 font-sans font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer hover:scale-103"
            >
              <Plus className="w-4 h-4" /> Add Post
            </button>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
            {/* Total Posts */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-neutral-55/40 border border-neutral-200/60 p-3 sm:p-5 rounded-2xl flex flex-col justify-between min-h-[100px] sm:min-h-[110px]"
            >
              <div>
                <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs xl:text-sm font-sans font-black text-dark2/50 uppercase tracking-widest block">Total Posts</span>
                <p className="text-lg xs:text-xl sm:text-3xl lg:text-4xl font-black text-dark mt-0.5 sm:mt-1 font-sans">{totalPosts}</p>
              </div>
              <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] xl:text-xs font-sans text-dark/30 mt-1.5 sm:mt-2">All Drop Stories</span>
            </motion.div>

            {/* Published */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-purple-50/50 border border-purple-100 p-3 sm:p-5 rounded-2xl flex flex-col justify-between min-h-[100px] sm:min-h-[110px]"
            >
              <div>
                <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs xl:text-sm font-sans font-black text-accent uppercase tracking-widest block">Published</span>
                <p className="text-lg xs:text-xl sm:text-3xl lg:text-4xl font-black text-dark mt-0.5 sm:mt-1 font-sans">{publishedPosts}</p>
              </div>
              <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] xl:text-xs font-sans text-purple-600 mt-1.5 sm:mt-2">Live on Shop</span>
            </motion.div>

            {/* Drafts */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-neutral-55/50 border border-neutral-200/40 p-3 sm:p-5 rounded-2xl flex flex-col justify-between min-h-[100px] sm:min-h-[110px]"
            >
              <div>
                <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs xl:text-sm font-sans font-black text-dark2/40 uppercase tracking-widest block">Drafts</span>
                <p className="text-lg xs:text-xl sm:text-3xl lg:text-4xl font-black text-dark mt-0.5 sm:mt-1 font-sans">{draftPosts}</p>
              </div>
              <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] xl:text-xs font-sans text-neutral-400 mt-1.5 sm:mt-2">Offline Drafts</span>
            </motion.div>
          </div>

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-cream2/30 p-4 rounded-2xl border border-cream3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark2/45" />
              <input
                type="text"
                placeholder="Search articles by title, summary, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-cream3 rounded-xl focus:outline-none focus:border-dark text-xs lg:text-sm font-bold placeholder:opacity-50 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 bg-cream2/20 border border-dashed border-cream3 rounded-[28px] select-none">
              <BookOpen className="w-10 h-10 mx-auto text-dark2/30 mb-3" />
              <p className="text-xs lg:text-sm font-black uppercase text-dark2/60">No articles match your criteria</p>
              <p className="text-[10px] lg:text-xs text-dark2/40 mt-1 font-sans">Create your first update drop, or clear search queries.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white border border-cream3 rounded-[28px] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs lg:text-[14px] xl:text-[15px]">
                  <thead>
                    <tr className="bg-cream2/30 border-b border-cream3 select-none text-[10px] lg:text-xs font-sans font-black uppercase tracking-wider text-dark2/50">
                      <th className="p-4 lg:p-5">Story Details</th>
                      <th className="p-4 lg:p-5">Author</th>
                      <th className="p-4 lg:p-5">Tag</th>
                      <th className="p-4 lg:p-5">Status</th>
                      <th className="p-4 lg:p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream2 font-medium">
                    {filteredBlogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-cream2/15 transition-colors">
                        <td className="p-4 lg:p-5">
                          <div className="flex gap-4 items-center">
                            <div className="w-16 h-10 rounded-lg overflow-hidden bg-cream border border-cream3 shrink-0 select-none">
                              {blog.image ? (
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-dark2/30">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-sans font-semibold text-xs lg:text-[16px] xl:text-[18px] text-dark block leading-snug">{blog.title}</span>
                              <span className="text-[10px] lg:text-xs text-dark2/45 font-sans block mt-1">{blog.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 lg:p-5 text-dark2/70 font-sans font-bold">{blog.author}</td>
                        <td className="p-4 lg:p-5 font-sans text-[10px]">
                          {blog.tag ? (
                            <span className="bg-dark text-cream font-black px-2 py-1 rounded-md text-[9px] select-none tracking-widest uppercase">{blog.tag}</span>
                          ) : (
                            <span className="text-dark2/30 italic">—</span>
                          )}
                        </td>
                        <td className="p-4 lg:p-5">
                          {blog.published ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-3 py-1 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider select-none">
                              <Globe className="w-3 h-3" /> Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-neutral-500 bg-neutral-100 border border-neutral-200/50 px-3 py-1 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider select-none">
                              <Eye className="w-3 h-3 text-neutral-450" /> Draft
                            </span>
                          )}
                        </td>
                        <td className="p-4 lg:p-5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenEdit(blog)}
                              className="p-2 border border-cream3 rounded-xl hover:bg-cream hover:border-dark text-dark transition-all cursor-pointer bg-white shadow-xs"
                              title="Edit Post"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this story permanently?")) {
                                  onDeleteBlog(blog.id)
                                }
                              }}
                              className="p-2 border border-cream3 rounded-xl hover:bg-red-50 hover:border-red-300 text-red-600 transition-all cursor-pointer bg-white shadow-xs"
                              title="Delete Post"
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

              {/* Mobile Card-based List View */}
              <div className="md:hidden divide-y divide-cream3 bg-cream2/10 border border-cream3 rounded-2xl overflow-hidden shadow-xs">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id} className="p-4 space-y-3 hover:bg-cream/15 transition-all text-dark font-sans bg-white">
                    <div className="flex gap-3 items-start">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-cream border border-cream3 shrink-0 select-none">
                        {blog.image ? (
                          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark2/30">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="font-sans font-bold text-xs sm:text-sm text-dark block leading-snug">{blog.title}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {blog.tag && (
                            <span className="bg-dark text-cream font-black px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase">{blog.tag}</span>
                          )}
                          {blog.published ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">Live</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-neutral-500 bg-neutral-105 border border-neutral-250 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">Draft</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-cream3/50">
                      <span className="text-[9px] font-mono text-dark2/45 font-bold uppercase tracking-wider">By: {blog.author}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="px-3 py-1.5 border border-cream3 rounded-xl hover:bg-cream hover:border-dark text-[10px] font-bold uppercase tracking-wider text-dark transition-all cursor-pointer bg-white shadow-3xs flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this story permanently?")) {
                              onDeleteBlog(blog.id)
                            }
                          }}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl border-none transition-all cursor-pointer shadow-3xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#FAFAF7] border border-cream3 w-full p-3 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[32px] shadow-xs relative text-sm font-sans">
          <div className="flex justify-between items-center border-b border-cream3 pb-5 mb-8 select-none">
            <div>
              <span className="text-[10px] text-accent font-black uppercase tracking-widest font-sans">Blog Feed Operations</span>
              <h3 className="font-display text-2xl lg:text-3xl font-black uppercase text-dark tracking-tight leading-none mt-1.5">
                {modalMode === 'add' ? 'Publish Blog Story' : 'Modify Blog Story'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="p-2.5 rounded-xl hover:bg-cream3 border border-cream3 text-dark transition-all cursor-pointer bg-white flex items-center justify-center shrink-0 shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CARD 1: Core Story Identity */}
            <div className="bg-white border border-cream3 p-4 sm:p-7 rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="border-b border-cream2 pb-3">
                <span className="text-[10px] lg:text-[13px] xl:text-[14px] uppercase font-black text-dark tracking-wider block">Core Story Identity</span>
                <span className="text-[9px] lg:text-[11px] xl:text-[12px] text-dark2/40 font-sans uppercase block mt-0.5">Configure main headers and web routing path.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-dark2/50 block">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introducing The Cyber drop"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-sm sm:text-base font-bold text-dark transition-all placeholder:opacity-30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-dark2/50 block">Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="introducing-the-cyber-drop"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-sm sm:text-base font-bold text-dark transition-all font-sans placeholder:opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Cover & Metadata */}
            <div className="bg-white border border-cream3 p-4 sm:p-7 rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="border-b border-cream2 pb-3">
                <span className="text-[10px] lg:text-[12px] uppercase font-black text-dark tracking-wider block">Media & Catalog Details</span>
                <span className="text-[9px] lg:text-[10.5px] text-dark2/40 font-sans uppercase block mt-0.5">Upload cover image and customize feed descriptors.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Cover Image - Left Column */}
                <div className="flex flex-col">
                  <label className="text-[10px] lg:text-[11.5px] xl:text-[12.5px] uppercase font-black text-dark2/50 block mb-1.5">Cover Banner</label>
                  <div className="w-full aspect-[16/9] md:aspect-[21/9]">
                    {image ? (
                      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-cream3 bg-[#FAF9F6] group">
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
                      <label className="flex flex-col items-center justify-center w-full h-full rounded-2xl border-2 border-dashed border-cream3 bg-cream2/30 hover:bg-white hover:border-[#FF4E20]/60 transition-all cursor-pointer relative group">
                        {uploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="animate-spin w-5 h-5 border-2 border-[#161616] border-t-transparent rounded-full" />
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-dark/50">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <Plus className="w-6 h-6 text-dark2/35 group-hover:text-[#FF4E20] transition-colors" />
                            <span className="text-[10px] font-sans font-black uppercase tracking-widest text-dark2/50 group-hover:text-dark transition-colors">Upload Banner</span>
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

                {/* Metadata Column - Right Column */}
                <div className="space-y-4 mt-4 md:mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] lg:text-[11.5px] xl:text-[12.5px] uppercase font-black text-dark2/50 block">Author</label>
                      <input
                        type="text"
                        placeholder="FTW Team"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-[14px] xl:text-[15px] font-bold text-dark transition-all placeholder:opacity-30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] lg:text-[11.5px] xl:text-[12.5px] uppercase font-black text-dark2/50 block">Tag / Label</label>
                      <input
                        type="text"
                        placeholder="EDITORIAL"
                        value={tag}
                        onChange={(e) => setTag(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-[14px] xl:text-[15px] font-bold text-dark transition-all placeholder:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] lg:text-[11.5px] xl:text-[12.5px] uppercase font-black text-dark2/50 block">Excerpt / Summary</label>
                    <textarea
                      rows="3"
                      placeholder="Write a brief 1-2 sentence hook for catalog feed preview cards..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-[14px] xl:text-[15px] font-bold text-dark transition-all font-sans placeholder:opacity-30 resize-none h-[115px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Narrative Content */}
            <div className="bg-white border border-cream3 p-4 sm:p-7 rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs relative">
              <div className="flex justify-between items-start border-b border-cream2 pb-3">
                <div>
                  <span className="text-[10px] lg:text-[13px] xl:text-[14px] uppercase font-black text-dark tracking-wider block">Story Content Narrative</span>
                  <span className="text-[9px] lg:text-[11px] xl:text-[12px] text-dark2/40 font-sans uppercase block mt-0.5">Write your article body using headings, formatting, and inline images.</span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-sans font-black uppercase tracking-widest text-[#FF4E20] bg-[#FF4E20]/5 px-2.5 py-1 rounded-lg border border-[#FF4E20]/15 select-none shrink-0">
                  Rich Text Editor
                </span>
              </div>
              <div className="bg-[#FAF9F6] p-2 sm:p-3 rounded-2xl border border-cream3">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your article narrative here..."
                />
                
                {/* Real-time stats bar */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-cream3/60 text-[9px] sm:text-[10px] font-sans text-dark2/40 uppercase tracking-wider select-none">
                  <div className="flex gap-4">
                    <span>Words: <strong className="text-dark font-black">{wordCount}</strong></span>
                    <span>Characters: <strong className="text-dark font-black">{charCount}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: SEO Meta Fields */}
            <div className="bg-white border border-cream3 p-4 sm:p-7 rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="border-b border-[#FAF9F6] pb-3 select-none">
                <span className="text-[10px] lg:text-[12px] uppercase font-black text-dark tracking-wider block">Search Engine Optimization (SEO)</span>
                <span className="text-[9px] lg:text-[10.5px] text-dark2/40 font-sans uppercase block mt-0.5">These inputs are hidden from users but help index search rankings.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-[11.5px] xl:text-[12.5px] uppercase font-black text-dark2/50 block">SEO Title Tag</label>
                  <input
                    type="text"
                    placeholder="Custom Google title (leave blank to use main Title)"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-[14px] xl:text-[15px] font-bold text-dark transition-all placeholder:opacity-30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-[11.5px] xl:text-[12.5px] uppercase font-black text-dark2/50 block">SEO Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. streetwear, oversized hoodie, new drop"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-[14px] xl:text-[15px] font-bold text-dark transition-all placeholder:opacity-30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-[11.5px] xl:text-[12.5px] uppercase font-black text-dark2/50 block">SEO Meta Description</label>
                <textarea
                  rows="3"
                  placeholder="Summarize the article in 150-160 characters for search result listings..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark text-xs lg:text-[14px] xl:text-[15px] font-sans text-dark transition-all placeholder:opacity-30"
                />
              </div>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-cream3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3.5 bg-white hover:bg-cream3 text-dark font-sans font-bold uppercase tracking-wider rounded-2xl border border-cream3 transition-colors cursor-pointer text-center text-xs md:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#161616] hover:bg-accent text-white font-sans font-black uppercase tracking-wider rounded-2xl transition-colors cursor-pointer text-center shadow-md text-xs md:text-sm border-none"
              >
                Save Blog
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
