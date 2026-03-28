import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Settings } from '@/models/Settings'

export const dynamic = 'force-dynamic'

// GET current settings
export async function GET() {
  await connectDB()
  const setting = await Settings.findOne({ key: 'allow_multiple_entry' })
  return NextResponse.json({ allowMultipleEntry: setting?.value ?? true }) // default: ALLOW re-entry
}

// PUT to update settings
export async function PUT(req: Request) {
  const { allowMultipleEntry } = await req.json()
  await connectDB()
  await Settings.findOneAndUpdate(
    { key: 'allow_multiple_entry' },
    { key: 'allow_multiple_entry', value: allowMultipleEntry, updatedAt: new Date() },
    { upsert: true, new: true }
  )
  return NextResponse.json({ success: true, allowMultipleEntry })
}
