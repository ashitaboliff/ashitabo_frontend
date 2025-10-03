declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		GA_ID: string
		MAINTENANCE_MODE: string
		NEXT_PUBLIC_ADSENSE_CLIENT_ID: string
		NEXT_PUBLIC_API_KEY: string
		NEXT_PUBLIC_APP_URL: string
	}
}
