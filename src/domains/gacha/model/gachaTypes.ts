export type RarityType =
	| 'COMMON'
	| 'RARE'
	| 'SUPER_RARE'
	| 'SS_RARE'
	| 'ULTRA_RARE'
	| 'SECRET_RARE'

export type GachaSort = 'new' | 'old' | 'rare' | 'notrare'

export type GachaData = {
	userId: string
	id: string
	gachaVersion: string
	gachaRarity: RarityType
	gachaSrc: string
	signedGachaSrc?: string | null
	createdAt: Date
	updatedAt: Date
	isDeleted: boolean
}

export type GachaCreateType = 'booking' | 'user'

export interface CarouselPackDataItem {
	version: string
	r2Key: string
	signedPackImageUrl: string
}
