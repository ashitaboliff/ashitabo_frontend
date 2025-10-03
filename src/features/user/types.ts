export type Role = 'GRADUATE' | 'STUDENT'

type RoleEnum = '卒業生' | '現役生'

export type Part =
	| 'BACKING_GUITAR'
	| 'LEAD_GUITAR'
	| 'BASS'
	| 'DRUMS'
	| 'KEYBOARD'
	| 'VOCAL'
	| 'OTHER'

type PartEnum =
	| 'バッキングギター'
	| 'リードギター'
	| 'ベース'
	| 'ドラム'
	| 'キーボード'
	| 'ボーカル'
	| 'その他'

export type AccountRole = 'ADMIN' | 'USER' | 'TOPADMIN'

export const RoleMap: Record<Role, RoleEnum> = {
	GRADUATE: '卒業生',
	STUDENT: '現役生',
}

export const PartMap: Record<Part, PartEnum> = {
	BACKING_GUITAR: 'バッキングギター',
	LEAD_GUITAR: 'リードギター',
	BASS: 'ベース',
	DRUMS: 'ドラム',
	KEYBOARD: 'キーボード',
	VOCAL: 'ボーカル',
	OTHER: 'その他',
}

export const PartOptions: Record<PartEnum, Part> = {
	バッキングギター: 'BACKING_GUITAR',
	リードギター: 'LEAD_GUITAR',
	ベース: 'BASS',
	ドラム: 'DRUMS',
	キーボード: 'KEYBOARD',
	ボーカル: 'VOCAL',
	その他: 'OTHER',
}

export const AccountRoleMap: Record<AccountRole, string> = {
	ADMIN: '三役',
	USER: 'ユーザ',
	TOPADMIN: '管理者',
}

export interface Profile {
	id: string
	user_id: string
	name?: string | null
	student_id?: string | null
	expected?: string | null
	created_at?: Date
	updated_at?: Date
	role: Role
	part: Part[]
	is_deleted?: boolean
}

export interface User {
	id: string
	user_id: string | null
	name: string | null
	role: AccountRole | null
	password: string | null
	email: string | null
	emailVerified: Date | null
	image: string | null
	createdAt: Date
	updatedAt: Date
}

export interface UserDetail {
	id: string
	name: string | null
	fullName?: string
	studentId?: string
	expected?: string
	image: string | null
	createAt: Date
	updateAt: Date
	AccountRole: AccountRole | null
	role?: Role
	part?: Part[]
}
