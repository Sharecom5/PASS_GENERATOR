import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { authFromRequest } from '@/lib/jwt'
import { sendPassEmail } from '@/lib/resend'
import { generateQRCodeBase64 } from '@/lib/qrcode'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = authFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get('search') || ''
  const status   = searchParams.get('status') || ''
  const passType = searchParams.get('passType') || ''
  const page     = parseInt(searchParams.get('page') || '1')
  const limit    = parseInt(searchParams.get('limit') || '20')

  const query: any = {}
  if (search) {
    query.$or = [
      { name:   { $regex: search, $options: 'i' } },
      { email:  { $regex: search, $options: 'i' } },
      { passId: { $regex: search, $options: 'i' } },
    ]
  }
  if (status)   query.status   = status
  if (passType) query.passType = passType

  const [visitors, total] = await Promise.all([
    Visitor.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Visitor.countDocuments(query),
  ])

  return NextResponse.json({ visitors, total, page, pages: Math.ceil(total / limit) })
}

// PATCH /api/admin/visitors — update visitor status
export async function PATCH(req: NextRequest) {
  const auth = authFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { passId, action } = await req.json()
  await connectDB()

  const visitor = await Visitor.findOne({ passId })
  if (!visitor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'cancel') {
    visitor.status = 'cancelled'
    await visitor.save()
    return NextResponse.json({ success: true, message: 'Pass cancelled' })
  }

  if (action === 'mark_entered') {
    visitor.status    = 'entered'
    visitor.enteredAt = new Date()
    await visitor.save()
    return NextResponse.json({ success: true, message: 'Marked as entered' })
  }

  if (action === 'resend') {
    const qrBase64 = await generateQRCodeBase64({
      passId: visitor.passId, name: visitor.name,
      event: visitor.eventName, type: visitor.passType,
    })
    await sendPassEmail({
      to: visitor.email, visitorName: visitor.name, passId: visitor.passId,
      passType: visitor.passType, eventName: visitor.eventName,
      eventDate: visitor.eventDate, eventVenue: visitor.eventVenue,
      qrCodeBase64: qrBase64,
    })
    return NextResponse.json({ success: true, message: 'Pass resent' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// DELETE /api/admin/visitors
export async function DELETE(req: NextRequest) {
  const auth = authFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { passId } = await req.json()
  await connectDB()
  await Visitor.deleteOne({ passId })
  return NextResponse.json({ success: true })
}
