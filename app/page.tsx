'use client'
import Link from 'next/link'
import { CheckCircle2, QrCode, Smartphone, Zap, Shield, ArrowRight, BarChart } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-extrabold text-xl tracking-tight">EventPass</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          <Link href="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
          <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase mb-8 animate-in slide-in-from-bottom-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            EventPass Beta is live
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-in slide-in-from-bottom-8">
            The ultimate ticketing <br className="hidden lg:block" />
            system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">smart organisers.</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in slide-in-from-bottom-10 fade-in duration-500">
            Create beautiful events, generate smart QR passes, and securely scan attendees at the door in milliseconds. Built for modern events of all sizes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-12 fade-in duration-700">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-700 font-bold text-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-slate-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight mb-4">Everything you need to run events.</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Stop using spreadsheets and manual verification. Automate your entire event entry process from registration to the venue doors.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: QrCode, title: 'Smart QR Passes', desc: 'Auto-generate secure, tamper-proof QR codes embedded in a beautiful digital pass.' },
              { icon: Smartphone, title: 'Lightning Fast Scanning', desc: 'Scan passes at the door using any smartphone camera. Works seamlessly offline too.' },
              { icon: Zap, title: 'Instant Delivery', desc: 'Passes are instantly emailed to attendees as PDF and Image downloads.' },
              { icon: BarChart, title: 'Live Analytics', desc: 'Know exactly how many people have entered in real-time with our live dashboard.' },
              { icon: Shield, title: 'Fraud Prevention', desc: 'Prevent ticket sharing and duplicate entries with real-time sync and visual alerts.' },
              { icon: CheckCircle2, title: 'White-Label Options', desc: 'Customise the registration page and passes to match your brand exactly.' },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight mb-4">Simple, transparent pricing.</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Start for free, scale when you need. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-slate-500 text-sm mb-6">Perfect for small meetups.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500 font-medium">/forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 50 attendees', '1 Active Event', 'Basic Pass Design', 'Email Support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-4 text-center rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors">Start for Free</Link>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl shadow-blue-500/10 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">Most Popular</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-400 text-sm mb-6">For professional event organizers.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">$49</span>
                <span className="text-slate-400 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 1,000 attendees/mo', 'Unlimited Events', 'Custom Pass Designs', 'Priority Support', 'Live Analytics'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-4 text-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">Get Pro</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-500 text-sm mb-6">Unlimited scaling for large events.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-slate-900">$199</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited attendees', 'Custom Domains', 'White-labeling', 'Dedicated Account Manager', 'API Access', 'SSO Login'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-4 text-center rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <p>© 2026 EventPass SaaS. All rights reserved.</p>
      </footer>
    </div>
  )
}
