import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, ArrowRight, Share2, BookOpen } from 'lucide-react'
import { getBlogBySlug } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] } }
}

export default function BlogDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBlog() {
      try {
        const data = await getBlogBySlug(slug)
        if (!data) {
          toast.error("Blog post not found.")
          navigate('/blogs')
          return
        }
        setBlog(data)
      } catch (err) {
        console.error("Error loading blog details:", err)
        navigate('/blogs')
      } finally {
        setLoading(false)
      }
    }
    loadBlog()
  }, [slug, navigate])

  useEffect(() => {
    if (!blog) return

    // Save initial tags so we can restore them on unmount
    const originalTitle = document.title
    const originalMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const originalMetaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || ''

    // Set title
    document.title = blog.seo_title || `${blog.title} | FOR THE WIN`

    // Set description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', blog.seo_description || blog.excerpt || "FOR THE WIN Premium Unisex Streetwear")

    // Set keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', blog.seo_keywords || 'streetwear, fashion, premium, oversized')

    // Clean up on unmount
    return () => {
      document.title = originalTitle
      if (metaDesc) metaDesc.setAttribute('content', originalMetaDesc)
      if (metaKeywords) metaKeywords.setAttribute('content', originalMetaKeywords)
    }
  }, [blog])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Article link copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center font-sans text-[#161616]/60 text-sm">
        <span className="animate-spin w-6 h-6 border-2 border-[#161616] border-t-transparent rounded-full inline-block mb-3" />
        Opening narrative dossier...
      </div>
    )
  }

  if (!blog) return null

  return (
    <div className="bg-[#FAFAF7] text-[#161616] font-sans min-h-screen pt-16 sm:pt-24 pb-20 relative selection:bg-[#0B0B0B] selection:text-[#CCFF00] bg-grid-dots bg-grain">

      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(255,78,32,0.05),transparent)] pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >


        {/* Article Layout */}
        <article className="space-y-10">

          {/* Header metadata */}
          <motion.div variants={fadeInUp} className="space-y-4 text-left">
            {blog.tag && (
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#FF4E20] bg-[#FF4E20]/5 px-3 py-1.5 rounded-lg border border-[#FF4E20]/15 inline-block">
                {blog.tag}
              </span>
            )}
            <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-[45px] font-black text-dark tracking-tight leading-none lg:leading-[1.1]">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-[10.5px] font-mono text-[#161616]/50 uppercase tracking-widest border-t border-neutral-200/40">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-neutral-400" />
                <span>By {blog.author}</span>
              </div>
            </div>
          </motion.div>

          {/* Left image, right content side-by-side on lg: screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left side: Cover Image banner */}
            {blog.image && (
              <motion.div
                variants={fadeInUp}
                className="lg:col-span-6 rounded-[32px] overflow-hidden border border-neutral-200/70 shadow-lg bg-white lg:sticky lg:top-28"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-auto block"
                />
              </motion.div>
            )}

            {/* Right side: Excerpt & Main Content Body */}
            <div className={`space-y-8 ${blog.image ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
              {/* Excerpt spotlight */}
              {blog.excerpt && (
                <motion.div
                  variants={fadeInUp}
                  className="border-l-4 border-[#FF4E20] pl-6 py-2 italic text-[15px] sm:text-[17px] md:text-[19px] text-[#161616]/80 leading-relaxed font-sans font-semibold tracking-wide"
                >
                  "{blog.excerpt}"
                </motion.div>
              )}

              {/* Main text content body */}
              <motion.div
                variants={fadeInUp}
                className="font-sans text-[14px] sm:text-base lg:text-[15.5px] text-[#161616]/80 leading-[1.85] space-y-6 text-left bg-white border border-neutral-200/50 rounded-[32px] p-5 sm:p-8 md:p-12 shadow-xs ql-editor-content"
              >
                <style>{`
                  .ql-editor-content p { margin-bottom: 1.25rem !important; line-height: 1.85 !important; color: rgba(22, 22, 22, 0.8) !important; text-align: left !important; font-weight: normal !important; }
                  .ql-editor-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1.5rem !important; }
                  .ql-editor-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1.5rem !important; }
                  .ql-editor-content li { margin-bottom: 0.5rem !important; line-height: 1.7 !important; color: rgba(22, 22, 22, 0.8) !important; font-weight: normal !important; }
                  .ql-editor-content a { color: #0066cc !important; text-decoration: underline !important; transition: color 0.2s ease; }
                  .ql-editor-content a:hover { color: #161616 !important; }
                  .ql-editor-content strong, .ql-editor-content b { font-weight: bold !important; }
                  .ql-editor-content h1 { font-size: 1.8em; font-weight: inherit !important; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #161616 !important; line-height: 1.25 !important; text-align: left !important; padding-left: 0 !important; margin-left: 0 !important; }
                  .ql-editor-content h2 { font-size: 1.5em; font-weight: inherit !important; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #161616 !important; line-height: 1.25 !important; text-align: left !important; padding-left: 0 !important; margin-left: 0 !important; }
                  .ql-editor-content h3 { font-size: 1.2em; font-weight: inherit !important; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #161616 !important; line-height: 1.25 !important; text-align: left !important; padding-left: 0 !important; margin-left: 0 !important; }
                  .ql-editor-content blockquote {
                    border-left: 4px solid #FF4E20 !important;
                    padding-left: 1.25rem !important;
                    font-style: italic !important;
                    margin: 1.75rem 0 !important;
                    color: rgba(22, 22, 22, 0.65) !important;
                  }
                  .ql-editor-content img {
                    max-width: 450px !important;
                    width: 100% !important;
                    height: auto !important;
                    display: block !important;
                    margin: 2rem auto !important;
                    border-radius: 24px !important;
                    border: 1px solid rgba(22, 22, 22, 0.08) !important;
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08) !important;
                  }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </motion.div>
            </div>

          </div>

          {/* Release card CTA */}
          <motion.div
            variants={fadeInUp}
            className="bg-[#161616] rounded-[28px] p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-neutral-900 shadow-xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-48 h-48 bg-[#FF4E20]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="max-w-md text-center md:text-left">
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-[#FF4E20] block mb-2">EXPERIENCE THE CRAFT</span>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-none">UPGRADE YOUR STREETWEAR SILHOUETTES</h3>
              <p className="text-[11px] text-white/50 mt-3 font-sans leading-relaxed">
                Our drops feature heavy pre-shrunk fabrics, double-stitched ribbings, and state-of-the-art prints. Experience luxury you can actually live in.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#FF4E20] hover:bg-white text-white hover:text-[#161616] text-[10px] font-mono font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all duration-300 shadow-md border-none cursor-pointer decoration-none shrink-0"
            >
              Explore Drops <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </article>
      </motion.div>
    </div>
  )
}
