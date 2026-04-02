import { useState } from 'react'
import { Printer, CheckCircle, XCircle, Clock, Zap, FileText, User, ChevronDown } from 'lucide-react'
import { updatePrintJob } from '../firebase/db'
import { deleteDocument } from '../firebase/storage'
import { formatINR, shortDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_STEPS = {
  pending: { next: 'printing', label: 'Start Printing', icon: Printer, color: 'btn-cyan' },
  printing: { next: 'completed', label: 'Mark Complete', icon: CheckCircle, color: 'btn-primary' },
}

export default function JobCard({ job, compact = false }) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const advance = async () => {
    const step = STATUS_STEPS[job.status]
    if (!step) return
    setLoading(true)
    try {
      await updatePrintJob(job.id, { status: step.next })
      // Delete file from storage when completed (privacy)
      if (step.next === 'completed' && job.filePath) {
        await deleteDocument(job.filePath)
      }
      toast.success(step.next === 'printing' ? 'Printing started!' : '✅ Job completed!')
    } catch {
      toast.error('Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  const cancel = async () => {
    if (!window.confirm('Cancel this print job?')) return
    setLoading(true)
    try {
      await updatePrintJob(job.id, { status: 'cancelled' })
      if (job.filePath) await deleteDocument(job.filePath)
      toast.success('Job cancelled')
    } catch {
      toast.error('Failed to cancel')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    pending: 'tag-pending',
    printing: 'tag-printing',
    completed: 'tag-completed',
    cancelled: 'tag-cancelled',
  }

  const step = STATUS_STEPS[job.status]
  const StepIcon = step?.icon

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-3 px-4 border-b border-border/50 last:border-0 hover:bg-white/2 transition-colors">
        <div className="text-center w-10 flex-shrink-0">
          <span className="text-lg font-syne font-bold text-cyan">
            {String(job.tokenNumber).padStart(3, '0')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">{job.fileName || 'Document'}</p>
          <p className="text-xs text-slate-500">{job.pages}p · {job.mode === 'color' ? '🎨' : '⬛'} · {formatINR(job.amount)}</p>
        </div>
        <span className={`stat-badge ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </div>
    )
  }

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${
      job.status === 'printing'
        ? 'border-cyan/40 bg-cyan/5'
        : job.status === 'pending'
        ? 'border-border bg-card'
        : 'border-border/50 bg-card/50 opacity-70'
    }`}>
      {/* Token header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-syne font-black ${
            job.status === 'printing' ? 'text-cyan' :
            job.status === 'pending' ? 'text-white' : 'text-slate-500'
          }`}>
            #{String(job.tokenNumber).padStart(3, '0')}
          </div>
          {job.isInstant && (
            <span className="flex items-center gap-1 text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5">
              <Zap size={10} /> Instant
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`stat-badge ${statusColors[job.status]}`}>
            {job.status}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{job.fileName || 'Document'}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-xs text-slate-400">{job.pages} {job.pages === 1 ? 'page' : 'pages'}</span>
              <span className="text-xs text-slate-400">{job.mode === 'color' ? '🎨 Color' : '⬛ B&W'}</span>
              <span className="text-xs text-emerald-400 font-semibold">{formatINR(job.amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <User size={11} />
            <span>
              {job.paymentMethod === 'upi' ? '⚡ UPI' :
               job.paymentMethod === 'cash' ? '💵 Cash due' : '👛 Wallet'}
            </span>
          </div>
          <span className="text-slate-500">{shortDate(job.createdAt)}</span>
        </div>

        {/* Expanded info */}
        {expanded && (
          <div className="pt-2 border-t border-border/50 space-y-1.5 text-xs text-slate-400">
            <p>Job ID: <span className="font-mono text-slate-500">{job.id}</span></p>
            {job.printerName && <p>Printer: {job.printerName}</p>}
            {job.paymentMethod === 'cash' && job.status !== 'cancelled' && (
              <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mt-2">
                <Clock size={12} />
                <span>Cash payment — confirm upon receipt</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {(job.status === 'pending' || job.status === 'printing') && (
        <div className="px-5 pb-4 flex gap-2">
          <button
            onClick={advance}
            disabled={loading}
            className={`flex-1 ${step?.color || 'btn-primary'} text-sm py-2.5 justify-center`}
          >
            {loading ? <span className="spinner" /> : (
              <><StepIcon size={14} /> {step?.label}</>
            )}
          </button>
          {job.status === 'pending' && (
            <button
              onClick={cancel}
              disabled={loading}
              className="btn-secondary text-sm py-2.5 px-3"
            >
              <XCircle size={14} className="text-red-400" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
