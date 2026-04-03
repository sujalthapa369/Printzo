import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Printer, Shield, LogOut, Menu, X, Wallet, ChevronDown, Moon, Sun, Laptop } from 'lucide-react'
import { logout } from '../firebase/auth'
import { useAuth } from '../context/AuthContext'
import { useTheme } from 'next-themes'
import { formatINR } from '../utils/helpers'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'

export default function Navbar() {
  const { user, userData } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      toast.success('Logged out')
    } catch {
      toast.error('Failed to logout')
    }
  }

  const isRetailer = userData?.role === 'retailer'

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900 transition-all duration-300">
        <div className="mx-auto max-w-[1280px] h-[72px] px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-12 group-hover:scale-110">
              <Printer size={18} className="text-primary relative z-10" strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-black uppercase tracking-[0.2em] text-main hidden sm:block">
              Printzo
            </span>
          </Link>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="relative">
              <button 
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface border border-transparent hover:border-border transition-all"
              >
                <ThemeIcon size={18} className="text-muted hover:text-main" />
              </button>
              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-36 card !p-2 !rounded-2xl"
                  >
                    {['light', 'dark', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTheme(t); setThemeMenuOpen(false) }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-xl capitalize flex items-center gap-2 transition-all ${theme === t ? 'bg-primary/10 text-primary font-bold' : 'text-muted hover:bg-surface hover:text-main'}`}
                      >
                        {t === 'light' ? <Sun size={14}/> : t === 'dark' ? <Moon size={14}/> : <Laptop size={14}/>}
                        {t}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <>
                {!isRetailer && (
                  <Link to="/shops" className="text-sm font-semibold text-muted hover:text-main transition-colors px-2">
                    Find Shops
                  </Link>
                )}
                <Link
                  to={isRetailer ? '/retailer' : '/customer'}
                  className="text-sm font-semibold text-muted hover:text-main transition-colors px-2"
                >
                  {isRetailer ? 'Dashboard' : 'My Prints'}
                </Link>

                {/* Wallet chip */}
                {!isRetailer && (
                  <div className="flex items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1.5 text-sm ml-2">
                    <Wallet size={13} className="text-primary" />
                    <span className="font-syne font-bold">{formatINR(userData?.wallet || 0)}</span>
                  </div>
                )}

                {/* User menu */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-main/5 border border-border rounded-full pl-1.5 pr-3 py-1 hover:border-primary/50 transition-all group"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-primary to-cyan rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold max-w-[120px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={14} className="text-muted" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 card !p-2 !rounded-2xl"
                      >
                        <div className="px-3 py-3 border-b border-border/50 mb-2">
                          <p className="text-[10px] uppercase text-muted font-bold tracking-wider mb-1">Signed in as</p>
                          <p className="text-sm font-bold truncate">{user.email}</p>
                          <span className={`text-xs px-2.5 py-1 rounded-full mt-2 inline-block font-medium ${
                            isRetailer ? 'bg-cyan/10 text-cyan border border-cyan/20' : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {isRetailer ? '🏪 Retailer' : '👤 Customer'}
                          </span>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-xl transition-colors font-medium"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/auth" className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-900 dark:text-white hover:opacity-70 transition-opacity">
                  Sign in
                </Link>
                <Link 
                  to="/auth?tab=signup" 
                  className="hidden md:flex items-center justify-center px-8 py-2.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white dark:text-black bg-black dark:bg-white rounded-full hover:opacity-90 transition-all shadow-lg shadow-black/10 dark:shadow-white/10"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            {!user && (
              <Link 
                to="/auth?tab=signup" 
                className="flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-[#0B0D11] bg-white rounded-lg hover:bg-white/90 transition-all"
              >
                Get Started
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-all"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-4 right-4 z-40 md:hidden card !rounded-3xl shadow-2xl"
          >
            <div className="space-y-2 relative">
              {user ? (
                <>
                  <div className="flex items-center gap-3 pb-4 mb-2 border-b border-border/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                      {(user.displayName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold">{user.displayName || 'User'}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  {!isRetailer && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
                      <span className="text-sm font-semibold text-muted">Wallet Balance</span>
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-primary" />
                        <span className="font-bold text-lg">{formatINR(userData?.wallet || 0)}</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link
                      to={isRetailer ? '/retailer' : '/customer'}
                      onClick={() => setMenuOpen(false)}
                      className="p-3 bg-surface rounded-2xl text-center font-semibold text-sm border border-transparent hover:border-border"
                    >
                      Dashboard
                    </Link>
                    {!isRetailer && (
                      <Link
                        to="/shops"
                        onClick={() => setMenuOpen(false)}
                        className="p-3 bg-surface rounded-2xl text-center font-semibold text-sm border border-transparent hover:border-border"
                      >
                        Find Shops
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
                        setTheme(next)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-surface rounded-2xl font-semibold text-sm border border-border"
                    >
                      <ThemeIcon size={16} /> Theme
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-danger/10 text-danger rounded-2xl font-semibold text-sm"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/auth" onClick={() => setMenuOpen(false)} className="p-4 bg-surface rounded-2xl font-bold flex justify-center text-center">Sign In</Link>
                  <Link to="/auth?tab=signup" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center p-4 !rounded-2xl text-base">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
