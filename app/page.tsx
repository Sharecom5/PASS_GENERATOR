'use client'
import Link from 'next/link'
import { CheckCircle2, QrCode, Smartphone, Zap, Shield, ArrowRight, BarChart } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-200 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 sm:px-12 flex justify-between items-center bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-extrabold text-xl tracking-tight">EventPass</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <Link href="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
          <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 transform duration-200">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-32 px-6">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-300/40 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4 animate-blob mix-blend-multiply" />
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-indigo-300/40 rounded-full blur-[100px] -z-10 -translate-x-1/3 animate-blob animation-delay-2000 mix-blend-multiply" />
        <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-pink-300/30 rounded-full blur-[120px] -z-10 -translate-x-1/2 animate-blob animation-delay-4000 mix-blend-multiply" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-8 backdrop-blur-sm animate-in slide-in-from-bottom-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            EventPass Beta is live
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tighter leading-[1.05] mb-6 animate-in slide-in-from-bottom-8">
            The ultimate ticketing <br className="hidden lg:block" />
            system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">smart organisers.</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in slide-in-from-bottom-10 fade-in duration-500 font-medium">
            Create beautiful events, generate smart QR passes, and securely scan attendees at the door in milliseconds. Built for modern events of all sizes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-12 fade-in duration-700">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/40 flex items-center justify-center gap-2 group hover:-translate-y-0.5">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/80 backdrop-blur-sm text-slate-700 font-bold text-lg border border-slate-200/60 hover:bg-white hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 animate-in slide-in-from-bottom-8 fade-in">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Everything you need to run events.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Stop using spreadsheets and manual verification. Automate your entire event entry process from registration to the venue doors.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: QrCode, title: 'Smart QR Passes', desc: 'Auto-generate secure, tamper-proof QR codes embedded in a beautiful digital pass.' },
              { icon: Smartphone, title: 'Lightning Fast Scanning', desc: 'Scan passes at the door using any smartphone camera. Works seamlessly offline too.' },
              { icon: Zap, title: 'Instant Delivery', desc: 'Passes are instantly emailed to attendees as PDF and Image downloads.' },
              { icon: BarChart, title: 'Live Analytics', desc: 'Know exactly how many people have entered in real-time with our live dashboard.' },
              { icon: Shield, title: 'Fraud Prevention', desc: 'Prevent ticket sharing and duplicate entries with real-time sync and visual alerts.' },
              { icon: CheckCircle2, title: 'White-Label Options', desc: 'Customise the registration page and passes to match your brand exactly.' },
            ].map((feature, i) => (
              <div key={i} className="group bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white max-w-sm mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-slate-900 -skew-y-3 origin-top-left -z-10"></div>
        <div className="max-w-6xl mx-auto pt-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Simple, transparent pricing.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Start for free, scale when you need. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Free */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium">Perfect for small meetups.</p>
              <div className="mb-8">
                <span className="text-6xl font-extrabold text-white tracking-tighter">$0</span>
                <span className="text-slate-400 font-medium">/forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 50 attendees', '1 Active Event', 'Basic Pass Design', 'Email Support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-4 text-center rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors border border-white/5">Start for Free</Link>
            </div>

            {/* Pro */}
            <div className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 flex flex-col transform md:-translate-y-4">
              <div className="absolute -inset-[2px] bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 rounded-[2.6rem] -z-10 opacity-50 blur-[2px]"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full ring-4 ring-white">Most Popular</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">For professional event organizers.</p>
              <div className="mb-8">
                <span className="text-6xl font-extrabold text-slate-900 tracking-tighter">$49</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 1,000 attendees/mo', 'Unlimited Events', 'Custom Pass Designs', 'Priority Support', 'Live Analytics'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-4 text-center rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5 duration-200">Get Pro</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium">Unlimited scaling for large events.</p>
              <div className="mb-8">
                <span className="text-6xl font-extrabold text-white tracking-tighter">$199</span>
                <span className="text-slate-400 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited attendees', 'Custom Domains', 'White-labeling', 'Dedicated Account Manager', 'API Access', 'SSO Login'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-4 text-center rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors border border-white/5">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-12 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 opacity-80">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <p className="font-medium text-sm">© 2026 EventPass SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
