const ORIGIN_FALLBACK = 'http://localhost:3000'

export const FRONTEND_ORIGIN =
	process.env.NEXT_PUBLIC_APP_URL ?? ORIGIN_FALLBACK
