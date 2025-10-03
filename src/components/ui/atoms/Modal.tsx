import { ReactNode } from 'react'

const Modal = ({
	id,
	btnText,
	children,
	btnClass = 'btn-primary',
	modalClass = '',
	isBackdrop = true,
}: {
	id: string
	btnText?: string
	children: ReactNode
	btnClass?: string
	modalClass?: string
	isBackdrop?: boolean
}) => {
	return (
		<>
			<label htmlFor={id} className={`btn ${btnClass}`}>
				{btnText || '開く'}
			</label>
			<input type="checkbox" id={id} className="modal-toggle" />
			<div className={`modal ${modalClass}`}>
				<div className="modal-box">
					{children}
					<div className="modal-action">
						<label htmlFor={id} className="btn btn-outline">
							閉じる
						</label>
					</div>
					{isBackdrop && <label htmlFor={id} className="modal-backdrop" />}
				</div>
			</div>
		</>
	)
}

export default Modal
