'use client'
import { useState } from 'react'
import { Ticket, User, Mail, Phone, Building, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import PassCard from '@/components/PassCard'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PASS_TYPES = [
  { id: 'Visitor', label: 'Visitor' },
  { id: 'Speaker', label: 'Speaker' },
  { id: 'VIP', label: 'VIP' },
  { id: 'Press', label: 'Press' },
  { id: 'Exhibitor', label: 'Exhibitor' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', passType: 'Visitor',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.error === 'already_registered') {
        setError('You are already registered! Check your email for your pass.')
        setLoading(false)
        return
      }
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setSuccess(data)
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 font-sans selection:bg-blue-200">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-8 text-center bg-gradient-to-b from-blue-50 to-white">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-2 tracking-tight">Registration Successful!</h2>
            <p className="text-neutral-500 text-lg">Your pass has been sent to <strong className="text-neutral-800">{form.email}</strong></p>
          </div>
          <div className="flex justify-center mb-8 px-6">
            <PassCard
              name={form.name}
              company={form.company}
              passType={form.passType}
              passId={success.passId}
              eventName={process.env.NEXT_PUBLIC_EVENT_NAME || 'Tech Summit 2025'}
              eventDate={process.env.NEXT_PUBLIC_EVENT_DATE || 'Oct 15 - 17, 2025'}
              eventVenue={process.env.NEXT_PUBLIC_EVENT_VENUE || 'Convention Center, NY'}
              qrCodeBase64={success.qrCodeUrl || ''}
            />
          </div>
          <div className="m-6 p-5 rounded-2xl bg-blue-50 border border-blue-100 text-sm text-blue-700 leading-relaxed text-center">
            <strong>Forgot your pass at the venue?</strong><br />
            Visit <a href="/getpass" className="font-semibold underline underline-offset-2 hover:text-blue-900 transition-colors">/getpass</a> or scan the QR code at the entrance to recover it instantly.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/20 mb-4 backdrop-blur-md">
              <Ticket className="w-6 h-6 text-blue-200" />
            </div>
            <p className="text-blue-300 text-xs uppercase tracking-widest font-semibold mb-2">Official Registration</p>
            <h1 className="text-3xl sm:text-4xl text-white font-extrabold tracking-tight mb-2">
              {process.env.NEXT_PUBLIC_EVENT_NAME || 'Event Registration'}
            </h1>
            <p className="text-slate-400 text-sm">
              {process.env.NEXT_PUBLIC_EVENT_DATE || '2025'} &nbsp;·&nbsp; {process.env.NEXT_PUBLIC_EVENT_VENUE || 'Venue'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Phone Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Company (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                  placeholder="Google"
                  value={form.company}
                  onChange={e => update('company', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Select Pass Type</label>
            <div className="flex flex-wrap gap-2">
              {PASS_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => update('passType', type.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-semibold transition-all border outline-none",
                    form.passType === type.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-md scale-105"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-bold tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating your pass...
                </div>
              ) : (
                <>
                  Register & Get Pass
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium">
              Your pass will be securely delivered to your email inbox instantly.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
