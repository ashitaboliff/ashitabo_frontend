'use client'

import { useMemo, useState } from 'react'
import useSWR, { mutate as mutateGlobal } from 'swr'
import { getGachaByGachaSrcAction } from '@/domains/gacha/api/gachaActions'
import type { GachaData } from '@/domains/gacha/model/gachaTypes'
import {
	clearPreviewCacheEntry,
	getPreviewCacheEntry,
	isPreviewEntryValid,
	PREVIEW_CACHE_TTL_MS,
	setPreviewCacheEntry,
} from '@/domains/gacha/services/gachaPreviewCache'
import { toSignedImageKey } from '@/domains/gacha/services/gachaTransforms'
import {
	ensureSignedResourceUrls,
	getSignedResourceEntry,
	getSignedResourceUrl,
	setSignedResourceEntry,
	shouldRefreshSignedResource,
} from '@/domains/gacha/services/signedGachaResourceCache'
import { logError } from '@/shared/utils/logger'
import type { Session } from '@/types/session'

interface UseGachaPreviewProps {
	session: Session
}

type PreviewPayload = { gacha: GachaData | null; totalCount: number } | null

type PreviewKey = readonly ['gacha-preview', string, string]

const createPreviewKey = (userId: string, gachaSrc: string): PreviewKey => [
	'gacha-preview',
	userId,
	gachaSrc,
]

interface FetcherArgs {
	userId: string
	gachaSrc: string
}

const loadGachaPreview = async ({
	userId,
	gachaSrc,
}: FetcherArgs): Promise<PreviewPayload> => {
	const cachedEntry = getPreviewCacheEntry(gachaSrc)
	if (isPreviewEntryValid(cachedEntry)) {
		return cachedEntry.data
	}

	const response = await getGachaByGachaSrcAction({ userId, gachaSrc })
	if (!response.ok) {
		logError('Failed to fetch gacha preview data', response)
		throw new Error(response.message ?? 'Failed to fetch gacha preview data')
	}

	const baseData = response.data
	if (baseData?.gacha) {
		const r2Key = toSignedImageKey(baseData.gacha.gachaSrc)
		if (!r2Key) {
			logError('Failed to derive R2 key for gacha preview image', {
				gachaSrc: baseData.gacha.gachaSrc,
			})
		} else {
			let signedUrl = baseData.gacha.signedGachaSrc ?? null
			if (signedUrl) {
				setSignedResourceEntry(r2Key, signedUrl)
			}
			const existingEntry = getSignedResourceEntry(r2Key)
			const shouldRefresh = shouldRefreshSignedResource(existingEntry)
			if (!signedUrl) {
				const cachedSignedUrl = getSignedResourceUrl(r2Key)
				if (cachedSignedUrl) {
					signedUrl = cachedSignedUrl
				}
			}
			if (!signedUrl || shouldRefresh) {
				const ensured = await ensureSignedResourceUrls([r2Key])
				if (ensured[r2Key] !== undefined) {
					signedUrl = ensured[r2Key]
				}
			}
			if (signedUrl !== baseData.gacha.signedGachaSrc) {
				baseData.gacha = {
					...baseData.gacha,
					signedGachaSrc: signedUrl ?? null,
				}
			}
		}
	}

	const entry = setPreviewCacheEntry(gachaSrc, baseData)
	return entry.data
}

/**
 * 指定したユーザーとガチャソースに紐づくプレビューキャッシュを破棄し、SWRの手動キャッシュも同期的に無効化する。
 */
export const invalidateGachaPreviewCache = (
	userId: string,
	gachaSrc: string,
) => {
	clearPreviewCacheEntry(gachaSrc)
	const key = createPreviewKey(userId, gachaSrc)
	void mutateGlobal(key, undefined, { revalidate: false })
}

/**
 * ガチャプレビューポップアップの開閉状態とデータ取得を管理し、1時間キャッシュと署名URLキャッシュを連携させるフック。
 */
export const useGachaPreview = ({ session }: UseGachaPreviewProps) => {
	const [selectedGachaSrc, setSelectedGachaSrc] = useState<string | null>(null)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

	const swrKey = useMemo(() => {
		if (!selectedGachaSrc) {
			return null
		}
		return createPreviewKey(session.user.id, selectedGachaSrc)
	}, [selectedGachaSrc, session.user.id])

	const fallbackData = useMemo<PreviewPayload | undefined>(() => {
		if (!selectedGachaSrc) {
			return undefined
		}
		const entry = getPreviewCacheEntry(selectedGachaSrc)
		if (isPreviewEntryValid(entry)) {
			return entry?.data
		}
		return undefined
	}, [selectedGachaSrc])

	const {
		data: popupData,
		error,
		isLoading,
		mutate,
	} = useSWR<PreviewPayload, Error, PreviewKey | null>(
		swrKey,
		(key) =>
			loadGachaPreview({
				userId: key[1],
				gachaSrc: key[2],
			}),
		{
			shouldRetryOnError: false,
			revalidateOnFocus: false,
			revalidateIfStale: false,
			fallbackData,
			dedupingInterval: PREVIEW_CACHE_TTL_MS,
			revalidateOnMount: fallbackData === undefined,
		},
	)

	const openGachaPreview = (gachaSrc: string) => {
		if (gachaSrc === selectedGachaSrc) {
			setIsPopupOpen(true)
			return
		}
		setSelectedGachaSrc(gachaSrc)
		setIsPopupOpen(true)
	}

	const closeGachaPreview = () => {
		setIsPopupOpen(false)
		setSelectedGachaSrc(null)
	}

	const invalidateSelectedPreview = (gachaSrc: string) => {
		invalidateGachaPreviewCache(session.user.id, gachaSrc)
		if (swrKey && swrKey[2] === gachaSrc) {
			void mutate(undefined, { revalidate: false })
		}
	}

	return {
		isPopupOpen,
		isPopupLoading: isLoading,
		popupData,
		openGachaPreview,
		closeGachaPreview,
		error,
		invalidatePreview: invalidateSelectedPreview,
	}
}
