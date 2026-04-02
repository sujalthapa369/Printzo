import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF, OverlayViewF } from '@react-google-maps/api'
import { calculateDistance, formatDistance } from '../../utils/geo'
import MapOverlay from './MapOverlay'
import toast from 'react-hot-toast'

const MOCK_SHOPS = [
  { id: '1', name: "QuickPrint Central", lat: 28.6139, lng: 77.2090, price_bw: 2, price_color: 8, address: "Connaught Place, Block E", city: "New Delhi" },
  { id: '2', name: "Spark Copy & Prints", lat: 28.6155, lng: 77.2105, price_bw: 1.5, price_color: 10, address: "Harsha Bhawan", city: "New Delhi" },
  { id: '3', name: "Digital Hub", lat: 28.6105, lng: 77.2050, price_bw: 5, price_color: 15, address: "Janpath Rd", city: "New Delhi" },
  { id: '4', name: "Prime Print Gallery", lat: 28.6200, lng: 77.2150, price_bw: 3, price_color: 12, address: "Gole Market", city: "New Delhi" },
]

const CITIES = [
  { name: 'My Location (GPS)', lat: null, lng: null },
  { name: 'New Delhi, IN', lat: 28.6139, lng: 77.2090 },
  { name: 'New York, US', lat: 40.7128, lng: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
]

const STYLES = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
]

const containerStyle = { width: '100%', height: '100%' }

export default function Map3D({ shops: initialShops = [] }) {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY })

  const [map, setMap] = useState(null)
  const [userLoc, setUserLoc] = useState(CITIES[1])
  const [selectedCity, setSelectedCity] = useState(CITIES[1].name)
  const [activeShop, setActiveShop] = useState(null)
  
  const handleCityChange = async (e) => {
     const cityName = e?.target?.value || e
     const city = CITIES.find(c => c.name === cityName)
     if (!city) return
     
     setSelectedCity(city.name)
     setActiveShop(null)

     if (city.lat === null) {
        if ('geolocation' in navigator) {
            toast.loading('Locating Device...', { id: 'geo' })
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                 toast.success('Location found!', { id: 'geo' })
                 const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                 setUserLoc(loc)
                 map?.panTo(loc)
                 map?.setZoom(16)
              },
              (err) => toast.error('Location denied.', { id: 'geo' }),
              { enableHighAccuracy: true }
            )
        }
     } else {
        const loc = { lat: city.lat, lng: city.lng }
        setUserLoc(loc)
        map?.panTo(loc)
        map?.setZoom(14)
     }
  }

  const processedShops = useMemo(() => {
    const baseShops = initialShops.length > 0 ? initialShops : MOCK_SHOPS
    return baseShops.map(shop => {
      const lat = parseFloat(shop.lat || shop.latitude || 28.6139)
      const lng = parseFloat(shop.lng || shop.longitude || 77.2090)
      const dist = userLoc ? calculateDistance(userLoc.lat, userLoc.lng, lat, lng) : 999
      return { ...shop, lat, lng, distance: dist }
    }).sort((a, b) => a.distance - b.distance)
  }, [initialShops, userLoc])

  const onLoad = useCallback(function callback(map) {
    setMap(map)
    setTimeout(() => handleCityChange('My Location (GPS)'), 1500)
  }, [])

  const handleMarkerClick = (shop) => {
    setActiveShop(shop)
    map?.panTo({ lat: shop.lat, lng: shop.lng })
    map?.setZoom(17)
  }

  if (!isLoaded) return <div className="absolute inset-0 bg-bg" />

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden group">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLoc ? { lat: userLoc.lat, lng: userLoc.lng } : { lat: 28.6139, lng: 77.2090 }}
        zoom={14}
        onLoad={onLoad}
        options={{ 
          styles: STYLES, 
          disableDefaultUI: true, 
          tilt: 45, 
          mapTypeId: 'roadmap',
          gestureHandling: 'greedy'
        }}
      >
        {/* Connection Polyline */}
        {activeShop && userLoc && (
           <PolylineF
             path={[
               { lat: userLoc.lat, lng: userLoc.lng },
               { lat: activeShop.lat, lng: activeShop.lng }
             ]}
             options={{
               strokeColor: '#22d3ee',
               strokeOpacity: 0.8,
               strokeWeight: 2,
               icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 }, offset: '0', repeat: '12px' }],
             }}
           />
        )}

        {/* User Location Pin */}
        {userLoc && (
           <MarkerF
             position={{ lat: userLoc.lat, lng: userLoc.lng }}
             zIndex={100}
             icon={{
               path: google.maps.SymbolPath.CIRCLE,
               scale: 8,
               fillColor: "#34d399",
               fillOpacity: 1,
               strokeWeight: 3,
               strokeColor: "#ffffff",
             }}
             title="Your Location"
           />
        )}

        {/* Shop Pins (Switching to MarkerF for reliability) */}
        {processedShops.map(shop => {
           const isActive = activeShop?.id === shop.id
           return (
             <MarkerF
               key={shop.id}
               position={{ lat: shop.lat, lng: shop.lng }}
               onClick={() => handleMarkerClick(shop)}
               zIndex={isActive ? 150 : 50}
               icon={{
                 path: "M12 4H4C2.9 4 2 4.9 2 6V12C2 13.1 2.9 14 4 14H12C13.1 14 14 13.1 14 12V6C14 4.9 13.1 4 12 4M12 12H4V6H12V12M15 8V10H17V8H15M15 11V13H17V11H15M2 15V17C2 18.1 2.9 19 4 19H12C13.1 19 14 18.1 14 17V15H2Z", // Printer-ish SVG
                 fillColor: isActive ? "#06b6d4" : "#22d3ee",
                 fillOpacity: 1,
                 strokeWeight: 1,
                 strokeColor: "#ffffff",
                 scale: 1.5,
                 anchor: new google.maps.Point(8, 8)
               }}
             />
           )
        })}

        {/* Floating Distance Tooltip (Using OverlayViewF for the active shop name/distance) */}
        {activeShop && (
           <OverlayViewF
              position={{ lat: activeShop.lat, lng: activeShop.lng }}
              mapPaneName={OverlayViewF.FLOAT_PANE}
           >
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-cyan/90 border border-cyan/40 backdrop-blur-xl px-2 py-1 rounded-lg text-white font-syne font-bold text-[10px] shadow-2xl z-[200] whitespace-nowrap pointer-events-none">
                 {activeShop.name} ({formatDistance(activeShop.distance)})
              </div>
           </OverlayViewF>
        )}
      </GoogleMap>

      {/* Top UI Overlay */}
      <div className="absolute top-6 left-6 z-[60] flex items-center gap-4">
          <div className="glass border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-2xl backdrop-blur-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <select className="bg-transparent text-sm font-syne font-bold text-white outline-none cursor-pointer pr-4" value={selectedCity} onChange={handleCityChange}>
                {CITIES.map(c => <option key={c.name} value={c.name} className="bg-surface text-white">{c.name}</option>)}
             </select>
          </div>
      </div>

      <MapOverlay 
        shops={processedShops} 
        userLocation={userLoc} 
        activeShop={activeShop} 
        onShowOnMap={handleMarkerClick} 
        onCloseDetails={() => setActiveShop(null)} 
      />
    </div>
  )
}
