import type { PointerEvent } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

type SwipeAxis = 'x' | 'y'

interface UseDragSwipeOptions {
	onSwipeLeft?: () => void
	onSwipeRight?: () => void
	onSwipeUp?: () => void
	onSwipeDown?: () => void
	axis?: SwipeAxis
	threshold?: number
	disabled?: boolean
}

interface UseDragSwipeResult {
	readonly bind: {
		onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
		onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
		onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
		onPointerLeave: (event: PointerEvent<HTMLDivElement>) => void
		onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
	}
	readonly dragOffset: number
	readonly isDragging: boolean
}

const DEFAULT_THRESHOLD = 40

export const useDragSwipe = ({
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
	onSwipeDown,
	axis = 'x',
	threshold = DEFAULT_THRESHOLD,
	disabled = false,
}: UseDragSwipeOptions): UseDragSwipeResult => {
	const [isDragging, setIsDragging] = useState(false)
	const [dragOffset, setDragOffset] = useState(0)
	const startXRef = useRef(0)
	const startYRef = useRef(0)
	const deltaXRef = useRef(0)
	const deltaYRef = useRef(0)

	const finishSwipe = useCallback(
		(commit: boolean) => {
			if (!isDragging) return
			setIsDragging(false)
			setDragOffset(0)

			if (!commit) {
				deltaXRef.current = 0
				deltaYRef.current = 0
				return
			}

			const deltaX = deltaXRef.current
			const deltaY = deltaYRef.current
			deltaXRef.current = 0
			deltaYRef.current = 0

			if (axis === 'x') {
				if (Math.abs(deltaX) < threshold) return
				if (deltaX > 0) {
					onSwipeRight?.()
				} else {
					onSwipeLeft?.()
				}
			} else {
				if (Math.abs(deltaY) < threshold) return
				if (deltaY > 0) {
					onSwipeDown?.()
				} else {
					onSwipeUp?.()
				}
			}
		},
		[
			axis,
			isDragging,
			onSwipeDown,
			onSwipeLeft,
			onSwipeRight,
			onSwipeUp,
			threshold,
		],
	)

	const handlePointerDown = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (disabled) return
			if (event.pointerType === 'mouse' && event.button !== 0) return

			setIsDragging(true)
			startXRef.current = event.clientX
			startYRef.current = event.clientY
			deltaXRef.current = 0
			deltaYRef.current = 0
			event.currentTarget.setPointerCapture?.(event.pointerId)
		},
		[disabled],
	)

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (!isDragging) return
			const deltaX = event.clientX - startXRef.current
			const deltaY = event.clientY - startYRef.current
			deltaXRef.current = deltaX
			deltaYRef.current = deltaY
			setDragOffset(axis === 'x' ? deltaX : deltaY)
			event.preventDefault()
		},
		[axis, isDragging],
	)

	const handlePointerUp = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (!isDragging) return
			event.currentTarget.releasePointerCapture?.(event.pointerId)
			finishSwipe(true)
		},
		[finishSwipe, isDragging],
	)

	const handlePointerLeave = useCallback(() => {
		if (!isDragging) return
		finishSwipe(true)
	}, [finishSwipe, isDragging])

	const handlePointerCancel = useCallback(() => {
		if (!isDragging) return
		finishSwipe(false)
	}, [finishSwipe, isDragging])

	const bind = useMemo(
		() => ({
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			onPointerLeave: handlePointerLeave,
			onPointerCancel: handlePointerCancel,
		}),
		[
			handlePointerCancel,
			handlePointerDown,
			handlePointerLeave,
			handlePointerMove,
			handlePointerUp,
		],
	)

	return {
		bind,
		dragOffset,
		isDragging,
	}
}

export default useDragSwipe
