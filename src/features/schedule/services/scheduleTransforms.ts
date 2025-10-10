import { Schedule, UserWithName } from '@/features/schedule/types'

const toDate = (value: string | Date | undefined | null): Date | undefined => {
	if (!value) return undefined
	return value instanceof Date ? value : new Date(value)
}

export interface RawSchedule {
	id?: string
	userId: string
	title: string
	description?: string | null
	startDate: string
	endDate: string
	mention: string[]
	timeExtended: boolean
	deadline: string
	createdAt?: string | Date | null
	updatedAt?: string | Date | null
}

export const mapRawSchedule = (raw: RawSchedule): Schedule => ({
	...raw,
	description: raw.description ?? undefined,
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
})

export interface RawUserWithName {
	id: string | null
	name: string | null
	image?: string | null
}

export const mapRawUserWithNames = (
	items: RawUserWithName[] | null | undefined,
): UserWithName[] => {
	if (!items) return []
	return items.map((item) => ({
		id: item.id ?? '',
		name: item.name,
		image: item.image ?? null,
	}))
}
