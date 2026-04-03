import { useState } from 'react'
import { X, Zap, Banknote, Wallet, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { formatINR, PAYMENT_METHODS, getQRCodeUrl } from '../utils/helpers'
import { deductWallet } from '../firebase/db'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function PaymentModal({ job, onConfirm, onClose, walletBalance = 0, shopUpiId }) {
  const { user } = useAuth()
  const [selected, setSelected] = useState('upi')
  const [loading, setLoading] = useState(false)

  const canUseWallet = walletBalance >= job.amount

  const handleConfirm = async () => {
    setLoading(true)
    try {
      if (selected === 'wallet') {
        await deductWallet(user.uid, job.amount)
      }
      await onConfirm(selected)
    } catch (err) {
      toast.error(err.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md glass-bright border border-border rounded-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-syne font-bold text-white">Confirm & Pay</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Order summary */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Order Summary</p>
            <SummaryRow label="Document" value={job.fileName || 'Document'} />
            <SummaryRow label="Pages" value={`${job.pages} pages`} />
            <SummaryRow label="Print Mode" value={job.mode === 'color' ? '🎨 Color' : '⬛ B&W'} />
            {job.isInstant && <SummaryRow label="Type" value="⚡ Instant Print" valueClass="text-amber-400" />}
            <div className="border-t border-border mt-2 pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-xl font-syne font-bold text-emerald-400">{formatINR(job.amount)}</span>
            </div>
          </div>

          {/* Payment methods */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Payment Method</p>
            {PAYMENT_METHODS.map(method => {
              const isWallet = method.key === 'wallet'
              const isDisabled = isWallet && !canUseWallet
              return (
                <label
                  key={method.key}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selected === method.key
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface hover:border-primary/40'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.key}
                    checked={selected === method.key}
                    onChange={() => !isDisabled && setSelected(method.key)}
                    className="sr-only"
                    disabled={isDisabled}
                  />
                  <span className="text-xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{method.label}</p>
                    <p className="text-xs text-slate-500">
                      {isWallet
                        ? canUseWallet
                          ? `Balance: ${formatINR(walletBalance)}`
                          : `Insufficient balance (${formatINR(walletBalance)})`
                        : method.description
                      }
                    </p>
                  </div>
                  {selected === method.key && (
                    <CheckCircle size={16} className="text-primary flex-shrink-0" />
                  )}
                </label>
              )
            })}
          </div>

          {/* UPI note and QR Code */}
          {selected === 'upi' && (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-5 text-center mt-2">
              <p className="text-sm font-semibold text-white">Scan QR Code to Pay</p>
              
              <div className="bg-white p-2 rounded-xl">
                <img 
                  src={getQRCodeUrl(`upi://pay?pa=${shopUpiId || 'tsujal568@okhdfcbank'}&pn=Printzo&am=${job.amount}&cu=INR`, 160)} 
                  alt="UPI QR Code" 
                  className="w-32 h-32" 
                />
              </div>
              
              <div className="text-xs text-slate-400 space-y-1">
                <p>UPI ID: <span className="text-white font-mono">{shopUpiId || 'tsujal568@okhdfcbank'}</span></p>
                <p>Amount: <span className="text-emerald-400 font-bold">{formatINR(job.amount)}</span></p>
              </div>

              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 text-left w-full mt-2">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span>Once payment is done, click confirm to automatically trigger the ESP32 printer queue.</span>
              </div>
            </div>
          )}

          {selected === 'cash' && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              <span>Pay cash at the counter. The retailer will confirm receipt and start printing.</span>
            </div>
          )}

          {/* Confirm button */}
          <div className="pt-2 pb-1 sticky bottom-0 bg-surface/80 backdrop-blur-sm border-t border-border/50 -mx-5 px-5 mt-4">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full btn-primary justify-center text-base py-3.5 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" />
                  Processing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Confirm & Submit Job
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SummaryRow = ({ label, value, valueClass = 'text-slate-300' }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-slate-500">{label}</span>
    <span className={`font-medium truncate max-w-[180px] ${valueClass}`}>{value}</span>
  </div>
)
