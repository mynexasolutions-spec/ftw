import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, Eye, EyeOff, Gamepad2, Shield, Zap, Swords, Trophy } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const { signIn, resetPasswordForEmail } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isForgotPassword) {
        await resetPasswordForEmail(email)
        toast.success('Password reset link sent to your email!', {
          icon: '✉️',
          style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }
        })
        setIsForgotPassword(false)
      } else if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match!")
        }
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        })
        if (error) throw error

        if (data?.session) {
          toast.success('Successfully registered and logged in!', {
            icon: '⚡',
            style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }
          })
          navigate('/')
        } else {
          toast.success('Registration request sent! Please check your email to verify.', {
            style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }
          })
          setIsSignUp(false) // Switch to Sign In mode
        }
      } else {
        // Sign In Flow
        await signIn(email, password)
        toast.success('Successfully logged in!', {
          icon: '⚡',
          style: { background: '#0B0B0B', color: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }
        })
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication error', {
        style: { background: '#0B0B0B', color: '#FFFFFF' }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] relative overflow-hidden flex items-center justify-center py-8 px-4"
      style={{ background: 'linear-gradient(160deg, #FAF8FE 0%, #F0EAFB 55%, #E8DFF8 100%)' }}>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Grid dot overlay */
        .auth-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(139,92,246,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none; z-index: 0;
        }

        /* HUD Card border wrapper — shows border even on chamfered corners */
        .auth-card-border {
          background: rgba(139,92,246,0.28);
          clip-path: polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px);
          padding: 1.5px;
          position: relative;
          box-shadow: 0 28px 70px rgba(139,92,246,0.14), 0 4px 20px rgba(0,0,0,0.05), 0 0 0 0px rgba(139,92,246,0.2);
          width: 100%; max-width: 480px;
        }

        /* HUD Card */
        .auth-hud-card {
          background: rgba(255,255,255,0.93);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          clip-path: polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px);
          position: relative; width: 100%;
          padding: 42px 36px 36px;
        }
        /* ::before top gradient line */
        .auth-hud-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #8B5CF6 30%, #A855F7 50%, #6D28D9 70%, transparent);
          z-index: 1;
        }

        /* HUD corner ticks */
        .auth-corner { position: absolute; width: 14px; height: 14px; border-color: rgba(139,92,246,0.45); border-style: solid; }
        .auth-tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
        .auth-tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; }
        .auth-bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; }
        .auth-br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }

        /* Input field — rounded corners */
        .auth-input {
          width: 100%;
          padding: 13px 16px 13px 46px;
          background: rgba(245,240,255,0.55);
          border: 1.5px solid rgba(139,92,246,0.22);
          border-radius: 12px;
          color: #161616;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14.5px;
          outline: none;
          transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
        }
        .auth-input::placeholder { color: rgba(100,80,140,0.38); font-size: 13px; }
        .auth-input:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 0 4px rgba(139,92,246,0.11);
          background: rgba(248,244,255,0.95);
        }

        /* Submit button */
        .auth-submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(90deg, #7C3AED 0%, #6D28D9 50%, #2563EB 100%);
          color: #fff;
          font-family: 'Orbitron', 'Space Grotesk', monospace;
          font-size: 13px; font-weight: 900;
          letter-spacing: 0.18em; text-transform: uppercase;
          border: none; cursor: pointer;
          clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
          transition: opacity 0.22s, box-shadow 0.22s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(124,58,237,0.38);
        }
        .auth-submit-btn:hover:not(:disabled) {
          opacity: 0.88;
          box-shadow: 0 12px 32px rgba(124,58,237,0.55);
        }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Label */
        .auth-label {
          font-family: 'Space Grotesk', monospace; font-size: 12.5px; font-weight: 900;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: rgba(109,40,217,0.75); display: block; margin-bottom: 7px;
        }

        /* Toggle link */
        .auth-toggle-link {
          font-size: 13.5px; font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          color: #7C3AED; cursor: pointer; border: none; background: transparent;
          text-decoration: underline; text-underline-offset: 3px;
          transition: color 0.2s;
        }
        .auth-toggle-link:hover { color: #6D28D9; }

        /* Divider */
        .auth-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
          margin: 20px 0;
        }

        /* Decorative bg icons */
        .auth-deco {
          position: absolute; pointer-events: none; z-index: 0;
          color: rgba(139,92,246,0.1);
        }

        /* Scan line shimmer on card top */
        @keyframes authScan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .auth-scan-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1.5px; overflow: hidden;
        }
        .auth-scan-line::after {
          content: '';
          position: absolute; top: 0; left: 0; height: 100%; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent);
          animation: authScan 2.8s ease-in-out infinite;
        }
      ` }} />

      {/* Background layers */}
      <div className="auth-grid" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[320px] h-[320px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[280px] h-[280px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,58,214,0.09) 0%, transparent 70%)' }} />

      {/* Decorative icons — 2 left, 2 right */}
      <div className="auth-deco" style={{ top: '8%', left: '3%' }}>
        <Swords className="w-24 h-24 md:w-36 md:h-36 -rotate-12" />
      </div>
      <div className="auth-deco" style={{ bottom: '8%', left: '3%' }}>
        <Shield className="w-20 h-20 md:w-32 md:h-32 rotate-10" />
      </div>
      <div className="auth-deco" style={{ top: '8%', right: '3%' }}>
        <Gamepad2 className="w-24 h-24 md:w-36 md:h-36 rotate-12" />
      </div>
      <div className="auth-deco" style={{ bottom: '8%', right: '3%' }}>
        <Trophy className="w-20 h-20 md:w-32 md:h-32 -rotate-10" />
      </div>

      {/* Border wrapper + HUD Card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="auth-card-border relative z-10"
      >
        <div className="auth-hud-card">
          {/* Corner accents */}
          <div className="auth-corner auth-tl" />
          <div className="auth-corner auth-tr" />
          <div className="auth-corner auth-bl" />
          <div className="auth-corner auth-br" />

          {/* Scan shimmer line */}
          <div className="auth-scan-line" style={{ background: 'linear-gradient(90deg, transparent, #8B5CF6 35%, #6D28D9 65%, transparent)' }}>
            <div className="auth-scan-line" />
          </div>

          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-500/10 border border-dashed border-purple-500/35 text-purple-700 font-mono uppercase tracking-[0.22em] text-[9.5px] font-black rounded mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              {isForgotPassword ? 'SECURITY_RESET' : isSignUp ? 'FTW_REGISTER' : 'FTW_AUTH_SYS'}
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 leading-none">
              {isForgotPassword ? (
                <span>RESET <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 italic pr-1">ACCESS</span></span>
              ) : isSignUp ? (
                <span>JOIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 italic pr-1">THE WIN</span></span>
              ) : (
                <span>LOCK <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 italic pr-1">IN</span></span>
              )}
            </h2>
            <p className="text-[12px] text-gray-400 mt-2.5 font-mono uppercase tracking-widest leading-relaxed">
              {isForgotPassword
                ? 'Enter email to receive a reset link'
                : isSignUp
                  ? 'Get early access · Exclusive drops · Vault entry'
                  : 'Access your orders · Wishlist · Design vault'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && !isForgotPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="auth-label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-purple-400 pointer-events-none" />
                    <input
                      type="text"
                      required={isSignUp}
                      placeholder="Enter your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="auth-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-purple-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password */}
            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => setIsForgotPassword(true)}
                      className="text-[12px] font-mono font-bold text-purple-500 hover:text-purple-700 border-none bg-transparent cursor-pointer tracking-widest uppercase">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-purple-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isForgotPassword}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    style={{ paddingRight: '42px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-purple-400 hover:text-purple-600 border-none bg-transparent cursor-pointer flex items-center">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <AnimatePresence mode="wait">
              {isSignUp && !isForgotPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="auth-label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-purple-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required={isSignUp}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input"
                      style={{ paddingRight: '42px' }}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-purple-400 hover:text-purple-600 border-none bg-transparent cursor-pointer flex items-center">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AUTHENTICATING...
                  </span>
                ) : (
                  <>
                    {isForgotPassword ? 'SEND RESET LINK' : isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Divider + Toggle */}
          <div className="auth-divider" />
          <div className="text-center">
            {isForgotPassword ? (
              <button onClick={() => setIsForgotPassword(false)} className="auth-toggle-link">
                ← Back to Login
              </button>
            ) : (
              <button onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle-link">
                {isSignUp ? 'Already registered? Log in here' : "New to FTW? Register here"}
              </button>
            )}
          </div>

          {/* Footer tag */}
        </div>{/* end auth-hud-card */}
      </motion.div>
    </div>
  )
}
