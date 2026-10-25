import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const bucket = process.env.NEON_S3_BUCKET
const client = new S3Client({
  region: process.env.NEON_S3_REGION ?? 'auto',
  endpoint: process.env.NEON_S3_ENDPOINT,
  credentials: process.env.NEON_S3_ACCESS_KEY_ID && process.env.NEON_S3_SECRET_ACCESS_KEY ? { accessKeyId: process.env.NEON_S3_ACCESS_KEY_ID, secretAccessKey: process.env.NEON_S3_SECRET_ACCESS_KEY } : undefined,
})

export async function createCoworkingImageUpload(objectKey: string, contentType: string) {
  if (!bucket) throw new Error('NEON_S3_BUCKET is not configured')
  return getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: contentType }), { expiresIn: 900 })
}
