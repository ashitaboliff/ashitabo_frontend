'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import GachaController from '@/domains/gacha/ui/GachaController'
import { Ads, CreepingOverlayAd } from '@/shared/ui/ads'
import type { AdPlacement } from '@/shared/ui/ads/Ads'
import type { Session } from '@/types/session'

interface Props {
	readonly session: Session
	readonly carouselPackData: CarouselPackDataItem[]
}

type SlotDescriptor =
	| {
			id: string
			kind: 'ad'
			placement: AdPlacement
			columnClass: string
	  }
	| {
			id: string
			kind: 'trigger'
			columnClass: string
	  }

type SlotBlueprint =
	| { kind: 'ad'; placement: AdPlacement }
	| { kind: 'trigger' }

const BASE_BLUEPRINTS: SlotBlueprint[] = [
	{ kind: 'ad', placement: 'Menu' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'Menu' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'Menu' },
	{ kind: 'ad', placement: 'Menu' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'Menu' },
	{ kind: 'trigger' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'GachaPage' },
	{ kind: 'ad', placement: 'Menu' },
	{ kind: 'ad', placement: 'Menu' },
	{ kind: 'ad', placement: 'Menu' },
]

const randomId = () => Math.random().toString(36).slice(2, 9)

const shuffleArray = <T,>(input: readonly T[]): T[] => {
	const arr = [...input]
	for (let i = arr.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[j]] = [arr[j], arr[i]]
	}
	return arr
}

const createRandomSlots = (): SlotDescriptor[] => {
	const shuffled = shuffleArray(BASE_BLUEPRINTS)
	return shuffled.map((slot, index) => {
		const columnClass = 'flex flex-col items-center justify-center'
		if (slot.kind === 'trigger') {
			return {
				id: `trigger-${index}-${randomId()}`,
				kind: 'trigger',
				columnClass,
			}
		}
		return {
			id: `${slot.placement}-${index}-${randomId()}`,
			kind: 'ad',
			placement: slot.placement,
			columnClass,
		}
	})
}

const createDeterministicSlots = (): SlotDescriptor[] => {
	return BASE_BLUEPRINTS.map((slot, index) => {
		const columnClass = 'flex flex-col items-center justify-center'
		if (slot.kind === 'trigger') {
			return {
				id: `stable-trigger-${index}`,
				kind: 'trigger',
				columnClass,
			}
		}
		return {
			id: `stable-${slot.placement}-${index}`,
			kind: 'ad',
			placement: slot.placement,
			columnClass,
		}
	})
}

const GachaAdPage = ({ session, carouselPackData }: Props) => {
	const [slots, setSlots] = useState<SlotDescriptor[]>(() =>
		createDeterministicSlots(),
	)
	const [isControllerOpen, setIsControllerOpen] = useState(false)
	const [playCount, setPlayCount] = useState(0)

	const reshuffleSlots = useCallback(() => {
		setSlots(createRandomSlots())
	}, [])

	useEffect(() => {
		reshuffleSlots()
	}, [reshuffleSlots])

	const handleTriggerClick = useCallback(() => {
		setIsControllerOpen(true)
	}, [])

	const handleControllerClose = useCallback(() => {
		setIsControllerOpen(false)
		reshuffleSlots()
	}, [reshuffleSlots])

	const handleGachaSuccess = useCallback(() => {
		setPlayCount((prev) => prev + 1)
	}, [])

	return (
		<div className="relative min-h-screen py-4">
			<CreepingOverlayAd />
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{slots.map((slot) => {
						if (slot.kind === 'ad') {
							return (
								<div key={slot.id} className={slot.columnClass}>
									<Ads
										placement={slot.placement}
										className="w-full"
										enableClickDetection={true}
									/>
								</div>
							)
						}
						return (
							<div key={slot.id} className={`${slot.columnClass} relative`}>
								<button
									type="button"
									onClick={handleTriggerClick}
									className="flex h-full flex-col text-base-content transition"
								>
									<span className="rounded px-2 py-1 font-slim text-base-content text-xxs ring transition group-hover:scale-105">
										ガチャを引く
									</span>
								</button>
							</div>
						)
					})}
				</div>
			</div>
			<GachaController
				session={session}
				gachaPlayCountToday={playCount}
				onGachaPlayedSuccessfully={handleGachaSuccess}
				open={isControllerOpen}
				onClose={handleControllerClose}
				carouselPackData={carouselPackData}
				ignorePlayCountLimit={true}
				closeOnResultReset={true}
				maxPlayCountOverride={Number.POSITIVE_INFINITY}
			/>
		</div>
	)
}

export default GachaAdPage
