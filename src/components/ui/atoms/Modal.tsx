'use client'

import { ReactNode, useState } from 'react'
import Popup from '@/components/ui/molecules/Popup'

interface ModalProps {
	id: string
	children: ReactNode
	btnText?: string
	btnClass?: string
	modalClass?: string
	title?: string
}

const Modal = ({
	id,
	btnText,
	children,
	btnClass = 'btn-primary',
	modalClass = '',
	title,
}: ModalProps) => {
	const [open, setOpen] = useState(false)
	const dialogTitle =
		title && title.trim().length > 0 ? title : btnText ?? '情報'

	return (
		<>
			<button
				type="button"
				className={`btn ${btnClass}`}
				onClick={() => setOpen(true)}
			>
				{btnText || '開く'}
			</button>
			<Popup
				id={id}
				title={dialogTitle}
				open={open}
				onClose={() => setOpen(false)}
				className={modalClass}
			>
				<div className="flex flex-col gap-4">
					{children}
					<div className="flex justify-center">
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setOpen(false)}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
		</>
	)
}

export default Modal
