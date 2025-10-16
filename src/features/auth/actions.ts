'use server'

import { cookies } from 'next/headers'
import { apiGet, apiPost, apiPut } from '@/lib/api/crud'
import type { Profile } from '@/features/user/types'
import { ApiResponse } from '@/types/responseTypes'
import type { Session } from '@/types/session'
import type { AuthDetails } from '@/features/auth/types'
import { makeAuthDetails } from '@/features/auth/utils/sessionInfo'

const CSRF_COOKIE_KEYS = [
	'authjs.csrf-token',
	'next-auth.csrf-token',
	'__Secure-authjs.csrf-token',
	'__Host-authjs.csrf-token',
] as const

const CALLBACK_COOKIE_KEYS = [
	'authjs.callback-url',
	'next-auth.callback-url',
	'__Secure-authjs.callback-url',
	'__Host-authjs.callback-url',
] as const

const DEFAULT_CALLBACK_URL = '/user'

const getCookieValue = async (keyList: readonly string[]) => {
	const store = await cookies()
	for (const key of keyList) {
		const value = store.get(key)?.value
		if (value && value !== 'undefined') {
			return value
		}
	}
	return null
}

export const getPadlockCsrfToken = async (): Promise<string | null> => {
	const raw = await getCookieValue(CSRF_COOKIE_KEYS)
	if (!raw) return null
	const [token] = raw.split('|')
	return token ?? null
}

export const getPadlockCallbackUrl = async (): Promise<string> => {
	const value = await getCookieValue(CALLBACK_COOKIE_KEYS)
	return value ?? DEFAULT_CALLBACK_URL
}

export const getAuthDetails = async (
	noStore?: boolean,
): Promise<AuthDetails> => {
	const sessionRes = await apiGet<Session | null>('/auth/session', {
		cache: noStore ? 'no-store' : 'default',
	})
	const base = makeAuthDetails(sessionRes.ok ? sessionRes.data ?? null : null)
	return {
		...base,
		error: sessionRes.ok ? base.error : sessionRes.message ?? base.error,
	}
}

export const createProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: Record<string, unknown>
}): Promise<ApiResponse<Profile>> => {
	return apiPost<Profile>(`/users/${userId}/profile`, {
		body,
	})
}

export const putProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: Record<string, unknown>
}): Promise<ApiResponse<Profile>> => {
	return apiPut<Profile>(`/users/${userId}/profile`, {
		body,
	})
}

export type PadlockResponse = {
	status: 'ok' | 'locked' | 'invalid'
	minutesRemaining?: number
	attemptsRemaining?: number
}

export const padLockAction = async (
	password: string,
): Promise<ApiResponse<PadlockResponse>> => {
	return apiPost<PadlockResponse>('/auth/padlock', {
		body: { password },
	})
}
