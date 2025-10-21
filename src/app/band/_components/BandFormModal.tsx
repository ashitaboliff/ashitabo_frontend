'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
	createBandAction,
	updateBandAction,
} from '@/domains/band/api/bandActions'
import type { BandDetails } from '@/domains/band/model/bandTypes'
import {
	type BandFormValues,
	bandFormSchema,
} from '@/domains/band/schemas/bandSchema'
import { useFeedback } from '@/shared/hooks/useFeedback'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import { logError } from '@/shared/utils/logger'

interface Props {
	isOpen: boolean
	onClose: () => void
	bandToEdit?: BandDetails | null
	onFormSubmitSuccess: (band: BandDetails, mode: 'create' | 'update') => void
}

const defaultValues: BandFormValues = {
	name: '',
}

const BandFormModal = ({
	isOpen,
	onClose,
	bandToEdit,
	onFormSubmitSuccess,
}: Props) => {
	const modalRef = useRef<HTMLDialogElement>(null)
	const feedback = useFeedback()
	const isEditing = useMemo(() => !!bandToEdit, [bandToEdit])

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<BandFormValues>({
		resolver: zodResolver(bandFormSchema),
		defaultValues,
	})

	useEffect(() => {
		if (isOpen) {
			modalRef.current?.showModal()
		} else {
			modalRef.current?.close()
		}
	}, [isOpen])

	useEffect(() => {
		if (bandToEdit) {
			reset({ name: bandToEdit.name ?? '' })
		} else {
			reset(defaultValues)
		}
	}, [bandToEdit, reset])

	const closeAndReset = (values?: BandFormValues) => {
		reset(
			values ?? (bandToEdit ? { name: bandToEdit.name ?? '' } : defaultValues),
		)
		feedback.clearFeedback()
		onClose()
	}

	const onSubmit = async (values: BandFormValues) => {
		feedback.clearFeedback()

		const formData = new FormData()
		formData.append('name', values.name.trim())

		try {
			const response =
				isEditing && bandToEdit
					? await updateBandAction(bandToEdit.id, formData)
					: await createBandAction(formData)

			if (response.ok) {
				onFormSubmitSuccess(
					response.data as BandDetails,
					isEditing ? 'update' : 'create',
				)
				closeAndReset(defaultValues)
			} else {
				feedback.showApiError(response)
			}
		} catch (error) {
			feedback.showError(
				'バンドの保存に失敗しました。しばらくしてから再度お試しください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('band form submit error', error)
		}
	}

	return (
		<dialog ref={modalRef} className="modal" onClose={() => closeAndReset()}>
			<div className="modal-box">
				<h3 className="font-bold text-lg">
					{isEditing ? 'バンド名を編集' : '新しいバンドを作成'}
				</h3>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<FeedbackMessage source={feedback.feedback} />
					<TextInputField
						label="バンド名"
						type="text"
						register={register('name')}
						placeholder="バンド名を入力"
						maxLength={100}
						disabled={isSubmitting}
						errorMessage={errors.name?.message}
					/>
					<div className="modal-action">
						<button
							type="button"
							className="btn"
							onClick={() => closeAndReset()}
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
								<span className="loading loading-spinner" />
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
				<button type="button" onClick={() => closeAndReset()}>
					close
				</button>
			</form>
		</dialog>
	)
}

export default BandFormModal
