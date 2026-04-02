import { Link } from 'react-router-dom'
import { Printer, Shield, Zap, QrCode, Wallet, MapPin, Sparkles, ArrowRight, CheckCircle, Star } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background orbs */}
        <div className="orb w-[600px] h-[600px] bg-primary" style={{ top: '-10%', left: '-15%' }} />
        <div className="orb w-[500px] h-[500px] bg-cyan" style={{ bottom: '-10%', right: '-10%' }} />
        <div className="absolute inset-0 noise-bg" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center page-enter">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-surface border border-cyan/20 rounded-full px-4 py-2 mb-8">
            <div className="pulse-dot" />
            <span className="text-xs text-cyan font-medium tracking-wide">Privacy-first Smart Printing Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-syne font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
            Print Smart.<br />
            <span className="gradient-text">Stay Private.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Scan a QR code. Upload your document securely. Get it printed — no WhatsApp sharing, no privacy leaks, no manual hassle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to="/auth?tab=signup&role=customer" className="btn-cyan text-base py-3.5 px-8 justify-center shadow-lg">
              Start Printing Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/auth?tab=signup&role=retailer" className="btn-secondary text-base py-3.5 px-8 justify-center">
              Register Your Shop
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span>Privacy Focused</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span>🔒 Files deleted after printing</span>
            <div className="w-px h-4 bg-border" />
            <span>📱 No app install needed</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-5 h-8 border border-slate-700 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-slate-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ──────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problem */}
            <div className="card border-red-500/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">😓</span>
                </div>
                <h3 className="text-xl font-syne font-bold text-white">The Old Way</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Share documents on WhatsApp → shopkeeper has your number forever',
                  'Aadhaar, PAN, resumes sent over Telegram with zero privacy',
                  'Manual page counting, manual cost calculation, verbal back-and-forth',
                  'Long queues, confusion, no idea when your job will print',
                  'Your file stays on their device — permanently',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <span className="text-red-400 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="card border-cyan/20 bg-gradient-to-br from-cyan/5 to-primary/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <h3 className="text-xl font-syne font-bold text-white">The Printzo Way</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Scan QR → upload file → no personal details exchanged',
                  'End-to-end secure upload, file auto-deleted after printing',
                  'Automatic page count, auto cost calculation, transparent pricing',
                  'Token system — know your place in the queue in real-time',
                  'Zero file retention: file is gone the moment printing is done',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle size={14} className="text-cyan mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-cyan uppercase tracking-widest font-medium mb-3">Simple Process</p>
            <h2 className="text-4xl font-syne font-bold text-white">Print in 3 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary to-cyan opacity-30" />

            {[
              { icon: QrCode, step: '01', title: 'Scan the QR', desc: 'Find the Printzo QR code at the shop counter and scan it with your phone camera. No app needed.', color: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
              { icon: Shield, step: '02', title: 'Upload Securely', desc: 'Upload your document directly in the browser. Auto page count, transparent pricing, choose print mode.', color: 'from-cyan/20 to-cyan/5', iconColor: 'text-cyan' },
              { icon: Printer, step: '03', title: 'Pay & Get Token', desc: 'Pay via UPI, cash, or wallet. Get a token number and track your print job in real-time.', color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
            ].map(({ icon: Icon, step, title, desc, color, iconColor }) => (
              <div key={step} className="card text-center relative">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon size={28} className={iconColor} />
                </div>
                <div className="absolute top-4 right-4 text-xs font-syne font-bold text-slate-700">{step}</div>
                <h3 className="text-lg font-syne font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-cyan uppercase tracking-widest font-medium mb-3">Everything Included</p>
            <h2 className="text-4xl font-syne font-bold text-white">Built for the real world</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'No phone numbers shared. Files auto-deleted after printing. Zero data retention.', color: 'text-cyan' },
              { icon: Zap, title: 'Instant Print', desc: 'Need it NOW? Pay priority pricing and jump to the front of the queue instantly.', color: 'text-amber-400' },
              { icon: Sparkles, title: 'AI Doc Generator', desc: 'Generate cover letters, NOCs, applications using Gemini AI in seconds. ₹39/month.', color: 'text-purple-400' },
              { icon: Wallet, title: 'Smart Wallet', desc: 'Preload balance, avoid payment downtime. Pay with UPI, cash, or wallet.', color: 'text-emerald-400' },
              { icon: QrCode, title: 'Token System', desc: 'Zero queue confusion. See your token number, track live status from your phone.', color: 'text-primary' },
              { icon: MapPin, title: 'Shop Discovery', desc: 'Find Printzo-enabled shops near you. View ratings and services before visiting.', color: 'text-rose-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card group hover:border-white/10 transition-all hover:-translate-y-1 duration-200">
                <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center mb-4 ${color}`} style={{ backgroundColor: 'currentColor', opacity: 1 }}>
                  <Icon size={20} className={color} style={{ opacity: 1 }} />
                </div>
                <Icon size={20} className={`${color} mb-4`} />
                <h3 className="text-base font-syne font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR RETAILERS ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-cyan uppercase tracking-widest font-medium mb-4">For Shop Owners</p>
              <h2 className="text-4xl font-syne font-bold text-white mb-5">
                Run a smarter<br />print shop
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Manage all print jobs from a clean dashboard. No more WhatsApp floods, manual counting, or missed payments.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: QrCode, text: 'One QR code on your counter — customers self-serve' },
                  { icon: Printer, text: 'Manage multiple printers, set custom pricing per mode' },
                  { icon: Wallet, text: 'Instant UPI confirmation + cash job tracking' },
                  { icon: Zap, text: 'Real-time job queue with token management' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-primary" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup&role=retailer" className="btn-cyan mt-8 inline-flex">
                Register Your Shop Free <ArrowRight size={16} />
              </Link>
            </div>
            {/* Mock dashboard card */}
            <div className="glass border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-syne font-bold text-white">Live Queue</span>
                <div className="flex items-center gap-1.5">
                  <div className="pulse-dot" />
                  <span className="text-xs text-emerald-400">3 active jobs</span>
                </div>
              </div>
              {[
                { token: '007', file: 'Resume_Priya.pdf', pages: 2, mode: 'B&W', status: 'printing', amount: 4 },
                { token: '008', file: 'Aadhaar_Copy.pdf', pages: 1, mode: 'Color', status: 'pending', amount: 8 },
                { token: '009', file: 'Admit_Card.jpg', pages: 1, mode: 'B&W', status: 'pending', amount: 2 },
              ].map(job => (
                <div key={job.token} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                  <span className={`text-base font-syne font-black w-9 ${job.status === 'printing' ? 'text-cyan' : 'text-slate-400'}`}>
                    #{job.token}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{job.file}</p>
                    <p className="text-xs text-slate-500">{job.pages}p · {job.mode} · ₹{job.amount}</p>
                  </div>
                  <span className={`stat-badge text-xs ${
                    job.status === 'printing' ? 'tag-printing' : 'tag-pending'
                  }`}>{job.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-cyan uppercase tracking-widest font-medium mb-3">Simple Pricing</p>
          <h2 className="text-4xl font-syne font-bold text-white mb-12">Free to use. Pay only for printing.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="card text-left">
              <div className="text-2xl mb-3">🆓</div>
              <h3 className="text-lg font-syne font-bold text-white mb-1">Free Plan</h3>
              <p className="text-slate-400 text-sm mb-4">Everything you need to print</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {['Scan & print from any shop', 'UPI / Cash / Wallet payment', 'Token system & job tracking', 'Shop discovery map', 'Printzo wallet'].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle size={13} className="text-emerald-400" />{f}</li>
                ))}
              </ul>
              <div className="mt-6 text-3xl font-syne font-bold text-white">₹0</div>
            </div>
            <div className="card border-cyan/30 bg-gradient-to-br from-cyan/5 to-primary/5 text-left relative overflow-hidden">
              <div className="absolute top-3 right-3 text-xs bg-cyan text-slate-900 font-bold px-2.5 py-1 rounded-full">POPULAR</div>
              <div className="text-2xl mb-3">✨</div>
              <h3 className="text-lg font-syne font-bold text-white mb-1">AI Docs Plan</h3>
              <p className="text-slate-400 text-sm mb-4">For those who need documents fast</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {['Everything in Free', 'AI Document Generator', '20+ document templates', 'Gemini AI powered', 'Download & edit documents', '30-day access'].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan" />{f}</li>
                ))}
              </ul>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-3xl font-syne font-bold text-white">₹39</span>
                <span className="text-slate-500 text-sm">/ 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card border-cyan/20 bg-gradient-to-br from-cyan/5 to-primary/5">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/30 to-cyan/30 rounded-2xl flex items-center justify-center">
              <Printer size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-syne font-bold text-white mb-3">Ready to print smarter?</h2>
            <p className="text-slate-400 mb-8">Join thousands of students and professionals printing with zero privacy risk.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth?tab=signup" className="btn-cyan py-3.5 px-8 justify-center text-base">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link to="/shops" className="btn-secondary py-3.5 px-8 justify-center text-base">
                Find Nearby Shops
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-cyan rounded-md flex items-center justify-center">
              <Printer size={12} className="text-white" />
            </div>
            <span className="font-syne font-bold text-white">Print<span className="text-cyan">zo</span></span>
          </div>
          <p className="text-xs text-slate-600">© 2025 Printzo. Privacy-focused printing platform.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link to="/auth" className="hover:text-slate-400 transition-colors">Login</Link>
            <Link to="/shops" className="hover:text-slate-400 transition-colors">Find Shops</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
