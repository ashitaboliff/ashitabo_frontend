'use client'

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'

type PopupProps = {
	id: string
	title: string
	children?: ReactNode
	maxWidth?: string
	open: boolean
	onClose: () => void
	className?: string
	isCloseButton?: boolean
	noPadding?: boolean
}

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

	useEffect(() => {
		latestOnClose.current = onClose
	}, [onClose])

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		const handleClose = () => {
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
			dialog.showModal()
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

	return (
		<dialog
			id={id}
			ref={dialogRef}
			className="modal modal-middle"
			aria-labelledby={titleId}
			aria-hidden={!open}
		>
			<div
				className={`modal-box bg-base-100 relative mx-auto ${maxWidth ? `max-w-${maxWidth}` : 'max-w-lg'} ${noPadding ? 'paddingless' : ''} ${className ?? ''}`}
			>
				<h2
					id={titleId}
					className={`text-center mb-4 text-xl font-bold ${noPadding ? 'pt-6' : ''}`}
				>
					{title}
				</h2>
				{isCloseButton && (
					<form
						method="dialog"
						className="absolute right-2 top-2"
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
				<button type="submit">close</button>
			</form>
		</dialog>
	)
}

export default Popup
