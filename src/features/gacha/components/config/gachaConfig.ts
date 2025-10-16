import type { RarityType } from '@/features/gacha/types'

export const MAX_GACHA_PLAYS_PER_DAY = 3

export interface GachaCategoryConfig {
	name: RarityType
	probability: number
	count: number
	prefix: string
}

export interface GachaVersionConfig {
	categories: GachaCategoryConfig[]
	title: string
	packKey?: string // Changed from packImage to store the R2 key directly
}

export const gachaConfigs: { [version: string]: GachaVersionConfig } = {
	version1: {
		categories: [
			{ name: 'COMMON', probability: 22500, count: 20, prefix: 'C' },
			{ name: 'RARE', probability: 20000, count: 15, prefix: 'R' },
			{ name: 'SUPER_RARE', probability: 17000, count: 10, prefix: 'SR' },
			{ name: 'SS_RARE', probability: 13000, count: 5, prefix: 'SSR' },
			{ name: 'ULTRA_RARE', probability: 5000, count: 2, prefix: 'UR' },
			{ name: 'SECRET_RARE', probability: 1, count: 1, prefix: 'SECRET' },
		],
		title: 'OBのいる島',
		packKey: 'gacha/version1/pack.png', // Store the R2 key directly
	},
	version2: {
		categories: [
			{ name: 'COMMON', probability: 200, count: 20, prefix: 'C' },
			{ name: 'RARE', probability: 160, count: 15, prefix: 'R' },
			{ name: 'SUPER_RARE', probability: 150, count: 10, prefix: 'SR' },
			{ name: 'SS_RARE', probability: 125, count: 4, prefix: 'SSR' },
			{ name: 'ULTRA_RARE', probability: 100, count: 1, prefix: 'UR' },
		],
		title: '卒業生の暴獣',
		packKey: 'gacha/version2/pack.png', // Store the R2 key directly
	},
	version3: {
		categories: [
			{ name: 'COMMON', probability: 20, count: 20, prefix: 'C' },
			{ name: 'RARE', probability: 16, count: 15, prefix: 'R' },
			{ name: 'SUPER_RARE', probability: 14, count: 10, prefix: 'SR' },
			{ name: 'SS_RARE', probability: 12, count: 5, prefix: 'SSR' },
			{ name: 'ULTRA_RARE', probability: 8, count: 1, prefix: 'UR' },
		],
		title: 'コスプレガーデン',
		packKey: 'gacha/version3/pack.png', // Store the R2 key directly
	},
}
