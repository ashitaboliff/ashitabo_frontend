'use server'

import { apiRequest } from '@/lib/api'
import { getClientAuthState } from '@/lib/auth/unifiedAuth'
import type { Profile } from '@/features/user/types'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import type { Session } from '@/types/session'
import type { UnifiedAuthResult } from '@/features/auth/types'

export const getUnifiedAuthState = async (
	noStore?: boolean,
): Promise<UnifiedAuthResult> => {
	const sessionRes = await apiRequest<Session | null>('/auth/session', {
		method: 'GET',
		cache: noStore ? 'no-store' : 'default',
	})

	const session = sessionRes.ok ? sessionRes.data : null
	const sessionError = sessionRes.ok ? null : sessionRes.message

	const unified: UnifiedAuthResult = {
		session,
		authState: 'no-session',
		isAuthenticated: false,
		hasProfile: false,
		needsProfile: false,
		isInvalid: false,
		user: session?.user ?? null,
		profile: null,
	}

	const authState = getClientAuthState(session)
	unified.authState = authState

	if (authState === 'no-session') {
		return unified
	}

	if (authState === 'invalid-session') {
		unified.isInvalid = true
		return unified
	}

	unified.isAuthenticated = true

	if (!session?.user?.id) {
		unified.isInvalid = true
		if (sessionError) {
			console.warn('Failed to load session user id:', sessionError)
		}
		return unified
	}

	const profileRes = await apiRequest<Profile>(
		`/users/${session.user.id}/profile`,
		{
			method: 'GET',
			cache: 'no-store',
		},
	)

	if (profileRes.ok) {
		const profile = profileRes.data
		unified.profile = profile
		unified.hasProfile = Boolean(profile?.id)
		unified.needsProfile = !unified.hasProfile
		if (unified.hasProfile) {
			unified.authState = 'profile'
		}
	} else if (profileRes.status === StatusCode.NOT_FOUND) {
		unified.needsProfile = true
		unified.authState = 'session'
	} else {
		console.warn('Failed to load profile:', profileRes.message)
	}

	return unified
}

export const createProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: Record<string, unknown>
}): Promise<ApiResponse<Profile>> => {
	return apiRequest<Profile>(`/users/${userId}/profile`, {
		method: 'POST',
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
	return apiRequest<Profile>(`/users/${userId}/profile`, {
		method: 'PUT',
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
	return apiRequest<PadlockResponse>('/auth/padlock', {
		method: 'POST',
		body: { password },
	})
}
