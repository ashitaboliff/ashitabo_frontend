import { useCallback, useEffect, useRef, useState } from 'react'
import { getSignedUrlsForGachaImagesAction } from '@/features/gacha/actions'
import { toSignedImageKey } from '@/features/gacha/services/gachaTransforms'
import type { GachaData } from '@/features/gacha/types'
import { logError } from '@/utils/logger'

const SIGNED_URL_TTL_MS = 60 * 60 * 1000
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000

type SignedUrlEntry = {
	url: string | null
	expiresAt: number | null
}

type SignedUrlMap = Record<string, SignedUrlEntry>

const createEntry = (url: string | null): SignedUrlEntry => ({
	url,
	expiresAt: url ? Date.now() + SIGNED_URL_TTL_MS : null,
})

const mergeNullEntries = (
	prev: SignedUrlMap,
	sources: readonly string[],
): SignedUrlMap => {
	let updated = false
	const next = { ...prev }
	for (const src of sources) {
		const existing = next[src]
		if (!existing || existing.url !== null || existing.expiresAt !== null) {
			next[src] = { url: null, expiresAt: null }
			updated = true
		}
	}
	return updated ? next : prev
}

const storeEntries = (
	prev: SignedUrlMap,
	entries: Array<readonly [string, string | null]>,
): SignedUrlMap => {
	let updated = false
	const next = { ...prev }
	for (const [gachaSrc, signedUrl] of entries) {
		const expiresAt = signedUrl ? Date.now() + SIGNED_URL_TTL_MS : null
		const existing = next[gachaSrc]
		if (
			!existing ||
			existing.url !== signedUrl ||
			existing.expiresAt !== expiresAt
		) {
			next[gachaSrc] = { url: signedUrl, expiresAt }
			updated = true
		}
	}
	return updated ? next : prev
}

const shouldRefreshEntry = (entry: SignedUrlEntry | undefined, now: number) => {
	if (!entry || !entry.url || entry.expiresAt === null) {
		return false
	}
	return entry.expiresAt - now <= REFRESH_THRESHOLD_MS
}

export const useSignedGachaImages = (items: GachaData[] | undefined) => {
	const [signedUrlMap, setSignedUrlMap] = useState<SignedUrlMap>({})
	const [isFetching, setIsFetching] = useState(false)
	const mapRef = useRef(signedUrlMap)

	useEffect(() => {
		mapRef.current = signedUrlMap
	}, [signedUrlMap])

	useEffect(() => {
		if (!items || items.length === 0) {
			return
		}
		let isCancelled = false
		const syncSignedUrls = async () => {
			const now = Date.now()
			const currentMap: SignedUrlMap = { ...mapRef.current }
			let hasPrefill = false
			for (const item of items) {
				if (item.signedGachaSrc && !(item.gachaSrc in currentMap)) {
					currentMap[item.gachaSrc] = createEntry(item.signedGachaSrc)
					hasPrefill = true
				}
			}
			const unsignedSources: string[] = []
			const refreshCandidates: string[] = []
			for (const item of items) {
				const cacheEntry = currentMap[item.gachaSrc]
				if (!item.signedGachaSrc && (!cacheEntry || cacheEntry.url === null)) {
					unsignedSources.push(item.gachaSrc)
					continue
				}
				if (shouldRefreshEntry(cacheEntry, now)) {
					refreshCandidates.push(item.gachaSrc)
				}
			}
			if (hasPrefill && !isCancelled) {
				setSignedUrlMap(currentMap)
			}
			if (isCancelled) {
				return
			}
			const sourcesToResolve = Array.from(
				new Set([...unsignedSources, ...refreshCandidates]),
			)
			if (sourcesToResolve.length === 0) {
				return
			}
			const gachaToR2Entries: Array<readonly [string, string]> = []
			const gachaWithoutR2Key: string[] = []
			for (const gachaSrc of sourcesToResolve) {
				const r2Key = toSignedImageKey(gachaSrc)
				if (!r2Key) {
					gachaWithoutR2Key.push(gachaSrc)
					continue
				}
				gachaToR2Entries.push([gachaSrc, r2Key])
			}
			if (!isCancelled && gachaWithoutR2Key.length > 0) {
				setSignedUrlMap((prev) => mergeNullEntries(prev, gachaWithoutR2Key))
			}
			if (gachaToR2Entries.length === 0 || isCancelled) {
				return
			}
			setIsFetching(true)
			const r2Keys = Array.from(
				new Set(gachaToR2Entries.map(([, r2Key]) => r2Key)),
			)
			try {
				const response = await getSignedUrlsForGachaImagesAction({ r2Keys })
				if (isCancelled) {
					return
				}
				if (!response.ok) {
					logError('Failed to fetch signed URLs for gacha images', {
						r2Keys,
						error: response.message,
					})
					setSignedUrlMap((prev) => mergeNullEntries(prev, sourcesToResolve))
					return
				}
				const signedUrlByR2Key = response.data
				const resolvedEntries = gachaToR2Entries.map(([gachaSrc, r2Key]) => {
					const signedUrl = signedUrlByR2Key[r2Key] ?? null
					return [gachaSrc, signedUrl] as const
				})
				setSignedUrlMap((prev) => storeEntries(prev, resolvedEntries))
			} catch (error) {
				if (!isCancelled) {
					logError('Unexpected error while fetching signed gacha URLs', {
						r2Keys,
						error,
					})
					setSignedUrlMap((prev) => mergeNullEntries(prev, sourcesToResolve))
				}
			} finally {
				if (!isCancelled) {
					setIsFetching(false)
				}
			}
		}
		void syncSignedUrls()
		return () => {
			isCancelled = true
		}
	}, [items])

	const getSignedSrc = useCallback(
		(gachaSrc: string, fallback?: string | null) => {
			if (fallback !== undefined && fallback !== null) {
				return fallback
			}
			const entry = signedUrlMap[gachaSrc]
			return entry?.url ?? null
		},
		[signedUrlMap],
	)

	const markStale = useCallback((gachaSrc: string) => {
		setSignedUrlMap((prev) => {
			const existing = prev[gachaSrc]
			if (!existing || existing.url === null) {
				return prev
			}
			return {
				...prev,
				[gachaSrc]: { url: existing.url, expiresAt: Date.now() - 1000 },
			}
		})
	}, [])

	return {
		signedUrlMap,
		getSignedSrc,
		markStale,
		isFetching,
	}
}

export type UseSignedGachaImagesReturn = ReturnType<typeof useSignedGachaImages>
