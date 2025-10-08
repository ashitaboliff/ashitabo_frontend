import { AccountRole } from '@/features/user/types'

export interface SessionUser {
	id: string
	name: string | null
	email?: string | null
	image?: string | null
	role: AccountRole | null
	hasProfile: boolean
}

export interface Session {
	user: SessionUser
	expires: string
	error?: string
}
