import { motion } from 'framer-motion'
import { MapPin, Navigation, Printer } from 'lucide-react'
import { formatDistance } from '../../utils/geo'

export default function ShopCard({ shop, active, onClick }) {
  const openGoogleMaps = (e) => {
    e.stopPropagation()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat || shop.latitude},${shop.lng || shop.longitude}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`border backdrop-blur-xl rounded-2xl p-4 cursor-pointer transition-all active:scale-95 flex items-center gap-4 min-w-[280px] snap-center ${active ? 'bg-white/10 border-cyan/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'bg-surface/40 border-white/10 hover:bg-white/5'}`}
      onClick={() => onClick(shop)}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-cyan/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Printer size={22} className="text-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-syne font-bold text-white truncate">{shop.name}</h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <MapPin size={10} /> {formatDistance(shop.distance)} — Near you
        </p>
        <div className="flex items-baseline gap-2">
           <span className="text-xs font-dm font-semibold text-white">₹{shop.price_bw || 2}/pg</span>
           <span className="text-[10px] text-slate-500 line-through">₹{shop.price_color || 10} color</span>
        </div>
      </div>
      <button
        onClick={openGoogleMaps}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan hover:text-bg hover:border-cyan transition-colors group flex-shrink-0"
        title="Navigate to shop"
      >
        <Navigation size={16} className="text-slate-400 group-hover:text-bg transition-colors" />
      </button>
    </motion.div>
  )
}
