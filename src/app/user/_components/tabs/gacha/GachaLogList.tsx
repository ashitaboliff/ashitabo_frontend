'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { getGachaByUserIdAction } from '@/domains/gacha/api/gachaActions'
import { useSignedGachaImages } from '@/domains/gacha/hooks/useSignedGachaImages'
import type { GachaData, GachaSort } from '@/domains/gacha/model/gachaTypes'
import { ImageWithFallback } from '@/shared/ui/atoms/ImageWithFallback'
import GachaLogsSkeleton from './GachaLogsSkeleton'

interface Props {
	readonly userId: string
	readonly currentPage: number
	readonly logsPerPage: number
	readonly sort: GachaSort
	readonly onGachaItemClick: (gachaSrc: string) => void
	readonly onDataLoaded: (totalCount: number) => void
	readonly initialData?: { gacha: GachaData[]; totalCount: number }
}

const fetchGachas = async ([userId, page, perPage, sort]: [
	string,
	number,
	number,
	GachaSort,
]): Promise<{
	gacha: GachaData[]
	totalCount: number
}> => {
	const res = await getGachaByUserIdAction({ userId, page, perPage, sort })
	if (res.ok) {
		return res.data
	}
	throw res
}

const GachaLogList = ({
	userId,
	currentPage,
	logsPerPage,
	sort,
	onGachaItemClick,
	onDataLoaded,
	initialData,
}: Props) => {
	const swrKey = [userId, currentPage, logsPerPage, sort]
	const { data, error, isLoading } = useSWR(swrKey, fetchGachas, {
		fallbackData: currentPage === 1 ? initialData : undefined,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		revalidateOnMount: true,
		revalidateIfStale: false,
		shouldRetryOnError: false,
		onSuccess: (fetchedData) => {
			if (fetchedData) {
				onDataLoaded(fetchedData.totalCount)
			}
		},
	})

	const displayGachaData = data?.gacha
	const { getSignedSrc } = useSignedGachaImages(displayGachaData)

	const gachaItems = useMemo(() => {
		if (!displayGachaData) {
			return []
		}
		return displayGachaData.map((item) => {
			const signedGachaSrc = getSignedSrc(item.gachaSrc, item.signedGachaSrc)
			if (signedGachaSrc === item.signedGachaSrc) {
				return item
			}
			return {
				...item,
				signedGachaSrc,
			}
		})
	}, [displayGachaData, getSignedSrc])

	if (isLoading && !displayGachaData) {
		return <GachaLogsSkeleton logsPerPage={logsPerPage} />
	}

	if (error) {
		return (
			<div className="py-10 text-center">
				ガチャ履歴の読み込みに失敗しました: {error.message}
			</div>
		)
	}

	if (!gachaItems.length) {
		return <div className="py-10 text-center">ガチャ履歴はありません。</div>
	}

	return (
		<div
			className={`grid ${logsPerPage % 3 === 0 ? 'grid-cols-3' : 'grid-cols-5'} gap-2`}
		>
			{gachaItems.map((gachaItem) => {
				const signedSrc = gachaItem.signedGachaSrc
				if (!signedSrc) {
					return (
						<button
							type="button"
							key={gachaItem.id}
							className="aspect-[3/4] w-full animate-pulse rounded bg-base-200"
							onClick={() => onGachaItemClick(gachaItem.gachaSrc)}
							aria-label={`ガチャ画像プレビュー-${gachaItem.gachaSrc}`}
						/>
					)
				}
				return (
					<ImageWithFallback
						key={gachaItem.id}
						src={signedSrc}
						alt={`ガチャ画像プレビュー-${gachaItem.gachaSrc}`}
						className="h-auto w-full cursor-pointer rounded object-cover"
						decoding="auto"
						width={180}
						height={240}
						onClick={() => onGachaItemClick(gachaItem.gachaSrc)}
						unoptimized
					/>
				)
			})}
		</div>
	)
}

export default GachaLogList
