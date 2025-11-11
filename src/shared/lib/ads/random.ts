const LCG_MULTIPLIER = 1664525
const LCG_INCREMENT = 1013904223
const LCG_MODULUS = 0x100000000 // 2^32

const DEFAULT_MAX_ADS = 3

const toSeed = (seedSource: string): number => {
	if (!seedSource) {
		return 1
	}
	let hash = 0
	for (let idx = 0; idx < seedSource.length; idx += 1) {
		hash = (hash << 5) - hash + seedSource.charCodeAt(idx)
		hash |= 0
	}
	return Math.abs(hash) + 1
}

const createDeterministicRandom = (seed: number) => {
	let state = seed
	return () => {
		state = (state * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS
		return state / LCG_MODULUS
	}
}

export type RandomAdPositionsOptions = {
	readonly length: number
	readonly seedSource: string
	readonly maxAds?: number
}

export const buildRandomAdPositions = ({
	length,
	seedSource,
	maxAds = DEFAULT_MAX_ADS,
}: RandomAdPositionsOptions): number[] => {
	if (length <= 0) {
		return []
	}
	const targetAds = Math.min(Math.max(Math.floor(maxAds), 0), length)
	if (targetAds === 0) {
		return []
	}
	const seed = toSeed(seedSource)
	const random = createDeterministicRandom(seed)
	const positions = new Set<number>()
	while (positions.size < targetAds) {
		const candidate = Math.floor(random() * length)
		positions.add(candidate)
	}
	return Array.from(positions).sort((a, b) => a - b)
}

export const buildSeedKey = (
	parts: ReadonlyArray<string | number | boolean | undefined | null>,
): string =>
	parts
		.map((part) => (part === undefined || part === null ? '' : String(part)))
		.join('::')
