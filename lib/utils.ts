import crypto from 'crypto'

// Generates: EVT-A3F9K2-20251215
export function generatePassId(): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  const date   = new Date().toISOString().slice(0,10).replace(/-/g,'')
  return `EVT-${random}-${date}`
}

// Generates 6-digit OTP
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// OTP expiry — 10 minutes from now
export function otpExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000)
}

// Pass type badge colors
export const PASS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Visitor:   { bg: '#F3F4F6', text: '#374151', label: 'VISITOR' },
  Speaker:   { bg: '#DBEAFE', text: '#1E40AF', label: 'SPEAKER' },
  VIP:       { bg: '#FEF3C7', text: '#92400E', label: 'VIP' },
  Press:     { bg: '#EDE9FE', text: '#5B21B6', label: 'PRESS' },
  Exhibitor: { bg: '#D1FAE5', text: '#065F46', label: 'EXHIBITOR' },
}
