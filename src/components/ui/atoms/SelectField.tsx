'use client'

import React, { type ReactNode, useCallback, useMemo } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import InputFieldError from '@/components/ui/atoms/InputFieldError'
import LabelInputField from '@/components/ui/atoms/LabelInputField'
import { createSyntheticEvent } from '@/hooks/useSelectField'

export type SelectOptions<TValue extends string | number> = Record<
	string,
	TValue
>

export interface BaseSelectFieldProps<TValue extends string | number>
	extends Omit<
		React.SelectHTMLAttributes<HTMLSelectElement>,
		'multiple' | 'value' | 'onChange'
	> {
	register?: UseFormRegisterReturn
	options: SelectOptions<TValue>
	label?: string
	labelId?: string
	name: string
	infoDropdown?: ReactNode
	errorMessage?: string
	className?: string
}

interface SingleSelectFieldProps<TValue extends string | number>
	extends BaseSelectFieldProps<TValue> {
	value?: TValue
	onChange?: (
		event: React.ChangeEvent<HTMLSelectElement> & {
			target: { name: string; value: TValue }
		},
	) => void
}

const SelectField = <TValue extends string | number = string>({
	register,
	options,
	label,
	labelId,
	name,
	infoDropdown,
	errorMessage,
	value: controlledValue,
	onChange: controlledOnChange,
	className,
	defaultValue,
	...rest
}: SingleSelectFieldProps<TValue>) => {
	const { onChange: registerOnChange, ...registerRest } = register ?? {}

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => {
			registerOnChange?.(event)

			if (controlledOnChange) {
				const selectedStringValue = event.target.value
				const entry = Object.entries(options).find(
					([, optVal]) => String(optVal) === selectedStringValue,
				)
				const actualValue = entry
					? (entry[1] as TValue)
					: (selectedStringValue as unknown as TValue)
				controlledOnChange(
					createSyntheticEvent(name, actualValue) as typeof event & {
						target: { name: string; value: TValue }
					},
				)
			}
		},
		[controlledOnChange, name, options, registerOnChange],
	)

	const selectValueProps = useMemo(() => {
		if (controlledValue !== undefined) {
			return { value: String(controlledValue) }
		}
		if (defaultValue !== undefined) {
			return { defaultValue: String(defaultValue) }
		}
		return {}
	}, [controlledValue, defaultValue])

	return (
		<div className="form-control w-full">
			{label && (
				<LabelInputField
					label={label}
					infoDropdown={infoDropdown}
					labelId={labelId}
				/>
			)}
			<select
				id={labelId}
				name={name}
				className={`select w-full bg-white ${className ?? ''}`}
				onChange={handleChange}
				{...registerRest}
				{...selectValueProps}
				{...rest}
			>
				<option
					value=""
					disabled={controlledValue === undefined && defaultValue === undefined}
					hidden
				>
					選択してください
				</option>
				{Object.entries(options).map(([optionLabel, optionValue]) => (
					<option key={String(optionValue)} value={String(optionValue)}>
						{optionLabel}
					</option>
				))}
			</select>
			<InputFieldError errorMessage={errorMessage} />
		</div>
	)
}

export default SelectField
