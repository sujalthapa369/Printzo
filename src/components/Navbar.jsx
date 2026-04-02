import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Printer, LogOut, User, Menu, X, Wallet, ChevronDown } from 'lucide-react'
import { logout } from '../firebase/auth'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, userData } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-cyan rounded-lg flex items-center justify-center">
              <Printer size={16} className="text-white" />
            </div>
            <span className="text-xl font-syne font-bold text-white tracking-tight">
              Print<span className="text-cyan">zo</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to={isRetailer ? '/retailer' : '/customer'}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {isRetailer ? 'Dashboard' : 'My Prints'}
                </Link>
                {!isRetailer && (
                  <Link to="/shops" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Find Shops
                  </Link>
                )}

                {/* Wallet chip */}
                {!isRetailer && (
                  <div className="flex items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1.5 text-sm">
                    <Wallet size={13} className="text-cyan" />
                    <span className="text-slate-300 font-medium">{formatINR(userData?.wallet || 0)}</span>
                  </div>
                )}

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-surface border border-border rounded-full pl-2 pr-3 py-1.5 hover:border-primary/50 transition-all"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-cyan rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 max-w-[120px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-bright rounded-xl border border-border shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{user.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          isRetailer ? 'bg-cyan/10 text-cyan border border-cyan/20' : 'bg-primary/10 text-blue-400 border border-primary/20'
                        }`}>
                          {isRetailer ? '🏪 Retailer' : '👤 Customer'}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/shops" className="text-sm font-semibold text-cyan hover:text-white transition-colors">
                  Find Shops
                </Link>
                <div className="w-px h-4 bg-white/10" />
                <Link to="/auth" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/auth?tab=signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-bright border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-cyan rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.displayName || 'User'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                {!isRetailer && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Wallet size={14} className="text-cyan" />
                    Wallet: <span className="font-semibold text-white">{formatINR(userData?.wallet || 0)}</span>
                  </div>
                )}
                <Link
                  to={isRetailer ? '/retailer' : '/customer'}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-slate-300 hover:text-white py-1"
                >
                  {isRetailer ? 'Dashboard' : 'My Prints'}
                </Link>
                {!isRetailer && (
                  <Link to="/shops" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-300 hover:text-white py-1">
                    Find Shops
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-red-400 py-1"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-300 py-1">Sign In</Link>
                <Link to="/auth?tab=signup" onClick={() => setMenuOpen(false)} className="btn-primary text-sm justify-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
