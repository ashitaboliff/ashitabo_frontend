import type { GachaData, RarityType } from '@/domains/gacha/model/gachaTypes'

export interface RawGachaData {
	userId: string
	id: string
	gachaVersion: string
	gachaRarity: RarityType
	gachaSrc: string
	createdAt: string
	updatedAt: string
	isDeleted?: boolean | null
}

const toDate = (value: string | Date): Date =>
	value instanceof Date ? value : new Date(value)

export const toSignedImageKey = (gachaSrc: string): string => {
	const prefix = '/gacha/'
	const withoutPrefix = gachaSrc.startsWith(prefix)
		? gachaSrc.slice(prefix.length)
		: gachaSrc.replace(prefix, '')
	return withoutPrefix.replace(/\.png$/i, '.webp')
}

export const mapRawGacha = (data: RawGachaData): GachaData => ({
	userId: data.userId,
	id: data.id,
	gachaVersion: data.gachaVersion,
	gachaRarity: data.gachaRarity,
	gachaSrc: data.gachaSrc,
	createdAt: toDate(data.createdAt),
	updatedAt: toDate(data.updatedAt),
	isDeleted: Boolean(data.isDeleted),
})

export const mapRawGachaList = (
	items: RawGachaData[] | null | undefined,
): GachaData[] => {
	if (!items) {
		return []
	}
	return items.map(mapRawGacha)
}
