'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, KeyRound, QrCode, ArrowRight, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function PassRecoveryPortal() {
  const [step, setStep] = useState<'contact' | 'otp' | 'pass'>('contact')
  const [contact, setContact] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passData, setPassData] = useState<any>(null)

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', contact })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', contact, otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setPassData(data.visitor)
      setStep('pass')
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-blue-200">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 mb-6 shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform">
            <QrCode className="w-7 h-7 text-white" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Your Pass</h1>
          <p className="text-slate-500 mt-2 font-medium">Lost your ticket? Recover it instantly.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
          
          {/* Top Decorative gradient */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {step === 'contact' && (
            <form onSubmit={requestOtp} className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email or Phone Number</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" required value={contact} onChange={e => setContact(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="john@example.com or +123456789" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 group disabled:opacity-70">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Get Security Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Check your email</h3>
                <p className="text-sm text-slate-500 mt-1">We sent a 6-digit code to <strong>{contact}</strong></p>
              </div>

              <div>
                <div className="relative">
                  <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-center text-2xl font-bold tracking-[0.5em]" placeholder="000000" />
                </div>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2 group disabled:opacity-70">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Verify & Access Pass</>}
              </button>

              <button type="button" onClick={() => setStep('contact')} className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700 pt-2">
                Use a different email or phone
              </button>
            </form>
          )}

          {step === 'pass' && passData && (
            <div className="text-center animate-in zoom-in-95 data-[state=pass]:duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">Pass Recovered!</h3>
              <p className="text-sm text-slate-500 mt-2 mb-8">Hello {passData.name}, here is your event pass.</p>

              {/* Pass Mini-Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden mb-6 text-left shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <img src={passData.qrCode} alt="Pass QR" className="w-32 h-32 rounded-lg" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <span className="bg-blue-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{passData.passType}</span>
                <h4 className="text-2xl font-bold mt-4 mb-1">{passData.name}</h4>
                <p className="text-slate-400 text-sm font-medium">{passData.eventName}</p>
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-500">{passData.passId}</span>
                  {passData.status === 'entered' && <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Already Entered</span>}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2">
                  <Download className="w-5 h-5" /> Download PDF
                </button>
              </div>
              
              <button onClick={() => {setStep('contact'); setContact(''); setOtp(''); setPassData(null)}} className="mt-6 w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700 flex justify-center items-center gap-1">
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
