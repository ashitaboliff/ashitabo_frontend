import { apiRequest } from '@/lib/api'
import { getClientAuthState } from '@/lib/auth/unifiedAuth'
import { Profile } from '@/features/user/types'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import { Session } from '@/types/session'
import { UnifiedAuthResult } from '@/features/auth/types'

const mapProfileFromApi = (input: any): Profile => {
	if (!input) {
		return {
			id: '',
			user_id: '',
			name: null,
			student_id: null,
			expected: null,
			role: 'STUDENT',
			part: [],
		}
	}

	return {
		id: input.id,
		user_id: input.userId,
		name: input.name ?? null,
		student_id: input.studentId ?? null,
		expected: input.expected ?? null,
		role: input.role,
		part: input.part ?? [],
		created_at: input.createdAt ? new Date(input.createdAt) : undefined,
		updated_at: input.updatedAt ? new Date(input.updatedAt) : undefined,
		is_deleted: input.isDeleted ?? false,
	}
}

const mapProfileToApi = (body: Record<string, unknown>) => {
	const {
		name,
		student_id,
		expected,
		role,
		part,
		...rest
	} = body

	return {
		...rest,
		name,
		studentId: student_id,
		expected,
		role,
		part,
	}
}

export const getUnifiedAuthState = async (
	noStore?: boolean,
): Promise<UnifiedAuthResult> => {
	const sessionRes = await apiRequest<Session | null>('/auth/session', {
		method: 'GET',
		cache: noStore ? 'no-store' : 'default',
	})

	const session =
		sessionRes.status === StatusCode.OK &&
		typeof sessionRes.response !== 'string'
			? (sessionRes.response as Session | null)
			: null

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
		return unified
	}

	const profileRes = await apiRequest<Profile>(
		`/users/${session.user.id}/profile`,
		{
			method: 'GET',
			cache: 'no-store',
		},
	)

	if (
		profileRes.status === StatusCode.OK &&
		typeof profileRes.response !== 'string'
	) {
		const profile = mapProfileFromApi(profileRes.response)
		unified.profile = profile
		unified.hasProfile = Boolean(profile.id)
		unified.needsProfile = !unified.hasProfile
		if (unified.hasProfile) {
			unified.authState = 'profile'
		}
	} else if (profileRes.status === StatusCode.NOT_FOUND) {
		unified.needsProfile = true
		unified.authState = 'session'
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
	const res = await apiRequest<Profile>(`/users/${userId}/profile`, {
		method: 'POST',
		body: mapProfileToApi(body),
	})

	if (
		res.status === StatusCode.CREATED &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapProfileFromApi(res.response),
		}
	}

	return res
}

export const putProfileAction = async ({
	userId,
	body,
}: {
	userId: string
	body: Record<string, unknown>
}): Promise<ApiResponse<Profile>> => {
	const res = await apiRequest<Profile>(`/users/${userId}/profile`, {
		method: 'PUT',
		body: mapProfileToApi(body),
	})

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapProfileFromApi(res.response),
		}
	}

	return res
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
