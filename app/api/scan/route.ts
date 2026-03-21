import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { ScanLog } from '@/models/ScanLog'
import { Settings } from '@/models/Settings'

export async function POST(req: NextRequest) {
  try {
    const { passId } = await req.json()
    const deviceInfo = req.headers.get('user-agent') || 'Unknown Device'

    if (!passId) {
      return NextResponse.json({ success: false, status: 'not_found', message: 'No Pass ID provided in QR Code' })
    }

    await connectDB()

    // Read the company's multiple entry preference (default: allow re-entry)
    const setting = await Settings.findOne({ key: 'allow_multiple_entry' })
    const allowMultipleEntry = setting?.value ?? true

    const visitor = await Visitor.findOne({ passId: passId.trim() })

    if (!visitor) {
      // Log failed attempt
      await ScanLog.create({ passId: passId.trim(), visitorName: 'Unknown', result: 'denied', deviceInfo })
      return NextResponse.json({ success: false, status: 'not_found', message: 'Pass not found in the system' })
    }

    if (visitor.status === 'cancelled') {
      await ScanLog.create({ passId: visitor.passId, visitorName: visitor.name, result: 'denied', deviceInfo })
      return NextResponse.json({ success: false, status: 'invalid', message: 'Pass has been cancelled' })
    }

    if (visitor.status === 'entered') {
      if (allowMultipleEntry) {
        // Company allows free re-entry — just log it and let them in
        await ScanLog.create({ passId: visitor.passId, visitorName: visitor.name, result: 'granted', deviceInfo })
        return NextResponse.json({ 
          success: true, 
          status: 'valid', 
          message: 'Welcome back! Re-entry allowed.', 
          visitor: { name: visitor.name, email: visitor.email, passType: visitor.passType, company: visitor.company, passId: visitor.passId }
        })
      } else {
        // Company set single-entry mode — block re-entry
        await ScanLog.create({ passId: visitor.passId, visitorName: visitor.name, result: 'duplicate', deviceInfo })
        return NextResponse.json({ 
          success: false, 
          status: 'already_entered', 
          message: 'This pass was already scanned. Re-entry is not allowed.', 
          visitor: { name: visitor.name, email: visitor.email, passType: visitor.passType, company: visitor.company, passId: visitor.passId }
        })
      }
    }

    // Grant Entry — update status + log success
    visitor.status = 'entered'
    await visitor.save()
    await ScanLog.create({ passId: visitor.passId, visitorName: visitor.name, result: 'granted', deviceInfo })

    return NextResponse.json({ 
      success: true, 
      status: 'valid', 
      message: 'Verified! Please allow entry.', 
      visitor: { name: visitor.name, email: visitor.email, passType: visitor.passType, company: visitor.company, passId: visitor.passId }
    })
    
  } catch (error) {
    console.error("Scan API Error:", error)
    return NextResponse.json({ success: false, status: 'error', message: 'Internal server error while scanning' })
  }
}
