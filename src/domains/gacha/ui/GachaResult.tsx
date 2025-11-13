'use client'

import type { RarityType } from '@/domains/gacha/model/gachaTypes'
import CardAnimation from '@/domains/gacha/ui/animations/CardAnimation'

export type GachaResultViewState =
	| { status: 'idle' }
	| { status: 'loading'; message?: string }
	| { status: 'success'; rarity: RarityType; signedUrl: string }
	| { status: 'error'; message: string }

interface GachaResultProps {
	readonly state: GachaResultViewState
}

export const GachaResult = ({ state }: GachaResultProps) => {
	if (state.status === 'idle') {
		return null
	}

	if (state.status === 'loading') {
		return (
			<div className="flex h-[25rem] flex-col items-center justify-center">
				<div className="loading loading-spinner loading-lg"></div>
				{state.message && <p className="mt-2">{state.message}</p>}
			</div>
		)
	}

	if (state.status === 'error') {
		return (
			<div className="flex h-[25rem] flex-col items-center justify-center">
				<div className="my-auto text-error text-lg">{state.message}</div>
			</div>
		)
	}

	return (
		<div className="my-2 flex h-[25rem] flex-col items-center">
			<CardAnimation
				frontImageSignedUrl={state.signedUrl}
				rarity={state.rarity}
				delay={0.2}
			/>
		</div>
	)
}

export default GachaResult
