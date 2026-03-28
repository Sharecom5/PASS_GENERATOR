import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Organizer } from "@/models/Organizer"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, companyName, email, password } = await req.json()
    
    if (!name || !companyName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const existingUser = await Organizer.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "Email already taken" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await Organizer.create({
      name,
      companyName,
      email: email.toLowerCase(),
      passwordHash,
      plan: 'free',
    })

    return NextResponse.json({ success: true, message: "Account created successfully" })
  } catch (error: any) {
    console.error("Register Error:", error)
    return NextResponse.json({ 
      error: "Registration failed", 
      details: error.message || "Unknown error" 
    }, { status: 500 })
  }
}
