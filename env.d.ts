declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		NEXT_PUBLIC_GA_ID: string
		NEXT_PUBLIC_ADS_ID: string
		MAINTENANCE_MODE: string
		NEXT_PUBLIC_ADSENSE_CLIENT_ID: string
		NEXT_PUBLIC_API_KEY: string
		NEXT_PUBLIC_APP_URL: string
	}
}
