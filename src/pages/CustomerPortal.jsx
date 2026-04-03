import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Printer, Wallet, MapPin, Sparkles, Plus, Clock, FileText, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react'
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
  const [showTopUpPayment, setShowTopUpPayment] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserData(user.uid, (data) => {
      setLiveUserData(data)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (tab === 'jobs' && user) loadJobs()
  }, [tab, user])

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

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount)
    if (!amount || amount < 10) { toast.error('Minimum top-up is ₹10'); return }
    if (amount > 5000) { toast.error('Maximum top-up is ₹5000'); return }
    setShowTopUpPayment(true)
  }

  const confirmTopUp = async () => {
    const amount = parseInt(topUpAmount)
    try {
      await topUpWallet(user.uid, amount)
      toast.success(`₹${amount} added! Wallet updated.`)
      setTopUpAmount('')
      setShowTopUpPayment(false)
    } catch {
      toast.error('Failed to update wallet')
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

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl mb-8 overflow-x-auto no-scrollbar">
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

        {/* ── PRINT JOBS ────────────────────────────────────────────── */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            {loadingJobs ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted">Fetching your prints...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="card text-center py-16">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Printer size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-syne font-bold text-main mb-2">No prints yet</h3>
                <p className="text-sm text-muted mb-6">Upload a document and find a shop to start printing.</p>
                <Link to="/shops" className="btn-primary mx-auto">
                  Start Your First Print
                </Link>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="card group hover:border-primary/40 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-main leading-tight truncate max-w-[200px] sm:max-w-xs">{job.fileName}</h4>
                        <p className="text-[10px] text-muted overflow-hidden">{shortDate(job.createdAt)} • {job.pages} pages</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${TOKEN_STATUS[job.status]?.style}`}>
                      {TOKEN_STATUS[job.status]?.label}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-muted tracking-widest">Token</span>
                      <span className="font-mono font-bold text-primary text-sm bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                        {job.token}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-main">{formatINR(job.amount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── WALLET ────────────────────────────────────────────────── */}
        {tab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Balance card */}
            <div className="card overflow-hidden relative border-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <p className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-syne font-black text-main">{formatINR(liveUserData?.wallet || 0)}</span>
              </div>
            </div>

            {/* Top-up */}
            <div className="card">
              <h3 className="text-sm font-syne font-bold text-main mb-4 flex items-center gap-2">
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
                        : 'border-border bg-card text-muted hover:border-primary/40'
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
                <button onClick={handleTopUp} className="btn-primary px-5">
                  Add
                </button>
              </div>
              <p className="text-xs text-muted mt-3 py-2 px-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary" />
                Payments are handled securely via Admin UPI gateway.
              </p>
            </div>

            {/* How to use */}
            <div className="card border-border/50 bg-transparent">
              <h4 className="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">How to use your wallet</h4>
              <ul className="space-y-2 text-xs text-muted">
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
              <h2 className="text-lg font-syne font-bold text-main mb-1">AI Document Generator</h2>
              <p className="text-sm text-muted">Powered by Google Gemini</p>
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
            <h2 className="text-xl font-syne font-bold text-main mb-2">Find Nearby Shops</h2>
            <p className="text-muted text-sm mb-6">Discover Printzo-enabled print shops near you</p>
            <Link to="/shops" className="btn-cyan justify-center">
              <MapPin size={14} /> Browse All Shops
            </Link>
          </div>
        )}
      </div>

      {/* Admin Payment Modal for Top-up */}
      {showTopUpPayment && (
        <AdminPaymentModal 
          amount={parseInt(topUpAmount)}
          onConfirm={confirmTopUp}
          onClose={() => setShowTopUpPayment(false)}
        />
      )}
    </div>
  )
}

function AdminPaymentModal({ amount, onConfirm, onClose }) {
  const adminUpi = import.meta.env.VITE_ADMIN_UPI_ID || 'sujalthapa369@oksbi'
  const upiUrl = `upi://pay?pa=${adminUpi}&pn=Printzo%20Admin&am=${amount}&cu=INR`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card max-w-sm w-full p-6 text-center space-y-6 shadow-2xl border-primary/20 animate-in zoom-in-95 duration-300">
        <h2 className="text-xl font-syne font-bold text-main">Add Money to Wallet</h2>
        <div className="bg-white p-4 rounded-[20px] inline-block mb-2 border border-border shadow-lg">
          <img src={qrUrl} alt="UPI QR" className="w-40 h-40" />
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-syne font-black text-primary truncate px-2">{formatINR(amount)}</p>
          <p className="text-xs text-muted font-medium">Scan the QR to pay the Admin</p>
          <p className="text-[10px] text-muted opacity-60">UPI ID: {adminUpi}</p>
        </div>
        <div className="space-y-3">
          <button 
            onClick={onConfirm} 
            className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            I've Paid Successfully
          </button>
          <button 
            onClick={onClose} 
            className="text-xs text-muted hover:text-red-500 transition-colors uppercase tracking-widest font-bold"
          >
            Cancel Transaction
          </button>
        </div>
      </div>
    </div>
  )
}
