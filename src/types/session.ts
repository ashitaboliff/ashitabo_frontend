import { AccountRole, Part, Role } from '@/features/user/types'

export interface SessionProfile {
	id: string
	name?: string | null
	studentId?: string | null
	expected?: string | null
	part?: Part[]
	role?: Role
}

export interface SessionUser {
	id: string
	name: string | null
	email?: string | null
	image?: string | null
	role: AccountRole
	accountRole?: AccountRole | null
	profile?: SessionProfile | null
}

export interface Session {
	user: SessionUser
	expires: string
	error?: string
}
