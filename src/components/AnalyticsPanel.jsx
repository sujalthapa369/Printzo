import { useState, useEffect, useMemo } from 'react'
import { getShopJobHistory } from '../firebase/db'
import { TrendingUp, FileText, IndianRupee, Layers, Calendar, ArrowUpRight, TrendingDown, Clock } from 'lucide-react'
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
      setLoading(true)
      getShopJobHistory(shopId, 1000)
        .then((data) => {
          // Filter to only include money-generating status
          const validJobs = data.filter(j => j.status === 'completed' || j.status === 'printing' || j.status === 'pending')
          setJobs(validJobs)
        })
        .catch(err => console.error("Analytics fetch failed:", err))
        .finally(() => setLoading(false))
    }
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

    // Initialize last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      dailyMap[dateStr] = 0
    }

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    jobs.forEach(job => {
      const createdAt = job.createdAt?.toDate ? job.createdAt.toDate() : new Date(job.createdAt || Date.now())
      const amount = Number(job.amount) || 0
      const pages = Number(job.pages) || 0
      
      totalRev += amount
      
      if (job.mode === 'color') colorPages += pages
      else bwPages += pages

      const jDate = new Date(createdAt)
      jDate.setHours(0, 0, 0, 0)

      // Today's revenue
      if (jDate.getTime() === today.getTime()) {
        todayRev += amount
      }

      // This month's revenue
      if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
        monthRev += amount
      }

      // Populate 7-day chart
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
      totalJobs: jobs.length 
    }
  }, [jobs])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-surface/30 rounded-[32px] border border-border/50 backdrop-blur-xl h-[500px]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <p className="text-main font-syne font-bold text-lg">Analyzing your business...</p>
        <p className="text-muted text-sm mt-1">Fetching real-time transaction data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-xl self-start md:self-auto">
          <span className="px-4 py-2 bg-primary text-bg text-xs font-bold rounded-lg shadow-lg">Last 30 Days</span>
          <span className="px-4 py-2 text-muted text-xs font-bold">Lifetime</span>
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
          <div className="mt-8 flex items-center gap-3">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-slate-800" />)}
             </div>
             <p className="text-[10px] text-muted font-medium">Updated just now • Based on {stats.totalJobs} jobs</p>
          </div>
        </motion.div>

        {/* KPI: Total Jobs */}
        <motion.div variants={cardVariants} className="card !p-8 flex flex-col justify-between hover:border-primary/40 transition-all">
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Total Print Tokens</p>
          <div className="mt-6">
            <p className="text-4xl font-syne font-black text-main">{stats.totalJobs.toLocaleString()}</p>
            <p className="text-xs text-primary font-bold mt-1">+12% from last week</p>
          </div>
        </motion.div>

        {/* KPI: Monthly Revenue */}
        <motion.div variants={cardVariants} className="card !p-8 flex flex-col justify-between bg-surface/50 border-white/5">
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Current Month</p>
          <div className="mt-6">
            <p className="text-3xl font-syne font-black text-main">{formatINR(stats.monthRev)}</p>
            <p className="text-[10px] text-muted mt-2">Projection: {formatINR(stats.monthRev * 1.4)}</p>
          </div>
        </motion.div>

        {/* 7-DAY CHART */}
        <motion.div variants={cardVariants} className="md:col-span-2 lg:col-span-3 card !p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-syne font-bold text-main">Revenue Velocity (7D)</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] text-muted font-bold uppercase">Daily Total</span>
                 </div>
              </div>
           </div>
           
           <div className="flex items-end justify-between h-48 gap-3 sm:gap-6 px-2">
              {stats.chartData.map((data, i) => {
                const height = (data.revenue / stats.maxRev) * 100
                const isToday = i === 6
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                    {data.revenue > 0 && (
                      <div className="absolute -top-8 px-2 py-1 bg-main text-bg text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {formatINR(data.revenue)}
                      </div>
                    )}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
                      className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${
                        isToday ? 'bg-primary shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-surface border border-border group-hover:border-primary/40'
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

        {/* OUTPUT MIX */}
        <motion.div variants={cardVariants} className="card !p-8 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-main uppercase tracking-widest mb-6">Output Mix</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-muted uppercase">Color (Premium)</span>
                <span className="text-main">{stats.colorPages} pgs</span>
              </div>
              <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.colorPages / Math.max(stats.bwPages + stats.colorPages, 1)) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-muted uppercase">B&W (Standard)</span>
                <span className="text-main">{stats.bwPages} pgs</span>
              </div>
              <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.bwPages / Math.max(stats.bwPages + stats.colorPages, 1)) * 100}%` }}
                  className="h-full bg-slate-500"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-border flex items-center gap-2">
               <IndianRupee size={12} className="text-primary" />
               <p className="text-[10px] text-muted font-medium">Avg ticket: {formatINR(stats.totalRev / Math.max(stats.totalJobs, 1))}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
