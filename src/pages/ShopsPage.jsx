import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Search, Printer, Star, ArrowRight, QrCode, SlidersHorizontal, Sparkles } from 'lucide-react'
import { getAllShops } from '../firebase/db'
import Navbar from '../components/Navbar'
import Map3D from '../components/map/Map3D'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function ShopsPage() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => { loadShops() }, [])

  const loadShops = async () => {
    try {
      const data = await getAllShops()
      setShops(data.filter(s => s.status === 'active'))
    } catch { toast.error('Failed to load shops') }
    finally { setLoading(false) }
  }

  const filtered = shops.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      {/* 🏟️ Map Hero Section */}
      <div className="relative pt-24 px-4 max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-64px)]">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-8 flex flex-col md:flex-row items-end justify-between gap-4 flex-shrink-0"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-[10px] font-bold tracking-widest uppercase">
                 Nearby Shops
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">LIVE TRACKING</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-syne font-bold text-main tracking-tight">
              Find <span className="text-gradient">Print Shops</span>
            </h1>
          </div>
        </motion.div>

        {/* The Map Component taking remaining height */}
        <div className="flex-1 w-full relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
           <Map3D shops={shops} />
        </div>
      </div>
    </div>
  )
}
