'use client'

import Image from 'next/image'
import useSWR from 'swr'
import { GachaSort, GachaData } from '@/features/gacha/types'
import { getGachaByUserIdAction } from '@/features/gacha/actions'
import GachaLogsSkeleton from './GachaLogsSkeleton'

interface GachaLogListProps {
	userId: string
	currentPage: number
	logsPerPage: number
	sort: GachaSort
	onGachaItemClick: (gachaSrc: string) => void
	onDataLoaded: (totalCount: number) => void
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
	const errorMessage = res.message || 'Failed to fetch gacha logs'
	throw new Error(errorMessage)
}

const GachaLogList = ({
	userId,
	currentPage,
	logsPerPage,
	sort,
	onGachaItemClick,
	onDataLoaded,
}: GachaLogListProps) => {
	const swrKey = userId ? [userId, currentPage, logsPerPage, sort] : null
	const { data, error, isLoading } = useSWR(swrKey, fetchGachas, {
		revalidateOnFocus: true,
		revalidateIfStale: true,
		revalidateOnReconnect: true,
		revalidateOnMount: true,
		shouldRetryOnError: false,
		onSuccess: (fetchedData) => {
			if (fetchedData) {
				onDataLoaded(fetchedData.totalCount)
			}
		},
	})

	const displayGachaData = data?.gacha

	if (isLoading && !displayGachaData) {
		return <GachaLogsSkeleton logsPerPage={logsPerPage} />
	}

	if (error) {
		return (
			<div className="text-center py-10">
				ガチャ履歴の読み込みに失敗しました: {error.message}
			</div>
		)
	}

	if (!displayGachaData || displayGachaData.length === 0) {
		return <div className="text-center py-10">ガチャ履歴はありません。</div>
	}

	return (
		<div
			className={`grid ${logsPerPage % 3 === 0 ? 'grid-cols-3' : 'grid-cols-5'} gap-2`}
		>
			{displayGachaData.map((gachaItem) => (
				<Image
					key={gachaItem.id}
					src={gachaItem.signedGachaSrc}
					alt="Gacha Item"
					className="w-full h-auto object-cover rounded cursor-pointer"
					decoding="auto"
					width={180}
					height={240}
					onClick={() => onGachaItemClick(gachaItem.gachaSrc)}
				/>
			))}
		</div>
	)
}

export default GachaLogList
