import type { Session } from '@/types/session'

export type ClientAuthState =
	| 'no-session'
	| 'invalid-session'
	| 'session'
	| 'profile'

const hasProfile = (session: Session | null | undefined) => {
	if (!session?.user) return false
	const profile = session.user.profile
	return Boolean(profile && profile.id)
}

export const getClientAuthState = (
	session: Session | null | undefined,
): ClientAuthState => {
	if (!session) return 'no-session'
	if (!session.user?.id) return 'invalid-session'
	return hasProfile(session) ? 'profile' : 'session'
}
