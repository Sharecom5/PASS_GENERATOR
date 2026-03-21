import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { OTP } from '@/models/OTP'
import { generateOTP, otpExpiry } from '@/lib/utils'
import { sendOTPEmail } from '@/lib/resend'

// Rate limit: max 3 OTP requests per email per hour
const otpRateLimit = new Map<string, { count: number; resetAt: number }>()

function checkOTPRateLimit(email: string): boolean {
  const now  = Date.now()
  const data = otpRateLimit.get(email)
  if (!data || now > data.resetAt) {
    otpRateLimit.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (data.count >= 3) return false
  data.count++
  return true
}

// POST /api/recover — request OTP
export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  if (!checkOTPRateLimit(email.toLowerCase())) {
    return NextResponse.json({ error: 'Too many OTP requests. Try again in 1 hour.' }, { status: 429 })
  }

  await connectDB()

  const visitor = await Visitor.findOne({ email: email.toLowerCase() })
  if (!visitor) {
    // Return same message to prevent email enumeration
    return NextResponse.json({ success: true, message: 'If found, OTP sent to email' })
  }

  // Invalidate old OTPs
  await OTP.deleteMany({ email: email.toLowerCase() })

  const otp = generateOTP()
  await OTP.create({ email: email.toLowerCase(), otp, expiresAt: otpExpiry(), used: false })

  await sendOTPEmail(email, otp, visitor.name)

  return NextResponse.json({ success: true, message: 'OTP sent to your email' })
}
