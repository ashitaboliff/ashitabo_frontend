'use client'

import { useRef, useState, useEffect, FormEvent } from 'react'
// import { useFormState, useFormStatus } from 'react-dom' // Not used
import { createBandAction, updateBandAction } from './actions'
import TextInputField from '@/components/ui/atoms/TextInputField' // Import TextInputField
import type {
	BandDetails,
	CreateBandResponse,
	UpdateBandResponse,
} from '@/features/band/types'
import { ApiError } from '@/types/responseTypes'

interface BandFormModalProps {
	isOpen: boolean
	onClose: () => void
	bandToEdit?: BandDetails | null
	onFormSubmitSuccess: (band: BandDetails) => void
}

// function SubmitButton({ isEditing }: { isEditing: boolean }) { // Not used
// 	// Not used with current form handling
// 	const { pending } = useFormStatus()
// 	return (
// 		<button type="submit" className="btn btn-primary" disabled={pending}>
// 			{pending ? (
// 				<span className="loading loading-spinner"></span>
// 			) : isEditing ? (
// 				'更新'
// 			) : (
// 				'作成'
// 			)}
// 		</button>
// 	)
// }

export default function BandFormModal({
	isOpen,
	onClose,
	bandToEdit,
	onFormSubmitSuccess,
}: BandFormModalProps) {
	const modalRef = useRef<HTMLDialogElement>(null)
	const [bandName, setBandName] = useState('')
	const isEditing = !!bandToEdit

	// `useFormState` expects the action to be passed directly.
	// We need to conditionally choose the action based on `isEditing`.
	// A common pattern is to wrap them or use a hidden input to dispatch.
	// For simplicity here, we'll create a wrapper action or handle it inside.
	// However, `useFormState` is designed for a single action.
	// Let's use a more traditional form handling for conditional actions.
	const [formMessage, setFormMessage] = useState<string | null>(null)
	const [error, setError] = useState<ApiError | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (bandToEdit) {
			setBandName(bandToEdit.name)
		} else {
			setBandName('')
		}
	}, [bandToEdit])

	useEffect(() => {
		if (isOpen) {
			modalRef.current?.showModal()
		} else {
			modalRef.current?.close()
		}
	}, [isOpen])

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSubmitting(true)
		setError(null)

		const formData = new FormData(event.currentTarget)
		let res: CreateBandResponse | UpdateBandResponse

		if (isEditing && bandToEdit) {
			res = await updateBandAction(bandToEdit.id, formData)
		} else {
			res = await createBandAction(formData)
		}
		setIsSubmitting(false)

		if (res.ok) {
			onFormSubmitSuccess(res.data as BandDetails)
			onClose()
		} else {
			setError(res)
		}
	}

	return (
		<dialog ref={modalRef} className="modal" onClose={onClose}>
			<div className="modal-box">
				<h3 className="font-bold text-lg">
					{isEditing ? 'バンド名を編集' : '新しいバンドを作成'}
				</h3>
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<TextInputField
						label="バンド名"
						type="text"
						name="name"
						// id="bandName" // TextInputFieldPropsにidがないため削除
						value={bandName}
						onChange={(e) => setBandName(e.target.value)}
						placeholder="バンド名を入力"
						required
						maxLength={100}
						disabled={isSubmitting}
						errorMessage={error?.message || undefined}
					/>
					<div className="modal-action">
						<button
							type="button"
							className="btn"
							onClick={onClose}
							disabled={isSubmitting}
						>
							キャンセル
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<span className="loading loading-spinner"></span>
							) : isEditing ? (
								'更新'
							) : (
								'作成'
							)}
						</button>
					</div>
				</form>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onClose}>
					close
				</button>
			</form>
		</dialog>
	)
}
