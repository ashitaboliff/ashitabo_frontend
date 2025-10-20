import { useCallback, useEffect, useRef, useState } from 'react'
import { toSignedImageKey } from '@/features/gacha/services/gachaTransforms'
import {
	ensureSignedResourceUrls,
	getSignedResourceEntry,
	getSignedResourceUrl,
	markSignedResourceStale,
	setSignedResourceEntry,
	shouldRefreshSignedResource,
} from '@/features/gacha/services/signedGachaResourceCache'
import type { GachaData } from '@/features/gacha/types'

type SignedUrlEntry = {
	url: string | null
	expiresAt: number | null
}

type SignedUrlMap = Record<string, SignedUrlEntry>

const STALE_EXPIRY_OFFSET_MS = 1000

/**
 * ガチャカードの署名付き画像URLをまとめて解決し、期限管理と再取得制御を自動化するフック。
 * 既存の署名済みURLをプリフェッチしつつ、失効前にバックグラウンド更新を行う。
 */
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
			const sourcesToEnsure: string[] = []
			const sourcesWithoutKey: string[] = []

			for (const item of items) {
				const r2Key = toSignedImageKey(item.gachaSrc)
				if (!r2Key) {
					sourcesWithoutKey.push(item.gachaSrc)
					continue
				}
				if (item.signedGachaSrc) {
					const entry = setSignedResourceEntry(r2Key, item.signedGachaSrc)
					if (!(item.gachaSrc in currentMap)) {
						currentMap[item.gachaSrc] = {
							url: entry.url,
							expiresAt: entry.expiresAt,
						}
						hasPrefill = true
					}
				}
				const cacheEntry = getSignedResourceEntry(r2Key)
				const cachedUrl = getSignedResourceUrl(r2Key, now)
				const expiresAt = cacheEntry?.expiresAt ?? null
				if (cachedUrl) {
					const existing = currentMap[item.gachaSrc]
					if (
						!existing ||
						existing.url !== cachedUrl ||
						existing.expiresAt !== expiresAt
					) {
						currentMap[item.gachaSrc] = {
							url: cachedUrl,
							expiresAt,
						}
						hasPrefill = true
					}
				}
				if (shouldRefreshSignedResource(cacheEntry, now)) {
					sourcesToEnsure.push(r2Key)
				}
			}

			if (hasPrefill && !isCancelled) {
				setSignedUrlMap(currentMap)
			}
			if (!isCancelled && sourcesWithoutKey.length > 0) {
				setSignedUrlMap((prev) => {
					let updated = false
					const next = { ...prev }
					for (const src of sourcesWithoutKey) {
						const existing = next[src]
						if (!existing || existing.url !== null) {
							next[src] = { url: null, expiresAt: null }
							updated = true
						}
					}
					return updated ? next : prev
				})
			}
			if (isCancelled) {
				return
			}
			const uniqueSourcesToEnsure = Array.from(new Set(sourcesToEnsure))
			if (uniqueSourcesToEnsure.length === 0) {
				return
			}
			setIsFetching(true)
			try {
				const signedUrls = await ensureSignedResourceUrls(uniqueSourcesToEnsure)
				if (isCancelled) {
					return
				}
				setSignedUrlMap((prev) => {
					let updated = false
					const next = { ...prev }
					for (const item of items) {
						const r2Key = toSignedImageKey(item.gachaSrc)
						if (!r2Key) {
							continue
						}
						if (!(r2Key in signedUrls)) {
							continue
						}
						const entry = getSignedResourceEntry(r2Key)
						const expiresAt = entry?.expiresAt ?? null
						const url = signedUrls[r2Key] ?? null
						const existing = next[item.gachaSrc]
						if (
							!existing ||
							existing.url !== url ||
							existing.expiresAt !== expiresAt
						) {
							next[item.gachaSrc] = { url, expiresAt }
							updated = true
						}
					}
					return updated ? next : prev
				})
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
		const r2Key = toSignedImageKey(gachaSrc)
		if (r2Key) {
			markSignedResourceStale(r2Key)
		}
		setSignedUrlMap((prev) => {
			const existing = prev[gachaSrc]
			if (!existing || existing.url === null) {
				return prev
			}
			return {
				...prev,
				[gachaSrc]: {
					url: existing.url,
					expiresAt: Date.now() - STALE_EXPIRY_OFFSET_MS,
				},
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
