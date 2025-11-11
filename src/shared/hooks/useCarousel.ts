import type { PointerEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
		onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
		onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
		onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
		onPointerLeave: (event: PointerEvent<HTMLDivElement>) => void
		onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
		onMouseEnter?: () => void
		onMouseLeave?: () => void
	}
}

const DRAG_THRESHOLD_PX = 40

export const useCarousel = ({
	size,
	autoPlay = true,
	interval = 5000,
	loop = true,
	pauseOnHover = true,
	onSlideChange,
}: UseCarouselOptions): UseCarouselResult => {
	const [activeIndex, setActiveIndex] = useState(0)
	const [dragOffset, setDragOffset] = useState(0)
	const [isHovering, setIsHovering] = useState(false)
	const [isDragging, setIsDragging] = useState(false)

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const startXRef = useRef(0)
	const deltaRef = useRef(0)

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

	const endDrag = useCallback(
		(commit: boolean) => {
			if (!isDragging) return
			setIsDragging(false)
			const delta = deltaRef.current
			deltaRef.current = 0
			setDragOffset(0)

			if (commit && Math.abs(delta) > DRAG_THRESHOLD_PX) {
				if (delta > 0) {
					prev()
				} else {
					next()
				}
			}
		},
		[isDragging, next, prev],
	)

	const handlePointerDown = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (size <= 1) return
			if (event.pointerType === 'mouse' && event.button !== 0) return

			setIsDragging(true)
			startXRef.current = event.clientX
			deltaRef.current = 0
			if (event.currentTarget.setPointerCapture) {
				event.currentTarget.setPointerCapture(event.pointerId)
			}
		},
		[size],
	)

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (!isDragging) return
			const delta = event.clientX - startXRef.current
			deltaRef.current = delta
			setDragOffset(delta)
			event.preventDefault()
		},
		[isDragging],
	)

	const handlePointerUp = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (!isDragging) return
			if (event.currentTarget.releasePointerCapture) {
				event.currentTarget.releasePointerCapture(event.pointerId)
			}
			deltaRef.current = event.clientX - startXRef.current
			endDrag(true)
		},
		[endDrag, isDragging],
	)

	const handlePointerLeave = useCallback(() => {
		if (!isDragging) return
		endDrag(true)
	}, [endDrag, isDragging])

	const handlePointerCancel = useCallback(() => {
		if (!isDragging) return
		endDrag(false)
	}, [endDrag, isDragging])

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
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			onPointerLeave: handlePointerLeave,
			onPointerCancel: handlePointerCancel,
			onMouseEnter: pauseOnHover ? handleMouseEnter : undefined,
			onMouseLeave: pauseOnHover ? handleMouseLeave : undefined,
		}),
		[
			handlePointerCancel,
			handlePointerDown,
			handlePointerLeave,
			handlePointerMove,
			handlePointerUp,
			handleMouseEnter,
			handleMouseLeave,
			pauseOnHover,
		],
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
