import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { sendOTPEmail } from '@/lib/resend'
import QRCode from 'qrcode'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, contact, otp } = body

    if (!contact) {
      return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400 })
    }

    await connectDB()
    const visitor = await Visitor.findOne({ 
      $or: [
        { email: contact.toLowerCase().trim() },
        { phone: contact.trim() }
      ]
    })

    if (!visitor) {
      return NextResponse.json({ error: 'No ticket found for this contact detail' }, { status: 404 })
    }

    if (action === 'request_otp') {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
      
      visitor.otp = newOtp
      visitor.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
      await visitor.save()

      if (contact.includes('@')) {
        const emailSent = await sendOTPEmail(visitor.email, newOtp, visitor.name)
        if (!emailSent) {
          return NextResponse.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: 'OTP sent to Email successfully' })
      } else {
        // NOTE: Here you would integrate Twilio or your SMS provider
        // e.g. await sendTwilioSMS(visitor.phone, `Your OTP is ${newOtp}`)
        console.log(`[SMS MOCK] Sending OTP ${newOtp} to phone ${visitor.phone}`)
        
        return NextResponse.json({ success: true, message: 'OTP sent to Phone successfully' })
      }
    }

    if (action === 'verify_otp') {
      if (!otp) {
        return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
      }

      if (!visitor.otp || visitor.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 })
      }

      if (!visitor.otpExpiry || new Date() > visitor.otpExpiry) {
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
      }

      visitor.otp = undefined
      visitor.otpExpiry = undefined
      await visitor.save()

      // Generate the real QR string immediately for the frontend
      const qrDataUrl = await QRCode.toDataURL(visitor.passId, { margin: 1 })

      return NextResponse.json({
        success: true,
        visitor: {
          name: visitor.name,
          email: visitor.email,
          passId: visitor.passId,
          passType: visitor.passType,
          company: visitor.company,
          eventName: visitor.eventName || 'Premium Event Pass', // fallback
          status: visitor.status,
          qrCode: qrDataUrl
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 })

  } catch (err: any) {
    console.error("Pass Recovery Error", err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
