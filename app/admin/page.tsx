'use client'
import { useState, useEffect } from 'react'
import { Upload, LayoutTemplate, Users, Send, Settings, CheckCircle2, QrCode, Download, ScanLine, LayoutDashboard, Ticket, ArrowRight, ImagePlus } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import QRCode from 'qrcode'

export default function SaaSAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [campaign, setCampaign] = useState({
    name: 'TechSummit 2026',
    date: 'Dec 15, 2026',
    venue: 'New York Convention Center',
    logoBase64: '',
    customBackgroundBase64: '',
    templateId: 'modern-dark', // modern-dark, minimal-white, corporate-blue, custom
    csvData: 'John Doe, john@example.com, VIP, Acme Corp\nJane Smith, jane@example.com, Speaker',
  })
  const [successMsg, setSuccessMsg] = useState('')
  const [allowMultipleEntry, setAllowMultipleEntry] = useState(true)
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      fetch('/api/settings').then(r => r.json()).then(d => setAllowMultipleEntry(d.allowMultipleEntry))
    }
  }, [status, router])

  async function saveSettings() {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowMultipleEntry })
    })
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCampaign({ ...campaign, logoBase64: e.target?.result as string })
      reader.readAsDataURL(file)
    }
  }

  function handleCustomBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCampaign({ ...campaign, customBackgroundBase64: e.target?.result as string })
      reader.readAsDataURL(file)
    }
  }

  async function handleBlast() {
    setLoading(true)
    
    try {
      const allRows = campaign.csvData.split('\n').filter(r => r.trim() !== '')
      const CHUNK_SIZE = 5000 

      let totalProcessed = 0
      
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      let logoImg: HTMLImageElement | null = null
      if (campaign.logoBase64 && campaign.templateId !== 'custom') {
        logoImg = new Image()
        logoImg.src = campaign.logoBase64
        await new Promise((resolve) => { logoImg!.onload = resolve })
      }

      let customBgImg: HTMLImageElement | null = null
      if (campaign.templateId === 'custom' && campaign.customBackgroundBase64) {
        customBgImg = new Image()
        customBgImg.src = campaign.customBackgroundBase64
        await new Promise((resolve) => { customBgImg!.onload = resolve })
        // Use custom image size for Canvas
        canvas.width = customBgImg.width
        canvas.height = customBgImg.height
      } else {
        canvas.width = 600
        canvas.height = 900
      }

      for (let c = 0; c < allRows.length; c += CHUNK_SIZE) {
        const chunkRows = allRows.slice(c, c + CHUNK_SIZE)
        const chunkCsvData = chunkRows.join('\n')
        
        const res = await fetch('/api/bulk-save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            csvData: chunkCsvData, 
            eventName: campaign.name,
            eventDate: campaign.date,
            eventVenue: campaign.venue,
            templateId: campaign.templateId 
          })
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        
        const zip = new JSZip()
        const folder = zip.folder(`Event_Passes_Part_${Math.floor(c/CHUNK_SIZE) + 1}`)

        for (let i = 0; i < data.passes.length; i++) {
          const pass = data.passes[i]
          
          const qrDataUrl = await QRCode.toDataURL(pass.passId, { 
            width: campaign.templateId === 'custom' ? Math.floor(canvas.width * 0.35) : 300, 
            margin: 2 
          })
          const qrImg = new Image()
          qrImg.src = qrDataUrl
          await new Promise((resolve) => { qrImg.onload = resolve })

          if (!ctx) continue

          if (campaign.templateId === 'custom' && customBgImg) {
            ctx.drawImage(customBgImg, 0, 0, canvas.width, canvas.height)

            // Add dark gradient at bottom for text readability
            const textZoneHeight = Math.floor(canvas.height * 0.4)
            const grad = ctx.createLinearGradient(0, canvas.height - textZoneHeight, 0, canvas.height)
            grad.addColorStop(0, 'rgba(0,0,0,0)')
            grad.addColorStop(0.3, 'rgba(0,0,0,0.6)')
            grad.addColorStop(1, 'rgba(0,0,0,0.9)')
            ctx.fillStyle = grad
            ctx.fillRect(0, canvas.height - textZoneHeight, canvas.width, textZoneHeight)

            ctx.textAlign = 'center'
            
            // Draw QR Code centered at bottom
            const qrSize = Math.floor(canvas.width * 0.35)
            ctx.drawImage(qrImg, canvas.width/2 - qrSize/2, canvas.height - qrSize - (canvas.height * 0.05), qrSize, qrSize)

            // Name
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${Math.floor(canvas.width * 0.07)}px Arial`
            ctx.fillText(pass.name, canvas.width/2, canvas.height - qrSize - (canvas.height * 0.12))
            
            // Company
            if (pass.company) {
              ctx.fillStyle = '#d4d4d8'
              ctx.font = `bold ${Math.floor(canvas.width * 0.04)}px Arial`
              ctx.fillText(pass.company.toUpperCase(), canvas.width/2, canvas.height - qrSize - (canvas.height * 0.07))
            }
          } else {
            // Standard Templates
            if (campaign.templateId === 'modern-dark') {
              ctx.fillStyle = '#18181b'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
              grad.addColorStop(0, '#6366f1')
              grad.addColorStop(1, '#8b5cf6')
              ctx.fillStyle = grad
              ctx.fillRect(0, 0, canvas.width, 180)
              ctx.strokeStyle = '#27272a'
              ctx.lineWidth = 4
              ctx.strokeRect(0, 0, canvas.width, canvas.height)
            } else if (campaign.templateId === 'minimal-white') {
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.fillStyle = '#f4f4f5'
              ctx.fillRect(0, 0, canvas.width, 180)
              ctx.strokeStyle = '#e4e4e7'
              ctx.lineWidth = 10
              ctx.strokeRect(0, 0, canvas.width, canvas.height)
            } else { 
              ctx.fillStyle = '#fafafa'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.fillStyle = '#4f46e5'
              ctx.fillRect(0, 0, canvas.width, 180)
            }

            ctx.textAlign = 'center'
            if (logoImg) {
              ctx.drawImage(logoImg, canvas.width/2 - 50, 40, 100, 100)
            }
            ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#ffffff' : (campaign.templateId === 'corporate-blue' ? '#ffffff' : '#09090b')
            ctx.font = 'bold 36px Arial'
            ctx.fillText(campaign.name, canvas.width/2, 240)
            ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#a1a1aa' : '#71717a'
            ctx.font = '24px Arial'
            ctx.fillText(`${campaign.date} | ${campaign.venue}`, canvas.width/2, 290)

            ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#27272a' : '#ffffff'
            ctx.fillRect(40, 360, canvas.width - 80, 480)
            ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#ffffff' : '#09090b'
            
            ctx.font = 'bold 42px Arial'
            ctx.fillText(pass.name, canvas.width/2, 420)

            if (pass.company) {
              ctx.fillStyle = '#71717a'
              ctx.font = 'bold 20px Arial'
              ctx.fillText(pass.company.toUpperCase(), canvas.width/2, 455)
            }

            ctx.fillStyle = '#6366f1'
            ctx.font = 'bold 24px Arial'
            ctx.fillText(pass.passType.toUpperCase(), canvas.width/2, 495)

            ctx.drawImage(qrImg, canvas.width/2 - 120, 520, 240, 240)
            ctx.fillStyle = '#71717a'
            ctx.font = '20px monospace'
            ctx.fillText(`Pass ID: ${pass.passId}`, canvas.width/2, 800)
          }

          const fullPassData = canvas.toDataURL('image/png').replace("data:image/png;base64,", "")
          const safeName = pass.name.replace(/[^a-zA-Z0-9]/g, '_')
          folder?.file(`${safeName}_${pass.passType}_Ticket.png`, fullPassData, { base64: true })
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zipName = allRows.length > CHUNK_SIZE ? `${campaign.name.replace(/\s+/g, '_')}_Part_${Math.floor(c/CHUNK_SIZE) + 1}.zip` : `${campaign.name.replace(/\s+/g, '_')}_Tickets.zip`
        saveAs(zipBlob, zipName)

        totalProcessed += data.passes.length
        
        await new Promise(r => setTimeout(r, 1000))
      }
      
      setSuccessMsg(`Massive Export Complete! Generated and downloaded ${totalProcessed} total High-Res Passes safely in batches.`)
      setStep(4)
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 animate-pulse">
           <QrCode className="w-4 h-4 text-white" />
        </div>
        <div className="text-zinc-500 font-medium">Loading Workspace...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row font-sans selection:bg-indigo-200">
      <aside className="w-full md:w-[280px] bg-[#0A0A0B] text-zinc-400 border-r border-[#1C1C1F] flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-extrabold tracking-tight text-lg">EventPass</span>
        </div>
        
        <div className="px-6 py-5 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#0A0A0B] border border-[#27272A] shadow-inner flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 mb-3 font-bold text-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-zinc-100 text-sm font-bold truncate max-w-full tracking-wide text-center">{session?.user?.name || 'Company Name'}</span>
          <span className="text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest mt-2">Pro Plan</span>
        </div>

        <nav className="px-4 space-y-1.5 flex-1 flex flex-col">
          <p className="px-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 mt-4">Tools</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 transition-all">
            <Ticket className="w-4 h-4" /> Bulk Generator
          </button>
          <a href="/scan-logs" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#18181B] hover:text-zinc-200 transition-all font-medium">
            <ScanLine className="w-4 h-4" /> Scan Logs
          </a>
          <a href="/scan" target="_blank" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#18181B] hover:text-zinc-200 transition-all font-medium">
             <QrCode className="w-4 h-4" /> Open Scanner
          </a>
          
          <p className="px-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 mt-8">Configuration</p>
          <div className="border border-[#27272A] rounded-2xl overflow-hidden bg-[#121214] mt-1 shadow-sm">
            <div className="px-4 py-3 flex items-center gap-3 text-zinc-300 font-medium border-b border-[#27272A] bg-[#18181B]">
              <Settings className="w-4 h-4" /> Settings
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <p className="text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-wide">Scanner Mode</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 leading-snug font-medium">Allow multi-entry</span>
                  <button
                    onClick={() => setAllowMultipleEntry(!allowMultipleEntry)}
                    className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-300 ${allowMultipleEntry ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${allowMultipleEntry ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></span>
                  </button>
                </div>
              </div>
              <button 
                onClick={saveSettings} 
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${settingsSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'}`}
              >
                {settingsSaved ? 'Saved Successfully' : 'Apply Changes'}
              </button>
            </div>
          </div>

          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all mt-auto text-zinc-500 font-medium mb-4">
            Log out
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 sm:p-10 hide-scrollbar overflow-y-auto w-full h-screen relative">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-widest uppercase mb-4 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Workspace Active
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Campaign Generator</h1>
            <p className="text-zinc-500 mt-2 font-medium">Configure your event branding and generate thousands of QR passes instantly.</p>
          </header>

          <div className="flex items-center justify-between mb-10 relative px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-200 -z-10 rounded-full"></div>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-600 -z-10 transition-all duration-500 rounded-full" style={{ width: `calc(${(step - 1) * 33.3}% - 24px)` }}></div>
            
            {[
              { num: 1, label: 'Details', icon: LayoutDashboard },
              { num: 2, label: 'Design', icon: LayoutTemplate },
              { num: 3, label: 'Audience', icon: Users },
              { num: 4, label: 'Export', icon: Download },
            ].map(s => (
              <div key={s.num} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setStep(s.num)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s.num 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110' 
                    : 'bg-white border-2 border-zinc-200 text-zinc-400 group-hover:border-indigo-300 group-hover:text-indigo-400'
                }`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wide transition-colors ${step >= s.num ? 'text-indigo-700' : 'text-zinc-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in-[0.98] duration-300">
            
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Event Configuration</h3>
                  <p className="text-sm text-zinc-500 font-medium">Set up the core details that will appear on the passes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Event Name</label>
                    <input className="w-full mt-2 px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-zinc-900 shadow-sm" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Date & Time</label>
                    <input className="w-full mt-2 px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-zinc-900 shadow-sm" value={campaign.date} onChange={e => setCampaign({...campaign, date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Venue Location</label>
                  <input className="w-full mt-2 px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-zinc-900 shadow-sm" value={campaign.venue} onChange={e => setCampaign({...campaign, venue: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-2 block">Brand Logo (Default Templates only)</label>
                  <div className="border-2 border-dashed border-zinc-200 bg-zinc-50/50 rounded-2xl p-8 text-center hover:bg-zinc-100 hover:border-indigo-300 transition-all relative group shadow-sm">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {campaign.logoBase64 ? (
                      <div className="relative inline-block">
                        <img src={campaign.logoBase64} alt="Logo" className="max-h-24 mx-auto object-contain drop-shadow-md rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">Replace</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                           <Upload className="w-5 h-5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-zinc-700">Click or drag logo here</span>
                        <span className="text-xs text-zinc-500 mt-1 font-medium">SVG, PNG, JPG (Max 2MB)</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-100">
                  <button onClick={() => setStep(2)} className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2">
                    Design Ticket Layout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Ticket Aesthetics</h3>
                  <p className="text-sm text-zinc-500 font-medium">Select a structural template or upload your own background.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div onClick={() => setCampaign({...campaign, templateId: 'modern-dark'})} className={`cursor-pointer border-2 rounded-2xl p-2 transition-all duration-200 ${campaign.templateId === 'modern-dark' ? 'border-indigo-600 bg-indigo-50/50' : 'border-zinc-200'}`}>
                    <div className="aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden relative border border-zinc-800 pointer-events-none">
                      <div className="w-full h-[25%] bg-gradient-to-br from-indigo-500 to-violet-600 mb-3"></div>
                      <div className="w-16 h-16 bg-white rounded-xl mx-auto absolute bottom-4 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="p-2 text-center font-bold text-xs text-zinc-800">Dark</div>
                  </div>
                  
                  <div onClick={() => setCampaign({...campaign, templateId: 'minimal-white'})} className={`cursor-pointer border-2 rounded-2xl p-2 transition-all duration-200 ${campaign.templateId === 'minimal-white' ? 'border-indigo-600 bg-indigo-50/50' : 'border-zinc-200'}`}>
                    <div className="aspect-[3/4] bg-white rounded-xl overflow-hidden relative border-2 border-zinc-200 pointer-events-none">
                      <div className="w-full h-[25%] bg-zinc-50 mb-3 border-b border-zinc-200"></div>
                      <div className="w-16 h-16 bg-white border border-zinc-200 rounded-xl mx-auto absolute bottom-4 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="p-2 text-center font-bold text-xs text-zinc-800">Light</div>
                  </div>

                  <div onClick={() => setCampaign({...campaign, templateId: 'corporate-blue'})} className={`cursor-pointer border-2 rounded-2xl p-2 transition-all duration-200 ${campaign.templateId === 'corporate-blue' ? 'border-indigo-600 bg-indigo-50/50' : 'border-zinc-200'}`}>
                    <div className="aspect-[3/4] bg-indigo-50 rounded-xl overflow-hidden relative border border-indigo-100 pointer-events-none">
                      <div className="w-full h-[25%] bg-indigo-600 mb-3"></div>
                      <div className="w-16 h-16 bg-white rounded-xl mx-auto absolute bottom-4 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="p-2 text-center font-bold text-xs text-zinc-800">Corporate</div>
                  </div>

                  {/* Template 4: Custom */}
                  <div onClick={() => setCampaign({...campaign, templateId: 'custom'})} className={`cursor-pointer border-2 rounded-2xl p-2 transition-all duration-200 ${campaign.templateId === 'custom' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-zinc-200 border-dashed'}`}>
                    <div className="aspect-[3/4] bg-zinc-50 rounded-xl overflow-hidden relative border border-zinc-200 flex items-center justify-center flex-col pointer-events-none">
                       {campaign.customBackgroundBase64 ? (
                          <img src={campaign.customBackgroundBase64} className="w-full h-full object-cover" />
                       ) : (
                          <>
                            <ImagePlus className="w-6 h-6 text-zinc-400 mb-1" />
                            <span className="text-[10px] text-zinc-500 font-bold px-2 text-center">Your Design</span>
                          </>
                       )}
                    </div>
                    <div className="p-2 text-center font-bold text-xs text-indigo-600">Custom Upload</div>
                  </div>
                </div>

                {campaign.templateId === 'custom' && (
                  <div className="mt-6 animate-in fade-in zoom-in-95">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-2 block">Upload Custom Pass Background</label>
                    <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-8 text-center hover:bg-indigo-50 hover:border-indigo-400 transition-all relative group shadow-sm">
                      <input type="file" accept="image/*" onChange={handleCustomBgUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {campaign.customBackgroundBase64 ? (
                        <div className="flex flex-col items-center">
                           <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                           <span className="text-sm font-bold text-emerald-700">Custom background applied</span>
                           <span className="text-xs text-emerald-600/70 mt-1">Click or drag to replace</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-indigo-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                             <Upload className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <span className="text-sm font-bold text-indigo-900">Upload Blank Pass Image</span>
                          <span className="text-xs text-indigo-500 mt-1 font-medium">We will auto-place Name, Company & QR Code perfectly on it.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-zinc-100">
                  <button onClick={() => setStep(1)} className="w-1/3 py-4 bg-white text-zinc-600 font-bold rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2">Import Audience Data <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Audience Data</h3>
                  <p className="text-sm text-zinc-500 font-medium">Paste your CSV records. Supports Company Name for custom templates!</p>
                </div>
                
                <div className="relative">
                  <div className="absolute top-4 right-4 bg-white border border-zinc-200 text-zinc-500 text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">Format: Name, Email, Type, Company</div>
                  <textarea 
                    rows={8}
                    className="w-full p-5 bg-zinc-50/50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed text-zinc-800 shadow-inner resize-none"
                    value={campaign.csvData}
                    onChange={e => setCampaign({...campaign, csvData: e.target.value})}
                    placeholder="John Doe, john@example.com, VIP, Acme Corp&#10;Alice Smith, alice@example.com, Standard, Global Tech"
                    spellCheck="false"
                  ></textarea>
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
                       <Users className="w-4 h-4 text-indigo-600"/>
                     </div>
                     <span className="text-sm text-indigo-900 font-bold">Valid Attendee Records</span>
                  </div>
                  <div className="bg-white border border-indigo-100 shadow-sm text-indigo-700 px-4 py-1.5 rounded-full text-sm font-extrabold">
                    {campaign.csvData.split('\n').filter(Boolean).length} detected
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-zinc-100">
                  <button onClick={() => setStep(2)} className="w-1/3 py-4 bg-white text-zinc-600 font-bold rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">Back</button>
                  <button onClick={() => setStep(4)} className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2">Final Review <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {step === 4 && !successMsg && (
              <div className="space-y-6 text-center py-10 animate-in slide-in-from-right-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-50/50">
                   <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
                     <Download className="w-8 h-8 text-indigo-600" />
                   </div>
                </div>
                <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Ready for Deployment</h3>
                <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                  System will compile and package <strong className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{campaign.csvData.split('\n').filter(Boolean).length} secure passes</strong> into a compressed archive.
                </p>
                
                <div className="flex gap-4 pt-8">
                  <button onClick={() => setStep(3)} className="w-1/3 py-4 bg-white text-zinc-600 font-bold rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm" disabled={loading}>Edit Data</button>
                  <button onClick={handleBlast} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2 text-lg" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <><Download className="w-5 h-5" /> Compile & Download ZIP</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && successMsg && (
              <div className="space-y-6 text-center py-12 animate-in zoom-in-95 duration-500">
                <div className="relative w-28 h-28 mx-auto mb-8">
                   <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                   <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-50">
                     <CheckCircle2 className="w-12 h-12 text-white" />
                   </div>
                </div>
                <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 to-zinc-900 tracking-tight">Success!</h3>
                <p className="text-zinc-500 font-medium max-w-md mx-auto">{successMsg}</p>
                <div className="pt-10 mt-6 border-t border-zinc-100">
                  <button onClick={() => { setStep(1); setSuccessMsg('') }} className="px-8 py-4 bg-white text-zinc-900 font-bold rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-all shadow-sm hover:shadow-md">Compile Another Campaign</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
