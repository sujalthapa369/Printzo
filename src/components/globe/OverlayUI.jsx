import { motion, AnimatePresence } from 'framer-motion'
import { Printer, MapPin, ArrowRight, QrCode, Star, ArrowLeft } from 'lucide-react'
import ShopCard from './ShopCard'

export default function OverlayUI({ shops, activeShop, onCloseDetails, onShopSelect }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none flex flex-col items-center">
      {/* Horizontal Scroller */}
      <div className="w-full max-w-5xl px-4 py-6 overflow-x-auto snap-x snap-mandatory flex gap-4 scroll-smooth no-scrollbar pointer-events-auto">
        <AnimatePresence>
          {shops.map((shop, i) => (
            <motion.div
              key={shop.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <ShopCard 
                shop={shop} 
                active={activeShop?.id === shop.id}
                onClick={onShopSelect} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {activeShop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 pointer-events-auto flex items-center justify-center p-6"
            onClick={onCloseDetails}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-surface border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl glass-bright"
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
                
                {/* Overlay Text over Map */}
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
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">B&W Print</span>
                      <span className="text-xl font-dm font-bold text-white">₹{activeShop.price_bw || 2}<span className="text-xs opacity-50">/pg</span></span>
                   </div>
                   <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Color Print</span>
                      <span className="text-xl font-dm font-bold text-white">₹{activeShop.price_color || 10}<span className="text-xs opacity-50">/pg</span></span>
                   </div>
                </div>

                <div className="flex gap-3">
                  <button className="btn-secondary flex-[0.7] justify-center py-3.5 rounded-xl font-bold">
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                  </button>
                  <a 
                    href={`/shop/${activeShop.id}`}
                    className="btn-cyan flex-[2] justify-center py-3.5 rounded-xl font-bold gap-2 text-sm shadow-lg shadow-cyan/20"
                  >
                    <QrCode size={16} />
                    Scan & Print Here
                    <ArrowRight size={16} />
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
