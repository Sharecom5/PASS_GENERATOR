'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PlusCircle, QrCode, UserPlus, FileSignature, ArrowRight, Printer, AlertCircle, RefreshCw } from 'lucide-react'

export default function OnSpotRegistration() {
  const [step, setStep] = useState<'form' | 'pass'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passData, setPassData] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    eventName: process.env.NEXT_PUBLIC_EVENT_NAME || 'Live Event Door Entry',
    eventDate: process.env.NEXT_PUBLIC_EVENT_DATE || 'Today',
    eventVenue: process.env.NEXT_PUBLIC_EVENT_VENUE || 'Main Gate',
    passType: 'Visitor'
  })

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/on-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setPassData(data.visitor)
      setStep('pass')
    } catch (err: any) {
      setError(err.message || 'Failed to generate pass')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100 selection:bg-blue-500/30">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-10 mt-8">
          <Link href="/admin" className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600 mb-6 shadow-xl shadow-blue-600/20 hover:scale-105 transition-transform">
            <UserPlus className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">On-Spot Generation</h1>
          <p className="text-slate-400 mt-2 font-medium">Create instant passes for walk-in attendees at the gate.</p>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
          
          {error && (
            <div className="mb-6 bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleRegister} className="space-y-6 animate-in slide-in-from-bottom-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Full Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-white placeholder-slate-700" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Pass Type</label>
                  <select value={formData.passType} onChange={e => setFormData({...formData, passType: e.target.value})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-blue-400 cursor-pointer appearance-none">
                    <option value="Visitor">Visitor</option>
                    <option value="VIP">VIP</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Press">Press</option>
                    <option value="Exhibitor">Exhibitor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-white placeholder-slate-700" placeholder="johndoe@email.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-white placeholder-slate-700" placeholder="+1234567890" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Company / Organization</label>
                <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-white placeholder-slate-700" placeholder="Acme Corp (Optional)" />
              </div>

              <button type="submit" disabled={loading || !formData.name} className="w-full mt-4 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-2xl hover:brightness-110 shadow-lg shadow-blue-600/30 flex justify-center items-center gap-3 group disabled:opacity-50">
                {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FileSignature className="w-6 h-6" /> Generate Official Pass Instantly <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          )}

          {step === 'pass' && passData && (
            <div className="text-center animate-in zoom-in-95 flex flex-col items-center">
              
              <h3 className="font-bold text-emerald-400 text-lg uppercase tracking-widest mb-6">Pass Generated Successfully</h3>

              {/* Live Ticket UI */}
              <div id="print-section" className="w-full max-w-sm bg-white text-slate-900 rounded-[2rem] p-8 relative shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{passData.passType}</span>
                </div>

                <div className="pt-8 pb-6 border-b border-dashed border-slate-200">
                  <h4 className="text-3xl font-black mb-1 leading-tight tracking-tight">{passData.name}</h4>
                  <p className="text-slate-500 font-bold text-sm tracking-wide">{passData.eventName}</p>
                </div>

                <div className="py-6 flex flex-col items-center justify-center">
                  <img src={passData.qrCode} alt="Walkin QR" className="w-48 h-48 rounded-xl border-4 border-slate-100" />
                  <p className="font-mono text-xs text-slate-400 mt-4 tracking-widest">{passData.passId}</p>
                </div>
              </div>

              <div className="flex gap-4 w-full mt-10">
                <button onClick={() => window.print()} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors flex justify-center items-center gap-2">
                  <Printer className="w-5 h-5" /> Print Pass
                </button>
                <button onClick={() => {setStep('form'); setFormData({...formData, name: '', email: '', phone: '', company: ''})}} className="flex-1 py-4 bg-blue-600/20 text-blue-400 font-bold rounded-2xl hover:bg-blue-600/30 transition-colors flex justify-center items-center gap-2">
                  <PlusCircle className="w-5 h-5" /> Next Person
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; transform: scale(1.5); }
        }
      `}} />
    </div>
  )
}
