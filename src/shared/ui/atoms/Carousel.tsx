'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useMemo } from 'react'
import { useCarousel } from '@/shared/hooks/useCarousel'

export interface CarouselSlide {
	id: string
	node: ReactNode
}

interface CarouselProps {
	slides: CarouselSlide[]
	autoPlay?: boolean
	interval?: number
	pauseOnHover?: boolean
	loop?: boolean
	className?: string
	style?: CSSProperties
	nextLabel?: string
	prevLabel?: string
	onSlideChange?: (index: number) => void
}

const Carousel = ({
	slides,
	autoPlay = true,
	interval = 5000,
	pauseOnHover = true,
	loop = true,
	className = '',
	style,
	nextLabel = 'Next slide',
	prevLabel = 'Previous slide',
	onSlideChange,
}: CarouselProps) => {
	const {
		activeIndex,
		dragOffset,
		next,
		prev,
		canGoNext,
		canGoPrev,
		containerProps,
	} = useCarousel({
		size: slides.length,
		autoPlay,
		interval,
		loop,
		pauseOnHover,
		onSlideChange,
	})

	const composedClassName = useMemo(() => {
		return ['relative w-full overflow-hidden select-none', className]
			.filter(Boolean)
			.join(' ')
	}, [className])

	const composedStyle = useMemo(() => {
		return {
			touchAction: 'pan-y',
			cursor: slides.length > 1 ? 'grab' : 'default',
			...style,
		}
	}, [slides.length, style])

	if (!slides.length) {
		return null
	}

	return (
		<div
			className={composedClassName}
			style={composedStyle}
			{...containerProps}
		>
			<div
				className="flex transition-transform duration-500 ease-out"
				style={{
					transform: `translateX(-${activeIndex * 100}%) translateX(${dragOffset}px)`,
				}}
				role="presentation"
			>
				{slides.map(({ id, node }, index) => (
					<fieldset
						className="w-full flex-shrink-0"
						key={id}
						aria-label={`${index + 1} / ${slides.length}`}
					>
						{node}
					</fieldset>
				))}
			</div>

			{slides.length > 1 && (
				<>
					<button
						type="button"
						className="-translate-y-1/2 absolute top-1/2 left-2 rounded-xl bg-white/80 p-4 text-base shadow hover:bg-white"
						onClick={prev}
						disabled={!canGoPrev}
						aria-label={prevLabel}
					>
						❮
					</button>
					<button
						type="button"
						className="-translate-y-1/2 absolute top-1/2 right-2 rounded-xl bg-white/80 p-4 text-base shadow hover:bg-white"
						onClick={next}
						disabled={!canGoNext}
						aria-label={nextLabel}
					>
						❯
					</button>
				</>
			)}
		</div>
	)
}

export default Carousel
