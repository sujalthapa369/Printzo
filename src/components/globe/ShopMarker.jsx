import { motion, AnimatePresence } from 'framer-motion'
import { Printer } from 'lucide-react'

export default function ShopMarker({ shop, active, onClick }) {
  return (
    <div 
      className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 ${active ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-0'}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {/* Glow layer - No pulse when active to avoid irritation */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 opacity-60 blur-md ${active ? 'bg-cyan scale-150' : 'bg-primary scale-150'}`} />
      
      {/* Icon Background */}
      <div className={`relative w-8 h-8 rounded-full border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md ${active ? 'bg-surface' : 'bg-surface/80'}`}>
         <Printer size={14} className={active ? 'text-cyan' : 'text-slate-300'} />
      </div>

      {/* Info Label - shows on hover or active */}
      <AnimatePresence>
         {(active) && (
            <motion.div
               initial={{ opacity: 0, y: 10, scale: 0.8 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="absolute top-10 pointer-events-none whitespace-nowrap bg-surface/90 border border-white/10 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-2xl flex flex-col items-center gap-0.5"
            >
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">{shop.name}</span>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  )
}
