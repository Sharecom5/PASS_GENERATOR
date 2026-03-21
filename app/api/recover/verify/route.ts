import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { OTP } from '@/models/OTP'
import { generateQRCodeBase64 } from '@/lib/qrcode'

// POST /api/recover/verify — verify OTP and return pass data
export async function POST(req: NextRequest) {
  const { email, otp } = await req.json()

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
  }

  await connectDB()

  const otpRecord = await OTP.findOne({
    email: email.toLowerCase(),
    used: false,
    expiresAt: { $gt: new Date() },
  })

  if (!otpRecord || otpRecord.otp !== otp.toString()) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
  }

  // Mark OTP as used
  otpRecord.used = true
  await otpRecord.save()

  const visitor = await Visitor.findOne({ email: email.toLowerCase() })
  if (!visitor) {
    return NextResponse.json({ error: 'Visitor not found' }, { status: 404 })
  }

  // Re-generate QR code for display
  const qrBase64 = await generateQRCodeBase64({
    passId: visitor.passId,
    name:   visitor.name,
    event:  visitor.eventName,
    type:   visitor.passType,
  })

  return NextResponse.json({
    success: true,
    visitor: {
      passId:    visitor.passId,
      name:      visitor.name,
      email:     visitor.email,
      company:   visitor.company,
      passType:  visitor.passType,
      eventName: visitor.eventName,
      eventDate: visitor.eventDate,
      eventVenue:visitor.eventVenue,
      status:    visitor.status,
      qrCode:    qrBase64,
      passPdfUrl:visitor.passPdfUrl,
    },
  })
}
