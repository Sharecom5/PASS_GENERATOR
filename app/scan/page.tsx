'use client'
import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, AlertCircle, ScanLine, UserSquare2, RefreshCw, Camera, KeyboardIcon, Lock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type ScanResult = {
  success: boolean
  status: 'valid' | 'already_entered' | 'invalid' | 'not_found' | 'error'
  message: string
  visitor?: { name: string; email: string; passType: string; company?: string; passId: string }
}

type Mode = 'camera' | 'barcode'

export default function MobileScannerApp() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('camera')
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?from=scan')
    }
  }, [status, router])

  // For hardware barcode scanner (keyboard emulation)
  const barcodeBuffer = useRef('')
  const barcodeTimer = useRef<NodeJS.Timeout | null>(null)

  // ─────────────────────────────────────────
  // CAMERA MODE — html5-qrcode
  // ─────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'camera' || !scanning) return

    let scanner: any = null

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      )
      scanner.render(
        async (decodedText: string) => {
          setScanning(false)
          scanner.clear()
          await verifyPass(decodedText)
        },
        () => {}
      )
    })

    return () => {
      if (scanner) scanner.clear().catch(() => {})
    }
  }, [scanning, mode])

  // ─────────────────────────────────────────
  // BARCODE SCANNER MODE — Keyboard emulation
  // Hardware barcode scanners type chars fast + press Enter
  // ─────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'barcode' || !scanning) return

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore modifier keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return

      if (e.key === 'Enter') {
        const scanned = barcodeBuffer.current.trim()
        if (scanned.length > 3) {
          barcodeBuffer.current = ''
          setScanning(false)
          verifyPass(scanned)
        }
        return
      }

      barcodeBuffer.current += e.key

      // Auto-flush after 100ms silence (backup, in case scanner doesn't send Enter)
      if (barcodeTimer.current) clearTimeout(barcodeTimer.current)
      barcodeTimer.current = setTimeout(() => {
        const scanned = barcodeBuffer.current.trim()
        if (scanned.length > 3) {
          setScanning(false)
          verifyPass(scanned)
        }
        barcodeBuffer.current = ''
      }, 100)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, scanning])

  // ─────────────────────────────────────────
  // Shared API verification
  // ─────────────────────────────────────────
  async function verifyPass(passId: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId })
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, status: 'error', message: 'Network or Server Error' })
    } finally {
      setLoading(false)
    }
  }

  function resetScanner() {
    setResult(null)
    barcodeBuffer.current = ''
    setScanning(true)
  }

  function switchMode(newMode: Mode) {
    setMode(newMode)
    setResult(null)
    barcodeBuffer.current = ''
    setScanning(true)
  }

  // Show loading spinner while session is being checked
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  // This will briefly show before the redirect kicks in
  if (status === 'unauthenticated') return null

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Entry Scanner</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Staff Mode</p>
          </div>
        </div>
        {/* Authorized staff badge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <div className="text-right">
            <p className="text-xs font-extrabold text-emerald-400 leading-none">Authorized</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-[120px] truncate">{session?.user?.name || session?.user?.email}</p>
          </div>
        </div>
      </header>

      {/* Mode Switcher */}
      <div className="flex mx-4 mt-5 bg-slate-900 rounded-2xl p-1 border border-white/10 gap-1">
        <button
          onClick={() => switchMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            mode === 'camera' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          Mobile Camera
        </button>
        <button
          onClick={() => switchMode('barcode')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            mode === 'barcode' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <KeyboardIcon className="w-4 h-4" />
          Barcode Device
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-6 w-full max-w-md mx-auto relative pt-6">
        
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-blue-400 animate-pulse tracking-widest uppercase">Verifying Pass...</p>
            </div>
          </div>
        )}

        {/* ── CAMERA MODE ── */}
        {mode === 'camera' && scanning && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <p className="mb-4 text-sm font-semibold text-slate-400 text-center">Point camera at the attendee&apos;s QR code</p>
            <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border-2 border-slate-800 bg-slate-900"></div>
          </div>
        )}

        {/* ── BARCODE DEVICE MODE ── */}
        {mode === 'barcode' && scanning && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300 mt-4">
            <div className="w-full border-2 border-dashed border-blue-500/30 rounded-3xl p-12 flex flex-col items-center gap-5 text-center bg-blue-500/5">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center animate-pulse">
                <KeyboardIcon className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">Barcode Scanner Ready</p>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  Aim your hardware scanner at any attendee&apos;s QR barcode.<br/>
                  The code will be verified automatically.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Listening for scan input...</span>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT (shared for both modes) ── */}
        {result && !loading && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            {/* GREEN: VALID */}
            {result.status === 'valid' && (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-emerald-900/20">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-emerald-400 tracking-tight">ACCESS GRANTED</h2>
                <p className="text-emerald-500/80 font-bold uppercase tracking-widest text-sm mt-1 mb-8">{result.message}</p>
                
                {result.visitor && (
                  <div className="w-full bg-slate-900/50 rounded-2xl p-5 text-left border border-white/5 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Name</span>
                      <p className="text-lg font-bold text-white flex items-center gap-2"><UserSquare2 className="w-4 h-4 text-emerald-400"/> {result.visitor.name}</p>
                    </div>
                    {result.visitor.company && (
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company</span>
                        <p className="text-sm font-medium text-slate-300">{result.visitor.company}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pass Type</span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider">{result.visitor.passType}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* YELLOW: ALREADY ENTERED */}
            {result.status === 'already_entered' && (
              <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-amber-900/20">
                <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-amber-500/20">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-amber-400 tracking-tight">ALREADY SCANNED</h2>
                <p className="text-amber-500/80 font-bold uppercase tracking-widest text-sm mt-1 mb-8">{result.message}</p>
                {result.visitor && (
                  <div className="w-full bg-slate-900/50 rounded-2xl p-5 text-left border border-white/5 opacity-80">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registered To</span>
                    <p className="text-lg font-bold text-white mt-1">{result.visitor.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* RED: DENIED */}
            {(result.status === 'invalid' || result.status === 'not_found' || result.status === 'error') && (
              <div className="w-full bg-red-500/10 border border-red-500/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-red-900/20">
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-500/20">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-red-400 tracking-tight">ACCESS DENIED</h2>
                <p className="text-red-500/80 font-bold uppercase tracking-widest text-sm mt-1 mb-2">{result.message}</p>
              </div>
            )}

            <button 
              onClick={resetScanner} 
              className="mt-8 w-full py-4 bg-slate-800 text-white border border-slate-700 font-bold rounded-2xl hover:bg-slate-700 hover:border-slate-600 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> Scan Next Ticket
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mt-auto">
        {mode === 'camera' ? 'Ensure screen brightness is up on attendee device' : 'USB / Bluetooth barcode scanners are supported'}
      </footer>

    </div>
  )
}
