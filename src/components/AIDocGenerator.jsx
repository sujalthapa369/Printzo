import { useState } from 'react'
import { Sparkles, ChevronDown, Send, Wand2, Copy, Download, RefreshCw, Lock, ArrowRight } from 'lucide-react'
import { generateDocument, improveDocument, TEMPLATE_LIST } from '../utils/gemini'
import { useAuth } from '../context/AuthContext'
import { activateSubscription } from '../firebase/db'
import toast from 'react-hot-toast'

const FIELD_PRESETS = {
  leave_application: [
    { key: 'Your Name', placeholder: 'e.g. Rahul Sharma' },
    { key: 'Department / Class', placeholder: 'e.g. Computer Science, 3rd Year' },
    { key: 'Manager / Teacher Name', placeholder: 'e.g. Prof. Anita Verma' },
    { key: 'Leave From Date', placeholder: 'e.g. 10 April 2025' },
    { key: 'Leave To Date', placeholder: 'e.g. 14 April 2025' },
    { key: 'Reason', placeholder: 'e.g. Medical emergency / family function' },
  ],
  cover_letter: [
    { key: 'Your Name', placeholder: 'e.g. Priya Singh' },
    { key: 'Position Applied For', placeholder: 'e.g. Software Engineer' },
    { key: 'Company Name', placeholder: 'e.g. Infosys Ltd.' },
    { key: 'Your Skills', placeholder: 'e.g. React, Node.js, Python' },
    { key: 'Years of Experience', placeholder: 'e.g. 2 years' },
    { key: 'Your Email', placeholder: 'e.g. priya@email.com' },
  ],
  authorization_letter: [
    { key: 'Authorizer Name', placeholder: 'e.g. Suresh Patel' },
    { key: 'Authorized Person Name', placeholder: 'e.g. Meena Patel' },
    { key: 'Purpose', placeholder: 'e.g. Collect documents from bank' },
    { key: 'Date', placeholder: 'e.g. 15 April 2025' },
    { key: 'ID Proof Type', placeholder: 'e.g. Aadhaar Card' },
  ],
  noc: [
    { key: 'Issuing Organization', placeholder: 'e.g. ABC College' },
    { key: "Employee/Student Name", placeholder: 'e.g. Amit Kumar' },
    { key: 'Purpose of NOC', placeholder: 'e.g. Visa application / Job change' },
    { key: 'Authorized By', placeholder: 'e.g. Principal / HR Manager' },
    { key: 'Date', placeholder: 'e.g. April 2025' },
  ],
}

const DEFAULT_FIELDS = [
  { key: 'Full Name', placeholder: 'Your name' },
  { key: 'Address', placeholder: 'Your address' },
  { key: 'Date', placeholder: 'Today\'s date' },
  { key: 'Purpose / Details', placeholder: 'Describe what you need' },
]

