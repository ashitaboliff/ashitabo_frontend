'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import {
	createUserGachaResultAction,
	getSignedUrlForGachaImageAction,
} from '@/features/gacha/actions'
import CardAnimation from '@/features/gacha/components/animations/CardAnimation'
import Gacha, { type GachaItem } from '@/features/gacha/components/GachaList'
import type { RarityType } from '@/features/gacha/types'
import type { ApiResponse } from '@/types/responseTypes'

interface GachaResultProps {
	version: string
	userId: string
	onGachaSuccess?: () => void
	currentPlayCount: number
	ignorePlayCountLimit?: boolean
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
		gachaData.data.src ? `signedUrl/gachaCard/${gachaData.data.src}` : null,
		async () => {
			if (!gachaData.data.src) {
				throw new Error('Gacha image source is missing.')
			}
			const res = await getSignedUrlForGachaImageAction({
				r2Key: gachaData.data.src
					.replace('/gacha/', '')
					.replace('.png', '.webp'),
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
		<div className="flex flex-col items-center h-[25rem]">
			<CardAnimation
				frontImageSignedUrl={signedUrl}
				rarity={gachaData.name}
				delay={1}
			/>
		</div>
	)
}

export default GachaResult
