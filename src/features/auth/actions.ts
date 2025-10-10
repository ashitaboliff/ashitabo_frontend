'use server'

import { apiGet, apiPost, apiPut } from '@/lib/api/crud'
import type { Profile } from '@/features/user/types'
import { ApiResponse } from '@/types/responseTypes'
import type { Session } from '@/types/session'
import type { AuthDetails } from '@/features/auth/types'
import { makeAuthDetails } from '@/features/auth/utils/sessionInfo'

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
