'use client'

import type { FormEventHandler } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import {
	DIGIT_FIELDS,
	type PadlockDigits,
} from '@/features/auth/hooks/usePasswordForm'

const inputClass = 'input w-16 h-16 text-center text-2xl'

type PadlockFormProps = {
	register: UseFormRegister<PadlockDigits>
	errors: FieldErrors<PadlockDigits>
	onSubmit: FormEventHandler<HTMLFormElement>
	onClear: () => void
	onDigitChange: (
		event: React.ChangeEvent<HTMLInputElement>,
		next?: keyof PadlockDigits,
	) => void
	onDigitKeyDown: (
		event: React.KeyboardEvent<HTMLInputElement>,
		prev?: keyof PadlockDigits,
	) => void
	disableSubmit?: boolean
}

const PadlockForm = ({
	register,
	errors,
	onSubmit,
	onClear,
	onDigitChange,
	onDigitKeyDown,
	disableSubmit,
}: PadlockFormProps) => (
	<form onSubmit={onSubmit} className="flex flex-col items-center gap-y-2">
		<div className="flex flex-row justify-center">
			{DIGIT_FIELDS.map((field, index) => {
				const next = DIGIT_FIELDS[index + 1]
				const prev = DIGIT_FIELDS[index - 1]
				const registerProps = register(field)
				return (
					<input
						key={field}
						type="tel"
						maxLength={1}
						className={inputClass}
						{...registerProps}
						onChange={(event) => {
							registerProps.onChange(event)
							onDigitChange(event, next)
						}}
						onKeyDown={(event) => {
							onDigitKeyDown(event, prev)
						}}
						aria-invalid={Boolean(errors[field])}
					/>
				)
			})}
		</div>
		<div className="flex flex-row justify-center space-x-2">
			<button
				type="submit"
				className="btn btn-primary"
				disabled={disableSubmit}
			>
				送信
			</button>
			<button type="button" className="btn btn-outline" onClick={onClear}>
				入力をクリア
			</button>
		</div>
	</form>
)

export default PadlockForm
