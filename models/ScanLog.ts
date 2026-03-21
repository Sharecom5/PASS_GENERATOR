import mongoose, { Schema, Document } from 'mongoose'

export interface IScanLog extends Document {
  passId: string
  visitorName?: string
  scannedAt: Date
  result: 'granted' | 'denied' | 'duplicate'
  deviceInfo?: string
}

const ScanLogSchema = new Schema<IScanLog>({
  passId:      { type: String, required: true },
  visitorName: { type: String },
  scannedAt:   { type: Date, default: Date.now },
  result:      { type: String, enum: ['granted','denied','duplicate'], required: true },
  deviceInfo:  { type: String },
})

export const ScanLog = (mongoose.models.ScanLog as mongoose.Model<IScanLog>) || mongoose.model<IScanLog>('ScanLog', ScanLogSchema)
