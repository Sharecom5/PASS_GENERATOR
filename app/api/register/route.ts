import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { generatePassId } from '@/lib/utils'
import { generateQRCodeBase64 } from '@/lib/qrcode'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { sendPassEmail } from '@/lib/resend'

// Simple in-memory rate limiter (per IP, max 5 per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now  = Date.now()
  const data = rateLimitMap.get(ip)
  if (!data || now > data.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (data.count >= 5) return false
  data.count++
  return true
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many registrations from your network. Try again later.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { name, email, phone, company, passType } = body

  // Validate
  if (!name || !email || !phone) {
    return NextResponse.json({ error: 'Name, email and phone are required.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  await connectDB()

  // Duplicate check
  const existing = await Visitor.findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json(
      { error: 'already_registered', passId: existing.passId, message: 'Already registered' },
      { status: 409 }
    )
  }

  const eventName  = process.env.NEXT_PUBLIC_EVENT_NAME  || 'Event'
  const eventDate  = process.env.NEXT_PUBLIC_EVENT_DATE  || ''
  const eventVenue = process.env.NEXT_PUBLIC_EVENT_VENUE || ''

  const passId = generatePassId()

  // Generate QR code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/verify/${passId}`
  const qrBase64 = await generateQRCodeBase64(verifyUrl)

  // Upload QR to Cloudinary
  let qrCodeUrl = ''
  try {
    qrCodeUrl = await uploadToCloudinary(qrBase64, 'event-passes/qr', passId)
  } catch { /* non-fatal */ }

  // Save visitor
  const visitor = await Visitor.create({
    passId, name, email: email.toLowerCase(), phone,
    company: company || '',
    passType: passType || 'Visitor',
    status: 'registered',
    qrCodeUrl,
    eventName, eventDate, eventVenue,
  })

  // Send email (non-blocking)
  sendPassEmail({
    to: email, visitorName: name, passId,
    passType: passType || 'Visitor',
    eventName, eventDate, eventVenue,
    qrCodeBase64: qrBase64,
    passImageUrl: qrCodeUrl,
  }).catch(console.error)

  return NextResponse.json({
    success: true,
    passId: visitor.passId,
    message: `Pass sent to ${email}`,
    qrCodeUrl,
  })
}
