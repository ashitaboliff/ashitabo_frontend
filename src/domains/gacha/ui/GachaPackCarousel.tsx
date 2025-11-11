'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import { useDragSwipe } from '@/shared/lib/gesture'
import { ImageWithFallback } from '@/shared/ui/atoms/ImageWithFallback'

interface Props {
	readonly onPackSelect: (version: string) => void
	readonly carouselPackData: CarouselPackDataItem[]
}

const SIDE_OFFSET = 100
const IMAGE_WIDTH = 250
const IMAGE_HEIGHT = 475

const GachaPackCarousel = ({ onPackSelect, carouselPackData }: Props) => {
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

	const handlePackClick = useCallback(() => {
		const selected = packs[currentIndex]
		if (!selected) return
		onPackSelect(selected.version)
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
						<div className="pack-text -translate-x-1/2 absolute top-4 left-1/2 w-[90%] bg-base-content/50 py-1 text-center font-bold text-2xl text-white">
							このパックを引く
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

export default GachaPackCarousel
