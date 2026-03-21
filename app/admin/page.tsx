'use client'
import { useState, useEffect } from 'react'
import { Upload, LayoutTemplate, Users, Send, Settings, CheckCircle2, QrCode, Download, ScanLine } from 'lucide-react'
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
    templateId: 'modern-dark', // modern-dark, minimal-white, corporate-blue
    csvData: 'John Doe, john@example.com, VIP\nJane Smith, jane@example.com, Speaker',
  })
  const [successMsg, setSuccessMsg] = useState('')
  const [allowMultipleEntry, setAllowMultipleEntry] = useState(true)
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      // Load current setting
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

  async function handleBlast() {
    setLoading(true)
    
    try {
      // 1. Safe Processing for LAKHS of records (Chunking System)
      const allRows = campaign.csvData.split('\n').filter(r => r.trim() !== '')
      const CHUNK_SIZE = 5000 // Break massive data into completely safe 5k increments to protect Server & Browser RAM

      let totalProcessed = 0
      
      // Create an off-screen canvas once
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = 600
      canvas.height = 900

      // Pre-load company logo if exists
      let logoImg: HTMLImageElement | null = null
      if (campaign.logoBase64) {
        logoImg = new Image()
        logoImg.src = campaign.logoBase64
        await new Promise((resolve) => { logoImg!.onload = resolve })
      }

      for (let c = 0; c < allRows.length; c += CHUNK_SIZE) {
        const chunkRows = allRows.slice(c, c + CHUNK_SIZE)
        const chunkCsvData = chunkRows.join('\\n')
        
        // Step A: Send safe chunk to backend Database
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
        
        // Step B: Generate Zip specifically for this block to save RAM
        const zip = new JSZip()
        const folder = zip.folder(`Event_Passes_Part_${Math.floor(c/CHUNK_SIZE) + 1}`)

        for (let i = 0; i < data.passes.length; i++) {
          const pass = data.passes[i]
          
          // 1. Generate QR Code image
          const qrDataUrl = await QRCode.toDataURL(pass.passId, { width: 300, margin: 2 })
          const qrImg = new Image()
          qrImg.src = qrDataUrl
          await new Promise((resolve) => { qrImg.onload = resolve })

          if (!ctx) continue

          // 2. Draw Template Background
          if (campaign.templateId === 'modern-dark') {
            ctx.fillStyle = '#0f172a'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
            grad.addColorStop(0, '#2563eb')
            grad.addColorStop(1, '#4f46e5')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, canvas.width, 180)
          } else if (campaign.templateId === 'minimal-white') {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#f8fafc'
            ctx.fillRect(0, 0, canvas.width, 180)
            ctx.strokeStyle = '#e2e8f0'
            ctx.lineWidth = 10
            ctx.strokeRect(0, 0, canvas.width, canvas.height)
          } else { 
            ctx.fillStyle = '#eff6ff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#1d4ed8'
            ctx.fillRect(0, 0, canvas.width, 180)
          }

          // 3. Draw Logo & Details
          ctx.textAlign = 'center'
          if (logoImg) {
            ctx.drawImage(logoImg, canvas.width/2 - 50, 40, 100, 100)
          }
          ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#ffffff' : (campaign.templateId === 'corporate-blue' ? '#ffffff' : '#0f172a')
          ctx.font = 'bold 36px Arial'
          ctx.fillText(campaign.name, canvas.width/2, 240)
          ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#94a3b8' : '#64748b'
          ctx.font = '24px Arial'
          ctx.fillText(`${campaign.date} | ${campaign.venue}`, canvas.width/2, 290)

          // 4. Draw Attendee Name
          ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#1e293b' : '#ffffff'
          ctx.fillRect(40, 360, canvas.width - 80, 480)
          ctx.fillStyle = campaign.templateId === 'modern-dark' ? '#ffffff' : '#0f172a'
          ctx.font = 'bold 42px Arial'
          ctx.fillText(pass.name, canvas.width/2, 440)
          ctx.fillStyle = '#3b82f6'
          ctx.font = 'bold 24px Arial'
          ctx.fillText(pass.passType.toUpperCase(), canvas.width/2, 480)

          // 5. Draw QR Code 
          ctx.drawImage(qrImg, canvas.width/2 - 120, 520, 240, 240)
          ctx.fillStyle = '#64748b'
          ctx.font = '20px monospace'
          ctx.fillText(`Pass ID: ${pass.passId}`, canvas.width/2, 800)

          // Add to Zip
          const fullPassData = canvas.toDataURL('image/png').replace("data:image/png;base64,", "")
          const safeName = pass.name.replace(/[^a-zA-Z0-9]/g, '_')
          folder?.file(`${safeName}_${pass.passType}_Ticket.png`, fullPassData, { base64: true })
        }

        // Trigger Download for this Chunk immediately to free RAM
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zipName = allRows.length > CHUNK_SIZE ? `${campaign.name.replace(/\\s+/g, '_')}_Part_${Math.floor(c/CHUNK_SIZE) + 1}.zip` : `${campaign.name.replace(/\\s+/g, '_')}_Tickets.zip`
        saveAs(zipBlob, zipName)

        totalProcessed += data.passes.length
        
        // Small pause to allow UI thread and Garbage Collection to breathe
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading...</div>
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold tracking-wide">EventPass SaaS</span>
        </div>
        <div className="px-6 py-4 flex flex-col items-center border-b border-slate-800">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white mb-2 font-bold text-lg">
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-white text-sm font-bold truncate max-w-full text-center">{session?.user?.name || 'Company Name'}</span>
          <span className="text-slate-500 text-xs mt-1">Starter Plan</span>
        </div>
        <nav className="p-4 space-y-2 flex-1 flex flex-col">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white font-medium">
            <Upload className="w-5 h-5" /> Bulk Generator
          </button>
          <a href="/scan-logs" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors">
            <ScanLine className="w-5 h-5" /> Scan Logs
          </a>
          <a href="/scan" target="_blank" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors">
            <QrCode className="w-5 h-5" /> Open Scanner
          </a>
          <div className="mt-2 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3 text-slate-400">
              <Settings className="w-5 h-5" /> Settings
            </div>
            <div className="bg-slate-950/50 px-4 py-4 border-t border-slate-800 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Entry Mode</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-300 leading-snug">Allow attendees to re-enter the venue multiple times</span>
                  <button
                    onClick={() => setAllowMultipleEntry(!allowMultipleEntry)}
                    className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ${allowMultipleEntry ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${allowMultipleEntry ? 'translate-x-7' : 'translate-x-1'}`}></span>
                  </button>
                </div>
                <p className={`text-xs mt-2 font-semibold ${allowMultipleEntry ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {allowMultipleEntry ? '✅ Free Re-entry ON — people can come & go' : '🔒 Single Entry Only — block re-entry'}
                </p>
              </div>
              <button onClick={saveSettings} className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${settingsSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {settingsSaved ? '✓ Saved!' : 'Save Setting'}
              </button>
            </div>
          </div>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors mt-auto text-red-400">
            Log out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 hide-scrollbar overflow-y-auto w-full h-screen">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Campaign & Download ZIP</h1>
            <p className="text-slate-500 mt-1">Setup your event and instantly generate a massive ZIP file containing thousands of QR Passes to blast yourself.</p>
          </header>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 33.3}%` }}></div>
            
            {[
              { num: 1, label: 'Event Details', icon: Settings },
              { num: 2, label: 'Design Pass', icon: LayoutTemplate },
              { num: 3, label: 'Audience', icon: Users },
              { num: 4, label: 'Download', icon: Download },
            ].map(s => (
              <div key={s.num} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep(s.num)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-[3px] transition-all ${step >= s.num ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${step >= s.num ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Event Details</h3>
                  <p className="text-sm text-slate-500 mb-6">Enter the basic details and upload your company/event logo.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Event Name</label>
                    <input className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                    <input className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={campaign.date} onChange={e => setCampaign({...campaign, date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Venue Location</label>
                  <input className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={campaign.venue} onChange={e => setCampaign({...campaign, venue: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Company / Event Logo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {campaign.logoBase64 ? (
                      <img src={campaign.logoBase64} alt="Logo" className="max-h-20 mx-auto object-contain" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm font-semibold text-slate-600">Click to upload or drag logo here</span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl mt-4 hover:bg-slate-800 transition-colors">Continue to Design →</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Choose a Template</h3>
                  <p className="text-sm text-slate-500 mb-6">Select from 3 gorgeous, email-ready templates.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Template 1 */}
                  <div onClick={() => setCampaign({...campaign, templateId: 'modern-dark'})} className={`cursor-pointer border-2 rounded-2xl overflow-hidden transition-all ${campaign.templateId === 'modern-dark' ? 'border-blue-600 ring-4 ring-blue-500/20' : 'border-slate-200'}`}>
                    <div className="aspect-[3/4] bg-slate-900 p-4 relative">
                      <div className="w-full h-1/5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg mb-2"></div>
                      <div className="w-8 h-8 bg-blue-500 rounded-full mb-2"></div>
                      <div className="h-2 bg-slate-700 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-slate-700 rounded w-1/2 mb-4"></div>
                      <div className="w-16 h-16 bg-white rounded mx-auto mt-auto absolute bottom-4 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="p-3 text-center bg-white font-bold text-sm text-slate-800 border-t border-slate-100">Modern Dark</div>
                  </div>
                  
                  {/* Template 2 */}
                  <div onClick={() => setCampaign({...campaign, templateId: 'minimal-white'})} className={`cursor-pointer border-2 rounded-2xl overflow-hidden transition-all ${campaign.templateId === 'minimal-white' ? 'border-blue-600 ring-4 ring-blue-500/20' : 'border-slate-200'}`}>
                    <div className="aspect-[3/4] bg-white p-4 relative border border-slate-100">
                      <div className="w-full h-1/5 bg-slate-100 border border-slate-200 rounded-t-lg mb-2"></div>
                      <div className="w-8 h-8 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-2 bg-slate-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-slate-200 rounded w-1/2 mb-4"></div>
                      <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded mx-auto mt-auto absolute bottom-4 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="p-3 text-center bg-white font-bold text-sm text-slate-800 border-t border-slate-100">Minimal White</div>
                  </div>

                  {/* Template 3 */}
                  <div onClick={() => setCampaign({...campaign, templateId: 'corporate-blue'})} className={`cursor-pointer border-2 rounded-2xl overflow-hidden transition-all ${campaign.templateId === 'corporate-blue' ? 'border-blue-600 ring-4 ring-blue-500/20' : 'border-slate-200'}`}>
                    <div className="aspect-[3/4] bg-blue-50 p-4 relative">
                      <div className="w-full h-1/5 bg-blue-600 rounded-t-lg mb-2"></div>
                      <div className="w-8 h-8 bg-white border border-blue-200 rounded-full mb-2"></div>
                      <div className="h-2 bg-blue-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-blue-200 rounded w-1/2 mb-4"></div>
                      <div className="w-16 h-16 bg-white border border-blue-200 rounded mx-auto mt-auto absolute bottom-4 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="p-3 text-center bg-white font-bold text-sm text-slate-800 border-t border-slate-100">Corporate Blue</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="w-1/3 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl mt-4 hover:bg-slate-200 transition-colors">← Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl mt-4 hover:bg-slate-800 transition-colors">Continue to Audience →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Upload Audience CSV</h3>
                  <p className="text-sm text-slate-500 mb-6">Paste your attendees. Format: Name, Email, Pass Type</p>
                </div>
                
                <div>
                  <textarea 
                    rows={8}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    value={campaign.csvData}
                    onChange={e => setCampaign({...campaign, csvData: e.target.value})}
                    placeholder="Name, Email, PassType"
                  ></textarea>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-blue-800 font-semibold flex items-center gap-2"><Users className="w-4 h-4"/> Valid Attendees Detected:</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{campaign.csvData.split('\n').filter(Boolean).length}</span>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="w-1/3 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">← Back</button>
                  <button onClick={() => setStep(4)} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Review Campaign →</button>
                </div>
              </div>
            )}

            {step === 4 && !successMsg && (
              <div className="space-y-6 text-center py-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="w-10 h-10 text-blue-600 ml-0.5 mt-0.5" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Ready to Generate?</h3>
                <p className="text-slate-500 max-w-md mx-auto">You are about to generate customized QR passes for <strong>{campaign.csvData.split('\n').filter(Boolean).length}</strong> people. The system will bundle these into a standard ZIP folder and immediately download it.</p>
                
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(3)} className="w-1/3 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors" disabled={loading}>← Edit Audience</button>
                  <button onClick={handleBlast} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2" disabled={loading}>
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Download className="w-5 h-5" /> Generate & Download ZIP</>}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && successMsg && (
              <div className="space-y-6 text-center py-10 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Download Complete!</h3>
                <p className="text-slate-500 text-lg">{successMsg}</p>
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <button onClick={() => { setStep(1); setSuccessMsg('') }} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Start New Campaign</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
