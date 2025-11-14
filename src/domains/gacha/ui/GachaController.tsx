'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MAX_GACHA_PLAYS_PER_DAY } from '@/domains/gacha/config/gachaConfig'
import { FORCE_GACHA_PENDING } from '@/domains/gacha/config/gachaDebugConfig'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import { executeGachaPlay } from '@/domains/gacha/services/executeGachaPlay'
import GachaConfirm from '@/domains/gacha/ui/GachaConfirm'
import GachaPending from '@/domains/gacha/ui/GachaPending'
import GachaResult, {
	type GachaResultViewState,
} from '@/domains/gacha/ui/GachaResult'
import GachaSelectPopup, {
	type PackSelectionPayload,
} from '@/domains/gacha/ui/GachaSelectPopup'
import FullscreenOverlay from '@/shared/ui/atoms/FullscreenOverlay'
import type { Session } from '@/types/session'

type GachaStep = 'select' | 'confirm' | 'pending' | 'result'

interface Props {
	readonly session: Session
	readonly gachaPlayCountToday: number
	readonly onGachaPlayedSuccessfully: () => void
	readonly open: boolean
	readonly onClose: () => void
	readonly carouselPackData: CarouselPackDataItem[]
	readonly ignorePlayCountLimit?: boolean
	readonly closeOnResultReset?: boolean
	readonly maxPlayCountOverride?: number
}

