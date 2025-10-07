import { ApiResponse, StatusCode } from '@/types/responseTypes'
import { failure, noContentResponse } from '@/lib/api/helper'

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
			return noContentResponse()
		}

		const message = await response.text()
		let status: StatusCode
		switch (response.status) {
			case StatusCode.BAD_REQUEST:
			case StatusCode.UNAUTHORIZED:
			case StatusCode.FORBIDDEN:
			case StatusCode.NOT_FOUND:
			case StatusCode.CONFLICT:
				status = response.status
				break
			default:
				status = StatusCode.INTERNAL_SERVER_ERROR
				break
		}
		return failure(status, message || 'Failed to sign out')
	} catch (error) {
		return failure(
			StatusCode.INTERNAL_SERVER_ERROR,
			error instanceof Error ? error.message : 'Sign out error',
		)
	}
}
