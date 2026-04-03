import { useState } from 'react'
import { Printer, CheckCircle, XCircle, Clock, Zap, FileText, User, ChevronDown } from 'lucide-react'
import { updatePrintJob } from '../firebase/db'
import { deleteDocument } from '../firebase/storage'
import { formatINR, shortDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_STEPS = {
  pending: { next: 'printing', label: 'Start Printing', icon: Printer, color: 'bg-cyan text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]' },
  printing: { next: 'completed', label: 'Mark Complete', icon: CheckCircle, color: 'bg-primary text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]' },
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
    pending: 'bg-primary/10 text-primary border-primary/20',
    printing: 'bg-cyan/10 text-cyan border-cyan/20 animate-pulse',
    completed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-danger/10 text-danger border-danger/20',
  }

  const step = STATUS_STEPS[job.status]
  const StepIcon = step?.icon

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-3 px-4 border-b border-border/50 hover:bg-surface/50 transition-colors">
        <div className="text-center w-10 flex-shrink-0">
          <span className="text-lg font-syne font-bold text-cyan">
            {String(job.tokenNumber).padStart(3, '0')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-main font-medium truncate">{job.fileName || 'Document'}</p>
          <p className="text-xs text-muted">{job.pages}p · {job.mode === 'color' ? '🎨' : '⬛'} · {formatINR(job.amount)}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </div>
    )
  }

  return (
    <div className={`card !p-0 overflow-hidden transition-all duration-300 ${
      job.status === 'printing'
        ? 'border-cyan/40 bg-cyan/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
        : job.status === 'pending'
          ? job.isInstant 
            ? 'border-warning/50 bg-warning/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
            : 'border-border/60 bg-card/80'
          : 'border-border/40 bg-card/40 opacity-80'
    }`}>
      {/* Token header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-surface/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border shadow-inner flex items-center justify-center">
            <span className={`text-2xl font-syne font-black ${
              job.status === 'printing' ? 'text-cyan' :
              job.status === 'pending' ? 'text-main' : 'text-muted'
            }`}>
              #{String(job.tokenNumber).padStart(3, '0')}
            </span>
          </div>
          {job.isInstant && (
            <span className="flex items-center gap-1 text-xs bg-warning/10 text-warning border border-warning/20 rounded-full px-2 py-0.5 font-bold uppercase tracking-wide">
              <Zap size={10} /> Instant
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[job.status]}`}>
            {job.status}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-muted hover:text-main hover:bg-surface rounded-full transition-all active:scale-95"
          >
            <ChevronDown size={18} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Details (Bento Grid Style) */}
      <div className="p-4 space-y-3">
        {/* Main Doc card */}
        <div className="bg-surface/50 border border-border/50 rounded-2xl p-4 flex items-start gap-4 hover:border-border transition-colors">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {job.fileUrl ? (
              <a href={job.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-main hover:text-primary transition-colors truncate block">
                {job.fileName || 'Document'}
              </a>
            ) : (
              <p className="text-sm font-bold text-main truncate">{job.fileName || 'Document'}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-xs font-medium text-muted">{job.pages} {job.pages === 1 ? 'page' : 'pages'}</span>
              <span className="text-xs font-medium text-muted">{job.mode === 'color' ? '🎨 Color' : '⬛ B&W'}</span>
              <span className="text-xs font-bold text-success">{formatINR(job.amount)}</span>
            </div>
          </div>
        </div>

        {/* Info pills */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface/50 border border-border/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-muted">
              <User size={14} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Payment</p>
              <p className="text-xs font-semibold text-main truncate">
                {job.paymentMethod === 'upi' ? '⚡ UPI' : job.paymentMethod === 'cash' ? '💵 Cash' : '👛 Wallet'}
              </p>
            </div>
          </div>
          <div className="bg-surface/50 border border-border/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-muted">
              <Clock size={14} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Time</p>
              <p className="text-xs font-semibold text-main truncate">{shortDate(job.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Expanded info */}
        {expanded && (
          <div className="pt-2">
            <div className="bg-surface/50 border border-border/50 p-4 rounded-xl text-xs space-y-2 text-muted shadow-inner">
              <p className="flex justify-between"><span>Job ID:</span> <span className="font-mono text-main">{job.id}</span></p>
              {job.printerName && <p className="flex justify-between"><span>Target Printer:</span> <span className="text-main font-semibold">{job.printerName}</span></p>}
              {job.paymentMethod === 'cash' && job.status !== 'cancelled' && (
                <div className="flex items-center gap-2 text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mt-3 font-semibold">
                  <Clock size={12} />
                  <span>Cash payment — confirm upon receipt</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(job.status === 'pending' || job.status === 'printing') && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={advance}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-syne font-bold transition-all active:scale-95 ${step?.color}`}
          >
            {loading ? <span className="spinner" /> : (
              <><StepIcon size={16} /> {step?.label}</>
            )}
          </button>
          {job.status === 'pending' && (
            <button
              onClick={cancel}
              disabled={loading}
              className="px-4 bg-surface border border-border hover:border-danger hover:text-danger hover:bg-danger/10 text-muted rounded-xl transition-all active:scale-95"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
