'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import type { AuthDetails } from '@/domains/auth/model/authTypes'
import { makeAuthDetails } from '@/domains/auth/utils/sessionInfo'
import type { ProfileFormValues } from '@/domains/user/model/profileSchema'
import type { Profile } from '@/domains/user/model/userTypes'
import { apiGet, apiPost, apiPut } from '@/shared/lib/api/crud'
import {
	createdResponse,
	failure,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { type ApiResponse, StatusCode } from '@/types/response'
import type { Session } from '@/types/session'

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
	const base = makeAuthDetails(sessionRes.ok ? (sessionRes.data ?? null) : null)
	return {
		...base,
		error: sessionRes.ok ? base.error : (sessionRes.message ?? base.error),
	}
}

export const createProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: ProfileFormValues
}): Promise<ApiResponse<Profile>> => {
	const res = await apiPost<Profile>(`/users/${userId}/profile`, {
		body,
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザープロフィールの作成に失敗しました')
	}

	revalidateTag(`user-profile-${userId}`, 'max')
	revalidateTag(`users`, 'max')

	return createdResponse(res.data)
}

export const putProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: ProfileFormValues
}): Promise<ApiResponse<Profile>> => {
	const res = await apiPut<Profile>(`/users/${userId}/profile`, {
		body,
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザープロフィールの更新に失敗しました')
	}

	revalidateTag(`user-profile-${userId}`, 'max')
	revalidateTag(`users`, 'max')

	return okResponse(res.data)
}

export const revalidateUserAction = async (): Promise<void> => {
	revalidateTag('users', 'max')
}

export type PadlockResponse = {
	status: 'ok' | 'locked' | 'invalid'
	minutesRemaining?: number
	attemptsRemaining?: number
	token?: string
	expiresAt?: string
}

export const padLockAction = async (
	password: string,
): Promise<ApiResponse<PadlockResponse>> => {
	const res = await apiPost<PadlockResponse>('/auth/padlock', {
		body: { password },
	})

	if (!res.ok) {
		const store = await cookies()
		store.delete('padlockToken')
		return withFallbackMessage(res, 'パスワードロックに失敗しました')
	}

	const data = res.data
	if (!data || data.status !== 'ok' || typeof data.token !== 'string') {
		const store = await cookies()
		store.delete('padlockToken')
		return failure(
			StatusCode.INTERNAL_SERVER_ERROR,
			'部室鍵認証トークンの取得に失敗しました。時間をおいて再度お試しください。',
		)
	}

	const store = await cookies()
	const expires = (() => {
		if (data.expiresAt) {
			const parsed = new Date(data.expiresAt)
			if (!Number.isNaN(parsed.getTime())) {
				return parsed
			}
		}
		return new Date(Date.now() + 10 * 60 * 1000)
	})()
	store.set('padlockToken', data.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		expires,
	})

	return okResponse(data)
}
