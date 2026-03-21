import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import crypto from 'crypto'
import QRCode from 'qrcode'
import { sendPassEmail } from '@/lib/resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, passType, eventName, eventDate, eventVenue, company } = body

    if (!name || (!email && !phone)) {
      return NextResponse.json({ error: 'Name and either Email or Phone are required' }, { status: 400 })
    }

    await connectDB()

    const uniqueId = crypto.randomBytes(3).toString('hex').toUpperCase()
    const passId = `EVNT-${uniqueId}`

    // If no email, use a guaranteed-unique placeholder so the unique index never conflicts
    const visitorEmail = email
      ? email.toLowerCase().trim()
      : `walkin-${uniqueId}-${Date.now()}@no-email.local`

    const visitor = new Visitor({
      passId,
      name:       name.trim(),
      email:      visitorEmail,
      phone:      phone ? phone.trim() : '0000000000',
      company:    company ? company.trim() : '',
      passType:   passType || 'Visitor',
      eventName:  eventName || 'Live Event',
      eventDate:  eventDate || new Date().toLocaleDateString('en-IN'),
      eventVenue: eventVenue || 'Main Venue',
      status:     'registered',
      scanCount:  0,
    })

    await visitor.save()

    const qrDataUrl = await QRCode.toDataURL(passId, { margin: 1, width: 300 })

    // Send email if provided — don't block pass generation if email fails
    if (email && email.includes('@')) {
      try {
        await sendPassEmail({
          to: email,
          visitorName: name,
          passId,
          passType:   passType   || 'Visitor',
          eventName:  eventName  || 'Live Event',
          eventDate:  eventDate  || 'Today',
          eventVenue: eventVenue || 'Main Venue',
          qrCodeBase64: qrDataUrl
        })
        console.log(`[Email] Pass sent to ${email}`)
      } catch (emailErr) {
        console.error('[Email] Failed (pass still generated):', emailErr)
      }
    } else if (phone) {
      console.log(`[SMS MOCK] Pass ${passId} for ${name} → ${phone}`)
    }

    return NextResponse.json({
      success: true,
      visitor: {
        passId:    visitor.passId,
        name:      visitor.name,
        email:     visitor.email,
        phone:     visitor.phone,
        company:   visitor.company,
        passType:  visitor.passType,
        eventName: visitor.eventName,
        qrCode:    qrDataUrl
      }
    })

  } catch (err: any) {
    console.error('On-Spot Reg Error:', err?.message || err)
    return NextResponse.json({
      error: err?.message || 'Internal server error while generating pass'
    }, { status: 500 })
  }
}
