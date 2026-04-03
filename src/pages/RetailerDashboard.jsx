import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Printer, QrCode, Settings, BarChart3, Plus, Trash2,
  Wifi, Usb, Bluetooth, RefreshCw, Save, Package, Clock, CheckCircle, XCircle,
} from 'lucide-react'
import {
  getShopByOwner, createShop, updateShop, addPrinter,
  updatePrinter, deletePrinter, getPrintersByShop,
  subscribeToShopJobs, getShopJobHistory, subscribeToUserData,
} from '../firebase/db'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import AnalyticsPanel from '../components/AnalyticsPanel'
import QRCodeDisplay from '../components/QRCodeDisplay'
import JobCard from '../components/JobCard'
import { formatINR, shortDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'queue', label: 'Live Queue', icon: Clock },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'printers', label: 'Printers', icon: Printer },
  { key: 'qr', label: 'QR Code', icon: QrCode },
  { key: 'settings', label: 'Settings', icon: Settings },
]

const defaultShopForm = { name: '', address: '', city: '', upiId: '', phone: '', lat: 28.6139, lng: 77.2090 }
const defaultPrinterForm = { name: '', connectionType: 'usb', supportsColor: false, priceBW: 2, priceColor: 8, instantMultiplier: 3 }

export default function RetailerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [shop, setShop] = useState(null)
  const [printers, setPrinters] = useState([])
  const [loadingInit, setLoadingInit] = useState(true)
  const [tab, setTab] = useState('queue')
  const [jobs, setJobs] = useState([])
  const [shopForm, setShopForm] = useState(defaultShopForm)
  const [printerForm, setPrinterForm] = useState(defaultPrinterForm)
  const [savingShop, setSavingShop] = useState(false)
  const [addingPrinter, setAddingPrinter] = useState(false)
  const [showPrinterForm, setShowPrinterForm] = useState(false)

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (!shop?.id) return
    const unsub = subscribeToShopJobs(shop.id, setJobs)
    return () => unsub()
  }, [shop?.id])

  const init = async () => {
    try {
      const existingShop = await getShopByOwner(user.uid)
      if (existingShop) {
        setShop(existingShop)
        setShopForm({
          name: existingShop.name || '',
          address: existingShop.address || '',
          city: existingShop.city || '',
          upiId: existingShop.upiId || '',
          phone: existingShop.phone || '',
          lat: existingShop.lat || 28.6139,
          lng: existingShop.lng || 77.2090,
        })
        const printerData = await getPrintersByShop(existingShop.id)
        setPrinters(printerData)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load shop data')
    } finally {
      setLoadingInit(false)
    }
  }

  const handleSaveShop = async () => {
    if (!shopForm.name.trim()) { toast.error('Shop name is required'); return }
    setSavingShop(true)
    
    try {
      // 📍 Extract Geolocation Automatically when Registering
      let finalShopData = { ...shopForm }
      
      if (!shop) {
         toast.loading('Acquiring store GPS coordinates...', { id: 'save-shop' })
         const geoData = await new Promise((resolve) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  (err) => {
                     toast.error('Location denied! Store will fallback to generic coordinates.', { id: 'save-shop' })
                     resolve(null)
                  },
                  { enableHighAccuracy: true }
                )
            } else resolve(null)
         })
         if (geoData) {
            finalShopData.lat = geoData.lat
            finalShopData.lng = geoData.lng
            toast.success('GPS locked securely!', { id: 'save-shop' })
         }
      }

      if (shop) {
        await updateShop(shop.id, finalShopData)
        setShop(prev => ({ ...prev, ...finalShopData }))
        toast.success('Shop updated!')
      } else {
        const shopId = await createShop(user.uid, finalShopData)
        const newShop = { id: shopId, ...finalShopData, status: 'active' }
        setShop(newShop)
        toast.success('Shop created successfully!', { id: 'save-shop' })
        setTab('qr')
      }
    } catch { toast.error('Failed to save shop') }
    finally { setSavingShop(false) }
  }

  const handleAddPrinter = async () => {
    if (!printerForm.name.trim()) { toast.error('Printer name required'); return }
    setAddingPrinter(true)
    try {
      const printerId = await addPrinter(shop.id, printerForm)
      setPrinters(prev => [...prev, { id: printerId, shopId: shop.id, ...printerForm, status: 'online' }])
      setPrinterForm(defaultPrinterForm)
      setShowPrinterForm(false)
      toast.success('Printer added!')
    } catch { toast.error('Failed to add printer') }
    finally { setAddingPrinter(false) }
  }

  const handleDeletePrinter = async (printerId) => {
    if (!window.confirm('Remove this printer?')) return
    try {
      await deletePrinter(printerId)
      setPrinters(prev => prev.filter(p => p.id !== printerId))
      toast.success('Printer removed')
    } catch { toast.error('Failed to remove printer') }
  }

  const togglePrinterStatus = async (printer) => {
    const newStatus = printer.status === 'online' ? 'offline' : 'online'
    try {
      await updatePrinter(printer.id, { status: newStatus })
      setPrinters(prev => prev.map(p => p.id === printer.id ? { ...p, status: newStatus } : p))
    } catch { toast.error('Failed to update printer status') }
  }

  if (loadingInit) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-syne font-bold text-main">
              {shop ? shop.name : 'Setup Your Shop'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {shop ? 'Retailer Dashboard' : 'Complete your shop profile to get started'}
            </p>
          </div>
          {shop && (
            <div className="flex items-center gap-2">
              <div className="pulse-dot" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
          )}
        </div>

        {/* If no shop, show setup first */}
        {!shop ? (
          <div className="max-w-md">
            <div className="card mb-6">
              <h2 className="text-lg font-syne font-bold text-main mb-4">Create Your Shop</h2>
              <ShopForm form={shopForm} setForm={setShopForm} />
              <button onClick={handleSaveShop} disabled={savingShop} className="btn-primary w-full justify-center mt-4">
                {savingShop ? <span className="spinner" /> : <><Save size={14} /> Create Shop</>}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-6 overflow-x-auto">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    tab === key ? 'bg-primary text-bg shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* ── QUEUE ────────────────────────────── */}
            {tab === 'queue' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-300">Live Print Queue</h2>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">{jobs.length} Pending</span>
                </div>
                
                {jobs.length === 0 ? (
                  <div className="card text-center py-10">
                    <Clock size={36} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400">Waiting for new print requests...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ANALYTICS ─────────────────────────── */}
            {tab === 'analytics' && (
              <AnalyticsPanel shopId={shop.id} />
            )}

            {/* ── PRINTERS ─────────────────────────── */}
            {tab === 'printers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-300">Configured Printers</h2>
                  <button
                    onClick={() => setShowPrinterForm(!showPrinterForm)}
                    className="btn-primary text-sm py-2 px-3"
                  >
                    <Plus size={13} /> Add Printer
                  </button>
                </div>

                {/* Add printer form */}
                {showPrinterForm && (
                  <div className="card border-primary/20 bg-primary/5">
                    <h3 className="text-sm font-syne font-bold text-main mb-4">New Printer</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Printer Name</label>
                        <input placeholder="e.g. HP LaserJet" value={printerForm.name} onChange={e => setPrinterForm(p => ({...p, name: e.target.value}))} className="input text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Connection</label>
                        <select value={printerForm.connectionType} onChange={e => setPrinterForm(p => ({...p, connectionType: e.target.value}))} className="input text-sm">
                          <option value="usb">USB</option>
                          <option value="wifi">Wi-Fi</option>
                          <option value="bluetooth">Bluetooth</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">B&W Price (₹/page)</label>
                        <input type="number" min={1} value={printerForm.priceBW} onChange={e => setPrinterForm(p => ({...p, priceBW: Number(e.target.value)}))} className="input text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Color Price (₹/page)</label>
                        <input type="number" min={1} value={printerForm.priceColor} onChange={e => setPrinterForm(p => ({...p, priceColor: Number(e.target.value)}))} className="input text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Instant Multiplier (×)</label>
                        <input type="number" min={1} max={10} value={printerForm.instantMultiplier} onChange={e => setPrinterForm(p => ({...p, instantMultiplier: Number(e.target.value)}))} className="input text-sm" />
                      </div>
                      <div className="flex items-center gap-3 pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div
                            onClick={() => setPrinterForm(p => ({...p, supportsColor: !p.supportsColor}))}
                            className={`w-10 h-5.5 rounded-full border transition-all cursor-pointer ${printerForm.supportsColor ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                            style={{ width: 40, height: 22 }}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform m-0.5 ${printerForm.supportsColor ? 'translate-x-4' : 'translate-x-0'}`} style={{ width: 18, height: 18 }} />
                          </div>
                          <span className="text-sm text-slate-300">Supports Color</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddPrinter} disabled={addingPrinter} className="btn-primary text-sm py-2">
                        {addingPrinter ? <span className="spinner" /> : <><Plus size={13} /> Add Printer</>}
                      </button>
                      <button onClick={() => setShowPrinterForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Printer list */}
                {printers.length === 0 && !showPrinterForm ? (
                  <div className="card text-center py-10">
                    <Printer size={36} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 mb-3">No printers configured</p>
                    <button onClick={() => setShowPrinterForm(true)} className="btn-primary justify-center text-sm">
                      <Plus size={13} /> Add Your First Printer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {printers.map(printer => {
                      const ConnIcon = printer.connectionType === 'wifi' ? Wifi : printer.connectionType === 'bluetooth' ? Bluetooth : Usb
                      return (
                        <div key={printer.id} className="card">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center flex-shrink-0">
                                <Printer size={18} className={printer.status === 'online' ? 'text-cyan' : 'text-slate-600'} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-main">{printer.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <ConnIcon size={10} /> {printer.connectionType}
                                  </span>
                                  {printer.supportsColor && <span className="text-xs text-slate-500">🎨 Color</span>}
                                </div>
                                <div className="flex gap-3 mt-2 text-xs">
                                  <span className="text-slate-400">B&W: <span className="text-white font-medium">₹{printer.priceBW}/pg</span></span>
                                  {printer.supportsColor && <span className="text-slate-400">Color: <span className="text-white font-medium">₹{printer.priceColor}/pg</span></span>}
                                  <span className="text-slate-400">Instant: <span className="text-amber-400 font-medium">{printer.instantMultiplier}×</span></span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePrinterStatus(printer)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                  printer.status === 'online'
                                    ? 'tag-completed'
                                    : 'text-slate-500 border-border bg-surface'
                                }`}
                              >
                                {printer.status === 'online' ? 'Online' : 'Offline'}
                              </button>
                              <button onClick={() => handleDeletePrinter(printer.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── QR CODE ──────────────────────────── */}
            {tab === 'qr' && (
              <div className="flex flex-col items-center py-6">
                <h2 className="text-lg font-syne font-bold text-main mb-2">Your Shop QR Code</h2>
                <p className="text-sm text-slate-400 mb-8 text-center max-w-sm">
                  Place this at your counter. Customers scan to upload documents and start printing.
                </p>
                <QRCodeDisplay shopId={shop.id} shopName={shop.name} size={260} />
              </div>
            )}

            {/* ── SETTINGS ─────────────────────────── */}
            {tab === 'settings' && (
              <div className="max-w-md space-y-5">
                <h2 className="text-sm font-semibold text-slate-300">Shop Settings</h2>
                <div className="card">
                  <h3 className="text-sm font-syne font-bold text-main mb-4">Shop Information</h3>
                  <ShopForm form={shopForm} setForm={setShopForm} />
                  <button onClick={handleSaveShop} disabled={savingShop} className="btn-primary w-full justify-center mt-4">
                    {savingShop ? <span className="spinner" /> : <><Save size={14} /> Save Changes</>}
                  </button>
                </div>
                <div className="card border-border/50 bg-transparent">
                  <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Shop ID</p>
                  <p className="font-mono text-xs text-slate-400 bg-surface border border-border rounded-lg p-2.5 break-all">{shop.id}</p>
                  <p className="text-xs text-slate-600 mt-2">Used for QR code generation and API calls.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Reusable shop form
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'

const STYLES = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
]

function LocationPicker({ lat, lng, onChange }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  })

  const [map, setMap] = useState(null)

  const handleGPS = () => {
    toast.loading('Capturing GPS Coordinates...', { id: 'gps' })
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            toast.success('Location locked!', { id: 'gps' })
            onChange(pos.coords.latitude, pos.coords.longitude)
            map?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          },
          () => toast.error('Browser Location blocked.', { id: 'gps' }),
          { enableHighAccuracy: true }
        )
    }
  }

  const onMapClick = (e) => {
    onChange(e.latLng.lat(), e.latLng.lng())
  }

  if (!isLoaded) return <div className="w-full h-48 bg-surface border border-border animate-pulse rounded-xl" />

  return (
    <div className="space-y-2 mt-4 pb-2">
      <div className="flex items-center justify-between pb-1">
         <label className="text-xs text-slate-400 block">Pin Exact Map Location *</label>
         <button type="button" onClick={handleGPS} className="text-[10px] bg-cyan/20 border border-cyan/30 hover:bg-cyan/30 transition-colors text-cyan px-2 py-1 rounded-md flex items-center gap-1 font-bold">
            <MapPin size={10} /> Auto GPS Focus
         </button>
      </div>
      <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 relative shadow-inner">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: lat || 28.6139, lng: lng || 77.2090 }}
          zoom={15}
          options={{ styles: STYLES, disableDefaultUI: true, zoomControl: false }}
          onLoad={setMap}
          onClick={onMapClick}
        >
          <MarkerF
            position={{ lat: lat || 28.6139, lng: lng || 77.2090 }}
            draggable={true}
            onDragEnd={(e) => onChange(e.latLng.lat(), e.latLng.lng())}
          />
        </GoogleMap>
      </div>
      <p className="text-[10px] text-slate-500 font-medium">Drag the marker or click on the map to pinpoint your exact shop entrance.</p>
    </div>
  )
}

function ShopForm({ form, setForm }) {
  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
    className: 'input text-sm',
  })
  
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Shop Name *</label>
        <input placeholder="e.g. Sharma Print Center" {...f('name')} />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Address</label>
        <input placeholder="Street address" {...f('address')} />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">City</label>
        <input placeholder="e.g. Pune, Maharashtra" {...f('city')} />
      </div>

      <LocationPicker 
         lat={form.lat} 
         lng={form.lng} 
         onChange={(lat, lng) => setForm(p => ({ ...p, lat, lng }))} 
      />

      <div className="pt-2">
        <label className="text-xs text-slate-400 mb-1 block">UPI ID</label>
        <input placeholder="shopname@upi" {...f('upiId')} />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Phone (optional)</label>
        <input placeholder="+91 XXXXX XXXXX" {...f('phone')} />
      </div>
    </div>
  )
}
