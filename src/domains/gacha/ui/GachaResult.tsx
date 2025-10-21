'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import Gacha, { type GachaItem } from '@/domains/gacha'
import {
	createUserGachaResultAction,
	getSignedUrlForGachaImageAction,
} from '@/domains/gacha/api/gachaActions'
import { invalidateGachaPreviewCache } from '@/domains/gacha/hooks/useGachaPreview'
import type { RarityType } from '@/domains/gacha/model/gachaTypes'
import { toSignedImageKey } from '@/domains/gacha/services/gachaTransforms'
import CardAnimation from '@/domains/gacha/ui/animations/CardAnimation'
import type { ApiResponse } from '@/types/responseTypes'

interface GachaResultProps {
	readonly version: string
	readonly userId: string
	readonly onGachaSuccess?: () => void
	readonly currentPlayCount: number
	readonly ignorePlayCountLimit?: boolean
}

export const GachaResult = ({
	version,
	userId,
	onGachaSuccess,
	currentPlayCount,
	ignorePlayCountLimit,
}: GachaResultProps) => {
	const gacha = new Gacha(version)
	const [gachaData] = useState<{ data: GachaItem; name: RarityType }>(() =>
		gacha.pickRandomImage(),
	)
	const [createUserRes, setCreateUserRes] = useState<ApiResponse<string>>()
	const hasCalledCreateUserAction = useRef(false)

	const {
		data: signedUrl,
		error: signedUrlError,
		isLoading: isLoadingSignedUrl,
	} = useSWR(
		gachaData.data.src,
		async () => {
			if (!gachaData.data.src) {
				throw new Error('Gacha image source is missing.')
			}
			const res = await getSignedUrlForGachaImageAction({
				r2Key: toSignedImageKey(gachaData.data.src),
			})
			if (res.ok) {
				return res.data
			}
			throw res
		},
		{
			revalidateOnFocus: false,
			shouldRetryOnError: false,
		},
	)

	useEffect(() => {
		if (hasCalledCreateUserAction.current || !userId || !gachaData.data.src)
			return
		hasCalledCreateUserAction.current = true
		;(async () => {
			const result = await createUserGachaResultAction({
				userId: userId,
				gachaVersion: version,
				gachaRarity: gachaData.name,
				gachaSrc: gachaData.data.src,
				currentPlayCount: currentPlayCount,
				ignorePlayCountLimit: ignorePlayCountLimit,
			})
			setCreateUserRes(result)
			if (result.ok && onGachaSuccess) {
				invalidateGachaPreviewCache(userId, gachaData.data.src)
				onGachaSuccess()
			}
		})()
	}, [
		gachaData.data.src,
		gachaData.name,
		version,
		userId,
		onGachaSuccess,
		currentPlayCount,
		ignorePlayCountLimit,
	])

	if (!createUserRes || isLoadingSignedUrl) {
		return (
			<div className="flex flex-col items-center h-[25rem] justify-center">
				<div className="loading loading-spinner loading-lg"></div>
				{!createUserRes && <p className="mt-2">ガチャ結果を保存中...</p>}
				{createUserRes && isLoadingSignedUrl && (
					<p className="mt-2">画像準備中...</p>
				)}
			</div>
		)
	}

	if (!createUserRes.ok) {
		return (
			<div className="flex flex-col items-center h-[25rem] justify-center">
				<div className="text-lg text-error my-auto">
					ガチャの保存に失敗しました。
					{createUserRes.message}
				</div>
			</div>
		)
	}

	if (signedUrlError) {
		return (
			<div className="flex flex-col items-center h-[25rem] justify-center">
				<div className="text-lg text-error my-auto">
					画像URLの取得に失敗しました: {signedUrlError.message}
				</div>
			</div>
		)
	}

	if (!signedUrl) {
		return (
			<div className="flex flex-col items-center h-[25rem] justify-center">
				<div className="text-lg text-error my-auto">
					画像URLが取得できませんでした。
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center h-[25rem] my-2">
			<CardAnimation
				frontImageSignedUrl={signedUrl}
				rarity={gachaData.name}
				delay={1}
			/>
		</div>
	)
}

export default GachaResult
