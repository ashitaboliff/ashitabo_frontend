declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_APP_URL: string
		NEXT_PUBLIC_GA_ID: string
		NEXT_PUBLIC_ADS_ID: string
		NODE_ENV: 'development' | 'production'
		MAINTENANCE_MODE: string
		MAINTENANCE_WHITELIST: string
		API_URL: string
		API_KEY: string
		R2_ACCOUNT_ID: string
		R2_ACCESS_KEY_ID: string
		R2_SECRET_ACCESS_KEY: string
		R2_BUCKET_NAME: string
	}
}
