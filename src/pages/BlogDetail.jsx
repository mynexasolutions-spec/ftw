import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, ArrowRight, Share2, BookOpen, Zap } from 'lucide-react'
import { getBlogBySlug } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import DOMPurify from 'dompurify'

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
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center font-sans text-dark2/50 text-xs">
        <span className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full inline-block mb-3" />
        <span className="font-mono uppercase tracking-widest text-[10px]">Opening narrative dossier...</span>
      </div>
    )
  }

  if (!blog) return null

  return (
    <div className="bg-[#FAF9F6] text-[#161616] font-sans min-h-screen pt-8 sm:pt-24 pb-20 relative selection:bg-dark selection:text-[#D6FF40] bg-grain">

      {/* Gaming UI grid lines and glowing effects in light theme */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grain {
            background-image: 
              radial-gradient(rgba(139, 92, 246, 0.08) 1.2px, transparent 1.2px),
              radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
            background-size: 20px 20px, 100% 100%, 100% 100%;
          }

          /* Full subtle scanline overlay */
          .blog-detail-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.02) 2px,
              rgba(139,92,246,0.02) 4px
            );
          }

          .hud-detail-title {
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 1000;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.1;
            color: #161616;
          }

          /* Outer border wrapper for helpline card — darker gaming border */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.8), rgba(99,58,214,0.6), rgba(37,99,235,0.6));
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }

          /* HUD Card layout matching screenshot */
          .hud-detail-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 17.5px), 0 18px);
          }
          .hud-detail-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2.5px;
            background: linear-gradient(90deg, transparent, #8B5CF6 20%, #C084FC 50%, #6D28D9 80%, transparent);
            z-index: 5;
          }
          
          /* HUD corner ticks */
          .hud-corner { position: absolute; width: 14px; height: 14px; border-color: rgba(139,92,246,0.5); border-style: solid; z-index: 10; }
          .hud-tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }

          /* Hex values for tech gaming vibe */
          .hud-hex { position: absolute; font-size: 7.5px; font-family: monospace; color: rgba(139,92,246,0.45); letter-spacing: 0.05em; font-weight: bold; z-index: 10; }
          .hud-hex-tl { top: 4px; left: 24px; }
          .hud-hex-tr { top: 4px; right: 24px; }

          .hud-detail-btn {
            background: linear-gradient(90deg, #7C3AED 0%, #9333EA 50%, #6D28D9 100%);
            color: #FFFFFF;
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 900;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-size: 11px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 32px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
            box-shadow: 0 6px 20px rgba(124,58,237,0.3);
            text-decoration: none;
          }
          .hud-detail-btn:hover {
            box-shadow: 0 10px 28px rgba(124,58,237,0.45);
          }
        `
      }} />

      <div className="blog-detail-scanlines" />

      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />


      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >

        {/* Back navigation */}
        <div className="mb-8 flex justify-between items-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-[13.5px] font-mono font-black uppercase tracking-widest text-dark hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </Link>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white border border-[#E8E5DC] text-dark hover:text-purple-600 hover:border-purple-600/30 transition-all cursor-pointer flex items-center justify-center"
            title="Share article"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Article Layout */}
        <article className="space-y-10">

          {/* Header metadata */}
          <motion.div variants={fadeInUp} className="space-y-4 text-left border-b border-[#E8E5DC] pb-8">
            {blog.tag && (
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-purple-600 bg-purple-500/10 px-4 py-1.5 rounded-lg border border-purple-500/25 inline-block">
                {blog.tag}
              </span>
            )}
            <h1 className="hud-detail-title text-3xl sm:text-4xl md:text-5xl lg:text-[46px] leading-[1.1] font-black text-gray-900">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-[11px] font-mono font-bold text-dark2/50 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-400" />
                <span>By {blog.author}</span>
              </div>
            </div>
          </motion.div>

          {/* Left image, right content side-by-side on lg: screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left side: Cover Image banner wrapped in HUD border */}
            {blog.image && (
              <motion.div
                variants={fadeInUp}
                className="lg:col-span-6 hud-card-border lg:sticky lg:top-28"
              >
                <div className="hud-detail-card overflow-hidden">
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />
                  <span className="hud-hex hud-hex-tl">COVER_BANNER</span>
                  <span className="hud-hex hud-hex-tr">0x1A2F</span>
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-auto block object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* Right side: Excerpt & Main Content Body */}
            <div className={`space-y-8 ${blog.image ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
              {/* Excerpt spotlight */}
              {blog.excerpt && (
                <motion.div
                  variants={fadeInUp}
                  className="border-l-4 border-purple-600 pl-6 py-2 italic text-[16px] sm:text-[18px] md:text-[20px] text-[#161616]/80 leading-relaxed font-sans font-semibold tracking-wide"
                >
                  "{blog.excerpt}"
                </motion.div>
              )}

              {/* Main text content body wrapped in HUD border */}
              <motion.div
                variants={fadeInUp}
                className="hud-card-border"
              >
                <div className="hud-detail-card p-5 sm:p-8 md:p-12 ql-editor-content">
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />
                  <span className="hud-hex hud-hex-tl">CONTENT_STREAM</span>
                  <span className="hud-hex hud-hex-tr">0x3C8D</span>

                  <style>{`
                    .ql-editor-content p { margin-bottom: 1.25rem !important; line-height: 1.85 !important; color: rgba(22, 22, 22, 0.8) !important; text-align: left !important; font-weight: normal !important; font-size: 15px; }
                    @media (min-width: 640px) {
                      .ql-editor-content p { font-size: 17px; }
                    }
                    .ql-editor-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1.5rem !important; }
                    .ql-editor-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1.5rem !important; }
                    .ql-editor-content li { margin-bottom: 0.5rem !important; line-height: 1.7 !important; color: rgba(22, 22, 22, 0.8) !important; font-weight: normal !important; }
                    .ql-editor-content a { color: #8B5CF6 !important; text-decoration: underline !important; transition: color 0.2s ease; }
                    .ql-editor-content a:hover { color: #161616 !important; }
                    .ql-editor-content strong, .ql-editor-content b { font-weight: bold !important; }
                    .ql-editor-content h1 { font-size: 1.8em; font-weight: inherit !important; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #161616 !important; line-height: 1.25 !important; text-align: left !important; padding-left: 0 !important; margin-left: 0 !important; }
                    .ql-editor-content h2 { font-size: 1.5em; font-weight: inherit !important; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #161616 !important; line-height: 1.25 !important; text-align: left !important; padding-left: 0 !important; margin-left: 0 !important; }
                    .ql-editor-content h3 { font-size: 1.2em; font-weight: inherit !important; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #161616 !important; line-height: 1.25 !important; text-align: left !important; padding-left: 0 !important; margin-left: 0 !important; }
                    .ql-editor-content blockquote {
                      border-left: 4px solid #8B5CF6 !important;
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
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || '') }} />
                </div>
              </motion.div>
            </div>

          </div>

          {/* Release card CTA wrapped in HUD border */}
          <motion.div
            variants={fadeInUp}
            className="hud-card-border"
          >
            <div className="hud-detail-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="hud-corner hud-tl" />
              <div className="hud-corner hud-tr" />
              <div className="hud-corner hud-bl" />
              <div className="hud-corner hud-br" />
              <span className="hud-hex hud-hex-tl">SYSTEM_UPGRADE_PROMPT</span>
              <span className="hud-hex hud-hex-tr">0x7D9E</span>

              <div className="max-w-md text-center md:text-left">
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#8B5CF6] block mb-2">EXPERIENCE THE CRAFT</span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 leading-none">UPGRADE YOUR STREETWEAR SILHOUETTES</h3>
                <p className="text-[12.5px] text-gray-500 mt-3 font-sans leading-relaxed">
                  Our drops feature heavy pre-shrunk fabrics, double-stitched ribbings, and state-of-the-art prints. Experience luxury you can actually live in.
                </p>
              </div>
              <Link
                to="/shop"
                className="hud-detail-btn shrink-0"
              >
                Explore Drop <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </motion.div>

        </article>

      </motion.div>
    </div>
  )
}
