import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Printer, Eye, EyeOff, Mail, Lock, User, ArrowRight, Store } from 'lucide-react'
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../firebase/auth'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Auth() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, userData } = useAuth()

  const [tab, setTab] = useState(params.get('tab') === 'signup' ? 'signup' : 'login')
  const [role, setRole] = useState(params.get('role') || 'customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user && userData) {
      navigate(userData.role === 'retailer' ? '/retailer' : '/customer', { replace: true })
    }
  }, [user, userData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'signup') {
        if (!name.trim()) { toast.error('Enter your name'); setLoading(false); return }
        if (password.length < 6) { toast.error('Password must be 6+ characters'); setLoading(false); return }
        await signUpWithEmail(email, password, name, role)
        toast.success('Account created! Welcome to Printzo 🎉')
      } else {
        await signInWithEmail(email, password)
        toast.success('Welcome back!')
      }
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Email already registered. Try logging in.',
        'auth/user-not-found': 'No account found. Sign up first.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Try later.',
      }
      toast.error(msgs[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle(role)
      toast.success('Signed in with Google!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 relative overflow-hidden">

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-cyan rounded-xl flex items-center justify-center">
            <Printer size={18} className="text-white" />
          </div>
          <span className="text-2xl font-syne font-bold text-main">Print<span className="text-cyan">zo</span></span>
        </Link>

        <div className="glass-bright border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tab switcher */}
          <div className="flex border-b border-border">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${
                  tab === t
                    ? 'text-main border-b-2 border-primary bg-primary/5'
                    : 'text-muted hover:text-main'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {/* Role selector (Always show) */}
            <div>
              <p className="text-xs text-muted mb-2 font-medium">I am a…</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'customer', label: 'Customer', icon: User, desc: 'I want to print' },
                  { key: 'retailer', label: 'Shop Owner', icon: Store, desc: 'I run a print shop' },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === key
                        ? 'border-primary bg-primary/10 text-main font-bold'
                        : 'border-border bg-card text-muted hover:border-primary/40'
                    }`}
                  >
                    <Icon size={16} className={`mb-1.5 ${role === key ? 'text-primary' : ''}`} />
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-xs opacity-70 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input pl-10 text-main bg-card"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10 text-main bg-card"
                  required
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-10 text-main bg-card"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
                {loading ? <span className="spinner" /> : (
                  <>{tab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-slate-600">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-card border border-border rounded-xl py-3 text-sm text-main hover:border-primary/30 transition-all font-medium"
            >
              {googleLoading ? <span className="spinner" /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.3 8.5 3.4l6.3-6.3C34.8 2.8 29.8 0 24 0 14.8 0 7 5.8 3.2 14.2l7.3 5.7C12.3 13.4 17.7 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.7c-.5 2.7-2.1 5-4.5 6.5l7 5.4C43.3 36 46.5 30.7 46.5 24.5z"/>
                    <path fill="#4A90D9" d="M10.5 28.6C9.8 26.8 9.5 24.9 9.5 23s.3-3.8 1-5.6l-7.3-5.7C1.2 15.2 0 19 0 23s1.2 7.8 3.2 11.3l7.3-5.7z"/>
                    <path fill="#FBBC05" d="M24 46c5.8 0 10.7-1.9 14.2-5.2l-7-5.4c-1.9 1.3-4.4 2.1-7.2 2.1-6.3 0-11.6-4-13.5-9.5l-7.3 5.7C7 40.2 14.8 46 24 46z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Toggle tab */}
            <p className="text-center text-sm text-slate-500">
              {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')} className="text-cyan hover:underline font-medium">
                {tab === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
