import { Profile } from '@/features/user/types'
import type { Session } from '@/types/session'

export type AuthState = 'no-session' | 'invalid-session' | 'session' | 'profile'

export interface UnifiedAuthResult {
	session: Session | null
	authState?: AuthState
	isAuthenticated?: boolean
	hasProfile?: boolean
	needsProfile?: boolean
	isInvalid?: boolean
	user: Session['user'] | null
	profile: Profile | null
}
