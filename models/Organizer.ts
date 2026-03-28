import mongoose, { Schema, Document } from 'mongoose'

export interface IOrganizer extends Document {
  name: string
  email: string
  passwordHash?: string
  companyName: string
  plan: 'free' | 'pro' | 'enterprise'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripeSubscriptionStatus?: string
  googleId?: string
  createdAt: Date
}

const OrganizerSchema = new Schema<IOrganizer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  companyName: { type: String },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripeSubscriptionStatus: { type: String },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export const Organizer = (mongoose.models.Organizer as mongoose.Model<IOrganizer>) || mongoose.model<IOrganizer>('Organizer', OrganizerSchema)
