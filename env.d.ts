declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_APP_URL: string
		NEXT_PUBLIC_API_URL: string
		NEXT_PUBLIC_GA_ID: string
		NEXT_PUBLIC_ADS_ID: string
		NEXT_PUBLIC_ADSENSE_CLIENT_ID: string
		NODE_ENV: 'development' | 'production'
		MAINTENANCE_MODE: string
		MAINTENANCE_WHITELIST: string
		API_KEY: string
	}
}
