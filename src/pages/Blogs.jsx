import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
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
    <div className="bg-[#FAF9F6] text-[#161616] font-sans min-h-screen pt-16 sm:pt-24 pb-20 relative overflow-hidden selection:bg-[#161616] selection:text-white bg-grid-dots bg-grain">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(255,78,32,0.05),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 md:mb-12 border-l-4 border-[#161616] pl-4 sm:pl-6"
        >
          <span className="text-[#FF4E20] font-mono uppercase tracking-[0.25em] text-xs font-bold block mb-2">
            FTW BLOGS
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#161616] leading-none">
            THE <span className="text-[#FF4E20] italic transform skew-x-3 inline-block font-sans">FEED</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#161616]/60 font-sans text-sm">
            <span className="animate-spin w-6 h-6 border-2 border-[#161616] border-t-transparent rounded-full inline-block mb-3" />
            Loading FTW Blogs feed...
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-32 bg-white border border-neutral-200/80 rounded-[32px] p-8 md:p-12 shadow-sm">
            <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-display text-lg font-black uppercase text-[#161616]">Blogs are Empty</h3>
            <p className="text-xs sm:text-sm text-[#161616]/50 mt-1 max-w-xs mx-auto">We are cooking up some interesting drop narratives and designer logs. Check back soon!</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogs.map((blog) => (
              <motion.article 
                key={blog.id} 
                variants={cardFade}
                onClick={() => navigate(`/blog/${blog.slug}`)}
                className="group flex flex-col justify-between bg-white border border-neutral-200/70 rounded-[28px] overflow-hidden shadow-xs hover:shadow-xl hover:border-neutral-300/80 transition-all duration-500 cursor-pointer relative hover:-translate-y-2"
              >
                <div>
                  {/* Image wrapper */}
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-100 border-b border-neutral-200/50 relative">
                    {blog.image ? (
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-104"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#161616]/5 text-[#161616]/30">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    {blog.tag && (
                      <span className="absolute top-4 left-4 text-[9px] font-mono font-black uppercase tracking-widest text-[#FAF9F6] bg-[#161616] px-3.5 py-2 rounded-xl border border-white/5 shadow-md select-none">
                        {blog.tag}
                      </span>
                    )}
                  </div>

                  {/* Body content */}
                  <div className="p-6 space-y-4">
                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-[10.5px] font-mono text-[#161616]/50 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{blog.author}</span>
                      </div>
                    </div>

                    <h2 className="font-sans font-bold text-[22px] sm:text-[25px] leading-snug line-clamp-2">
                      <Link to={`/blog/${blog.slug}`} className="text-[#161616] hover:text-[#FF4E20] transition-colors duration-300 decoration-none block">
                        {blog.title}
                      </Link>
                    </h2>

                    <p className="text-[13.5px] text-[#161616]/65 leading-relaxed font-sans font-medium line-clamp-3">
                      {blog.excerpt || "Dive into our latest drop narrative to discover the inspiration, fabric choices, and design philosophy behind this release."}
                    </p>
                  </div>
                </div>

                {/* Footer read button */}
                <div className="px-6 pb-6 pt-2">
                  <Link 
                    to={`/blog/${blog.slug}`} 
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-[#161616] hover:bg-[#FF4E20] text-[#FAF9F6] hover:text-white text-[10px] sm:text-[10.5px] font-mono font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-xs border border-transparent select-none cursor-pointer decoration-none"
                  >
                    Read More
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  )
}
