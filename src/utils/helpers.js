// Format currency in INR
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// Generate QR code URL using api.qrserver.com (free, no API key needed)
export const getQRCodeUrl = (data, size = 300) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=0D1524&color=06B6D4&margin=10&format=png`

// Calculate print cost
export const calculateCost = (pages, mode, printer) => {
  if (!printer) return 0
  const pricePerPage = mode === 'color' ? printer.priceColor : printer.priceBW
  return pages * pricePerPage
}

// Calculate instant print cost
export const calculateInstantCost = (pages, mode, printer) => {
  if (!printer) return 0
  const base = calculateCost(pages, mode, printer)
  const multiplier = printer.instantMultiplier || 3
  return base * multiplier
}

// Get file type icon label
export const getFileTypeLabel = (type) => {
  if (type === 'application/pdf') return 'PDF'
  if (type.startsWith('image/')) return 'IMG'
  if (type.includes('word') || type.includes('document')) return 'DOC'
  if (type.includes('sheet') || type.includes('excel')) return 'XLS'
  return 'FILE'
}

// Accepted file types
export const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
}

// Max file size: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024

// Token status colors
export const TOKEN_STATUS = {
  pending: { label: 'Waiting', color: 'text-warning bg-warning/10 border-warning/20' },
  printing: { label: 'Printing', color: 'text-cyan bg-cyan/10 border-cyan/20' },
  completed: { label: 'Done', color: 'text-success bg-success/10 border-success/20' },
  cancelled: { label: 'Cancelled', color: 'text-danger bg-danger/10 border-danger/20' },
}

// Payment method labels
export const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI', icon: '⚡', description: 'Instant digital payment' },
  { key: 'cash', label: 'Cash', icon: '💵', description: 'Pay at the counter' },
  { key: 'wallet', label: 'Wallet', icon: '👛', description: 'Use Printzo wallet' },
]

// Truncate text
export const truncate = (str, n = 30) => str?.length > n ? `${str.slice(0, n)}…` : str

// Short date
export const shortDate = (ts) => {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
