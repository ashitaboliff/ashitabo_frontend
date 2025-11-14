import { useCallback, useMemo } from 'react'
import { buildRandomAdPositions, buildSeedKey } from '@/shared/lib/ads'

type SeedValue = string | number | boolean | undefined | null

interface UseAdInsertionOptions {
	readonly ids: readonly string[]
	readonly maxAds?: number
	readonly seedKey?: string
	readonly seedParts?: ReadonlyArray<SeedValue>
}

interface UseAdInsertionResult {
	readonly positions: number[]
	readonly shouldRenderAd: (index: number) => boolean
}

export const useAdInsertion = ({
	ids,
	maxAds,
	seedKey,
	seedParts,
}: UseAdInsertionOptions): UseAdInsertionResult => {
	const idsKey = useMemo(() => ids.join('|'), [ids])

	const extraSeedKey = useMemo(() => {
		if (seedKey) {
			return seedKey
		}
		if (!seedParts || seedParts.length === 0) {
			return ''
		}
		return buildSeedKey(seedParts)
	}, [seedKey, seedParts])

	const combinedSeedKey = useMemo(() => {
		if (!extraSeedKey) {
			return idsKey
		}
		return `${idsKey}::${extraSeedKey}`
	}, [idsKey, extraSeedKey])

	const positions = useMemo(
		() =>
			buildRandomAdPositions({
				length: ids.length,
				maxAds,
				seedSource: combinedSeedKey,
			}),
		[combinedSeedKey, ids.length, maxAds],
	)

	const positionsSet = useMemo(() => new Set(positions), [positions])

	const shouldRenderAd = useCallback(
		(index: number) => positionsSet.has(index),
		[positionsSet],
	)

	return { positions, shouldRenderAd }
}

export default useAdInsertion
