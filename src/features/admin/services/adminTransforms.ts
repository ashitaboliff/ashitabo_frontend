import { PadLock } from '@/features/admin/types'
import { AccountRole, Part, Role, UserDetail } from '@/features/user/types'
import { BanBooking } from '@/features/booking/types'

const toDate = (value: string | Date): Date =>
	value instanceof Date ? value : new Date(value)

export interface RawPadLock {
	id: string
	name: string
	createdAt: string
	updatedAt: string
	isDeleted?: boolean | null
}

export const mapRawPadLock = (raw: RawPadLock): PadLock => ({
	id: raw.id,
	name: raw.name,
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
	isDeleted: Boolean(raw.isDeleted),
})

export const mapRawPadLocks = (
	raw: RawPadLock[] | null | undefined,
): PadLock[] => (raw ? raw.map(mapRawPadLock) : [])

export interface RawUserDetail {
	id: string
	name: string | null
	fullName?: string | null
	studentId?: string | null
	expected?: string | null
	image: string | null
	createAt: string
	updateAt: string
	AccountRole: AccountRole | null
	role?: Role | null
	part?: Part[] | null
}

export const mapRawUserDetail = (raw: RawUserDetail): UserDetail => ({
	id: raw.id,
	name: raw.name,
	fullName: raw.fullName ?? undefined,
	studentId: raw.studentId ?? undefined,
	expected: raw.expected ?? undefined,
	image: raw.image,
	createAt: toDate(raw.createAt),
	updateAt: toDate(raw.updateAt),
	AccountRole: raw.AccountRole,
	role: raw.role ?? undefined,
	part: raw.part ?? undefined,
})

export const mapRawUserDetails = (
	raw: RawUserDetail[] | null | undefined,
): UserDetail[] => (raw ? raw.map(mapRawUserDetail) : [])

export interface RawBanBooking {
	id: string
	createdAt: string
	updatedAt: string
	startDate: string
	startTime: number
	endTime: number | null
	description: string
	isDeleted?: boolean | null
}

export const mapRawBanBooking = (raw: RawBanBooking): BanBooking => ({
	id: raw.id,
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
	startDate: toDate(raw.startDate),
	startTime: raw.startTime,
	endTime: raw.endTime,
	description: raw.description,
	isDeleted: Boolean(raw.isDeleted),
})

export const mapRawBanBookings = (
	raw: RawBanBooking[] | null | undefined,
): BanBooking[] => (raw ? raw.map(mapRawBanBooking) : [])
