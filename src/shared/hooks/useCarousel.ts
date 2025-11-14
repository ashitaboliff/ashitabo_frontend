import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDragSwipe } from '@/shared/lib/gesture'

interface UseCarouselOptions {
	size: number
	autoPlay?: boolean
	interval?: number
	loop?: boolean
	pauseOnHover?: boolean
	onSlideChange?: (index: number) => void
}

interface UseCarouselResult {
	activeIndex: number
	dragOffset: number
	next: () => void
	prev: () => void
	canGoNext: boolean
	canGoPrev: boolean
	containerProps: {
		onPointerDown: UseDragSwipeBind['onPointerDown']
		onPointerMove: UseDragSwipeBind['onPointerMove']
		onPointerUp: UseDragSwipeBind['onPointerUp']
		onPointerLeave: UseDragSwipeBind['onPointerLeave']
		onPointerCancel: UseDragSwipeBind['onPointerCancel']
		onMouseEnter?: () => void
		onMouseLeave?: () => void
	}
}

type UseDragSwipeBind = ReturnType<typeof useDragSwipe>['bind']

export const useCarousel = ({
	size,
	autoPlay = true,
	interval = 5000,
	loop = true,
	pauseOnHover = true,
	onSlideChange,
}: UseCarouselOptions): UseCarouselResult => {
	const [activeIndex, setActiveIndex] = useState(0)
	const [isHovering, setIsHovering] = useState(false)

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const sanitizeIndex = useCallback(
		(nextIndex: number) => {
			if (!size) return 0
			if (loop) {
				return (nextIndex + size) % size
			}
			return Math.min(Math.max(nextIndex, 0), size - 1)
		},
		[loop, size],
	)

	const goTo = useCallback(
		(target: number) => {
			setActiveIndex((prev) => {
				const nextIndex = sanitizeIndex(target)
				if (nextIndex !== prev) {
					onSlideChange?.(nextIndex)
				}
				return nextIndex
			})
		},
		[sanitizeIndex, onSlideChange],
	)

	const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
	const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

	const { bind, dragOffset, isDragging } = useDragSwipe({
		onSwipeLeft: () => next(),
		onSwipeRight: () => prev(),
		disabled: size <= 1,
	})

	const isPaused = useMemo(() => {
		if (size <= 1) return true
		if (!autoPlay) return true
		return (pauseOnHover && isHovering) || isDragging
	}, [autoPlay, isDragging, isHovering, pauseOnHover, size])

	useEffect(() => {
		if (isPaused) {
			clearTimer()
			return
		}

		timerRef.current = setTimeout(() => {
			next()
		}, interval)

		return clearTimer
	}, [clearTimer, interval, isPaused, next])

	const handleMouseEnter = useCallback(() => {
		if (!pauseOnHover || size <= 1) return
		setIsHovering(true)
	}, [pauseOnHover, size])

	const handleMouseLeave = useCallback(() => {
		if (!pauseOnHover || size <= 1) return
		setIsHovering(false)
	}, [pauseOnHover, size])

	const containerProps = useMemo(
		() => ({
			...bind,
			onMouseEnter: pauseOnHover ? handleMouseEnter : undefined,
			onMouseLeave: pauseOnHover ? handleMouseLeave : undefined,
		}),
		[bind, handleMouseEnter, handleMouseLeave, pauseOnHover],
	)

	const canGoPrev = loop || activeIndex > 0
	const canGoNext = loop || activeIndex < size - 1

	return {
		activeIndex,
		dragOffset,
		next,
		prev,
		canGoNext,
		canGoPrev,
		containerProps,
	}
}