export default function AIDocGenerator({ onSendToPrint, hasSubscription }) {
  const { user, userData, refreshUserData } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [fields, setFields] = useState({})
  const [generatedDoc, setGeneratedDoc] = useState('')
  const [generating, setGenerating] = useState(false)
  const [improving, setImproving] = useState(false)
  const [improveInstruction, setImproveInstruction] = useState('')
  const [activating, setActivating] = useState(false)
  const [showTemplateList, setShowTemplateList] = useState(false)

  const currentTemplate = TEMPLATE_LIST.find(t => t.key === selectedTemplate)
  const fieldPreset = FIELD_PRESETS[selectedTemplate] || DEFAULT_FIELDS

  const handleGenerate = async () => {
    if (!selectedTemplate) { toast.error('Please select a document type'); return }
    setGenerating(true)
    setGeneratedDoc('')
    try {
      const doc = await generateDocument(selectedTemplate, fields)
      setGeneratedDoc(doc)
      toast.success('Document generated!')
    } catch (err) {
      console.error(err)
      toast.error('Generation failed. Check your Gemini API key.')
    } finally {
      setGenerating(false)
    }
  }

  const handleImprove = async () => {
    if (!improveInstruction.trim()) { toast.error('Enter improvement instructions'); return }
    setImproving(true)
    try {
      const improved = await improveDocument(generatedDoc, improveInstruction)
      setGeneratedDoc(improved)
      setImproveInstruction('')
      toast.success('Document improved!')
    } catch (err) {
      toast.error('Improvement failed')
    } finally {
      setImproving(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDoc)
    toast.success('Copied to clipboard!')
  }

  const downloadAsText = () => {
    const blob = new Blob([generatedDoc], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentTemplate?.label || 'document'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleActivate = async () => {
    if ((userData?.wallet || 0) < 39) {
      toast.error('Insufficient wallet balance. Top up ₹39 to activate.')
      return
    }
    setActivating(true)
    try {
      await activateSubscription(user.uid)
      await refreshUserData()
      toast.success('AI Docs subscription activated! 🎉')
    } catch {
      toast.error('Activation failed')
    } finally {
      setActivating(false)
    }
  }

  // Paywall
  if (!hasSubscription) {
    return (
      <div className="card text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-cyan/20 rounded-2xl flex items-center justify-center border border-cyan/20">
          <Sparkles size={28} className="text-cyan" />
        </div>
        <h3 className="text-xl font-syne font-bold text-white mb-2">AI Document Generator</h3>
        <p className="text-slate-400 text-sm mb-6">
          Generate professional documents instantly using AI — cover letters, leave applications, NOCs, affidavits, and more.
        </p>
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 space-y-2 text-left">
          {['Cover Letters & Job Applications', 'Leave & Declaration Forms', 'NOC & Authorization Letters', 'Affidavits & Academic Applications', '20+ document templates'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-cyan">✓</span> {f}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl font-syne font-bold text-white">₹39</span>
          <span className="text-slate-500 text-sm">/ 30 days</span>
        </div>
        <button onClick={handleActivate} disabled={activating} className="btn-cyan w-full justify-center">
          {activating ? <><span className="spinner" /> Activating…</> : <><Lock size={14} /> Unlock with Wallet</>}
        </button>
        <p className="text-xs text-slate-600 mt-3">Deducted from your Printzo wallet</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Template selector */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-2">
          Document Type
        </label>
        <div className="relative">
          <button
            onClick={() => setShowTemplateList(!showTemplateList)}
            className="w-full input flex items-center justify-between text-left"
          >
            <span className={currentTemplate ? 'text-white' : 'text-slate-500'}>
              {currentTemplate?.label || 'Select a document type…'}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showTemplateList ? 'rotate-180' : ''}`} />
          </button>
          {showTemplateList && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-bright border border-border rounded-xl overflow-hidden shadow-2xl z-10 max-h-64 overflow-y-auto">
              {TEMPLATE_LIST.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setSelectedTemplate(t.key); setShowTemplateList(false); setFields({}); setGeneratedDoc('') }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 ${
                    selectedTemplate === t.key ? 'text-cyan bg-cyan/5' : 'text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic fields */}
      {selectedTemplate && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fieldPreset.map(field => (
            <div key={field.key}>
              <label className="text-xs text-slate-400 block mb-1">{field.key}</label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={fields[field.key] || ''}
                onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="input text-sm py-2.5"
              />
            </div>
          ))}
        </div>
      )}

      {/* Generate button */}
      {selectedTemplate && (
        <button onClick={handleGenerate} disabled={generating} className="btn-cyan w-full justify-center gap-2">
          {generating ? (
            <><span className="spinner" /> Generating with Gemini AI…</>
          ) : (
            <><Wand2 size={15} /> Generate Document</>
          )}
        </button>
      )}

      {/* Generated document */}
      {generatedDoc && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Generated Document</p>
            <div className="flex items-center gap-2">
              <button onClick={copyToClipboard} className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                <Copy size={12} /> Copy
              </button>
              <button onClick={downloadAsText} className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                <Download size={12} /> Download
              </button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 max-h-80 overflow-y-auto">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-dm leading-relaxed">
              {generatedDoc}
            </pre>
          </div>

          {/* Improve */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask AI to improve… e.g. 'make it more formal'"
              value={improveInstruction}
              onChange={e => setImproveInstruction(e.target.value)}
              className="input text-sm py-2.5 flex-1"
              onKeyDown={e => e.key === 'Enter' && handleImprove()}
            />
            <button onClick={handleImprove} disabled={improving} className="btn-secondary px-3">
              {improving ? <span className="spinner" /> : <RefreshCw size={14} />}
            </button>
          </div>

          {/* Send to print */}
          {onSendToPrint && (
            <button
              onClick={() => onSendToPrint(generatedDoc, currentTemplate?.label)}
              className="btn-primary w-full justify-center gap-2"
            >
              <Send size={14} />
              Send to Print
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