const GachaController = ({
	session,
	gachaPlayCountToday,
	onGachaPlayedSuccessfully,
	open,
	onClose,
	carouselPackData,
	ignorePlayCountLimit = false,
	closeOnResultReset = false,
	maxPlayCountOverride,
}: Props) => {
	const router = useRouter()
	const effectiveMaxPlayCount =
		typeof maxPlayCountOverride === 'number'
			? maxPlayCountOverride
			: MAX_GACHA_PLAYS_PER_DAY
	const [currentStep, setCurrentStep] = useState<GachaStep>('select')
	const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
	const [selectedRect, setSelectedRect] =
		useState<PackSelectionPayload['rect']>(null)
	const [pendingPackRect, setPendingPackRect] =
		useState<PackSelectionPayload['rect']>(null)
	const [pendingAnimationDone, setPendingAnimationDone] = useState(false)
	const [isGachaExecutionPending, setIsGachaExecutionPending] = useState(false)
	const executionIdRef = useRef(0)
	const [gachaResultState, setGachaResultState] =
		useState<GachaResultViewState>({ status: 'idle' })
	const suppressSelectClose = useRef(false)

	const selectedPack = useMemo(
		() =>
			carouselPackData.find((pack) => pack.version === selectedVersion) || null,
		[carouselPackData, selectedVersion],
	)

	useEffect(() => {
		if (!open) {
			setCurrentStep('select')
			setSelectedVersion(null)
			setSelectedRect(null)
			setPendingPackRect(null)
			setPendingAnimationDone(false)
			setIsGachaExecutionPending(false)
			setGachaResultState({ status: 'idle' })
			executionIdRef.current += 1
			suppressSelectClose.current = false
		}
	}, [open])

	const handlePackSelected = ({ version, rect }: PackSelectionPayload) => {
		if (!ignorePlayCountLimit && gachaPlayCountToday >= effectiveMaxPlayCount) {
			router.push('/gacha')
			return
		}
		suppressSelectClose.current = true
		setSelectedVersion(version)
		setSelectedRect(rect)
		setCurrentStep('confirm')
	}

	const handleConfirm = useCallback(
		(rect: PackSelectionPayload['rect']) => {
			if (!selectedVersion) return
			setCurrentStep('pending')
			setPendingPackRect(rect ?? selectedRect)
			setPendingAnimationDone(false)
			setGachaResultState({
				status: 'loading',
				message: 'ガチャ結果を生成中...',
			})
			setIsGachaExecutionPending(true)
			const executionId = executionIdRef.current + 1
			executionIdRef.current = executionId
			void executeGachaPlay({
				version: selectedVersion,
				userId: session.user.id,
				currentPlayCount: gachaPlayCountToday,
				ignorePlayCountLimit,
			}).then((result) => {
				if (executionIdRef.current !== executionId) return
				setIsGachaExecutionPending(false)
				if (result.ok) {
					setGachaResultState({
						status: 'success',
						rarity: result.rarity,
						signedUrl: result.signedUrl,
					})
					onGachaPlayedSuccessfully()
				} else {
					setGachaResultState({
						status: 'error',
						message: result.message,
					})
				}
			})
		},
		[
			gachaPlayCountToday,
			ignorePlayCountLimit,
			onGachaPlayedSuccessfully,
			selectedRect,
			selectedVersion,
			session.user.id,
		],
	)

	const handleBackToSelect = useCallback(() => {
		setSelectedVersion(null)
		setSelectedRect(null)
		setPendingPackRect(null)
		setPendingAnimationDone(false)
		setIsGachaExecutionPending(false)
		setGachaResultState({ status: 'idle' })
		executionIdRef.current += 1
		suppressSelectClose.current = false
		setCurrentStep('select')
	}, [])

	const handleResultBackToSelect = useCallback(() => {
		if (closeOnResultReset) {
			onClose()
			return
		}
		handleBackToSelect()
	}, [closeOnResultReset, handleBackToSelect, onClose])

	const handleClose = useCallback(() => {
		onClose()
		handleBackToSelect()
	}, [handleBackToSelect, onClose])

	const handleSelectPopupClose = useCallback(() => {
		if (suppressSelectClose.current) {
			suppressSelectClose.current = false
			return
		}
		handleClose()
	}, [handleClose])

	const renderOverlayContent = () => {
		if (!selectedPack) return null
		switch (currentStep) {
			case 'confirm':
				return (
					<GachaConfirm
						pack={selectedPack}
						packRect={selectedRect}
						onConfirm={handleConfirm}
						onBack={handleBackToSelect}
					/>
				)
			case 'pending':
				return (
					<GachaPending
						pack={selectedPack}
						packRect={pendingPackRect ?? selectedRect}
						onAnimationComplete={() => setPendingAnimationDone(true)}
						showBlockingLoader={pendingAnimationDone && isGachaExecutionPending}
					/>
				)
			case 'result':
				return (
					<div className="flex w-full max-w-xl flex-col pt-20">
						<GachaResult state={gachaResultState} />
						<div className="relative">
							<div className="fixed absolute bottom-0 z-40 flex h-32 w-full justify-center bg-white py-4">
								<button
									type="button"
									className="btn btn-outline"
									onClick={handleResultBackToSelect}
								>
									パック選択に戻る
								</button>
							</div>
						</div>
					</div>
				)
			default:
				return null
		}
	}

	const shouldShowOverlay = open && currentStep !== 'select'

	useEffect(() => {
		if (FORCE_GACHA_PENDING) {
			return
		}
		if (
			currentStep === 'pending' &&
			pendingAnimationDone &&
			!isGachaExecutionPending &&
			gachaResultState.status !== 'loading'
		) {
			setCurrentStep('result')
		}
	}, [
		currentStep,
		gachaResultState.status,
		isGachaExecutionPending,
		pendingAnimationDone,
	])

	return (
		<>
			<GachaSelectPopup
				open={open && currentStep === 'select'}
				onClose={handleSelectPopupClose}
				carouselPackData={carouselPackData}
				gachaPlayCountToday={gachaPlayCountToday}
				maxPlayCount={effectiveMaxPlayCount}
				onPackSelect={handlePackSelected}
			/>

			{shouldShowOverlay && (
				<FullscreenOverlay>{renderOverlayContent()}</FullscreenOverlay>
			)}
		</>
	)
}

export default GachaController
