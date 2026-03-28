import mongoose, { Schema, Document } from 'mongoose'

export interface IOTP extends Document {
  email: string
  otp: string
  expiresAt: Date
  used: boolean
}

const OTPSchema = new Schema<IOTP>({
  email:     { type: String, required: true, lowercase: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used:      { type: Boolean, default: false },
})

// MongoDB auto-deletes documents when expiresAt is reached
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OTP = (mongoose.models.OTP as mongoose.Model<IOTP>) || mongoose.model<IOTP>('OTP', OTPSchema)
