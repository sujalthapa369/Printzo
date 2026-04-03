import { useState, useEffect, useMemo } from 'react'
import { getShopJobHistory } from '../firebase/db'
import { TrendingUp, FileText, IndianRupee, Layers, Calendar } from 'lucide-react'
import { formatINR } from '../utils/helpers'

export default function AnalyticsPanel({ shopId }) {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    if (shopId) {
      // Fetch up to 500 recent jobs for local analytic computation
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
    today.setHours(0,0,0,0) // Start of today

    // Initialize last 7 days so chart always has 7 bars
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      dailyMap[dateStr] = 0
    }

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    jobs.forEach(job => {
      // Safely parse Firestore timestamp or ISO string
      const date = job.createdAt?.toDate ? job.createdAt.toDate() : new Date(job.createdAt || Date.now())
      
      const amt = job.amount || 0
      totalRev += amt
      
      // Page splits
      if (job.mode === 'color') color += (job.pages || 0)
      else bw += (job.pages || 0)

      // Today
      const jDate = new Date(date)
      jDate.setHours(0,0,0,0)
      if (jDate.getTime() === today.getTime()) {
        todayRev += amt
      }

      // This Month
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        monthRev += amt
      }

      // 7-day Chart Distribution
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

    // Find max for scaling
    const maxRev = Math.max(...chartData.map(d => d.revenue), 1) // prevent div by 0

    return { todayRev, monthRev, totalRev, bw, color, chartData, maxRev, totalJobs: jobs.length }
  }, [jobs])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="spinner mb-3" />
        <p className="text-slate-400 text-sm">Aggregating analytics…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-syne font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-cyan" /> Shop Analytics
        </h2>
        <span className="text-xs px-3 py-1 bg-surface border border-border text-slate-400 rounded-full font-medium flex items-center gap-1">
          <Calendar size={12} /> Last 30 Days
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium flex items-center gap-1.5 mb-2">
            <IndianRupee size={12} /> Daily Revenue
          </p>
          <p className="text-2xl font-syne font-bold text-emerald-400">{formatINR(stats.todayRev)}</p>
        </div>
        
        <div className="card p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium flex items-center gap-1.5 mb-2">
            <IndianRupee size={12} /> Monthly Revenue
          </p>
          <p className="text-2xl font-syne font-bold text-white">{formatINR(stats.monthRev)}</p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium flex items-center gap-1.5 mb-2">
            <FileText size={12} /> Total Jobs
          </p>
          <p className="text-2xl font-syne font-bold text-white">{stats.totalJobs}</p>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium gap-1.5 mb-2 flex items-center">
            <Layers size={12} /> Pages Printed
          </p>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300">⬛ B&W: <span className="text-white font-bold">{stats.bw}</span></span>
            <span className="text-cyan">🎨 Col: <span className="text-cyan font-bold">{stats.color}</span></span>
          </div>
          {/* Progress Bar rep */}
          <div className="w-full bg-surface h-1.5 rounded-full mt-2 flex overflow-hidden">
            <div className="bg-slate-400 h-full" style={{ width: `${(stats.bw / Math.max(stats.bw + stats.color, 1)) * 100}%` }} />
            <div className="bg-cyan h-full" style={{ width: `${(stats.color / Math.max(stats.bw + stats.color, 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Tailwind Bar Chart (Last 7 Days) */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-6">Revenue - Last 7 Days</h3>
        <div className="flex items-end justify-between h-48 gap-2 pt-4 border-b border-border/50 pb-2">
          {stats.chartData.map((data, i) => {
            const heightPercent = Math.max((data.revenue / stats.maxRev) * 100, 2); // Min 2% height so bar is visible
            return (
              <div key={i} className="flex flex-col items-center flex-1 group">
                {/* Tooltip on hover */}
                <span className="text-[10px] text-cyan font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                  {formatINR(data.revenue)}
                </span>
                
                {/* The Bar */}
                <div className="w-full relative max-w-[2.5rem] flex items-end">
                  <div 
                    className={`w-full rounded-t-md transition-all duration-500 hover:bg-cyan/80 ${
                      i === 6 ? 'bg-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-primary/40'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-3 px-1">
          {stats.chartData.map((data, i) => (
            <span key={i} className={`text-[10px] font-medium flex-1 text-center ${i === 6 ? 'text-cyan' : 'text-slate-500'}`}>
              {data.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
