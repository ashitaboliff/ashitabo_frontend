'use client'

import { useEffect, useRef, ReactNode } from 'react'

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
}: {
	id: string
	title: string
	children?: ReactNode
	maxWidth?: string
	open: boolean
	onClose: () => void
	className?: string
	isCloseButton?: boolean
	noPadding?: boolean
}) => {
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (open) {
			if (!dialog.open) {
				dialog.showModal()
			}
		} else {
			if (dialog.open) {
				dialog.close()
			}
		}
	}, [open])

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		const handleClose = () => {
			onClose()
		}

		dialog.addEventListener('close', handleClose)
		return () => {
			dialog.removeEventListener('close', handleClose)
		}
	}, [onClose])

	return (
		<dialog
			id={id}
			ref={dialogRef}
			className="modal modal-bottom sm:modal-middle"
			aria-labelledby="popup-title"
		>
			{(() => {
				const classes = [
					'modal-box bg-base-100 relative mx-auto',
					maxWidth ? `max-w-${maxWidth}` : 'max-w-lg',
					noPadding ? 'paddingless' : '',
					className || '',
				]
					.filter(Boolean)
					.join(' ')
				return (
					<div className={classes}>
						<h2
							id="popup-title"
							className={`text-center mb-4 text-xl font-bold ${noPadding ? 'pt-6' : ''}`}
						>
							{title}
						</h2>
						{isCloseButton && (
							<form method="dialog" className="absolute right-2 top-2">
								<button
									className="btn btn-sm btn-circle btn-ghost"
									aria-label="閉じる"
								>
									✕
								</button>
							</form>
						)}
						{children}
					</div>
				)
			})()}
			<form method="dialog" className="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	)
}

export default Popup
