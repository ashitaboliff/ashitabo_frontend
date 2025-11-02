'use client'

import { type ReactNode, useEffect, useState } from 'react'
import Message, { type MessageVariant } from '@/shared/ui/atoms/Message'

export type NoticeType = MessageVariant

export interface Props {
	type?: NoticeType
	children: ReactNode
	className?: string
	duration?: number
}

const ENTER_MS = 300
const LEAVE_MS = 300

const FlashMessage = ({
	type = 'info',
	children,
	className,
	duration = 2000,
}: Props) => {
	const [inView, setInView] = useState(false) // true: 画面内、false: 画面外(上)
	const [visible, setVisible] = useState(true) // コンポーネント自体の生存

	useEffect(() => {
		const rafId = requestAnimationFrame(() => setInView(true)) // 次フレームで入場開始

		const leaveTimer = window.setTimeout(
			() => setInView(false),
			ENTER_MS + duration,
		)
		const hideTimer = window.setTimeout(
			() => setVisible(false),
			ENTER_MS + duration + LEAVE_MS,
		)

		return () => {
			cancelAnimationFrame(rafId)
			clearTimeout(leaveTimer)
			clearTimeout(hideTimer)
		}
	}, [duration])

	if (!visible) return null

	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
			<div
				className={`pointer-events-auto mt-4 transform will-change-transform ${inView ? 'translate-y-0 duration-[350ms] ease-out' : '-translate-y-full duration-[280ms] ease-in'}`}
			>
				<Message
					variant={type}
					className={`shadow-lg ${className ?? ''}`.trim()}
				>
					{children}
				</Message>
			</div>
		</div>
	)
}

export default FlashMessage
