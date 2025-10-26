import type { z } from 'zod'
import {
	type adminUserSortSchema,
	type deniedBookingFormSchema,
	deniedBookingSortSchema,
	type deniedBookingTypeSchema,
	type padLockFormSchema,
} from './adminSchema'

export interface PadLock {
	id: string
	name: string
	createdAt: Date
	updatedAt: Date
	isDeleted: boolean
}

export type PadLockFormValues = z.infer<typeof padLockFormSchema>

export type AdminUserSort = z.infer<typeof adminUserSortSchema>

export type DeniedBookingSort = z.infer<typeof deniedBookingSortSchema>

export const DENIED_BOOKING_SORT_OPTIONS = deniedBookingSortSchema.options

export type DeniedBookingType = z.infer<typeof deniedBookingTypeSchema>

export type DeniedBookingFormValues = z.infer<typeof deniedBookingFormSchema>

export type DeniedBookingFormInput = z.input<typeof deniedBookingFormSchema>

export const DENIED_BOOKING_TYPE_OPTIONS = [
	{ value: 'single', label: '単発禁止' },
	{ value: 'period', label: '期間禁止' },
	{ value: 'regular', label: '定期禁止' },
] as const satisfies ReadonlyArray<{ value: DeniedBookingType; label: string }>

export type DeniedBookingTypeOption =
	(typeof DENIED_BOOKING_TYPE_OPTIONS)[number]
