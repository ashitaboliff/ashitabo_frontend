'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { padLockFormSchema } from '@/domains/admin/model/adminSchema'
import type { PadLockFormValues } from '@/domains/admin/model/adminTypes'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import Popup from '@/shared/ui/molecules/Popup'

interface PadlockCreateDialogProps {
	readonly open: boolean
	onClose: () => void
	onSubmit: (values: PadLockFormValues) => Promise<boolean>
	isSubmitting: boolean
}

const PadlockCreateDialog = ({
	open,
	onClose,
	onSubmit,
	isSubmitting,
}: PadlockCreateDialogProps) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PadLockFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(padLockFormSchema),
		defaultValues: { name: '', password: '' },
	})

	useEffect(() => {
		if (!open) {
			reset({ name: '', password: '' })
		}
	}, [open, reset])

	const handleFormSubmit = handleSubmit(async (values) => {
		const shouldReset = await onSubmit(values)
		if (shouldReset) {
			reset({ name: '', password: '' })
		}
	})

	return (
		<Popup
			id="padlock-create"
			title="パスワード作成"
			open={open}
			onClose={onClose}
		>
			<form
				onSubmit={handleFormSubmit}
				className="flex flex-col items-center justify-center gap-y-3"
			>
				<TextInputField
					label="管理名"
					type="text"
					register={register('name')}
					errorMessage={errors.name?.message}
				/>
				<TextInputField
					label="パスワード"
					type="text"
					inputMode="numeric"
					maxLength={4}
					register={register('password')}
					errorMessage={errors.password?.message}
				/>
				<div className="flex flex-row gap-x-2 justify-center">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={isSubmitting}
					>
						{isSubmitting ? '作成中…' : '作成'}
					</button>
					<button
						type="button"
						className="btn btn-outline"
						onClick={onClose}
						disabled={isSubmitting}
					>
						閉じる
					</button>
				</div>
			</form>
		</Popup>
	)
}

export default PadlockCreateDialog
