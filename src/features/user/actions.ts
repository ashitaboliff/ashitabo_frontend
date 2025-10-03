import { ApiResponse, StatusCode } from '@/types/responseTypes'

const buildSignOutUrl = () => {
	if (typeof window !== 'undefined') {
		return '/api/auth/signout'
	}
	const origin =
		process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ??
		process.env.NEXT_PUBLIC_APP_BASE_URL ??
		process.env.NEXTAUTH_URL ??
		process.env.AUTH_URL ??
		'http://localhost:3000'
	return `${origin}/api/auth/signout`
}

export const signOutUser = async (): Promise<ApiResponse<null>> => {
	try {
		const response = await fetch(buildSignOutUrl(), {
			method: 'POST',
			credentials: 'include',
			redirect: 'follow',
		})

		if (response.ok || response.status === 302) {
			return { status: StatusCode.NO_CONTENT, response: null }
		}

		const message = await response.text()
		return {
			status: response.status as StatusCode,
			response: message || 'Failed to sign out',
		} as ApiResponse<null>
	} catch (error) {
		return {
			status: StatusCode.INTERNAL_SERVER_ERROR,
			response: error instanceof Error ? error.message : 'Sign out error',
		} as ApiResponse<null>
	}
}
