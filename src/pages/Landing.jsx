import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Printer, Shield, Zap, QrCode, Wallet, MapPin, Sparkles, ArrowRight, CheckCircle, Star, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import HeroBackground from '../components/HeroBackground'
import { getGlobalStats } from '../firebase/db'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-x-hidden relative">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-[100px] md:pt-[120px] pb-24 overflow-hidden">
        
        <div className="relative z-10 max-w-[900px] w-full mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          
          <div className="flex flex-col items-center text-center">
            {/* Label Badge */}
            <div className="inline-flex items-center gap-2 mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A8F98]">Privacy-first Smart Printing Platform</span>
            </div>

            {/* Vaasio Headline Styling */}
            <h1 
              className="text-[48px] md:text-[72px] lg:text-[100px] font-black leading-[0.9] tracking-[-0.05em] mb-12 text-main"
            >
              PRINT SMART.<br />
              STAY <span className="text-muted">PRIVATE.</span>
            </h1>

            <p className="text-[16px] md:text-[18px] text-muted max-w-[540px] mb-12 leading-[1.6]">
              Secure document processing without data retention. The future of decentralized printing is here.
            </p>

            {/* Vaasio Button Styling: Pill shape, uppercase */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
              <Link to="/auth?tab=signup&role=customer" className="px-10 py-4 bg-primary text-bg rounded-full text-[13px] font-bold uppercase tracking-[0.1em] hover:opacity-90 transition-all flex items-center justify-center gap-2">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link to="/auth?tab=signup&role=retailer" className="px-10 py-4 border border-border text-main rounded-full text-[13px] font-bold uppercase tracking-[0.1em] hover:bg-main/5 transition-all">
                Register Shop
              </Link>
            </div>

            {/* Trust Indicators Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-2">
              {[
                'Free plan available',
                'No login needed',
                'Works instantly'
              ].map(badge => (
                <div key={badge} className="flex items-center gap-2">
                  <span className="text-[#22C55E] text-sm">✓</span>
                  <span className="text-[14px] font-medium text-[#6B7280]">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ──────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-black">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problem */}
            <div className="card bg-surface border border-border hover:border-danger/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-danger" />
                </div>
                <h3 className="text-[20px] font-bold text-main tracking-tight uppercase">The Old Way</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Share documents on WhatsApp → shopkeeper has your number forever',
                  'Aadhaar, PAN, resumes sent over Telegram with zero privacy',
                  'Manual page counting, manual cost calculation, verbal back-and-forth',
                  'Long queues, confusion, no idea when your job will print',
                  'Your file stays on their device — permanently',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[15px] text-[#8A8F98] leading-[1.6]">
                    <span className="text-[#EF4444] mt-0.5 mt-1 opacity-80">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="card bg-surface border border-border hover:border-cyan/40 relative overflow-hidden transition-all">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-cyan" />
                </div>
                <h3 className="text-[20px] font-bold text-main tracking-tight uppercase">The Printzo Way</h3>
              </div>
              <ul className="space-y-4 relative z-10">
                {[
                  'Scan QR → upload file → no personal details exchanged',
                  'End-to-end secure upload, file auto-deleted after printing',
                  'Automatic page count, auto cost calculation, transparent pricing',
                  'Token system — know your place in the queue in real-time',
                  'Zero file retention: file is gone the moment printing is done',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[15px] text-[#8A8F98] leading-[1.6]">
                    <CheckCircle size={16} className="text-cyan mt-1 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-surface/30 relative">
        <div className="absolute inset-0 border-y border-border/50" />
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[56px] font-black text-main mb-6 tracking-tighter uppercase">Print in 3 simple steps</h2>
            <p className="text-muted text-[18px] uppercase tracking-widest font-bold">Fast, secure, and fully automated.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[40px] left-1/4 right-1/4 h-px border-t border-dashed border-border" />

            {[
              { icon: QrCode, step: 'Step 1', title: 'Scan the QR', desc: 'Find the Printzo QR code at the shop counter and scan it with your phone camera. No app needed.', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Shield, step: 'Step 2', title: 'Upload Securely', desc: 'Upload your document directly in the browser. Auto page count, transparent pricing, choose print mode.', color: 'text-main', bg: 'bg-surface border border-border' },
              { icon: Printer, step: 'Step 3', title: 'Pay & Get Token', desc: 'Pay via UPI, cash, or wallet. Get a token number and track your print job in real-time.', color: 'text-main', bg: 'bg-surface border border-border' },
            ].map(({ icon: Icon, step, title, desc, color, bg }) => (
              <div key={step} className="text-center relative">
                <div className={`w-[80px] h-[80px] mx-auto mb-8 rounded-full ${bg} flex items-center justify-center relative z-10 shadow-xl`}>
                  <Icon size={32} className={color} />
                </div>
                <div className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] mb-4">{step}</div>
                <h3 className="text-[20px] font-black text-main mb-4 uppercase tracking-tight">{title}</h3>
                <p className="text-[15px] text-muted leading-[1.6] max-w-[300px] mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-bg">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-black text-main mb-4 tracking-tighter uppercase">Built for the real world</h2>
            <p className="text-muted text-[18px] uppercase tracking-widest font-bold">Everything you need for a smooth printing experience.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'No phone numbers shared. Files auto-deleted after printing. Zero data retention.', color: 'text-primary' },
              { icon: Zap, title: 'Instant Print', desc: 'Need it NOW? Pay priority pricing and jump to the front of the queue instantly.', color: 'text-primary' },
              { icon: Sparkles, title: 'AI Doc Generator', desc: 'Generate cover letters, NOCs, applications using Gemini AI in seconds. ₹39/month.', color: 'text-primary' },
              { icon: Wallet, title: 'Smart Wallet', desc: 'Preload balance, avoid payment downtime. Pay with UPI, cash, or wallet.', color: 'text-primary' },
              { icon: QrCode, title: 'Token System', desc: 'Zero queue confusion. See your token number, track live status from your phone.', color: 'text-primary' },
              { icon: MapPin, title: 'Shop Discovery', desc: 'Find Printzo-enabled shops near you. View ratings and services before visiting.', color: 'text-primary' },
            ].map(({ icon: Icon, title, desc, color }) => (
               <div key={title} className="bg-surface border border-border rounded-2xl p-8 hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-[12px] border border-border flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                  <Icon size={22} className="text-muted group-hover:text-primary transition-all" />
                </div>
                <h3 className="text-[18px] font-black text-main mb-3 tracking-tight uppercase">{title}</h3>
                <p className="text-[15px] text-muted leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR RETAILERS ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-surface/30 border-y border-border/50 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-main/5 border border-border/50">
                <span className="text-[13px] font-bold text-muted uppercase tracking-widest">For Shop Owners</span>
              </div>
              <h2 className="text-[36px] md:text-[48px] font-black text-main mb-6 leading-[1.1] tracking-tighter uppercase">
                Run a smarter<br />print shop.
              </h2>
              <p className="text-[18px] text-muted mb-8 leading-[1.6]">
                Manage all print jobs from a clean dashboard. No more WhatsApp floods, manual counting, or missed payments.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  { icon: QrCode, text: 'One QR code on your counter — customers self-serve' },
                  { icon: Printer, text: 'Manage multiple printers, set custom pricing per mode' },
                  { icon: Wallet, text: 'Instant UPI confirmation + cash job tracking' },
                  { icon: Zap, text: 'Real-time job queue with token management' },
                ].map(({ icon: Icon, text }, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-[15px] text-muted">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <span className="mt-1">{text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup&role=retailer" className="px-10 py-4 bg-primary text-bg rounded-full text-[13px] font-bold uppercase tracking-[0.1em] hover:opacity-90 transition-all flex items-center justify-center gap-2 w-fit">
                Register Your Shop Free <ArrowRight size={16} />
              </Link>
            </div>
            
            {/* Mock dashboard card */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent blur-2xl opacity-50 rounded-[20px] transition-all group-hover:opacity-70" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <span className="text-[14px] font-bold text-main tracking-wide uppercase">Live Queue</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-[12px] text-success font-medium uppercase tracking-wider">3 active jobs</span>
                  </div>
                </div>
                {[
                  { token: '007', file: 'Resume_Priya.pdf', pages: 2, mode: 'B&W', status: 'printing', amount: 4 },
                  { token: '008', file: 'Aadhaar_Copy.pdf', pages: 1, mode: 'Color', status: 'pending', amount: 8 },
                  { token: '009', file: 'Admit_Card.jpg', pages: 1, mode: 'B&W', status: 'pending', amount: 2 },
                ].map(job => (
                  <div key={job.token} className="flex items-center gap-4 py-4 border-b border-border/30 last:border-0 hover:bg-main/5 px-4 transition-colors rounded-lg">
                    <span className={`text-[16px] font-bold w-12 shrink-0 ${job.status === 'printing' ? 'text-primary' : 'text-muted'}`}>
                      #{job.token}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-main truncate mb-1 uppercase tracking-tight">{job.file}</p>
                      <p className="text-[12px] text-muted">{job.pages}P · {job.mode} · ₹{job.amount}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${
                      job.status === 'printing' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-warning/20 text-warning border border-warning/30'
                    }`}>{job.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-bg relative">
        <div className="max-w-[1280px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8 uppercase tracking-widest text-[11px] font-bold text-muted">
            Pricing
          </div>
          <h2 className="text-[36px] md:text-[56px] font-black text-main mb-16 tracking-tighter leading-[1.1] uppercase">Free to use.<br/>Pay only for printing.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
            {/* Free */}
            <div className="bg-surface border border-border rounded-2xl p-10 text-left hover:border-primary/30 transition-all">
              <h3 className="text-[20px] font-bold uppercase tracking-wider text-main mb-2">Free Plan</h3>
              <p className="text-[15px] text-muted mb-10">Everything you need to print securely.</p>
              
              <div className="flex items-end gap-2 mb-10 border-b border-border/50 pb-10">
                <span className="text-[56px] font-black text-main leading-none">₹0</span>
              </div>
              
              <ul className="space-y-4 mb-10">
                {['Scan & print from any shop', 'UPI / Cash / Wallet payment', 'Token system & job tracking', 'Shop discovery map', 'Printzo wallet'].map((f, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-[15px] text-muted">
                    <CheckCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup" className="w-full py-4 border border-border text-main rounded-full text-[13px] font-bold uppercase tracking-[0.15em] hover:bg-main/5 transition-all flex justify-center">Get Started</Link>
            </div>
            
            {/* Pro */}
            <div className="bg-surface border-2 border-primary/20 rounded-2xl p-10 text-left relative overflow-hidden group shadow-2xl shadow-primary/5">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-all" />
              <div className="absolute top-0 right-0 bg-primary text-bg text-[10px] font-bold uppercase tracking-[0.2em] py-2 px-6 rounded-bl-xl z-20">Popular</div>
              
              <h3 className="text-[20px] font-bold uppercase tracking-wider text-main mb-2 relative z-10">AI Docs Plan</h3>
              <p className="text-[15px] text-muted mb-10 relative z-10">For those who need documents fast.</p>
              
              <div className="flex items-end gap-2 mb-10 border-b border-border/50 pb-10 relative z-10">
                <span className="text-[56px] font-black text-main leading-none">₹39</span>
                <span className="text-[14px] text-muted mb-2 font-bold uppercase tracking-widest">/ month</span>
              </div>
              
              <ul className="space-y-4 mb-10 relative z-10">
                {['Everything in Free', 'AI Document Generator', '20+ document templates', 'Gemini AI powered', 'Download & edit documents', 'Priority support'].map((f, idx) => (
                   <li key={idx} className="flex items-start gap-4 text-[15px] text-main">
                    <CheckCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup" className="w-full py-4 bg-primary text-bg rounded-full text-[13px] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-all flex justify-center shadow-lg shadow-primary/10 relative z-10">Upgrade Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-40 px-4 bg-white dark:bg-black relative">
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <h2 className="text-[48px] md:text-[80px] font-black text-main mb-12 tracking-tighter leading-[0.9] uppercase">Ready to print <br />smarter?</h2>
          <p className="text-[18px] text-muted mb-16 max-w-[540px] mx-auto leading-relaxed">Join thousands of students and professionals printing with zero privacy risk.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth?tab=signup" className="px-12 py-5 bg-primary text-bg rounded-full text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
              Get Started Now <ArrowRight size={20} />
            </Link>
            <Link to="/shops" className="px-12 py-5 border border-border text-main rounded-full text-[14px] font-black uppercase tracking-[0.2em] hover:bg-main/5 transition-all">
              Find Shops
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-border bg-white dark:bg-black">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start gap-6">
               <Link to="/" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-12 group-hover:scale-110">
                  <Printer size={18} className="text-primary relative z-10" strokeWidth={2.5} />
                </div>
                <span className="text-[14px] font-black uppercase tracking-[0.2em] text-main">
                  Printzo
                </span>
              </Link>
              <p className="text-[11px] text-muted uppercase tracking-[0.2em] font-bold">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-muted">
              <Link to="/auth" className="hover:text-primary transition-colors">Sign in</Link>
              <Link to="/shops" className="hover:text-primary transition-colors">Find Shops</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
