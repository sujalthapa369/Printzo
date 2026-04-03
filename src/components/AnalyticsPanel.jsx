import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { TrendingUp, FileText, IndianRupee, Layers, Calendar, ArrowUpRight, TrendingDown, Clock, CheckCircle, Package } from 'lucide-react'
import { formatINR, shortDate } from '../utils/helpers'
import { motion, AnimatePresence } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function AnalyticsPanel({ shopId }) {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    if (!shopId) return

    setLoading(true)
    const q = query(
      collection(db, 'printJobs'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc'),
      limit(1000)
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setJobs(data)
      setLoading(false)
    }, (err) => {
      console.error("Analytics real-time sync failed:", err)
      setLoading(false)
    })

    return () => unsub()
  }, [shopId])

  const stats = useMemo(() => {
    let todayRev = 0
    let monthRev = 0
    let totalRev = 0
    let bwPages = 0
    let colorPages = 0
    
    const dailyMap = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      dailyMap[dateStr] = 0
    }

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Filter valid jobs for financial calculations (exclude cancelled)
    const validJobs = jobs.filter(j => j.status !== 'cancelled')

    validJobs.forEach(job => {
      const createdAt = job.createdAt?.toDate ? job.createdAt.toDate() : new Date(job.createdAt || Date.now())
      const amount = Number(job.amount) || 0
      const pages = Number(job.pages) || 0
      
      totalRev += amount
      
      if (job.mode === 'color') colorPages += pages
      else bwPages += pages

      const jDate = new Date(createdAt)
      jDate.setHours(0, 0, 0, 0)

      if (jDate.getTime() === today.getTime()) {
        todayRev += amount
      }

      if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
        monthRev += amount
      }

      const dateStr = jDate.toLocaleDateString('en-US', { weekday: 'short' })
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr] += amount
      }
    })

    const chartData = Object.keys(dailyMap).map(day => ({
      day,
      revenue: dailyMap[day]
    }))

    const maxRev = Math.max(...chartData.map(d => d.revenue), 10)

    return { 
      todayRev, 
      monthRev, 
      totalRev, 
      bwPages, 
      colorPages, 
      chartData, 
      maxRev, 
      totalJobs: validJobs.length,
      allJobs: jobs // keep original list for the feed
    }
  }, [jobs])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-surface/30 rounded-[32px] border border-border/50 backdrop-blur-xl h-[500px]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <p className="text-main font-syne font-bold text-lg">Analyzing your business...</p>
        <p className="text-muted text-sm mt-1">Streaming real-time performance data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Live Business Intelligence</span>
          </div>
          <h2 className="text-4xl font-syne font-black text-main tracking-tight">
            Perform<span className="text-primary">ance</span> dashboard
          </h2>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* KPI: Today's Revenue */}
        <motion.div variants={cardVariants} className="lg:col-span-2 card !p-8 bg-primary/5 border-primary/20 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp size={14} /> Today's Gross Revenue
          </p>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-5xl font-syne font-black text-main tracking-tighter">
              {formatINR(stats.todayRev)}
            </span>
          </div>
          <p className="mt-4 text-[11px] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
             <Package size={12} /> {stats.totalJobs} Successful Transactions
          </p>
        </motion.div>

        {/* KPI: Monthly Revenue */}
        <motion.div variants={cardVariants} className="card !p-8 flex flex-col justify-between bg-surface/50 border-white/5">
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Current Month</p>
          <div className="mt-6">
            <p className="text-3xl font-syne font-black text-main">{formatINR(stats.monthRev)}</p>
            <p className="text-[10px] text-primary font-bold mt-2">Active business cycle</p>
          </div>
        </motion.div>

        {/* OUTPUT MIX */}
        <motion.div variants={cardVariants} className="card !p-8 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-main uppercase tracking-widest mb-6">Output Mix</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-muted">COLOR</span>
                <span className="text-main">{stats.colorPages} pgs</span>
              </div>
              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border">
                <motion.div animate={{ width: `${(stats.colorPages / Math.max(stats.bwPages + stats.colorPages, 1)) * 100}%` }} className="h-full bg-primary" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-muted">B&W</span>
                <span className="text-main">{stats.bwPages} pgs</span>
              </div>
              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border">
                <motion.div animate={{ width: `${(stats.bwPages / Math.max(stats.bwPages + stats.colorPages, 1)) * 100}%` }} className="h-full bg-slate-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7-DAY CHART */}
        <motion.div variants={cardVariants} className="lg:col-span-4 card !p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-syne font-bold text-main">Weekly Profit Velocity</h3>
              <span className="text-[10px] text-muted font-bold border border-border px-3 py-1 rounded-full">LIVE FEED</span>
           </div>
           
           <div className="flex items-end justify-between h-40 gap-4 sm:gap-8 px-4">
              {stats.chartData.map((data, i) => {
                const height = (data.revenue / stats.maxRev) * 100
                const isToday = i === 6
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className={`w-full max-w-[50px] rounded-t-xl transition-all duration-300 ${
                        isToday ? 'bg-primary shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'bg-surface border border-border group-hover:border-primary/40'
                      }`}
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-muted'}`}>
                      {data.day}
                    </span>
                  </div>
                )
              })}
           </div>
        </motion.div>

        {/* RECENT ACTIVITY FEED (HISTORY) */}
        <motion.div variants={cardVariants} className="md:col-span-2 lg:col-span-4 mt-4">
           <div className="flex items-center gap-3 mb-6">
              <Clock className="text-primary w-5 h-5" />
              <h3 className="text-lg font-syne font-bold text-main">Recent Activity Feed</h3>
              <div className="h-px bg-border flex-1 ml-4" />
           </div>
           
           <div className="grid grid-cols-1 gap-1">
             {stats.allJobs.slice(0, 20).map((job, idx) => (
               <motion.div 
                 key={job.id} 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ delay: idx * 0.05 }}
                 className="flex items-center justify-between p-4 bg-surface/30 border-b border-border/50 first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface/60 transition-colors group"
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                       job.status === 'completed' ? 'bg-success' : 
                       job.status === 'printing' ? 'bg-cyan animate-pulse' : 
                       job.status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                    }`} />
                    <div className="w-10 text-[11px] font-mono text-cyan font-bold tracking-tighter">
                       #{String(job.tokenNumber).padStart(3, '0')}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-main group-hover:text-primary transition-colors">{job.fileName || 'Untitled Doc'}</p>
                       <p className="text-[10px] text-muted flex items-center gap-2">
                          <Clock size={10} /> {shortDate(job.createdAt)} • {job.pages} pgs • {job.mode === 'color' ? 'Color' : 'B&W'}
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-6">
                    <div className="text-right">
                       <p className="text-sm font-black text-main">{formatINR(job.amount)}</p>
                       <p className="text-[9px] font-bold text-muted uppercase tracking-wider">{job.paymentMethod}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-current opacity-70 group-hover:opacity-100 transition-opacity ${
                       job.status === 'completed' ? 'text-success' : 
                       job.status === 'printing' ? 'text-cyan' : 
                       job.status === 'cancelled' ? 'text-danger' : 'text-warning'
                    }`}>
                       {job.status}
                    </div>
                 </div>
               </motion.div>
             ))}
             
             {stats.allJobs.length === 0 && (
               <div className="text-center py-20 bg-surface/10 rounded-2xl border border-dashed border-border">
                  <p className="text-muted text-sm italic">No recent activity detected in your business cycles.</p>
               </div>
             )}
           </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

