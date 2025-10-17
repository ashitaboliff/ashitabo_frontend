import { z } from 'zod'

const envSchema = z.object({
	NEXT_PUBLIC_APP_URL: z.url(),
	NEXT_PUBLIC_GA_ID: z.string().optional(),
	NEXT_PUBLIC_ADS_ID: z.string().optional(),
	NODE_ENV: z.enum(['development', 'production']),
	MAINTENANCE_MODE: z.string().optional(),
	MAINTENANCE_WHITELIST: z.string().optional(),
	API_URL: z.url(),
	API_KEY: z.string().min(1),
	R2_ACCOUNT_ID: z.string().min(1),
	R2_ACCESS_KEY_ID: z.string().min(1),
	R2_SECRET_ACCESS_KEY: z.string().min(1),
	R2_BUCKET_NAME: z.string().min(1),
	R2_IMAGE_PROXY_SECRET: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
	console.error(
		'❌ Invalid or missing environment variables:',
		z.treeifyError(parsed.error),
	)
	throw new Error('環境変数のバリデーションに失敗しました')
}

const env = parsed.data

export default env
