'use client'
import { useRef } from 'react'
import { Download } from 'lucide-react'

interface PassCardProps {
  name: string
  company?: string
  passType: string
  passId: string
  eventName: string
  eventDate: string
  eventVenue: string
  qrCodeBase64: string
  showDownload?: boolean
}

const PASS_TYPE_STYLES: Record<string, { badgeBg: string; badgeText: string }> = {
  VIP:       { badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
  Speaker:   { badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
  Press:     { badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-700' },
  Exhibitor: { badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700' },
  Visitor:   { badgeBg: 'bg-slate-200', badgeText: 'text-slate-700' },
}

export default function PassCard({
  name, company, passType, passId,
  eventName, eventDate, eventVenue,
  qrCodeBase64, showDownload = true,
}: PassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const style = PASS_TYPE_STYLES[passType] || PASS_TYPE_STYLES.Visitor

  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

  async function handleDownload(format: 'png' | 'pdf' = 'png') {
    const { default: html2canvas } = await import('html2canvas')
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: '#0f172a' })
    const imgData = canvas.toDataURL('image/png')
    
    if (format === 'png') {
      const link = document.createElement('a')
      link.download = `pass-${passId}.png`
      link.href = imgData
      link.click()
    } else {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
      pdf.save(`pass-${passId}.pdf`)
    }
  }

  return (
    <div className="w-[360px] max-w-full font-sans group">
      {/* The Pass Card */}
      <div
        ref={cardRef}
        className="w-full relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-blue-500/20"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Top gradient stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 relative z-10 flex justify-between items-start">
          <div className="pr-4">
            <h3 className="text-white text-lg font-bold tracking-tight leading-tight">{eventName}</h3>
            <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase mt-1">Official Entry Pass</p>
          </div>
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap ${style.badgeBg} ${style.badgeText}`}>
            {passType}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white/20 shadow-inner flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold tracking-tight leading-none mb-1">{name}</h2>
              {company && <p className="text-blue-200 text-sm font-medium">{company}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Date</p>
              <p className="text-white text-xs font-medium">{eventDate}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Venue</p>
              <p className="text-white text-xs font-medium">{eventVenue}</p>
            </div>
          </div>
        </div>

        {/* Footer with QR */}
        <div className="p-5 bg-black/40 backdrop-blur-md relative z-10 flex items-center gap-5 border-t border-white/5">
          <div className="w-20 h-20 bg-white rounded-xl p-1.5 shadow-lg flex-shrink-0 relative overflow-hidden group">
            {qrCodeBase64 ? (
              <img src={qrCodeBase64} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="w-full h-full bg-slate-100/50 rounded-lg animate-pulse" />
            )}
            {/* Scanner laser effect */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.5)] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Pass ID</p>
            <p className="text-blue-100 text-xs font-mono font-bold truncate tracking-wider">{passId}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Valid Entry</span>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <div className="py-2 text-center bg-black/60 relative z-10">
          <p className="text-white/30 text-[9px] font-bold tracking-[0.2em]">NON-TRANSFERABLE &middot; ONE-TIME USE</p>
        </div>
      </div>

      {showDownload && (
        <button
          onClick={() => handleDownload('png')}
          className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-bold tracking-wide hover:bg-slate-800 hover:border-slate-700 transition-all group shadow-md"
        >
          <Download className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          Download Pass as Image
        </button>
      )}

      {/* Global styles for the scanner laser animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}} />
    </div>
  )
}
