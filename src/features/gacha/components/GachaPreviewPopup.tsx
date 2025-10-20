'use client'

import { useId } from 'react'
import Popup from '@/components/ui/molecules/Popup'
import CardAnimation from '@/features/gacha/components/animations/CardAnimation'
import { gachaConfigs } from '@/features/gacha/config'
import type { GachaData } from '@/features/gacha/types'
import { formatDateJa } from '@/utils/dateFormat'

interface GachaPreviewPopupProps {
	gachaItem: GachaData
	count: number
	open: boolean
	onClose: () => void
}

const GachaPreviewPopup = ({
	open,
	onClose,
	gachaItem,
	count,
}: GachaPreviewPopupProps) => {
	const popupId = useId()
	const renderCardContent = () => {
		if (!gachaItem) {
			return (
				<div className="flex flex-col items-center justify-center h-[25rem]">
					<p className="text-error">ガチャ情報がありません。</p>
				</div>
			)
		}
		if (!gachaItem.signedGachaSrc) {
			return (
				<div className="flex flex-col items-center justify-center h-[25rem]">
					<p className="text-error">画像URLがありません。</p>
					<p className="text-xs text-neutral-content">({gachaItem.gachaSrc})</p>
				</div>
			)
		}
		return (
			<CardAnimation
				frontImageSignedUrl={gachaItem.signedGachaSrc}
				rarity={gachaItem.gachaRarity}
			/>
		)
	}

	return (
		<Popup
			id={popupId}
			title=""
			open={open}
			onClose={onClose}
			maxWidth="3xl"
			isCloseButton={false}
		>
			<div className="flex flex-col gap-y-2 justify-center">
				<div className="flex flex-col items-center h-[25rem] my-2">
					{renderCardContent()}
				</div>
				{gachaItem && (
					<>
						<div className="ml-auto">
							パック:{' '}
							{gachaConfigs[gachaItem.gachaVersion]?.title ||
								gachaItem.gachaVersion}
						</div>
						<div className="ml-auto">所持枚数: {count}枚</div>
						<div className="ml-auto">
							引いた日: {formatDateJa(gachaItem.createdAt)}
						</div>
					</>
				)}
				<button type="button" className="btn btn-outline" onClick={onClose}>
					閉じる
				</button>
			</div>
		</Popup>
	)
}

export default GachaPreviewPopup
