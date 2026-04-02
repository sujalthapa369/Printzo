import { useState } from 'react'
import { Download, RefreshCw, QrCode } from 'lucide-react'
import { getQRCodeUrl } from '../utils/helpers'

export default function QRCodeDisplay({ shopId, shopName, size = 250 }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const shopUrl = `${window.location.origin}/shop/${shopId}`
  const qrUrl = getQRCodeUrl(shopUrl, size)

  const downloadQR = () => {
    // Create a larger version for download
    const downloadUrl = getQRCodeUrl(shopUrl, 800)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `printzo-qr-${shopName?.replace(/\s+/g, '-') || shopId}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Frame */}
      <div className="relative">
        <div className="p-4 bg-[#0D1524] rounded-2xl border border-cyan/20 glow-cyan">
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan rounded-tl-sm" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan rounded-tr-sm" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan rounded-bl-sm" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan rounded-br-sm" />

          {!loaded && !error && (
            <div
              className="flex items-center justify-center bg-surface rounded-xl"
              style={{ width: size, height: size }}
            >
              <div className="spinner" />
            </div>
          )}

          {error && (
            <div
              className="flex flex-col items-center justify-center gap-2 bg-surface rounded-xl"
              style={{ width: size, height: size }}
            >
              <QrCode size={40} className="text-slate-600" />
              <p className="text-xs text-slate-500">QR unavailable</p>
            </div>
          )}

          <img
            src={qrUrl}
            alt={`QR Code for ${shopName}`}
            width={size}
            height={size}
            className={`rounded-xl transition-opacity ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(false) }}
            style={loaded ? {} : { position: 'absolute', top: -9999 }}
          />
        </div>
      </div>

      {/* Shop URL */}
      <div className="text-center">
        <p className="text-xs text-slate-500 mb-1">Customer scan URL</p>
        <p className="text-xs text-cyan font-mono bg-surface border border-border rounded-lg px-3 py-1.5 max-w-[260px] truncate">
          {shopUrl}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => { setLoaded(false); setError(false) }}
          className="btn-secondary text-sm py-2 px-3 gap-1.5"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
        <button onClick={downloadQR} className="btn-cyan text-sm py-2 px-4 gap-1.5">
          <Download size={14} />
          Download QR
        </button>
      </div>

      <p className="text-xs text-slate-600 text-center max-w-[240px]">
        Display this QR at your shop counter. Customers scan to start printing instantly.
      </p>
    </div>
  )
}
