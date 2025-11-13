'use client'

import { useCallback, useMemo, useRef } from 'react'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import { usePackOpeningAnimation } from '@/domains/gacha/ui/animations/usePackOpeningAnimation'
import type { PackSelectionPayload } from '@/domains/gacha/ui/GachaSelectPopup'
import { ImageWithFallback } from '@/shared/ui/atoms/ImageWithFallback'

interface GachaPendingProps {
	readonly pack: CarouselPackDataItem
	readonly packRect: PackSelectionPayload['rect']
	readonly onAnimationComplete: () => void
	readonly showBlockingLoader: boolean
}

const PACK_RATIO = 684 / 360
const PACK_TOP_TRIM_RATIO = 2.4 / 19
const RIBBON_CLIP_PATH =
	'path("M28.913 1.52588e-05L34.9132 0C32.1185 4.61393 29.3759 9.09718 26.729 13.424C0.962214 55.5441 -11.2336 98.3356 21.4128 87C56.9128 68.5 39.9129 136 39.9129 136L34.9132 134.5L36.4129 128V122C36.4129 122 48.9128 70.6393 21.4128 76.5C-21.5872 85.664 10.4132 26 28.913 1.52588e-05Z")'
const GachaPending = ({
	pack,
	packRect,
	onAnimationComplete,
	showBlockingLoader,
}: GachaPendingProps) => {
	const animatedPackRef = useRef<HTMLDivElement | null>(null)
	const topSliceRef = useRef<HTMLDivElement | null>(null)
	const cutLineRef = useRef<HTMLDivElement | null>(null)
	const confettiRefs = useRef<(HTMLSpanElement | null)[]>([])
	const ribbonRefs = useRef<(HTMLSpanElement | null)[]>([])
	const lightRefs = useRef<(HTMLSpanElement | null)[]>([])
	const animationCompletedRef = useRef(false)

	const finalSize = useMemo(() => {
		if (typeof window === 'undefined') {
			const fallbackWidth = 320
			return { width: fallbackWidth, height: fallbackWidth * PACK_RATIO }
		}
		const finalWidth = Math.min(window.innerWidth * 0.6, 340)
		return {
			width: finalWidth,
			height: finalWidth * PACK_RATIO,
		}
	}, [])

	const notifyCompletion = useCallback(() => {
		if (animationCompletedRef.current) return
		animationCompletedRef.current = true
		onAnimationComplete()
	}, [onAnimationComplete])
	const { confettiSpecs, ribbonSpecs, lightBeamSpecs } =
		usePackOpeningAnimation({
			containerRef: animatedPackRef,
			topSliceRef,
			cutLineRef,
			confettiRefs,
			ribbonRefs,
			lightRefs,
			finalSize,
			packRect,
			onAnimationComplete: notifyCompletion,
		})

	const topClipPercent = (1 - PACK_TOP_TRIM_RATIO) * 100
	const bottomClipPercent = PACK_TOP_TRIM_RATIO * 100

	return (
		<>
			<div
				ref={animatedPackRef}
				className="relative drop-shadow-[0_25px_25px_rgba(0,0,0,0.75)]"
			>
				<div ref={topSliceRef} className="absolute top-0 left-0 h-full w-full">
					<ImageWithFallback
						src={pack.signedPackImageUrl}
						fallback="/version1.webp"
						alt={`${pack.version} pack top`}
						width={360}
						height={684}
						className="absolute top-0 right-0 left-0 h-full w-full object-cover"
						style={{ clipPath: `inset(0 0 ${topClipPercent}% 0)` }}
					/>
				</div>
				<div className="absolute bottom-0 left-0 h-full w-full">
					<ImageWithFallback
						src={pack.signedPackImageUrl}
						fallback="/version1.webp"
						alt={`${pack.version} pack bottom`}
						width={360}
						height={684}
						className="absolute right-0 bottom-0 left-0 h-full w-full object-cover"
						style={{ clipPath: `inset(${bottomClipPercent}% 0 0 0)` }}
					/>
				</div>
				<div
					className="pointer-events-none absolute left-0 w-full"
					style={{ top: `${PACK_TOP_TRIM_RATIO * 100}%` }}
				>
					<div
						ref={cutLineRef}
						className="h-1.5 w-full"
						style={{
							background: '#ffffff',
							filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))',
						}}
					></div>
				</div>
				<div
					className="pointer-events-none absolute left-0 w-full overflow-visible"
					style={{ top: `${PACK_TOP_TRIM_RATIO * 100}%` }}
				>
					{confettiSpecs.map((spec, index) => (
						<span
							key={`confetti-${spec.color}-${index}`}
							ref={(node) => {
								confettiRefs.current[index] = node
							}}
							className="-translate-x-1/2 absolute left-1/2 inline-block h-2 w-2 opacity-0"
							style={{ backgroundColor: spec.color }}
						></span>
					))}
					{ribbonSpecs.map((spec, index) => (
						<span
							key={`ribbon-${spec.color}-${index}`}
							ref={(node) => {
								ribbonRefs.current[index] = node
							}}
							className="-translate-x-1/2 absolute left-1/2 inline-block h-32 w-48 opacity-0"
							style={{
								background: spec.color,
								boxShadow: '0 0 10px rgba(0,0,0,0.2)',
								clipPath: RIBBON_CLIP_PATH,
								WebkitClipPath: RIBBON_CLIP_PATH,
								transformOrigin: '50% 50%',
							}}
						></span>
					))}
					{lightBeamSpecs.map((spec, index) => (
						<span
							key={`light-${spec.rotation}-${index}`}
							ref={(node) => {
								lightRefs.current[index] = node
							}}
							className="-translate-x-1/2 absolute left-1/2 z-10 inline-block h-32 w-2 opacity-0"
							style={{
								background:
									'linear-gradient(180deg, rgba(255,255,50,0.9), rgba(255,255,50,0))',
								transformOrigin: 'center top',
								rotate: `${spec.rotation}deg`,
							}}
						></span>
					))}
				</div>
			</div>
			<div className="relative">
				<div className="fixed absolute bottom-0 z-40 flex h-32 w-full justify-center bg-white py-4" />
					{showBlockingLoader && (
						<div className="absolute inset-0 top-40 bottom-0 z-40 flex items-center justify-center bg-white/75">
							<div className="loading loading-spinner loading-lg" />
						</div>
					)}
			</div>
		</>
	)
}

export default GachaPending
