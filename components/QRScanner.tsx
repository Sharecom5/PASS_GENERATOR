'use client'
import { useEffect, useRef, useState } from 'react'

interface ScanResult {
  result: 'granted' | 'denied' | 'duplicate'
  message: string
  visitor?: {
    name: string
    passType: string
    company?: string
    enteredAt?: string
  }
}

const PASS_TYPE_COLORS: Record<string, string> = {
  VIP: '#D97706', Speaker: '#1D4ED8', Press: '#7C3AED',
  Exhibitor: '#065F46', Visitor: '#374151',
}

export default function QRScanner({ staffPin }: { staffPin: string }) {
  const scannerRef    = useRef<any>(null)
  const divRef        = useRef<HTMLDivElement>(null)
  const [result, setResult]     = useState<ScanResult | null>(null)
  const [loading, setLoading]   = useState(false)
  const [manualId, setManualId] = useState('')
  const [log, setLog]           = useState<Array<{ passId: string; result: string; time: string; name?: string }>>([])
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    startScanner()
    return () => { stopScanner() }
  }, [])

  async function startScanner() {
    const { Html5Qrcode } = await import('html5-qrcode')
    if (!divRef.current || scannerRef.current) return

    const scanner = new Html5Qrcode('qr-scanner-div')
    scannerRef.current = scanner
    setScanning(true)

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScan(decodedText),
        () => {}
      )
    } catch (err) {
      console.error('Camera error:', err)
      setScanning(false)
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      scannerRef.current = null
      setScanning(false)
    }
  }

  async function handleScan(rawText: string) {
    if (loading) return
    setLoading(true)

    // Extract passId from JSON or use raw text
    let passId = rawText
    try {
      const parsed = JSON.parse(rawText)
      if (parsed.passId) passId = parsed.passId
    } catch {}

    await verify(passId)
    setLoading(false)
  }

  async function verify(passId: string) {
    const res  = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passId, staffPin, deviceInfo: navigator.userAgent }),
    })
    const data: ScanResult = await res.json()
    setResult(data)

    // Sound feedback
    playSound(data.result)

    // Add to log
    setLog(prev => [
      { passId, result: data.result, time: new Date().toLocaleTimeString(), name: data.visitor?.name },
      ...prev.slice(0, 9),
    ])

    // Auto-clear result after 3 seconds
    setTimeout(() => setResult(null), 3000)
  }

  function playSound(type: 'granted' | 'denied' | 'duplicate') {
    const ctx   = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc   = ctx.createOscillator()
    const gain  = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'granted') {
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(); osc.stop(ctx.currentTime + 0.3)
    } else {
      osc.frequency.value = 200
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(); osc.stop(ctx.currentTime + 0.5)
    }
  }

  async function handleManualSubmit() {
    if (!manualId.trim()) return
    setLoading(true)
    await verify(manualId.trim())
    setManualId('')
    setLoading(false)
  }

  // Full-screen result overlay
  if (result) {
    const colors = {
      granted:   { bg: '#052e16', border: '#16a34a', text: '#4ade80', label: 'ENTRY GRANTED' },
      denied:    { bg: '#450a0a', border: '#dc2626', text: '#f87171', label: 'ENTRY DENIED' },
      duplicate: { bg: '#431407', border: '#ea580c', text: '#fb923c', label: 'ALREADY ENTERED' },
    }
    const c = colors[result.result]
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: c.bg, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {result.result === 'granted' ? '✓' : '✗'}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: c.text, letterSpacing: 2, marginBottom: 12 }}>
          {c.label}
        </div>
        {result.visitor && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: '#ffffff', fontWeight: 700 }}>{result.visitor.name}</div>
            <div style={{ fontSize: 16, color: c.text, marginTop: 6 }}>
              <span style={{ background: PASS_TYPE_COLORS[result.visitor.passType] || '#374151',
                color: '#fff', padding: '2px 12px', borderRadius: 20, fontSize: 12 }}>
                {result.visitor.passType}
              </span>
              {result.visitor.company && (
                <span style={{ color: '#9ca3af', marginLeft: 10 }}>{result.visitor.company}</span>
              )}
            </div>
            {result.result === 'duplicate' && result.visitor.enteredAt && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#fb923c' }}>
                First entered: {new Date(result.visitor.enteredAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop: 20, fontSize: 13, color: '#6b7280' }}>Auto-closing in 3 seconds…</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '1rem' }}>
      {/* Camera viewfinder */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', border: '2px solid #1f2937',
        background: '#000', marginBottom: 16, position: 'relative',
      }}>
        <div id="qr-scanner-div" ref={divRef} style={{ width: '100%' }} />
        {!scanning && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#111', color: '#6b7280', fontSize: 14,
          }}>
            Starting camera…
          </div>
        )}
      </div>

      {/* Manual entry */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={manualId}
          onChange={e => setManualId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
          placeholder="Or type Pass ID manually…"
          style={{
            flex: 1, padding: '12px 14px', borderRadius: 10,
            border: '1.5px solid #1f2937', background: '#111827',
            color: '#ffffff', fontSize: 14, fontFamily: 'monospace',
          }}
        />
        <button
          onClick={handleManualSubmit}
          disabled={loading}
          style={{
            padding: '12px 20px', borderRadius: 10, border: 'none',
            background: '#185FA5', color: '#ffffff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          {loading ? '…' : 'Verify'}
        </button>
      </div>

      {/* Scan log */}
      {log.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Recent Scans
          </div>
          {log.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: '#111827',
              borderRadius: 8, marginBottom: 6,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: entry.result === 'granted' ? '#16a34a' : entry.result === 'duplicate' ? '#ea580c' : '#dc2626',
              }} />
              <div style={{ flex: 1, fontSize: 13, color: '#e5e7eb' }}>{entry.name || entry.passId}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{entry.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
