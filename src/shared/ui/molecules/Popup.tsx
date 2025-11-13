'use client'

import {
	memo,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react'

type PopupProps = {
	id: string
	title: string
	children?: ReactNode
	// Tailwindのmax-w-*トークン or CSS長さ（例: '640px' '40rem'）
	maxWidth?: string
	open: boolean
	onClose: () => void
	className?: string
	isCloseButton?: boolean
	noPadding?: boolean
}

const TAILWIND_MAXW = new Set([
	'xs',
	'sm',
	'md',
	'lg',
	'xl',
	'2xl',
	'3xl',
	'4xl',
	'5xl',
	'6xl',
	'7xl',
	'full',
	'min',
	'max',
	'fit',
	'prose',
])

const Popup = ({
	id,
	title,
	children,
	maxWidth,
	open,
	onClose,
	className,
	isCloseButton = true,
	noPadding = false,
}: PopupProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const latestOnClose = useRef(onClose)
	const lastFocused = useRef<HTMLElement | null>(null)

	useEffect(() => {
		latestOnClose.current = onClose
	}, [onClose])

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		const handleClose = () => {
			if (lastFocused.current && document.contains(lastFocused.current)) {
				lastFocused.current.focus()
			}
			latestOnClose.current()
		}

		dialog.addEventListener('close', handleClose)
		return () => {
			dialog.removeEventListener('close', handleClose)
		}
	}, [])

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (open && !dialog.open) {
			lastFocused.current = (document.activeElement as HTMLElement) ?? null
			dialog.showModal()
			dialog.focus()
		} else if (!open && dialog.open) {
			dialog.close()
		}
	}, [open])

	const closeDialog = useCallback(() => {
		const dialog = dialogRef.current
		if (dialog?.open) {
			dialog.close()
		} else {
			latestOnClose.current()
		}
	}, [])

	const titleId = useMemo(() => `${id}-title`, [id])

	// maxWidth: Tailwindトークンならクラス、そうでなければstyleで適用
	const useTailwindMaxW = maxWidth && TAILWIND_MAXW.has(maxWidth)
	const maxWClass = useTailwindMaxW ? `max-w-${maxWidth}` : 'max-w-lg'
	const maxWStyle = !useTailwindMaxW && maxWidth ? { maxWidth } : undefined

	return (
		<dialog
			id={id}
			ref={dialogRef}
			className="modal modal-middle"
			aria-labelledby={titleId}
			aria-modal={open ? true : undefined}
		>
			<div
				className={`modal-box relative mx-auto overflow-x-hidden overflow-y-auto bg-base-100 ${maxWClass} ${noPadding ? 'paddingless' : ''} ${className ?? ''}`}
				style={maxWStyle}
			>
				<h2
					id={titleId}
					className={`mb-4 text-center font-bold text-xl ${noPadding ? 'pt-6' : ''}`}
				>
					{title}
				</h2>
				{isCloseButton && (
					<form
						method="dialog"
						className="absolute top-2 right-2"
						onSubmit={closeDialog}
					>
						<button
							className="btn btn-sm btn-circle btn-ghost"
							aria-label="閉じる"
							type="submit"
						>
							✕
						</button>
					</form>
				)}
				{children}
			</div>
			<form method="dialog" className="modal-backdrop" onSubmit={closeDialog}>
				<button type="submit" aria-label="閉じる">
					<span className="sr-only">閉じる</span>
				</button>
			</form>
		</dialog>
	)
}

export default memo(Popup)
