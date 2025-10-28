import { failure, noContentResponse } from '@/shared/lib/api/helper'
import { logError } from '@/shared/utils/logger'
import { type ApiResponse, StatusCode } from '@/types/response'
import type { Session } from '@/types/session'

const CSRF_ENDPOINT = '/api/auth/csrf'
const SIGN_OUT_ENDPOINT = '/api/auth/signout'

export const fetchCsrfToken = async (): Promise<string | null> => {
	const response = await fetch(CSRF_ENDPOINT, {
		credentials: 'include',
		cache: 'no-store',
		headers: {
			Accept: 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('CSRFトークンの取得に失敗しました。')
	}

	const payload = (await response.json()) as {
		csrfToken?: string | null
	} | null
	const token = payload?.csrfToken ?? null
	return token && token.length > 0 ? token : null
}

const ensureCsrfToken = async () => {
	const token = await fetchCsrfToken()
	if (!token) {
		throw new Error(
			'CSRFトークンが取得できませんでした。ページを再読み込みしてもう一度お試しください。',
		)
	}
	return token
}

export const updateSession = async (
	data?: Record<string, unknown>,
): Promise<Session | null> => {
	const csrfToken = await ensureCsrfToken()
	const response = await fetch('/api/auth/session?update', {
		method: 'POST',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'X-Auth-Return-JSON': 'true',
		},
		body: JSON.stringify({ csrfToken, data }),
	})

	if (!response.ok) {
		let message: string | undefined
		try {
			const payload = await response.json()
			message =
				typeof payload?.message === 'string'
					? payload.message
					: typeof payload?.error === 'string'
						? payload.error
						: undefined
		} catch (error) {
			logError('Failed to parse session update error payload', error)
			message = await response.text()
		}
		throw new Error(message || 'セッションの更新に失敗しました。')
	}

	if (response.status === StatusCode.NO_CONTENT) {
		return null
	}

	const contentType = response.headers.get('content-type') ?? ''
	if (!contentType.includes('application/json')) {
		return null
	}

	return (await response.json()) as Session | null
}

export const signOut = async (): Promise<ApiResponse<null>> => {
	try {
		const csrfToken = await ensureCsrfToken()

		const response = await fetch(SIGN_OUT_ENDPOINT, {
			method: 'POST',
			credentials: 'include',
			redirect: 'follow',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ csrfToken }),
		})

		if (response.ok || response.status === 302) {
			return noContentResponse()
		}

		let message: string | undefined
		try {
			const data = await response.json()
			message =
				typeof data?.message === 'string'
					? data.message
					: typeof data?.error === 'string'
						? data.error
						: undefined
		} catch (error) {
			logError('Failed to parse signout error payload', error)
			message = await response.text()
		}

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
		logError('Sign out request failed', error)
		return failure(
			StatusCode.INTERNAL_SERVER_ERROR,
			error instanceof Error ? error.message : 'Sign out error',
		)
	}
}
