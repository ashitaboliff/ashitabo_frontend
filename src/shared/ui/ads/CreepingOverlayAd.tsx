'use client'

import type { PointerEventHandler } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Ads from './Ads'

const LOCK_DELAY_MS = 8000

const CreepingOverlayAd = () => {
	const [isLocked, setIsLocked] = useState(false)
	const adContainerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setIsLocked(true)
		}, LOCK_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [])

	const triggerAdClick = useCallback(() => {
		if (isLocked) {
			return
		}
		const container = adContainerRef.current
		if (!container) {
			return
		}

		const candidateSelectors = [
			'button',
			'[role="button"]',
			'a',
			'iframe',
			'ins',
		]
		for (const selector of candidateSelectors) {
			const element = container.querySelector<HTMLElement>(selector)
			if (element) {
				if (typeof element.click === 'function') {
					element.click()
					return
				}
				const syntheticClick = new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					view: window,
				})
				element.dispatchEvent(syntheticClick)
				return
			}
		}

		container.click()
	}, [isLocked])

	const handleScrimPointerDown = useCallback<
		PointerEventHandler<HTMLDivElement>
	>(
		(event) => {
			if (isLocked) {
				return
			}
			event.preventDefault()
			event.stopPropagation()
			triggerAdClick()
		},
		[isLocked, triggerAdClick],
	)

	const containerClass = [
		'creeping-overlay-ad',
		isLocked ? 'creeping-overlay-ad--locked' : 'creeping-overlay-ad--floating',
	].join(' ')

	return (
		<>
			{!isLocked && (
				<div
					className="creeping-overlay-ad__scrim"
					aria-hidden="true"
					onPointerDown={handleScrimPointerDown}
				/>
			)}
			<div className={containerClass} aria-hidden="true">
				<div
					ref={adContainerRef}
					className="pointer-events-auto flex h-full w-full flex-col bg-white text-base-content"
				>
					<Ads placement="MenuDisplay" className="w-full" />
				</div>
			</div>
		</>
	)
}

export default CreepingOverlayAd
