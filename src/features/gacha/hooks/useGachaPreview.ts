'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { getGachaByGachaSrcAction } from '@/features/gacha/actions'
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
		return res.data
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
