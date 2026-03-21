'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ScanLine, CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Download } from 'lucide-react'

type ScanLog = {
  _id: string
  passId: string
  visitorName: string
  result: 'granted' | 'denied' | 'duplicate'
  scannedAt: string
  deviceInfo?: string
}

const FILTERS = [
  { label: 'All Scans', value: 'all', color: 'text-white' },
  { label: 'Granted', value: 'granted', color: 'text-emerald-400' },
  { label: 'Denied', value: 'denied', color: 'text-red-400' },
  { label: 'Duplicate', value: 'duplicate', color: 'text-amber-400' },
]

export default function ScanLogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/scan-logs?filter=${filter}&page=${page}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1)
  }, [filter])

  function exportCSV() {
    const header = 'Pass ID,Visitor Name,Result,Scanned At,Device\n'
    const rows = logs.map(l =>
      `${l.passId},"${l.visitorName}",${l.result},"${new Date(l.scannedAt).toLocaleString()}","${(l.deviceInfo || '').replace(/"/g, "'")}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scan_logs_page${page}.csv`
    a.click()
  }

  const resultBadge = (result: ScanLog['result']) => {
    if (result === 'granted') return (
      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" /> GRANTED
      </span>
    )
    if (result === 'duplicate') return (
      <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-extrabold border border-amber-500/20">
        <AlertCircle className="w-3.5 h-3.5" /> DUPLICATE
      </span>
    )
    return (
      <span className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-extrabold border border-red-500/20">
        <XCircle className="w-3.5 h-3.5" /> DENIED
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/10 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Scan Activity Log</h1>
              <p className="text-xs text-slate-400 font-medium">{total} total scan events recorded</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={fetchLogs} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-900 rounded-2xl p-1.5 border border-white/10 w-fit">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                filter === f.value
                  ? `bg-blue-600 text-white shadow-lg shadow-blue-600/30`
                  : `text-slate-400 hover:text-white`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Scans', value: total, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Granted', value: '-', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Denied / Dupe', value: '-', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-5 text-center`}>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <ScanLine className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg">No scan events yet</p>
            <p className="text-sm mt-1">Scan events will appear here in real time as staff scan passes</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-xs uppercase tracking-widest">
                  <th className="text-left p-5 font-bold">Pass ID</th>
                  <th className="text-left p-5 font-bold">Visitor Name</th>
                  <th className="text-left p-5 font-bold">Result</th>
                  <th className="text-left p-5 font-bold">Scanned At</th>
                  <th className="text-left p-5 font-bold hidden md:table-cell">Device</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-950/50'}`}>
                    <td className="p-5">
                      <span className="font-mono text-blue-400 text-xs bg-blue-500/10 px-2 py-1 rounded-lg">{log.passId}</span>
                    </td>
                    <td className="p-5 font-bold text-white">{log.visitorName || '—'}</td>
                    <td className="p-5">{resultBadge(log.result)}</td>
                    <td className="p-5 text-slate-400 font-medium">
                      {new Date(log.scannedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-5 text-slate-500 text-xs hidden md:table-cell max-w-xs truncate">
                      {log.deviceInfo?.split('(')[0]?.trim() || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-slate-500 text-sm font-medium">Page {page} of {totalPages}</p>
            <div className="flex gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 disabled:opacity-40 text-sm font-bold transition-colors">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 disabled:opacity-40 text-sm font-bold transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
