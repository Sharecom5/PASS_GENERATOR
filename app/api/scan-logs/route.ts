import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ScanLog } from '@/models/ScanLog'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'all' // all | granted | denied | duplicate
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50
    const skip = (page - 1) * limit

    const query: any = {}
    if (filter !== 'all') query.result = filter

    const [logs, total] = await Promise.all([
      ScanLog.find(query).sort({ scannedAt: -1 }).skip(skip).limit(limit).lean(),
      ScanLog.countDocuments(query)
    ])

    return NextResponse.json({ success: true, logs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error("Scan log fetch error:", err)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
