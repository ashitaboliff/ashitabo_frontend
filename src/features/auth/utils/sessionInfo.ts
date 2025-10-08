import type { AccountRole } from '@/features/user/types'
import type { Session } from '@/types/session'
import type { AuthDetails, AuthStatus } from '@/features/auth/types'

const isRole = (value: unknown): value is AccountRole =>
	value === 'USER' || value === 'ADMIN' || value === 'TOPADMIN'

export const cleanSession = (raw: Session | null): Session | null => {
	if (!raw) return null
	const user = raw.user
	if (!user || !user.id) return null
	const role = isRole(user.role) ? user.role : null
	return {
		...raw,
		user: {
			id: user.id,
			name: user.name ?? null,
			email: user.email ?? null,
			image: user.image ?? null,
			role,
			hasProfile: Boolean(user.hasProfile),
		},
	}
}

export const makeAuthDetails = (session: Session | null): AuthDetails => {
	const safeSession = cleanSession(session)
	let status: AuthStatus

	if (!safeSession) {
		status = 'guest'
	} else if (!safeSession.user.id) {
		status = 'invalid'
	} else if (safeSession.user.hasProfile) {
		status = 'signed-in'
	} else {
		status = 'needs-profile'
	}

	return {
		session: safeSession,
		status,
		isSignedIn: status === 'signed-in',
		hasProfile: Boolean(safeSession?.user.hasProfile),
		needsProfile: status === 'needs-profile',
		isInvalid: status === 'invalid',
		userId: safeSession?.user.id ?? null,
		role: safeSession?.user.role ?? null,
		error: safeSession?.error,
	}
}
