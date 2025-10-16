'use client'

import Image from 'next/image'
import React, { useId, useState } from 'react'
import { Tab, Tabs } from '@/components/ui/atoms/Tabs'
import Popup from '@/components/ui/molecules/Popup'
import {
	type GachaCategoryConfig,
	gachaConfigs,
} from '@/features/gacha/components/config/gachaConfig'
import type { RarityType } from '@/features/gacha/types'
import { getImageUrl } from '@/lib/r2'

const rarityDisplayNameMap: Record<RarityType, string> = {
	COMMON: 'COMMON',
	RARE: 'RARE',
	SUPER_RARE: 'SUPER RARE',
	SS_RARE: 'SSR',
	ULTRA_RARE: 'ULTRA RARE',
	SECRET_RARE: 'SECRET RARE',
}

const rarityImageMap: Record<RarityType, string> = {
	COMMON: 'Common',
	RARE: 'Rare',
	SUPER_RARE: 'SR',
	SS_RARE: 'SSR',
	ULTRA_RARE: 'UR',
	SECRET_RARE: 'Secret', // Assuming Secret.png exists or handle missing image
}

const calculateProbabilities = (categories: GachaCategoryConfig[]) => {
	const versionTotalFrequency = categories.reduce(
		(sum, cat) => sum + cat.probability * cat.count,
		0,
	)

	if (versionTotalFrequency === 0) {
		return categories.map((cat) => ({
			...cat,
			overallProbabilityPercent: 0,
			individualCardProbabilityPercent: 0,
		}))
	}

	return categories.map((cat) => {
		const rarityTotalFrequency = cat.probability * cat.count
		const overallProbabilityPercent =
			(rarityTotalFrequency / versionTotalFrequency) * 100
		const individualCardProbabilityPercent =
			(cat.probability / versionTotalFrequency) * 100
		return {
			...cat,
			overallProbabilityPercent,
			individualCardProbabilityPercent,
		}
	})
}

const RatioPopup = ({ gkktt }: { gkktt: { className: string } }) => {
	const [isPopupOpen, setIsPopupOpen] = useState(false)

	const versionEntries = Object.entries(gachaConfigs)

	const popupId = useId()

	return (
		<>
			<button
				type="button"
				className="btn btn-outline w-full sm:w-auto"
				onClick={() => setIsPopupOpen(true)}
			>
				提供割合
			</button>

			<Popup
				id={popupId}
				title="提供割合"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<Tabs>
					{versionEntries.map(([versionKey, versionConfig]) => {
						const allProcessedCategories = calculateProbabilities(
							versionConfig.categories,
						)
						// SECRET_RAREを除外
						const processedCategories = allProcessedCategories.filter(
							(cat) => cat.name !== 'SECRET_RARE',
						)
						return (
							<Tab key={versionKey} label={versionConfig.title}>
								<div className="flex flex-col items-center space-y-2 text-sm max-h-[60vh] overflow-y-auto p-1">
									{processedCategories.map((category, catIndex) => {
										const displayName =
											rarityDisplayNameMap[category.name as RarityType] ||
											category.name
										const imageName =
											rarityImageMap[category.name as RarityType] || 'Common' // Fallback image
										const imageUrl = getImageUrl(
											`/gacha/preset/${imageName}.png`,
										)
										const titleClassName = `bg-white px-4 rounded-lg shadow-md w-full text-2xl ${gkktt.className} ${catIndex > 0 ? 'mt-4' : ''}`
										const detailsGapClass =
											category.name === 'COMMON' || category.name === 'RARE'
												? 'gap-y-1'
												: 'gap-y-2'

										return (
											<React.Fragment key={category.name}>
												<div className={titleClassName}>{displayName}</div>
												<div className="flex flex-row my-2 w-full">
													<Image
														src={imageUrl}
														width={72}
														height={104}
														alt={displayName}
														className="basis-1/4 bg-base-content rounded-sm mr-4 object-contain"
													/>
													<div
														className={`flex flex-col justify-center ${detailsGapClass} basis-2/3`}
													>
														<div>
															全体確率:{' '}
															{category.overallProbabilityPercent.toFixed(2)}%
														</div>
														<div>封入数: {category.count}枚</div>
														<div>
															一枚当たりの確率:{' '}
															{category.individualCardProbabilityPercent.toFixed(
																4,
															)}
															%
														</div>
													</div>
												</div>
											</React.Fragment>
										)
									})}
								</div>
							</Tab>
						)
					})}
				</Tabs>
				<div className="flex flex-row justify-center gap-x-4 mt-4">
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => setIsPopupOpen(false)}
					>
						閉じる
					</button>
				</div>
			</Popup>
		</>
	)
}

export default RatioPopup
