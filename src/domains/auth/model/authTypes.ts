import type { AccountRole } from '@/domains/user/model/userTypes'
import type { Session } from '@/types/session'

export type AuthStatus = 'guest' | 'invalid' | 'needs-profile' | 'signed-in'

export type AuthIssue =
	| 'session-expired'
	| 'profile-required'
	| 'unauthorized'
	| null

export interface AuthDetails {
	session: Session | null
	status: AuthStatus
	isSignedIn: boolean
	hasProfile: boolean
	needsProfile: boolean
	isInvalid: boolean
	userId: string | null
	role: AccountRole | null
	issue: AuthIssue
	error?: string
}
