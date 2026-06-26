import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Sparkles, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)

  // Form Fields
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleResetSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!", {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      toast.success('Password updated successfully! Please log in.', {
        icon: '⚡',
        style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }
      })
      navigate('/auth')
    } catch (err) {
      toast.error(err.message || 'Error updating password', {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] bg-cream text-dark flex items-center justify-center py-4 sm:py-8 px-4 sm:px-6 relative overflow-hidden bg-grid-dots bg-grain">
      {/* Background glow spotlights */}
      <div className="absolute top-1/4 left-1/4 w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] bg-accent/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-cream3 rounded-2xl p-6 sm:p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 bg-dark text-primary px-2.5 py-1.5 rounded-full text-[9px] sm:text-[10px] font-mono uppercase tracking-widest mb-3 sm:mb-4 shadow-neon">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            FOR THE WIN
          </div>
          <h2 className="font-display text-xl sm:text-3xl font-black uppercase text-dark">
            SET NEW PASSWORD
          </h2>
          <p className="text-[10px] sm:text-xs text-dark2/50 mt-1.5 sm:mt-2 font-mono">
            Enter and confirm your new password below
          </p>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-mono uppercase text-dark2/50 font-bold block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 w-4 h-4 text-dark2/45" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-cream/50 border border-cream3 rounded-xl focus:border-dark focus:outline-none text-xs sm:text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-dark2/45 hover:text-dark border-none bg-transparent cursor-pointer flex items-center justify-center"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-mono uppercase text-dark2/50 font-bold block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 w-4 h-4 text-dark2/45" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-cream/50 border border-cream3 rounded-xl focus:border-dark focus:outline-none text-xs sm:text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3 text-dark2/45 hover:text-dark border-none bg-transparent cursor-pointer flex items-center justify-center"
                title={showConfirmPassword ? "Hide Password" : "Show Password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-dark text-cream hover:bg-primary hover:text-dark transition-all duration-300 font-bold uppercase tracking-widest text-[11px] sm:text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 mt-6 sm:mt-8 border-none cursor-pointer"
          >
            {loading ? 'Please wait...' : 'Reset Password'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </form>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-cream3 text-center">
          <button
            onClick={() => navigate('/auth')}
            className="text-[10px] sm:text-xs font-mono text-accent hover:underline border-none bg-transparent cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  )
}
