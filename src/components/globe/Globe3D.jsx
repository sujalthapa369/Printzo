import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { calculateDistance } from '../../utils/geo'
import OverlayUI from './OverlayUI'
import ShopMarker from './ShopMarker'

const GLOBE_RADIUS = 2

// Helper: Lat/Lng to 3D position
function getCoords(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = (radius * Math.sin(phi) * Math.sin(theta))
  const y = (radius * Math.cos(phi))
  return new THREE.Vector3(x, y, z)
}

// 🌍 Earth Component
const Earth = ({ shops, activeShop, onShopClick, userLoc }) => {
  return (
    <group>
        {/* Base Solid Sphere */}
        <mesh>
             <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
             <meshStandardMaterial 
                 color="#050C1A" 
                 emissive="#020617"
                 roughness={0.6}
                 metalness={0.5}
             />
        </mesh>
        
        {/* Holographic Wireframe Layer */}
        <mesh>
             <sphereGeometry args={[GLOBE_RADIUS + 0.01, 32, 32]} />
             <meshBasicMaterial color="#0EA5E9" wireframe={true} transparent={true} opacity={0.15} />
        </mesh>

        {/* Render shop markers on the globe */}
        {shops.map((shop) => {
            const pos = getCoords(shop.lat, shop.lng, GLOBE_RADIUS)
            return (
            <mesh key={shop.id} position={pos}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshBasicMaterial color="#06B6D4" />
                <Html center distanceFactor={15} zIndexRange={[100, 0]}>
                   <ShopMarker 
                       shop={shop} 
                       active={activeShop?.id === shop.id} 
                       onClick={() => onShopClick(shop)} 
                   />
                </Html>
            </mesh>
            )
        })}
        
        {/* User Location Marker */}
        {userLoc && (
           <mesh position={getCoords(userLoc.lat, userLoc.lng, GLOBE_RADIUS)}>
              <Html center distanceFactor={15}>
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex flex-col items-center justify-center animate-pulse-slow">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[8px] font-bold text-primary mt-1 uppercase tracking-widest absolute top-8 whitespace-nowrap bg-surface/80 rounded-md px-1">You</span>
                  </div>
              </Html>
           </mesh>
        )}
    </group>
  )
}

const CITIES = [
  { name: 'My Location (GPS)', lat: null, lng: null }, // Null triggers GPS
  { name: 'New Delhi, IN', lat: 28.6139, lng: 77.2090 },
  { name: 'New York, US', lat: 40.7128, lng: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
]

export default function Globe3D({ shops: initialShops = [] }) {
  const [userLoc, setUserLoc] = useState(CITIES[1]) // Default to New Delhi
  const [activeShop, setActiveShop] = useState(null)
  const [selectedCity, setSelectedCity] = useState(CITIES[1].name)
  const controlsRef = useRef()

  const handleCityChange = (e) => {
     const city = CITIES.find(c => c.name === e.target.value)
     setSelectedCity(city.name)
     setActiveShop(null)

     if (city.lat === null) {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              (err) => console.log('Location denied', err)
            )
        }
     } else {
        setUserLoc({ lat: city.lat, lng: city.lng })
     }
  }

  // 1. Initial Setup Geolocation (optional, default to Delhi)
  useEffect(() => {
     // Start with New Delhi by default, but wait 2 sec then ask GPS to not block immediate render
     const timer = setTimeout(() => {
        handleCityChange({ target: { value: 'My Location (GPS)' } })
     }, 2000)
     return () => clearTimeout(timer)
  }, [])

  // 2. Compute Distances & Merge Data
  const processedShops = useMemo(() => {
    const MOCK_SHOPS = [
      { id: '1', name: "QuickPrint Central", lat: 28.6139, lng: 77.2090, price_bw: 2, price_color: 8, address: "Connaught Place", city: "New Delhi" },
      { id: '2', name: "Spark PrintHub", lat: 28.5120, lng: 77.2105, price_bw: 1.5, price_color: 10, address: "Saket", city: "New Delhi" },
      { id: '3', name: "NY Digital Copies", lat: 40.7128, lng: -74.0060, price_bw: 5, price_color: 15, address: "Broadway", city: "New York" },
      { id: '4', name: "London Swift Print", lat: 51.5074, lng: -0.1278, price_bw: 3, price_color: 12, address: "Soho", city: "London" },
    ]
    const base = initialShops.length > 0 ? initialShops : MOCK_SHOPS
    return base.map(shop => {
      const lat = shop.lat || shop.latitude || 28.6139
      const lng = shop.lng || shop.longitude || 77.2090
      const dist = userLoc ? calculateDistance(userLoc.lat, userLoc.lng, lat, lng) : 999
      return { ...shop, lat, lng, distance: dist }
    }).sort((a, b) => a.distance - b.distance)
  }, [initialShops, userLoc])

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1.5 }}
      className="relative w-full h-[70vh] min-h-[500px] overflow-hidden rounded-3xl group bg-bg border border-white/5 shadow-2xl"
    >
        {/* Site Selection Dropdown Overlay */}
        <div className="absolute top-6 left-6 z-20">
            <div className="glass border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-2xl backdrop-blur-xl">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
               <select 
                  className="bg-transparent text-sm font-syne font-bold text-white outline-none cursor-pointer appearance-none pr-4"
                  value={selectedCity}
                  onChange={handleCityChange}
               >
                  {CITIES.map(c => (
                     <option key={c.name} value={c.name} className="bg-surface text-white p-2">
                        {c.name}
                     </option>
                  ))}
               </select>
               <svg className="w-3 h-3 text-slate-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0A192F]/40 via-bg to-bg" />

        <div className="absolute inset-0 cursor-move">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#06B6D4" />
                
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                
                {/* Free Dragging & Auto-Rotation! */}
                <OrbitControls 
                   ref={controlsRef}
                   enableZoom={true} 
                   minDistance={2.5} 
                   maxDistance={10} 
                   autoRotate={!activeShop} // Pauses spin when viewing a shop
                   autoRotateSpeed={0.5} 
                   makeDefault 
                />
                
                <React.Suspense fallback={null}>
                    <Earth 
                        shops={processedShops} 
                        activeShop={activeShop} 
                        onShopClick={setActiveShop} 
                        userLoc={userLoc}
                    />
                </React.Suspense>
            </Canvas>
        </div>

        <OverlayUI 
            shops={processedShops} 
            activeShop={activeShop} 
            onCloseDetails={() => setActiveShop(null)}
            onShopSelect={setActiveShop}
        />
    </motion.div>
  )
}
