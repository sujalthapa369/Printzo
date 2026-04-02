import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadDocument, estimatePageCount } from '../firebase/storage'
import { useAuth } from '../context/AuthContext'
import { ACCEPTED_TYPES, MAX_FILE_SIZE, formatFileSize, getFileTypeLabel } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function FileUpload({ onFileReady, disabled }) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError('')

    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0]
      if (err.code === 'file-too-large') {
        setError('File too large. Maximum size is 50MB.')
      } else if (err.code === 'file-invalid-type') {
        setError('Unsupported file type. Please use PDF, JPG, PNG, DOC, DOCX, or XLSX.')
      } else {
        setError(err.message)
      }
      return
    }

    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]

    setUploading(true)
    setProgress(0)

    try {
      const fileData = await uploadDocument(file, user.uid, (p) => setProgress(p))
      const pages = estimatePageCount(file.size, file.type)
      const result = { ...fileData, pages }
      setUploadedFile(result)
      onFileReady(result)
      toast.success('File uploaded securely!')
    } catch (err) {
      console.error(err)
      setError('Upload failed. Please try again.')
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }, [user, onFileReady])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled: disabled || uploading,
  })

  const clearFile = () => {
    setUploadedFile(null)
    setProgress(0)
    setError('')
    onFileReady(null)
  }

  if (uploadedFile) {
    return (
      <div className="relative border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-5">
        <button
          onClick={clearFile}
          className="absolute top-3 right-3 p-1 text-slate-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {uploadedFile.type?.startsWith('image/') ? (
              <Image size={22} className="text-emerald-400" />
            ) : (
              <FileText size={22} className="text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-white truncate">{uploadedFile.name}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                {getFileTypeLabel(uploadedFile.type)}
              </span>
              <span>{formatFileSize(uploadedFile.size)}</span>
              <span className="text-cyan font-medium">~{uploadedFile.pages} {uploadedFile.pages === 1 ? 'page' : 'pages'}</span>
            </div>
            <p className="text-xs text-emerald-500/80 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Uploaded securely · Will be deleted after printing
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-cyan bg-cyan/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }
          ${(disabled || uploading) ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
              <Upload size={22} className="text-primary animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-2">Uploading securely…</p>
              <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{progress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all ${
              isDragActive ? 'bg-cyan/20' : 'bg-surface'
            }`}>
              <Upload size={26} className={isDragActive ? 'text-cyan' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, JPG, PNG, DOC, DOCX, XLSX · Max 50MB
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['PDF', 'JPG', 'PNG', 'DOC', 'XLSX'].map(t => (
                <span key={t} className="text-xs bg-surface border border-border text-slate-400 px-2 py-0.5 rounded font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  )
}
