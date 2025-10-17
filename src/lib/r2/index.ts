'use server'

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import env from '@/lib/env'

const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	},
})

const BUCKET_NAME = env.R2_BUCKET_NAME

/**
 * R2オブジェクトの署名付きURLを生成する
 * @param key オブジェクトキー (例: 'images/my-photo.jpg')
 * @returns 署名付きURL
 */
export async function getSignedUrlForR2(key: string): Promise<string> {
	const cleanKey = key.startsWith('/') ? key.slice(1) : key

	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: cleanKey,
	})

	const signedUrl = await getSignedUrl(S3, command, { expiresIn: 60 * 60 })

	return signedUrl
}

export const getImageUrl = async (imageName: string): Promise<string> => {
	const baseUrl = ''
	return `${baseUrl}${imageName}`
}
