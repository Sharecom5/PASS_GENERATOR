import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { signToken, authFromRequest } from '@/lib/jwt'

// POST /api/admin/login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // Simple single-admin check from env
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken({ email, role: 'admin' })
  return NextResponse.json({ token })
}

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  const auth = authFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const [total, entered, cancelled, byType] = await Promise.all([
    Visitor.countDocuments(),
    Visitor.countDocuments({ status: 'entered' }),
    Visitor.countDocuments({ status: 'cancelled' }),
    Visitor.aggregate([{ $group: { _id: '$passType', count: { $sum: 1 } } }]),
  ])

  return NextResponse.json({
    total,
    entered,
    pending: total - entered - cancelled,
    cancelled,
    byType: byType.map(t => ({ type: t._id, count: t.count })),
  })
}
