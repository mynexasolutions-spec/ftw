import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowRight, BookOpen, Zap } from 'lucide-react'
import { getBlogs } from '../lib/supabase'

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const cardFade = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } }
}

export default function Blogs() {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await getBlogs(false) // Only fetch published posts
        setBlogs(data || [])
      } catch (err) {
        console.error("Error loading blog posts:", err)
      } finally {
        setLoading(false)
      }
    }
    loadBlogs()
  }, [])

  return (
    <div className="bg-[#FAF9F6] text-[#161616] font-sans min-h-screen pt-8 sm:pt-24 pb-20 relative overflow-hidden selection:bg-[#161616] selection:text-white bg-grain">
      
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
          .blogs-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.02) 2px,
              rgba(139,92,246,0.02) 4px
            );
          }

          .hud-blogs-title {
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 1000;
            font-size: clamp(34px, 5.5vw, 64px);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.1;
            color: #161616;
          }

          .hud-blogs-title span {
            background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-style: italic;
          }

          /* Outer border wrapper for helpline card — darker gaming border */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.8), rgba(99,58,214,0.6), rgba(37,99,235,0.6));
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }
          .hud-card-border:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(139,92,246,0.15), 0 0 15px rgba(139,92,246,0.1);
          }

          /* HUD Card layout matching screenshot */
          .hud-blog-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
          }
          
          /* HUD corner ticks */
          .hud-corner { position: absolute; width: 14px; height: 14px; border-color: rgba(139,92,246,0.5); border-style: solid; z-index: 10; }
          .hud-tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }

          /* Hex values for tech gaming vibe */
          .hud-hex { position: absolute; font-size: 7px; font-family: monospace; color: rgba(139,92,246,0.45); letter-spacing: 0.05em; font-weight: bold; z-index: 10; }
          .hud-hex-tl { top: 4px; left: 24px; }
          .hud-hex-tr { top: 4px; right: 24px; }

          /* Tech submit button styled exact */
          .hud-read-action {
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
            padding: 12px 28px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
            box-shadow: 0 4px 15px rgba(124,58,237,0.25);
            text-decoration: none;
          }
          .hud-read-action:hover {
            box-shadow: 0 8px 20px rgba(124,58,237,0.38);
          }
        `
      }} />

      <div className="blogs-scanlines" />

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Title Header with Gaming HUD layout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14 text-left border-b border-[#E8E5DC] pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black rounded mb-4">
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" /> FTW_NARRATIVES
          </div>
          <h1 className="hud-blogs-title">
            THE <span>FEED</span>
          </h1>
          <p className="text-dark2/50 font-mono text-[11px] md:text-sm font-bold uppercase tracking-wider mt-2">
            BEHIND THE DESIGNS, COLLECTION CONCEPTS & SYSTEM UPDATES.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-dark2/50 font-sans text-xs">
            <span className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full inline-block mb-3" />
            <span className="font-mono uppercase tracking-widest text-[10px]">Loading FTW dossier...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="hud-card-border max-w-xl mx-auto">
            <div className="hud-blog-card text-center p-8 md:p-12">
              <div className="hud-corner hud-tl" />
              <div className="hud-corner hud-tr" />
              <div className="hud-corner hud-bl" />
              <div className="hud-corner hud-br" />
              
              <BookOpen className="w-10 h-10 text-purple-400 mx-auto mb-4" />
              <h3 className="font-display text-lg font-black uppercase text-[#161616]">Blogs are Empty</h3>
              <p className="text-xs sm:text-sm text-dark2/50 mt-1 max-w-xs mx-auto font-sans">We are cooking up some interesting drop narratives and designer logs. Check back soon!</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogs.map((blog) => (
              <motion.div 
                key={blog.id} 
                variants={cardFade}
                className="hud-card-border"
              >
                <article 
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="hud-blog-card cursor-pointer group"
                >
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />

                  {/* Hex codes */}
                  <span className="hud-hex hud-hex-tl">POST_ID_{blog.id.substring(0,4).toUpperCase()}</span>
                  <span className="hud-hex hud-hex-tr">0x9F4C</span>

                  <div>
                    {/* Image wrapper */}
                    <div className="aspect-[16/10] overflow-hidden bg-[#F5F3EC] border-b border-purple-500/10 relative">
                      {blog.image ? (
                        <img 
                          src={blog.image} 
                          alt={blog.title} 
                          className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-500/5 text-purple-600/30">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                      {blog.tag && (
                        <span className="absolute top-4 left-4 text-[9px] font-mono font-black uppercase tracking-widest text-[#D6FF40] bg-dark px-3.5 py-2 rounded-xl border border-white/5 shadow-md select-none">
                          {blog.tag}
                        </span>
                      )}
                    </div>

                    {/* Body content */}
                    <div className="p-6 space-y-3 relative z-10">
                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-dark2/50 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-400" />
                          <span>{blog.author}</span>
                        </div>
                      </div>

                      <h2 className="font-sans font-bold text-[19px] sm:text-[21px] leading-snug line-clamp-2 text-dark group-hover:text-purple-600 transition-colors duration-300">
                        <Link to={`/blog/${blog.slug}`} className="text-[#161616] group-hover:text-purple-600 transition-colors duration-300 decoration-none block">
                          {blog.title}
                        </Link>
                      </h2>

                      <p className="text-[13.5px] text-dark2/60 leading-relaxed font-sans font-medium line-clamp-3">
                        {blog.excerpt || "Dive into our latest drop narrative to discover the inspiration, fabric choices, and design philosophy behind this release."}
                      </p>
                    </div>
                  </div>

                  {/* Footer read button */}
                  <div className="px-6 pb-6 pt-2 relative z-10">
                    <Link 
                      to={`/blog/${blog.slug}`} 
                      className="hud-read-action"
                    >
                      Read Blog
                    </Link>
                  </div>
                </article>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  )
}
