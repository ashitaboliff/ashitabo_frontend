'use client'

import { type ReactNode, useEffect, useState } from 'react'

export type NoticeType = 'info' | 'success' | 'warning' | 'error'

export interface NoticeDialogProps {
	type?: NoticeType
	children: ReactNode
	className?: string
	duration?: number
}

const ENTER_MS = 300
const LEAVE_MS = 300

const NoticeDialog = ({
	type = 'info',
	children,
	className,
	duration = 2000,
}: NoticeDialogProps) => {
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
		<div
			className={`fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none`}
		>
			<div
				role="alert"
				className={`alert alert-soft alert-${type} transform will-change-transform mt-4 pointer-events-auto text-base
					${inView ? 'translate-y-0 ease-out duration-[350ms]' : '-translate-y-full ease-in duration-[280ms]'} 
					${className}`}
			>
				<span>{children}</span>
			</div>
		</div>
	)
}

export default NoticeDialog
