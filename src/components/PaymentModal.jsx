import { useState } from 'react'
import { X, ExternalLink, ShieldCheck, Wallet, Banknote, QrCode } from 'lucide-react'
import { formatINR } from '../utils/helpers'

export default function PaymentModal({ job, onConfirm, onClose, walletBalance = 0, shopUpiId }) {
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState('upi') // 'upi', 'wallet', 'cash'

  if (!job) return null

  // Ensure upiId is valid
  const targetUpi = (shopUpiId && shopUpiId.includes('@')) ? shopUpiId : 'merchant@upi'

  const generateUpiUrl = () => {
    const pa = encodeURIComponent(targetUpi)
    const pn = encodeURIComponent('Printzo Shop')
    const am = encodeURIComponent(job.amount.toString())
    const tr = encodeURIComponent(`PZ-${Date.now()}`)
    const cu = 'INR'
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tr=${tr}&cu=${cu}`
  }

  const upiUrl = generateUpiUrl()
  // Use a more stable QR API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`

  const handleMethodSelect = async (mId) => {
    setMethod(mId)
    // For Wallet and UPI, we now proceed immediately after selection to avoid the extra button step.
    // For Cash, it stays on screen so the user can show it to the retailer? 
    // Actually the user says "once payment is done no need to press... then only request will go".
    // So we trigger onConfirm(mId) immediately.
    
    if (mId === 'wallet' && walletBalance < job.amount) {
      toast.error('Insufficient wallet balance')
      return
    }

    setLoading(true)
    try {
      await onConfirm(mId)
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card max-w-md w-full !p-0 overflow-hidden relative shadow-2xl shadow-primary/20 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-surface/80 border-b border-border p-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-syne font-bold text-main">Complete Payment</h2>
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" /> Secure Transaction
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-border hover:bg-red-500/10 hover:text-red-500 transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Amount Display */}
          <div className="text-center">
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">Total Amount</p>
            <p className="text-5xl font-syne font-black text-primary drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              {formatINR(job.amount)}
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'upi', icon: QrCode, label: 'UPI QR' },
              { id: 'wallet', icon: Wallet, label: 'Wallet' },
              { id: 'cash', icon: Banknote, label: 'Cash' }
            ].map(m => (
              <button
                key={m.id}
                disabled={loading}
                onClick={() => handleMethodSelect(m.id)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  method === m.id 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-surface border-border text-muted hover:border-primary/40'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading && method === m.id ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <m.icon size={20} className={method === m.id ? 'text-primary' : 'text-muted'} />
                )}
                <span className="text-xs font-semibold">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Payment Details */}
          {method === 'upi' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-[24px] p-6 flex items-center justify-center border border-border mx-auto w-fit shadow-xl">
                <img src={qrUrl} alt="UPI QR Code" className="w-[180px] h-[180px] rounded-lg" />
              </div>
              <div className="bg-surface/50 rounded-2xl p-4 border border-border flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-bold text-main">Paying on Mobile?</p>
                <a 
                  href={upiUrl}
                  onClick={() => handleMethodSelect('upi')}
                  className="inline-flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 hover:bg-primary/20 px-6 py-2.5 rounded-xl transition-all active:scale-95 border border-primary/20"
                >
                  Open UPI App <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {method === 'wallet' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Current Balance:</span>
                <span className="font-bold font-syne">{formatINR(walletBalance)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-4">
                <span className="text-sm text-slate-400">After Deduction:</span>
                <span className={`font-bold font-syne ${walletBalance >= job.amount ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatINR(walletBalance - job.amount)}
                </span>
              </div>
              {walletBalance < job.amount && (
                <p className="text-xs text-red-400 text-center mt-2 bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                  Insufficient balance. Top up from Dashboard.
                </p>
              )}
            </div>
          )}

          {method === 'cash' && (
            <div className="bg-surface/50 rounded-2xl p-5 border border-border text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Banknote size={24} />
              </div>
              <h3 className="font-syne font-bold text-lg text-main">Pay at Counter</h3>
              <p className="text-sm text-muted">Generate your token now and pay {formatINR(job.amount)} in cash at the shop to start printing.</p>
            </div>
          )}

          {/* Instant Submit Instructions */}
          <div className="space-y-3 pt-2">
            {!loading && (
              <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <p className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest mb-1">Instant Fulfillment</p>
                <p className="text-xs text-muted leading-relaxed">
                  Select your method above. Your print job will be sent <b>immediately</b> to the shop queue.
                </p>
              </div>
            )}
            
            {loading && (
              <div className="flex flex-col items-center gap-3 py-4">
                 <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                 <p className="text-sm font-bold text-primary animate-pulse tracking-wide">SUBMITTING JOB...</p>
              </div>
            )}

            <p className="text-[10px] text-muted text-center max-w-xs mx-auto leading-relaxed">
              {job.isInstant 
                ? "Your document is set to Instant Print and will float to the top of the queue upon confirmation."
                : "By confirming, you agree that you have read and understood the privacy policy. No files are retained."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
