import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:     process.env.CLOUDINARY_API_KEY!,
  api_secret:  process.env.CLOUDINARY_API_SECRET!,
})

// Upload a base64 data URL or buffer to Cloudinary
export async function uploadToCloudinary(
  data: string | Buffer,   // base64 dataURL or Buffer
  folder: string,
  publicId: string
): Promise<string> {
  const uploadData = Buffer.isBuffer(data)
    ? `data:image/png;base64,${data.toString('base64')}`
    : data

  const result = await cloudinary.uploader.upload(uploadData, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  })

  return result.secure_url
}

// Upload a PDF buffer
export async function uploadPDFToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'raw', format: 'pdf' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    )
    stream.end(buffer)
  })
}
