import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Printer, XCircle, Share2 } from 'lucide-react'
import { subscribeToJob } from '../firebase/db'
import { shortDate, formatINR } from '../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Waiting in Queue',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    desc: 'Your document is in the print queue.',
  },
  printing: {
    icon: Printer,
    label: 'Currently Printing',
    color: 'text-cyan',
    bg: 'bg-cyan/10 border-cyan/20',
    desc: 'Your document is being printed right now!',
  },
  completed: {
    icon: CheckCircle,
    label: 'Print Complete!',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    desc: 'Collect your printout from the counter.',
  },
  cancelled: {
    icon: XCircle,
    label: 'Job Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    desc: 'This print job was cancelled.',
  },
}

export default function TokenCard({ jobId, initialJob }) {
  const [job, setJob] = useState(initialJob)

  useEffect(() => {
    if (!jobId) return
    const unsub = subscribeToJob(jobId, (updatedJob) => {
      setJob(updatedJob)
      if (updatedJob.status === 'printing' && job?.status === 'pending') {
        toast('🖨️ Your document is printing!', { duration: 3000 })
      }
      if (updatedJob.status === 'completed' && job?.status === 'printing') {
        toast.success('✅ Print complete! Collect your document.', { duration: 5000 })
      }
    })
    return unsub
  }, [jobId])

  if (!job) return null

  const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon

  const shareToken = () => {
    const text = `My Printzo Token #${job.tokenNumber} at ${job.shopName || 'the shop'}. Status: ${status.label}`
    if (navigator.share) {
      navigator.share({ title: 'Printzo Token', text })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Token details copied!')
    }
  }

  return (
    <div className="card max-w-sm w-full mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-medium">Your Token</p>
        <div className="token-number">{String(job.tokenNumber).padStart(3, '0')}</div>
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 mb-4 ${status.bg}`}>
        <StatusIcon size={18} className={status.color} />
        <div>
          <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
          <p className="text-xs text-slate-400">{status.desc}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2 text-sm">
        <Row label="File" value={job.fileName || 'Document'} />
        <Row label="Pages" value={`${job.pages} ${job.pages > 1 ? 'pages' : 'page'}`} />
        <Row label="Mode" value={job.mode === 'color' ? '🎨 Color' : '⬛ B&W'} />
        <Row label="Payment" value={
          job.paymentMethod === 'upi' ? '⚡ UPI' :
          job.paymentMethod === 'cash' ? '💵 Cash' : '👛 Wallet'
        } />
        <Row
          label="Amount"
          value={formatINR(job.amount)}
          valueClass="text-emerald-400 font-semibold"
        />
        {job.isInstant && (
          <Row label="Type" value="⚡ Instant Print" valueClass="text-amber-400" />
        )}
        <Row label="Submitted" value={shortDate(job.createdAt)} />
      </div>

      {/* Printing animation */}
      {job.status === 'printing' && (
        <div className="mt-4 flex items-center justify-center gap-1">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-1.5 h-6 bg-cyan rounded-full"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {/* Share button */}
      <button
        onClick={shareToken}
        className="w-full mt-4 btn-secondary text-sm justify-center gap-2"
      >
        <Share2 size={14} />
        Share Token
      </button>
    </div>
  )
}

const Row = ({ label, value, valueClass = 'text-slate-200' }) => (
  <div className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
)
