import type { AuthDetails, AuthIssue, AuthStatus } from '@/domains/auth/model/authTypes'
import type { AccountRole } from '@/domains/user/model/userTypes'
import type { Session } from '@/types/session'

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

	const issue: AuthIssue = (() => {
		switch (status) {
			case 'invalid':
				return 'session-expired'
			case 'needs-profile':
				return 'profile-required'
			default:
				return null
		}
	})()

	return {
		session: safeSession,
		status,
		isSignedIn: status === 'signed-in',
		hasProfile: Boolean(safeSession?.user.hasProfile),
		needsProfile: status === 'needs-profile',
		isInvalid: status === 'invalid',
		userId: safeSession?.user.id ?? null,
		role: safeSession?.user.role ?? null,
		issue,
		error: safeSession?.error,
	}
}
