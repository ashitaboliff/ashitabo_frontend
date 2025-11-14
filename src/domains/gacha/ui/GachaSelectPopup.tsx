'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import { useDragSwipe } from '@/shared/lib/gesture'
import { ImageWithFallback } from '@/shared/ui/atoms/ImageWithFallback'
import Popup from '@/shared/ui/molecules/Popup'

export type PackSelectionPayload = {
	version: string
	rect: {
		left: number
		top: number
		width: number
		height: number
	} | null
}

interface GachaSelectPopupProps {
	readonly open: boolean
	readonly onClose: () => void
	readonly carouselPackData: CarouselPackDataItem[]
	readonly gachaPlayCountToday: number
	readonly maxPlayCount: number
	readonly onPackSelect: (payload: PackSelectionPayload) => void
}

const SIDE_OFFSET = 100
const IMAGE_WIDTH = 250
const IMAGE_HEIGHT = 475

const GachaSelectPopup = ({
	open,
	onClose,
	carouselPackData,
	gachaPlayCountToday,
	maxPlayCount,
	onPackSelect,
}: GachaSelectPopupProps) => {
	return (
		<Popup
			id="gacha-select-popup"
			title="ガチャパックを選択"
			open={open}
			onClose={onClose}
			maxWidth="xl"
			isCloseButton={false}
			className="h-[90vh] overflow-y-auto"
		>
			<div className="flex flex-col gap-y-4">
				<GachaSelectCarousel
					onPackSelect={onPackSelect}
					carouselPackData={carouselPackData}
				/>
				{(() => {
					const hasLimit = Number.isFinite(maxPlayCount)
					const reachedLimit = hasLimit && gachaPlayCountToday >= maxPlayCount
					const displayMax = hasLimit ? maxPlayCount : '無制限'
					return (
						<div
							className={`mt-4 text-center text-sm ${reachedLimit ? 'text-error' : 'text-base-content'}`}
						>
							今日のガチャプレイ回数: {gachaPlayCountToday} / {displayMax}
						</div>
					)
				})()}
				<button className="btn btn-outline" onClick={onClose} type="button">
					閉じる
				</button>
			</div>
		</Popup>
	)
}

interface CarouselProps {
	onPackSelect: (payload: PackSelectionPayload) => void
	carouselPackData: CarouselPackDataItem[]
}

const GachaSelectCarousel = ({
	onPackSelect,
	carouselPackData,
}: CarouselProps) => {
	const packs = useMemo(
		() =>
			carouselPackData.filter((pack): pack is CarouselPackDataItem =>
				Boolean(pack?.version),
			),
		[carouselPackData],
	)

	const [currentIndex, setCurrentIndex] = useState(() =>
		packs.length > 0 ? packs.length - 1 : 0,
	)

	useEffect(() => {
		setCurrentIndex((prev) => {
			if (!packs.length) return 0
			return Math.min(prev, packs.length - 1)
		})
	}, [packs.length])

	const goToIndex = useCallback(
		(target: number) => {
			setCurrentIndex((_prev) => {
				if (!packs.length) return 0
				const clamped = Math.min(Math.max(target, 0), packs.length - 1)
				return clamped
			})
		},
		[packs.length],
	)

	const goNext = useCallback(() => {
		setCurrentIndex((prev) => {
			if (prev >= packs.length - 1) return prev
			return prev + 1
		})
	}, [packs.length])

	const goPrev = useCallback(() => {
		setCurrentIndex((prev) => {
			if (prev <= 0) return prev
			return prev - 1
		})
	}, [])

	const { bind, dragOffset } = useDragSwipe({
		onSwipeLeft: () => goNext(),
		onSwipeRight: () => goPrev(),
		disabled: packs.length <= 1,
	})

	const activeCardRef = useRef<HTMLButtonElement | null>(null)

	const handlePackClick = useCallback(() => {
		const selected = packs[currentIndex]
		if (!selected) return
		const rect = activeCardRef.current?.getBoundingClientRect()
		onPackSelect({
			version: selected.version,
			rect: rect
				? {
						left: rect.left,
						top: rect.top,
						width: rect.width,
						height: rect.height,
					}
				: null,
		})
	}, [currentIndex, onPackSelect, packs])

	if (!packs.length) {
		return (
			<div className="relative flex h-[500px] w-full select-none items-center justify-center overflow-hidden">
				<p>利用可能なガチャパックがありません。</p>
			</div>
		)
	}

	const renderSlide = (pack: CarouselPackDataItem, index: number) => {
		const distance = index - currentIndex
		if (Math.abs(distance) > 1) {
			return null
		}

		const isActive = distance === 0
		const isRight = distance > 0
		const baseOffset = isActive ? 0 : isRight ? SIDE_OFFSET : -SIDE_OFFSET
		const translateX = baseOffset + dragOffset * (isActive ? 1 : 0.25)
		const scale = isActive ? 1 : 0.52
		const opacity = isActive ? 1 : 0.85
		const handleClick = () => {
			if (isActive) {
				handlePackClick()
			} else {
				goToIndex(index)
			}
		}

		return (
			<div
				key={pack.version}
				className="absolute top-1/2 flex flex-col items-center transition-all duration-300"
				style={{
					transform: `translateX(${translateX}px) translateY(-50%) scale(${scale})`,
					opacity,
					zIndex: isActive ? 20 : 10,
					pointerEvents: Math.abs(distance) > 1 ? 'none' : 'auto',
				}}
			>
				<button
					type="button"
					onClick={handleClick}
					className="relative flex flex-col items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-base-content/50 focus-visible:outline-offset-4"
					ref={(node) => {
						if (isActive) {
							activeCardRef.current = node
						} else if (activeCardRef.current === node) {
							activeCardRef.current = null
						}
					}}
					aria-label={
						isActive ? `${pack.version} を引く` : `${pack.version} を選択`
					}
				>
					{pack.signedPackImageUrl ? (
						<ImageWithFallback
							src={pack.signedPackImageUrl}
							alt={`${pack.version} pack`}
							width={IMAGE_WIDTH}
							height={IMAGE_HEIGHT}
							loading={isActive ? 'eager' : 'lazy'}
							preload={isActive}
							sizes="(min-width: 768px) 250px, 75vw"
							decoding="async"
							fallback="/version1.webp"
						/>
					) : (
						<div className="flex h-[400px] w-[250px] flex-col items-center justify-center rounded-lg bg-base-200">
							<p className="text-error-content text-sm">画像表示エラー</p>
							<p className="mt-1 text-error-content/70 text-xs">
								{pack.version}
							</p>
						</div>
					)}
					{isActive && (
						<div className="gacha-yoyo-scale -translate-x-1/2 pointer-events-none absolute bottom-3 left-1/2 flex w-[80%] justify-center rounded-full bg-rainbow-45 px-4 py-2 ring-2 ring-white/50">
							<span className="text-center font-black text-lg text-white tracking-wide">
								このパックを引く
							</span>
						</div>
					)}
				</button>
			</div>
		)
	}

	return (
		<div className="relative flex h-[500px] w-full select-none items-center justify-center overflow-hidden">
			<div
				className="relative flex h-full w-full items-center justify-center"
				style={{ touchAction: 'pan-y' }}
				{...bind}
			>
				{packs.map(renderSlide)}
			</div>
		</div>
	)
}

export default GachaSelectPopup
