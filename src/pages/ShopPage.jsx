import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Printer, MapPin, Star, Clock, Zap, ChevronRight, ArrowLeft, Info } from 'lucide-react'
import { getShop, getPrintersByShop, createPrintJob, getWalletBalance } from '../firebase/db'
import { useAuth } from '../context/AuthContext'
import FileUpload from '../components/FileUpload'
import PaymentModal from '../components/PaymentModal'
import TokenCard from '../components/TokenCard'
import { calculateCost, calculateInstantCost, formatINR } from '../utils/helpers'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'

const STEPS = ['upload', 'configure', 'payment', 'token']

export default function ShopPage() {
  const { shopId } = useParams()
  const { user, userData } = useAuth()
  const navigate = useNavigate()

  const [shop, setShop] = useState(null)
  const [printers, setPrinters] = useState([])
  const [loadingShop, setLoadingShop] = useState(true)

  // Print job state
  const [step, setStep] = useState('upload')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [selectedPrinter, setSelectedPrinter] = useState(null)
  const [printMode, setPrintMode] = useState('bw')
  const [isInstant, setIsInstant] = useState(false)
  const [pages, setPages] = useState(1)
  const [showPayment, setShowPayment] = useState(false)
  const [completedJob, setCompletedJob] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)

  useEffect(() => {
    loadShop()
  }, [shopId])

  useEffect(() => {
    if (user) loadWallet()
  }, [user])

  const loadShop = async () => {
    try {
      const [shopData, printersData] = await Promise.all([
        getShop(shopId),
        getPrintersByShop(shopId),
      ])
      if (!shopData) { toast.error('Shop not found'); return }
      setShop(shopData)

      // Fallback: If the retailer forgot to configure a printer, inject a default one so the page doesn't break!
      let activePrinters = printersData
      if (activePrinters.length === 0) {
        activePrinters = [{
          id: 'default-printer',
          name: 'Standard Printer',
          status: 'online',
          supportsColor: true,
          priceBW: 2,
          priceColor: 10
        }]
      }
      
      setPrinters(activePrinters)
      setSelectedPrinter(activePrinters[0])
      setPrintMode(activePrinters[0].supportsColor ? 'bw' : 'bw')
    } catch {
      toast.error('Failed to load shop')
    } finally {
      setLoadingShop(false)
    }
  }

  const loadWallet = async () => {
    const bal = await getWalletBalance(user.uid)
    setWalletBalance(bal)
  }

  const cost = isInstant
    ? calculateInstantCost(pages, printMode, selectedPrinter)
    : calculateCost(pages, printMode, selectedPrinter)

  const handleFileReady = (file) => {
    setUploadedFile(file)
    if (file) {
      setPages(file.pages || 1)
      setStep('configure')
    }
  }

  const handleConfirmPrint = async (paymentMethod) => {
    if (!user) { navigate('/auth'); return }
    try {
      const { jobId, tokenNumber } = await createPrintJob({
        shopId,
        shopName: shop.name,
        customerId: user.uid,
        customerName: user.displayName || 'Customer',
        fileName: uploadedFile.name,
        fileUrl: uploadedFile.url,
        filePath: uploadedFile.path,
        pages,
        mode: printMode,
        isInstant,
        amount: cost,
        paymentMethod,
        printerName: selectedPrinter?.name,
        printerId: selectedPrinter?.id,
      })
      setCompletedJob({ id: jobId, tokenNumber, fileName: uploadedFile.name, pages, mode: printMode, amount: cost, paymentMethod, isInstant, shopName: shop.name })
      setShowPayment(false)
      setStep('token')
      toast.success(`Job submitted! Token #${String(tokenNumber).padStart(3, '0')}`)
    } catch (err) {
      toast.error(err.message || 'Failed to submit job')
      throw err
    }
  }

  if (loadingShop) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading shop…</p>
      </div>
    </div>
  )

  if (!shop) return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-center px-4">
      <div>
        <div className="text-5xl mb-4">🏪</div>
        <h2 className="text-xl font-syne font-bold text-white mb-2">Shop Not Found</h2>
        <p className="text-slate-400 mb-6">This QR code may be invalid or the shop is no longer active.</p>
        <Link to="/shops" className="btn-primary">Find Other Shops</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-20 pb-12">
        {/* Shop info */}
        <div className="card mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-cyan/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Printer size={22} className="text-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-syne font-bold text-white truncate">{shop.name}</h2>
              {shop.address && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {shop.address}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                  shop.status === 'active' ? 'tag-completed' : 'tag-cancelled'
                }`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${shop.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {shop.status === 'active' ? 'Open' : 'Closed'}
                </span>
                {shop.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Star size={10} className="fill-amber-400" />
                    {shop.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Printer options */}
          {printers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-slate-500 mb-2">Available Printers</p>
              <div className="flex flex-wrap gap-2">
                {printers.filter(p => p.status === 'online').map(printer => (
                  <button
                    key={printer.id}
                    onClick={() => setSelectedPrinter(printer)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedPrinter?.id === printer.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-slate-400 hover:border-primary/40'
                    }`}
                  >
                    <Printer size={10} /> {printer.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Require login */}
        {!user && step !== 'upload' && (
          <div className="card text-center mb-6 border-amber-500/20 bg-amber-500/5">
            <p className="text-sm text-amber-300 mb-3">Sign in to complete your print job and get a token.</p>
            <Link to={`/auth?redirect=/shop/${shopId}`} className="btn-primary justify-center">Sign In / Sign Up</Link>
          </div>
        )}

        {/* Step: Upload */}
        {step === 'upload' || step === 'configure' ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {['upload', 'configure', 'payment', 'token'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      STEPS.indexOf(step) >= i ? 'bg-primary text-white' : 'bg-surface border border-border text-slate-500'
                    }`}>{i + 1}</div>
                    {i < 3 && <div className={`w-6 h-px ${STEPS.indexOf(step) > i ? 'bg-primary' : 'bg-border'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-xs font-bold flex items-center justify-center">1</span>
                Upload Document
              </h3>
              <FileUpload onFileReady={handleFileReady} />
            </div>

            {/* Configure */}
            {step === 'configure' && uploadedFile && selectedPrinter && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-xs font-bold flex items-center justify-center">2</span>
                  Configure Print
                </h3>

                {/* Document Preview */}
                <div className="card p-2 overflow-hidden">
                  <div className="flex items-center justify-between px-2 pt-1 pb-2 mb-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Document Preview</p>
                    <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan hover:underline font-medium">
                      Open Full Screen
                    </a>
                  </div>
                  {uploadedFile.type?.startsWith('image/') ? (
                    <img src={uploadedFile.url} alt="Preview" className="w-full h-64 object-contain rounded-lg bg-surface" />
                  ) : (
                    <iframe src={uploadedFile.url} className="w-full h-64 rounded-lg bg-white" title="Document Preview" />
                  )}
                </div>

                {/* Pages */}
                <div className="card py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Number of pages</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPages(Math.max(1, pages - 1))} className="w-7 h-7 rounded-lg bg-surface border border-border text-white hover:border-primary/50 transition-all">−</button>
                      <span className="text-lg font-syne font-bold text-white w-8 text-center">{pages}</span>
                      <button onClick={() => setPages(pages + 1)} className="w-7 h-7 rounded-lg bg-surface border border-border text-white hover:border-primary/50 transition-all">+</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                    <Info size={10} />
                    Estimated from file. Adjust if needed.
                  </p>
                </div>

                {/* Print mode */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPrintMode('bw')}
                    className={`p-4 rounded-xl border text-left transition-all ${printMode === 'bw' ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/40'}`}
                  >
                    <div className="text-2xl mb-1">⬛</div>
                    <p className="text-sm font-semibold text-white">B&W</p>
                    <p className="text-xs text-slate-400">{formatINR(selectedPrinter.priceBW || 2)} / page</p>
                  </button>
                  {selectedPrinter.supportsColor && (
                    <button
                      onClick={() => setPrintMode('color')}
                      className={`p-4 rounded-xl border text-left transition-all ${printMode === 'color' ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/40'}`}
                    >
                      <div className="text-2xl mb-1">🎨</div>
                      <p className="text-sm font-semibold text-white">Color</p>
                      <p className="text-xs text-slate-400">{formatINR(selectedPrinter.priceColor || 8)} / page</p>
                    </button>
                  )}
                </div>

                {/* Instant print toggle */}
                <label className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl cursor-pointer hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className={isInstant ? 'text-amber-400' : 'text-slate-500'} />
                    <div>
                      <p className="text-sm font-semibold text-white">Instant Print</p>
                      <p className="text-xs text-slate-400">
                        Priority queue · {formatINR(calculateInstantCost(pages, printMode, selectedPrinter))} total
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => setIsInstant(!isInstant)}
                    className={`w-11 h-6 rounded-full border transition-all ${isInstant ? 'bg-amber-400 border-amber-400' : 'bg-surface border-border'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform m-0.5 ${isInstant ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </label>

                {/* Cost summary */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-cyan/10 border border-emerald-500/20 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-400">Total Amount</p>
                    <p className="text-2xl font-syne font-bold text-emerald-400">{formatINR(cost)}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{pages} pages × {formatINR(isInstant ? calculateInstantCost(1, printMode, selectedPrinter) : calculateCost(1, printMode, selectedPrinter))}</p>
                    {isInstant && <p className="text-amber-400">⚡ Instant pricing</p>}
                  </div>
                </div>

                <button
                  onClick={() => user ? setShowPayment(true) : navigate('/auth')}
                  className="btn-primary w-full justify-center py-3.5 text-base"
                >
                  Proceed to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : step === 'token' && completedJob ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/customer" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={16} />
              </Link>
              <h2 className="text-lg font-syne font-bold text-white">Job Submitted!</h2>
            </div>
            <TokenCard jobId={completedJob.id} initialJob={{ ...completedJob, status: 'pending' }} />
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-400">Show your token number at the counter when ready.</p>
              <Link to="/customer" className="btn-secondary justify-center text-sm">
                View All My Jobs
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          job={{ fileName: uploadedFile?.name, pages, mode: printMode, amount: cost, isInstant }}
          onConfirm={handleConfirmPrint}
          onClose={() => setShowPayment(false)}
          walletBalance={walletBalance}
          shopUpiId={shop?.upiId}
        />
      )}
    </div>
  )
}
