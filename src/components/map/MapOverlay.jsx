import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Filter, SlidersHorizontal, ArrowLeft, ArrowRight, Star, QrCode } from 'lucide-react'
import ShopCard from './ShopCard'

export default function MapOverlay({ 
  shops, 
  userLocation, 
  activeShop, 
  onShowOnMap, 
  onCloseDetails 
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-50 p-6 pointer-events-none flex flex-col items-center">
      {/* Horizontal Shop Scroller */}
      <div className="w-full max-w-4xl flex gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {shops.map(shop => (
            <motion.div
              layout
              key={shop.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <ShopCard 
                shop={shop} 
                distance={shop.distance} 
                onShowOnMap={onShowOnMap}
                active={activeShop?.id === shop.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Background Dim for Details (Conditional) */}
      <AnimatePresence>
        {activeShop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center p-6"
            onClick={onCloseDetails}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.2)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-48 bg-gradient-to-br from-primary/80 to-cyan/80 flex flex-col justify-end overflow-hidden">
                {/* Embedded Google Maps - 100% Free Exact Location Targeting */}
                <iframe 
                   title="Shop Map Location"
                   width="100%" 
                   height="100%" 
                   frameBorder="0" 
                   scrolling="no" 
                   marginHeight="0" 
                   marginWidth="0" 
                   src={`https://maps.google.com/maps?q=${activeShop.lat},${activeShop.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                   className="absolute inset-0 z-0 opacity-80 mix-blend-luminosity brightness-75 transition-all hover:opacity-100 hover:mix-blend-normal hover:brightness-100"
                />
                
                {/* Overlay layer over iframe */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-6 z-10">
                    <button 
                      onClick={onCloseDetails}
                      className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center hover:bg-black/60 transition-colors border border-white/20 shadow-xl"
                    >
                      <ArrowLeft size={16} className="text-white" />
                    </button>
                    
                    <h2 className="text-2xl font-syne font-bold text-white tracking-tight drop-shadow-md">{activeShop.name}</h2>
                    <p className="text-white/90 text-sm flex items-center gap-1.5 drop-shadow-md">
                       <MapPin size={14} />
                       {[activeShop.address, activeShop.city].filter(Boolean).join(', ')}
                    </p>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-white/5 mx-auto w-full border border-white/10 flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">B&W Print</span>
                      <span className="text-lg font-dm font-bold text-white">₹{activeShop.price_bw || 2} <span className="text-xs opacity-50">/ pg</span></span>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Color Print</span>
                      <span className="text-lg font-dm font-bold text-white">₹{activeShop.price_color || 10} <span className="text-xs opacity-50">/ pg</span></span>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button className="btn-secondary flex-1 justify-center py-4 rounded-2xl font-bold gap-2">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    Reviews
                  </button>
                  <a 
                    href={`/shop/${activeShop.id}`}
                    className="btn-cyan flex-[2] justify-center py-4 rounded-2xl font-bold gap-2"
                  >
                    <QrCode size={18} />
                    Scan & Print
                    <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
