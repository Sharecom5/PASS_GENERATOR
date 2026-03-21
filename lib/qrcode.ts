import QRCode from 'qrcode'

interface QRData {
  passId: string
  name: string
  event: string
  type: string
}

// Returns base64 PNG data URL — embed directly in email/PDF
export async function generateQRCodeBase64(data: QRData): Promise<string> {
  const payload = JSON.stringify(data)
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#0a1628',
      light: '#ffffff',
    },
  })
  return dataUrl
}

// Returns SVG string — for embedding in HTML emails
export async function generateQRCodeSVG(data: QRData): Promise<string> {
  const payload = JSON.stringify(data)
  const svg = await QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    width: 200,
    margin: 1,
  })
  return svg
}

// Returns Buffer — for saving to Cloudinary
export async function generateQRCodeBuffer(data: QRData): Promise<Buffer> {
  const payload = JSON.stringify(data)
  const buffer = await QRCode.toBuffer(payload, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 400,
    margin: 2,
  })
  return buffer
}
