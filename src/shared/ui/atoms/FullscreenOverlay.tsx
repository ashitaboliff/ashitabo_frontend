'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface FullscreenOverlayProps {
	readonly children: ReactNode
	readonly className?: string
}

const useBodyScrollLock = () => {
	useEffect(() => {
		if (typeof document === 'undefined') return
		const body = document.body
		const attr = 'data-scroll-locked'
		const activeCount = Number(body.getAttribute(attr) ?? '0')
		body.setAttribute(attr, String(activeCount + 1))
		if (activeCount === 0) {
			body.dataset.prevOverflow = body.style.overflow
			body.style.overflow = 'hidden'
		}
		return () => {
			const nextCount = Number(body.getAttribute(attr) ?? '1') - 1
			if (nextCount <= 0) {
				body.style.overflow = body.dataset.prevOverflow ?? ''
				body.removeAttribute(attr)
				delete body.dataset.prevOverflow
			} else {
				body.setAttribute(attr, String(nextCount))
			}
		}
	}, [])
}

const FullscreenOverlay = ({ children, className }: FullscreenOverlayProps) => {
	useBodyScrollLock()
	return (
		<div
			className={`fixed inset-0 z-30 flex flex-col bg-white ${className ?? ''}`}
			role="dialog"
			aria-modal="true"
		>
			<div className="flex h-full flex-col">{children}</div>
		</div>
	)
}

export default FullscreenOverlay
