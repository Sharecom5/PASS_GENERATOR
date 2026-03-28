import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { csvData, eventName, eventDate, eventVenue, templateId } = await req.json()
    
    if (!csvData) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 })
    }

    await connectDB()

    const rows = csvData.split('\n').filter((r: string) => r.trim() !== '')
    const bulkOps = []
    const generatedPasses = []

    for (const row of rows) {
      const cols = row.split(',').map((c: string) => c.trim())
      if (cols.length >= 2) {
        const name = cols[0] || 'Guest'
        const email = cols[1] || 'no-email@test.com'
        const passType = cols[2] || 'Visitor'
        const company = cols[3] || ''

        // Extremely fast random 6 character alphanumeric passID
        const uniqueId = crypto.randomBytes(3).toString('hex').toUpperCase()
        const passId = `EVNT-${uniqueId}`

        // Prepare the doc for bulk insert
        const doc = {
          passId,
          name,
          email,
          phone: '0000000000', // bulk fallback
          company,
          passType,
          eventName: eventName || 'Company Event',
          eventDate: eventDate || 'TBD',
          eventVenue: eventVenue || 'Main Venue',
          status: 'registered',
          createdAt: new Date()
        }

        generatedPasses.push({ name, email, passType, passId, company })

        bulkOps.push({
          insertOne: {
            document: doc
          }
        })
      }
    }

    // Execute the massive insert instantly using bulkWrite
    if (bulkOps.length > 0) {
      await Visitor.bulkWrite(bulkOps, { ordered: false })
    }

    return NextResponse.json({ 
      success: true, 
      count: bulkOps.length,
      passes: generatedPasses
    })

  } catch (err: any) {
    console.error("Bulk Generation Error", err)
    return NextResponse.json({ error: 'Internal server error while saving passes' }, { status: 500 })
  }
}
