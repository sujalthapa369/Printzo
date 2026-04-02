import { motion, AnimatePresence } from 'framer-motion'
import { Printer } from 'lucide-react'

export default function ShopMarker({ shop, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all ${active ? 'z-50' : 'z-auto'}`}
    >
      <div className={`relative w-8 h-8 flex items-center justify-center transition-all ${active ? 'scale-125' : 'scale-100 hover:scale-110'}`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full bg-cyan transition-all opacity-40 blur-lg animate-pulse-slow ${active ? 'scale-150' : 'scale-110'}`} />
        
        {/* Border / Shadow */}
        <div className="absolute inset-0 rounded-full border border-white/20 bg-surface shadow-2xl" />
        
        {/* The Icon */}
        <Printer size={14} className={active ? 'text-primary' : 'text-cyan'} />
        
        {/* Active badge */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface animate-bounce"
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Name Label */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface/80 border border-border backdrop-blur-xl px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-2xl pointer-events-none"
          >
            {shop.name}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
