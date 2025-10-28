import * as z from 'zod'

const envSchema = z.object({
	NEXT_PUBLIC_APP_URL: z.url(),
	NEXT_PUBLIC_API_URL: z.url(),
	NEXT_PUBLIC_GA_ID: z.string().optional(),
	NEXT_PUBLIC_ADS_ID: z.string().optional(),
	NODE_ENV: z.enum(['development', 'production']),
	MAINTENANCE_MODE: z.string().optional(),
	MAINTENANCE_WHITELIST: z.string().optional(),
	API_KEY: z.string().min(1),
})

const isCI = process.env.CI === 'true'

let env: z.infer<typeof envSchema>

// CI環境の場合は環境変数の存在チェックをスキップする
if (isCI) {
	env = {
		NEXT_PUBLIC_APP_URL:
			process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
		NEXT_PUBLIC_API_URL:
			process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
		NODE_ENV: process.env.NODE_ENV || 'development',
		API_KEY: process.env.API_KEY || 'dummy-api-key',
		MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
		MAINTENANCE_WHITELIST: process.env.MAINTENANCE_WHITELIST,
		NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
		NEXT_PUBLIC_ADS_ID: process.env.NEXT_PUBLIC_ADS_ID,
	} as z.infer<typeof envSchema>
} else {
	const parsed = envSchema.safeParse(process.env)

	if (!parsed.success) {
		console.error(
			'❌ Invalid or missing environment variables:',
			z.treeifyError(parsed.error),
		)
		throw new Error('環境変数のバリデーションに失敗しました')
	}

	env = parsed.data
}

export default env
