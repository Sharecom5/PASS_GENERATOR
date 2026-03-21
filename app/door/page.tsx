'use client'
import { useState } from 'react'
import { QrCode, ArrowRight, CheckCircle2, Tent, Mail, User, Building2, Ticket, Phone } from 'lucide-react'

export default function SelfServiceDoorRegistration() {
  const [step, setStep] = useState<'welcome' | 'form' | 'pass'>('welcome')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passData, setPassData] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    eventName: process.env.NEXT_PUBLIC_EVENT_NAME || 'Annual Tech Summit',
    eventDate: process.env.NEXT_PUBLIC_EVENT_DATE || '2025-12-15',
    eventVenue: process.env.NEXT_PUBLIC_EVENT_VENUE || 'Hall A, New Delhi',
    passType: 'Visitor'
  })

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Reusing the same powerful API we built for on-spot staff
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
      setError(err.message || 'Failed to generate your pass. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900 selection:bg-blue-200">
      <div className="w-full max-w-md">
        
        {step === 'welcome' && (
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-3">
              <Tent className="w-12 h-12 text-white -rotate-3" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Welcome to the Event!</h1>
            <p className="text-slate-500 text-lg mb-10 px-4">Skip the line. Generate your official digital pass right now on your phone.</p>
            <button onClick={() => setStep('form')} className="w-full py-5 bg-slate-900 text-white font-bold text-lg rounded-2xl hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/20 flex justify-center items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <div className="mt-8 text-sm font-semibold text-slate-400 flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4" /> Scan at the gate
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 relative overflow-hidden animate-in slide-in-from-right-8">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight">Your Details</h2>
              <p className="text-slate-500 text-sm mt-1">Please enter your real name as it appears on your ID.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 text-red-600 border border-red-100 text-sm font-bold p-4 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="+1234567890" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Company (Optional)</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="Acme Corp" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Ticket className="w-5 h-5" /> Generate Digital Ticket</>}
              </button>
            </form>
          </div>
        )}

        {step === 'pass' && passData && (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
            
            <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 mb-8 shadow-sm">
              <CheckCircle2 className="w-5 h-5" /> Pass Activated
            </div>

            {/* Live Mobile Ticket */}
            <div className="w-full bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              
              <div className="text-center pb-6 border-b border-white/10 relative z-10">
                <span className="bg-white/10 text-blue-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">{passData.passType}</span>
                <h4 className="text-3xl font-black mb-1 leading-tight tracking-tight">{passData.name}</h4>
                <p className="text-slate-400 font-bold text-sm tracking-wide">{passData.eventName}</p>
                {passData.company && <p className="text-slate-500 text-xs mt-1">{passData.company}</p>}
              </div>

              <div className="py-8 flex flex-col items-center justify-center bg-white mt-8 rounded-3xl relative z-10 shadow-inner">
                <img src={passData.qrCode} alt="Your QR Pass" className="w-48 h-48 block" />
                <p className="font-mono text-xs text-slate-500 mt-4 tracking-widest font-bold">{passData.passId}</p>
              </div>
            </div>

            <p className="text-slate-500 text-sm mt-8 font-medium text-center">Take a screenshot of this pass and have it ready at the door scanner.</p>
          </div>
        )}

      </div>
    </div>
  )
}
