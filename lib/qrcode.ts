import QRCode from 'qrcode'

// Returns base64 PNG data URL — embed directly in email/PDF
export async function generateQRCodeBase64(url: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(url, {
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
export async function generateQRCodeSVG(url: string): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    width: 200,
    margin: 1,
  })
  return svg
}

// Returns Buffer — for saving to Cloudinary
export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  const buffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 400,
    margin: 2,
  })
  return buffer
}
