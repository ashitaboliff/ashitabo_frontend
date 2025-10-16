'use client'

import { useId, useState } from 'react'
import Popup from '@/components/ui/molecules/Popup'
import { MAX_GACHA_PLAYS_PER_DAY } from '@/features/gacha/components/config/gachaConfig'
import { useGachaData } from '@/features/gacha/context/GachaDataContext'
import type { Session } from '@/types/session'
import GachaResult from './GachaResult'
import ImageCarousel from './ImageCarousel'

interface GachaMainPopupProps {
	session: Session
	gachaPlayCountToday: number
	onGachaPlayedSuccessfully: () => void
	open: boolean
	onClose: () => void
}

type GachaStep = 'select' | 'pending' | 'result'

const GachaMainPopup = ({
	session,
	gachaPlayCountToday,
	onGachaPlayedSuccessfully,
	open,
	onClose,
}: GachaMainPopupProps) => {
	const { gachaCarouselData } = useGachaData()
	const [currentStep, setCurrentStep] = useState<GachaStep>('select')
	const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
	const popupId = useId()

	const handleGachaSuccessInternal = () => {
		onGachaPlayedSuccessfully()
	}

	const handlePackSelected = (version: string) => {
		setSelectedVersion(version)
		setCurrentStep('pending')
		setTimeout(() => {
			setCurrentStep('result')
		}, 500)
	}

	const handleClose = () => {
		onClose()
		setTimeout(() => {
			setCurrentStep('select')
			setSelectedVersion(null)
		}, 300)
	}

	const getPopupTitle = () => {
		switch (currentStep) {
			case 'select':
				return 'ガチャパックを選択'
			case 'pending':
				return 'ガチャ実行中...'
			case 'result':
				return 'ガチャ結果'
			default:
				return ''
		}
	}

	return (
		<Popup
			id={popupId}
			title={getPopupTitle()}
			open={open}
			onClose={handleClose}
			maxWidth={currentStep === 'select' ? 'xl' : '3xl'}
			isCloseButton={false}
			className="h-[90vh] overflow-y-auto"
		>
			<div className="flex flex-col gap-y-4 justify-center">
				{currentStep === 'select' && (
					<ImageCarousel
						onPackSelect={handlePackSelected}
						carouselPackData={gachaCarouselData}
					/>
				)}

				{currentStep === 'pending' && (
					<div className="flex flex-col items-center justify-center h-64">
						<span className="loading loading-spinner loading-lg"></span>
					</div>
				)}

				{currentStep === 'result' && selectedVersion && (
					<div className="flex flex-col items-center gap-y-4">
						<GachaResult
							version={selectedVersion}
							userId={session.user.id}
							currentPlayCount={gachaPlayCountToday}
							onGachaSuccess={handleGachaSuccessInternal}
						/>
						<button
							type="button"
							className="btn btn-primary mt-2 w-full"
							onClick={() => {
								setCurrentStep('select')
								setSelectedVersion(null)
							}}
						>
							パック選択に戻る
						</button>
					</div>
				)}

				{currentStep !== 'result' && (
					<div
						className={`text-center text-sm text-base-content mt-4 ${gachaPlayCountToday >= MAX_GACHA_PLAYS_PER_DAY ? 'text-error' : ''}`}
					>
						今日のガチャプレイ回数: {gachaPlayCountToday} /{' '}
						{MAX_GACHA_PLAYS_PER_DAY}
					</div>
				)}
				<button className="btn btn-outline" onClick={handleClose} type="button">
					閉じる
				</button>
			</div>
		</Popup>
	)
}

export default GachaMainPopup
