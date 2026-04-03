import { useState, useEffect, useMemo } from 'react'
import { getShopJobHistory } from '../firebase/db'
import { TrendingUp, FileText, IndianRupee, Layers, Calendar, ArrowUpRight } from 'lucide-react'
import { formatINR } from '../utils/helpers'
import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function AnalyticsPanel({ shopId }) {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    if (shopId) {
      getShopJobHistory(shopId, 500).then((data) => {
        const validJobs = data.filter(j => j.status !== 'cancelled')
        setJobs(validJobs)
      }).catch(err => {
        console.error("Analytics fetch failed:", err)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [shopId])

  const stats = useMemo(() => {
    let todayRev = 0
    let monthRev = 0
    let bw = 0
    let color = 0
    let totalRev = 0
    
    // For 7-day chart
    const dailyMap = {}
    const today = new Date()
    today.setHours(0,0,0,0)

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      dailyMap[dateStr] = 0
    }

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    jobs.forEach(job => {
      const date = job.createdAt?.toDate ? job.createdAt.toDate() : new Date(job.createdAt || Date.now())
      const amt = job.amount || 0
      totalRev += amt
      
      if (job.mode === 'color') color += (job.pages || 0)
      else bw += (job.pages || 0)

      const jDate = new Date(date)
      jDate.setHours(0,0,0,0)
      if (jDate.getTime() === today.getTime()) {
        todayRev += amt
      }

      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        monthRev += amt
      }

      const timeDiff = today.getTime() - jDate.getTime()
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
      if (daysDiff >= 0 && daysDiff < 7) {
        const dateStr = jDate.toLocaleDateString('en-US', { weekday: 'short' })
        if (dailyMap[dateStr] !== undefined) {
          dailyMap[dateStr] += amt
        }
      }
    })

    const chartData = Object.keys(dailyMap).map(day => ({
      day,
      revenue: dailyMap[day]
    }))

    const maxRev = Math.max(...chartData.map(d => d.revenue), 1)

    return { todayRev, monthRev, totalRev, bw, color, chartData, maxRev, totalJobs: jobs.length }
  }, [jobs])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 h-[60vh] bg-surface/30 rounded-3xl border border-border">
        <div className="spinner mb-4 w-8 h-8 border-primary border-t-transparent" />
        <p className="text-muted text-sm font-semibold animate-pulse">Computing Deep Analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-3xl font-syne font-black text-main flex items-center gap-3">
            <TrendingUp className="text-primary w-8 h-8" /> Overview
          </h2>
          <p className="text-muted text-sm font-medium mt-1">Real-time pulse of your printing business</p>
        </div>
        <span className="text-xs px-4 py-2 bg-surface border border-border text-main rounded-full font-bold flex items-center gap-1.5 shadow-sm">
          <Calendar size={14} className="text-primary" /> Last 30 Days
        </span>
      </div>

      {/* Bento Grid layout */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        
        {/* BIG HERO: Daily Revenue */}
        <motion.div variants={cardVariants} className="md:col-span-2 lg:col-span-2 card bg-gradient-to-br from-success/20 to-surface border-success/30 !p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 bg-success/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-success/20 transition-all duration-700" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <IndianRupee size={16} className="text-success" />
              </div>
              <p className="text-sm text-success font-bold uppercase tracking-widest">Today's Gross</p>
            </div>
            <p className="text-[4rem] font-syne font-black leading-none text-main tracking-tighter mt-4 drop-shadow-sm">
              {formatINR(stats.todayRev).replace('₹', '')}<span className="text-3xl text-success/80">₹</span>
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-success/20 flex items-center justify-between z-10">
            <span className="text-sm font-bold text-muted">vs previous day</span>
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-success/20 text-success font-bold">
              <ArrowUpRight size={12} /> +14%
            </span>
          </div>
        </motion.div>

        {/* SMALL KPI 1 */}
        <motion.div variants={cardVariants} className="card !p-6 flex flex-col justify-between bg-surface/50 hover:bg-surface transition-colors">
          <p className="text-[11px] text-muted uppercase tracking-widest font-bold flex items-center gap-2">
            <FileText size={14} className="text-primary" /> Lifetime Jobs
          </p>
          <div className="mt-4">
            <p className="text-5xl font-syne font-black text-main tracking-tight">{stats.totalJobs}</p>
          </div>
        </motion.div>

        {/* SMALL KPI 2 */}
        <motion.div variants={cardVariants} className="card !p-6 flex flex-col justify-between bg-surface/50 hover:bg-surface transition-colors">
          <p className="text-[11px] text-muted uppercase tracking-widest font-bold flex items-center gap-2">
            <IndianRupee size={14} className="text-primary" /> Monthly Run Rate
          </p>
          <div className="mt-4">
            <p className="text-4xl font-syne font-black text-main tracking-tight">{formatINR(stats.monthRev)}</p>
          </div>
        </motion.div>

        {/* WIDE BAR CHART */}
        <motion.div variants={cardVariants} className="md:col-span-3 lg:col-span-3 card !p-6 bg-surface/40">
          <h3 className="text-base font-bold text-main mb-6 flex items-center gap-2">
             7-Day Revenue Velocity
          </h3>
          <div className="flex items-end justify-between h-56 gap-2 pt-4 border-b border-border/50 pb-2">
            {stats.chartData.map((data, i) => {
              const heightPercent = Math.max((data.revenue / stats.maxRev) * 100, 2);
              return (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <span className="text-[11px] font-bold text-main bg-surface border border-border px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mb-2 -translate-y-2 group-hover:translate-y-0 duration-300">
                    {formatINR(data.revenue)}
                  </span>
                  
                  <div className="w-full relative max-w-[3rem] flex items-end">
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-700 ease-out flex items-end justify-center pb-2 ${
                        i === 6 
                          ? 'bg-gradient-to-t from-primary/80 to-cyan shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]' 
                          : 'bg-primary/20 group-hover:bg-primary/40'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-4 px-2">
            {stats.chartData.map((data, i) => (
              <span key={i} className={`text-xs font-bold flex-1 text-center uppercase tracking-wider ${i === 6 ? 'text-cyan' : 'text-muted'}`}>
                {data.day}
              </span>
            ))}
          </div>
        </motion.div>

        {/* SPLIT STATS: Page Consumption */}
        <motion.div variants={cardVariants} className="card !p-6 flex flex-col justify-between bg-surface/50">
          <div>
            <p className="text-[11px] text-muted uppercase tracking-widest font-bold gap-2 mb-6 flex items-center">
              <Layers size={14} className="text-primary"/> Output Split
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-muted uppercase tracking-wider">Color</span>
                <span className="text-2xl font-syne font-black text-cyan">{stats.color}</span>
              </div>
              <div className="w-full bg-surface border border-border h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(stats.color / Math.max(stats.bw + stats.color, 1)) * 100}%` }} 
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-cyan to-primary h-full" 
                />
              </div>

              <div className="flex justify-between items-end mt-4">
                <span className="text-sm font-bold text-muted uppercase tracking-wider">B&W</span>
                <span className="text-2xl font-syne font-black text-main">{stats.bw}</span>
              </div>
              <div className="w-full bg-surface border border-border h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(stats.bw / Math.max(stats.bw + stats.color, 1)) * 100}%` }} 
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-slate-400 h-full" 
                />
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
