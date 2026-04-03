import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Printer, Wallet, MapPin, Sparkles, Plus, Clock, FileText, RefreshCw, CreditCard } from 'lucide-react'
import { getCustomerJobs, topUpWallet, subscribeToUserData } from '../firebase/db'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import AIDocGenerator from '../components/AIDocGenerator'
import { formatINR, shortDate, TOKEN_STATUS } from '../utils/helpers'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'jobs', label: 'My Prints', icon: Printer },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
  { key: 'ai', label: 'AI Docs', icon: Sparkles },
  { key: 'shops', label: 'Find Shops', icon: MapPin },
]

export default function CustomerPortal() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState('jobs')
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [liveUserData, setLiveUserData] = useState(userData)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topping, setTopping] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserData(user.uid, setLiveUserData)
    return unsub
  }, [user])

  useEffect(() => {
    if (tab === 'jobs') loadJobs()
  }, [tab])

  const loadJobs = async () => {
    setLoadingJobs(true)
    try {
      const data = await getCustomerJobs(user.uid)
      setJobs(data)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount)
    if (!amount || amount < 10) { toast.error('Minimum top-up is ₹10'); return }
    if (amount > 5000) { toast.error('Maximum top-up is ₹5000'); return }
    setTopping(true)
    try {
      await topUpWallet(user.uid, amount)
      toast.success(`₹${amount} added to wallet!`)
      setTopUpAmount('')
    } catch {
      toast.error('Top-up failed')
    } finally {
      setTopping(false)
    }
  }

  const hasSubscription = liveUserData?.subscription?.active &&
    new Date(liveUserData?.subscription?.expiresAt?.toDate?.() || liveUserData?.subscription?.expiresAt) > new Date()
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-syne font-bold text-main">
              Hey, {user?.displayName?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-muted text-sm mt-0.5">Manage your print jobs and account</p>
          </div>
          <Link to="/shops" className="btn-primary text-sm py-2 px-4">
            <Printer size={14} /> New Print
          </Link>
        </div>

        {/* Wallet quick view */}
        <div className="card mb-6 bg-gradient-to-r from-primary/10 to-cyan/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Wallet size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Wallet Balance</p>
                <p className="text-2xl font-syne font-bold text-main">{formatINR(liveUserData?.wallet || 0)}</p>
              </div>
            </div>
            <button onClick={() => setTab('wallet')} className="btn-secondary text-xs py-2 px-3">
              <Plus size={12} /> Add Money
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                tab === key
                  ? 'bg-primary text-bg shadow-sm'
                  : 'text-muted hover:text-main'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── MY PRINTS ─────────────────────────────────────────────── */}
        {tab === 'jobs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">Print History</h2>
              <button onClick={loadJobs} className="text-slate-500 hover:text-white p-1 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
            {loadingJobs ? (
              <div className="flex justify-center py-12">
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : jobs.length === 0 ? (
              <div className="card text-center py-12">
                <FileText size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No print jobs yet</p>
                <Link to="/shops" className="btn-primary justify-center">
                  <Printer size={14} /> Start Printing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => {
                  const status = TOKEN_STATUS[job.status] || TOKEN_STATUS.pending
                  return (
                    <div key={job.id} className="card py-4">
                      <div className="flex items-start gap-4">
                        <div className="text-center flex-shrink-0">
                          <span className="text-xl font-syne font-bold text-cyan">
                            #{String(job.tokenNumber).padStart(3, '0')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-white truncate">{job.fileName || 'Document'}</p>
                            <span className={`stat-badge flex-shrink-0 ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>{job.shopName || 'Shop'}</span>
                            <span>{job.pages}p · {job.mode === 'color' ? '🎨' : '⬛'}</span>
                            <span className="text-emerald-400 font-medium">{formatINR(job.amount)}</span>
                            <span>{shortDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {(job.status === 'pending' || job.status === 'printing') && (
                        <div className={`mt-3 text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${status.color}`}>
                          <Clock size={11} />
                          {job.status === 'pending' ? 'Waiting in queue…' : '🖨️ Currently printing…'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── WALLET ────────────────────────────────────────────────── */}
        {tab === 'wallet' && (
          <div className="space-y-5">
            {/* Balance card */}
            <div className="card bg-gradient-to-br from-primary/20 to-cyan/20 border-cyan/20 text-center py-8">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
              <p className="text-5xl font-syne font-black text-white mb-1">{formatINR(liveUserData?.wallet || 0)}</p>
              <p className="text-xs text-slate-500">Printzo Wallet</p>
            </div>

            {/* Top-up */}
            <div className="card">
              <h3 className="text-sm font-syne font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard size={15} className="text-cyan" /> Add Money
              </h3>
              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[50, 100, 200, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(String(amt))}
                    className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                      topUpAmount === String(amt)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-slate-400 hover:border-primary/40'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter amount (₹10 – ₹5000)"
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                  className="input flex-1"
                  min={10}
                  max={5000}
                />
                <button onClick={handleTopUp} disabled={topping} className="btn-primary px-5">
                  {topping ? <span className="spinner" /> : 'Add'}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <span className="text-amber-500">⚠</span>
                Demo mode: top-up is simulated. Connect a payment gateway for real transactions.
              </p>
            </div>

            {/* How to use */}
            <div className="card border-border/50 bg-transparent">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">How to use your wallet</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><span className="text-cyan">→</span> Choose "Wallet" when paying for prints</li>
                <li className="flex items-center gap-2"><span className="text-cyan">→</span> Use ₹39 to activate AI Document Generator</li>
                <li className="flex items-center gap-2"><span className="text-cyan">→</span> Helpful when UPI servers are down</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── AI DOCS ───────────────────────────────────────────────── */}
        {tab === 'ai' && (
          <div>
            <div className="mb-5">
              <h2 className="text-lg font-syne font-bold text-white mb-1">AI Document Generator</h2>
              <p className="text-sm text-slate-400">Powered by Google Gemini</p>
            </div>
            <AIDocGenerator
              hasSubscription={hasSubscription}
              onSendToPrint={(text, docName) => {
                toast.success('Document ready! Find a nearby shop to print it.')
                setTab('shops')
              }}
            />
          </div>
        )}

        {/* ── FIND SHOPS ────────────────────────────────────────────── */}
        {tab === 'shops' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <MapPin size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-syne font-bold text-white mb-2">Find Nearby Shops</h2>
            <p className="text-slate-400 text-sm mb-6">Discover Printzo-enabled print shops near you</p>
            <Link to="/shops" className="btn-cyan justify-center">
              <MapPin size={14} /> Browse All Shops
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
