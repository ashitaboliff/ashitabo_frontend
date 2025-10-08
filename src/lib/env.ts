const ORIGIN_FALLBACK = 'http://localhost:3000'

const pickFirstEnv = (...keys: string[]) => {
	for (const key of keys) {
		const value = process.env[key]
		if (value && value.length > 0) {
			return value
		}
	}
	return undefined
}

export const FRONTEND_ORIGIN =
	pickFirstEnv(
		'NEXT_PUBLIC_FRONTEND_ORIGIN',
		'NEXT_PUBLIC_APP_BASE_URL',
		'NEXTAUTH_URL',
		'AUTH_URL',
	) ?? ORIGIN_FALLBACK

export const API_BASE_URL =
	pickFirstEnv('NEXT_PUBLIC_API_BASE_URL') ?? 'http://localhost:8787'

export const API_KEY = pickFirstEnv('NEXT_PUBLIC_API_KEY') ?? ''

export const getFrontendOrigin = () => FRONTEND_ORIGIN
