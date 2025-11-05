'use client'

import { useId } from 'react'
import { gachaConfigs } from '@/domains/gacha/config/gachaConfig'
import type { GachaData } from '@/domains/gacha/model/gachaTypes'
import CardAnimation from '@/domains/gacha/ui/animations/CardAnimation'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateJa } from '@/shared/utils/dateFormat'

interface Props {
	readonly gachaItem: GachaData
	readonly count: number
	readonly open: boolean
	readonly onClose: () => void
}

const GachaPreviewPopup = ({ open, onClose, gachaItem, count }: Props) => {
	const popupId = useId()
	const renderCardContent = () => {
		if (!gachaItem) {
			return (
				<div className="flex h-[25rem] flex-col items-center justify-center">
					<p className="text-error">ガチャ情報がありません。</p>
				</div>
			)
		}
		if (!gachaItem.signedGachaSrc) {
			return (
				<div className="flex h-[25rem] flex-col items-center justify-center">
					<p className="text-error">画像URLがありません。</p>
					<p className="text-neutral-content text-xs">({gachaItem.gachaSrc})</p>
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
			<div className="flex flex-col justify-center gap-y-2">
				<div className="my-2 flex h-[25rem] flex-col items-center">
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
