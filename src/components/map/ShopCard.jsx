import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Printer, Navigation } from 'lucide-react'
import { formatDistance } from '../../utils/geo'

export default function ShopCard({ shop, distance, onShowOnMap }) {
  const openGoogleMaps = (e) => {
    e.stopPropagation()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat || shop.latitude},${shop.lng || shop.longitude}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-surface/50 border border-border backdrop-blur-xl rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/5 active:scale-95 flex items-center gap-4 min-w-[280px]"
      onClick={() => onShowOnMap(shop)}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-cyan/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Printer size={22} className="text-cyan animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-syne font-bold text-white truncate">{shop.name}</h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <MapPin size={10} /> {formatDistance(distance)} — Near you
        </p>
        <div className="flex items-baseline gap-2">
           <span className="text-xs font-dm font-semibold text-white">₹{shop.price_bw || 2}/pg</span>
           <span className="text-[10px] text-slate-500 line-through">₹{shop.price_color || 10} color</span>
        </div>
      </div>
      <button
        onClick={openGoogleMaps}
        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors group flex-shrink-0"
        title="Navigate"
      >
        <Navigation size={14} className="text-slate-400 group-hover:text-primary" />
      </button>
    </motion.div>
  )
}
