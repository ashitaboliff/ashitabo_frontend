declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_APP_URL: string
		NEXT_PUBLIC_GA_ID: string
		NEXT_PUBLIC_ADS_ID: string
		NODE_ENV: 'development' | 'production'
		MAINTENANCE_MODE: boolean
		MAINTENANCE_WHITELIST: string
		API_URL: string
		API_KEY: string
	}
}
