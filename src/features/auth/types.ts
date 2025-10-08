import type { Session } from '@/types/session'
import type { AccountRole } from '@/features/user/types'

export type AuthStatus = 'guest' | 'invalid' | 'needs-profile' | 'signed-in'

export interface AuthDetails {
	session: Session | null
	status: AuthStatus
	isSignedIn: boolean
	hasProfile: boolean
	needsProfile: boolean
	isInvalid: boolean
	userId: string | null
	role: AccountRole | null
	error?: string
}
