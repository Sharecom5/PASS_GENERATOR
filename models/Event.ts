import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IEvent extends Document {
  organizerId: Types.ObjectId
  name: string
  date: string
  venue: string
  slug: string
  description?: string
  capacity?: number
  registrationOpen: boolean
  logoUrl?: string
  passTypes: string[]
  createdAt: Date
}

const EventSchema = new Schema<IEvent>({
  organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  venue: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  capacity: { type: Number },
  registrationOpen: { type: Boolean, default: true },
  logoUrl: { type: String },
  passTypes: [{ type: String, default: ['Visitor', 'VIP', 'Speaker'] }],
  createdAt: { type: Date, default: Date.now },
})

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)
