'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'

export const PasswordSchema = zod.object({
	digit1: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
	digit2: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
	digit3: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
	digit4: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
})

export type PadlockDigits = zod.infer<typeof PasswordSchema>
export type DigitField = keyof PadlockDigits

export const DIGIT_FIELDS: DigitField[] = [
	'digit1',
	'digit2',
	'digit3',
	'digit4',
]

export const usePasswordForm = () => {
	const form = useForm<PadlockDigits>({
		mode: 'onBlur',
		resolver: zodResolver(PasswordSchema),
		defaultValues: { digit1: '', digit2: '', digit3: '', digit4: '' },
	})

	const { setFocus, register, handleSubmit, reset, formState } = form

	const handleDigitChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>, next?: DigitField) => {
			if (event.target.value.length === 1 && next) {
				setFocus(next)
			}
		},
		[setFocus],
	)

	const handleDigitKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>, prev?: DigitField) => {
			if (event.key === 'Backspace' && !event.currentTarget.value && prev) {
				setFocus(prev)
			}
		},
		[setFocus],
	)

	const extractPassword = useCallback((values: PadlockDigits) => {
		return DIGIT_FIELDS.map((field) => values[field]).join('')
	}, [])

	return {
		register,
		handleSubmit,
		reset,
		handleDigitChange,
		handleDigitKeyDown,
		extractPassword,
		errors: formState.errors,
	}
}
