'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
	getGachaByGachaSrcAction,
	getSignedUrlForGachaImageAction,
} from '@/features/gacha/actions'
import { toSignedImageKey } from '@/features/gacha/services/gachaTransforms'
import type { GachaData } from '@/features/gacha/types'
import type { ApiResponse } from '@/types/responseTypes'
import type { Session } from '@/types/session'
import { logError } from '@/utils/logger'

interface UseGachaPreviewProps {
	session: Session
}

interface FetcherArgs {
	userId: string
	gachaSrc: string
}

const fetcher = async ({
	userId,
	gachaSrc,
}: FetcherArgs): Promise<{
	gacha: GachaData | null
	totalCount: number
} | null> => {
	const res: ApiResponse<{ gacha: GachaData | null; totalCount: number }> =
		await getGachaByGachaSrcAction({ userId, gachaSrc })
	if (res.ok) {
		const baseData = res.data
		if (!baseData.gacha || baseData.gacha.signedGachaSrc) {
			return baseData
		}
		const r2Key = toSignedImageKey(baseData.gacha.gachaSrc)
		if (!r2Key) {
			logError('Failed to derive R2 key for gacha preview image', {
				gachaSrc,
			})
			return baseData
		}
		const signedUrlResponse = await getSignedUrlForGachaImageAction({ r2Key })
		if (!signedUrlResponse.ok) {
			logError('Failed to fetch signed URL for gacha preview', {
				gachaSrc,
				r2Key,
				error: signedUrlResponse.message,
			})
			return baseData
		}
		return {
			...baseData,
			gacha: {
				...baseData.gacha,
				signedGachaSrc: signedUrlResponse.data,
			},
		}
	}
	logError('Failed to fetch gacha preview data', res)
	return null
}

export const useGachaPreview = ({ session }: UseGachaPreviewProps) => {
	const [selectedGachaSrc, setSelectedGachaSrc] = useState<string | null>(null)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

	const {
		data: popupData,
		error,
		isLoading: isPopupLoading,
	} = useSWR<
		{ gacha: GachaData | null; totalCount: number } | null,
		Error,
		FetcherArgs | null
	>(
		selectedGachaSrc
			? { userId: session.user.id, gachaSrc: selectedGachaSrc }
			: null,
		fetcher,
		{
			shouldRetryOnError: false,
			revalidateOnFocus: false,
		},
	)

	const openGachaPreview = (gachaSrc: string) => {
		setSelectedGachaSrc(gachaSrc)
		setIsPopupOpen(true)
	}

	const closeGachaPreview = () => {
		setIsPopupOpen(false)
		setSelectedGachaSrc(null)
	}

	return {
		isPopupOpen,
		isPopupLoading,
		popupData,
		openGachaPreview,
		closeGachaPreview,
		error,
	}
}
