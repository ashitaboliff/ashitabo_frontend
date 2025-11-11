'use client'

import { useMemo } from 'react'
import { useSignedGachaImages } from '@/domains/gacha/hooks/useSignedGachaImages'
import type { GachaData } from '@/domains/gacha/model/gachaTypes'
import { ImageWithFallback } from '@/shared/ui/atoms/ImageWithFallback'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import type { FeedbackMessageType } from '@/types/feedback'
import GachaLogsSkeleton from './GachaLogsSkeleton'

interface Props {
	readonly gachaItems?: GachaData[]
	readonly logsPerPage: number
	readonly isLoading: boolean
	readonly error?: FeedbackMessageType | null
	readonly onGachaItemClick: (gachaSrc: string) => void
}

const GachaLogList = ({
	gachaItems,
	logsPerPage,
	isLoading,
	error,
	onGachaItemClick,
}: Props) => {
	const { getSignedSrc } = useSignedGachaImages(gachaItems)

	const normalizedItems = useMemo(() => {
		if (!gachaItems) {
			return []
		}
		return gachaItems.map((item) => {
			const signedGachaSrc = getSignedSrc(item.gachaSrc, item.signedGachaSrc)
			if (signedGachaSrc === item.signedGachaSrc) {
				return item
			}
			return {
				...item,
				signedGachaSrc,
			}
		})
	}, [gachaItems, getSignedSrc])

	if (isLoading && (!normalizedItems || normalizedItems.length === 0)) {
		return <GachaLogsSkeleton logsPerPage={logsPerPage} />
	}

	if (error) {
		return (
			<div className="py-10 text-center">
				<FeedbackMessage source={error} />
			</div>
		)
	}

	if (!normalizedItems.length) {
		return <div className="py-10 text-center">ガチャ履歴はありません。</div>
	}

	return (
		<div
			className={`grid ${logsPerPage % 3 === 0 ? 'grid-cols-3' : 'grid-cols-5'} gap-2`}
		>
			{normalizedItems.map((gachaItem) => {
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
