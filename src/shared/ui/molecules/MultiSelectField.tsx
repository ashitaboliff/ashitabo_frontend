'use client'

import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from 'react-hook-form'
import { useDropdown } from '@/shared/hooks/useSelectField'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import type { BaseSelectFieldProps } from '@/shared/ui/atoms/SelectField'

interface MultiSelectFieldProps<
	TFieldValues extends FieldValues,
	TValue extends string | number = string,
> extends Omit<
		BaseSelectFieldProps<TValue>,
		'name' | 'render' | 'register' | 'value' | 'onChange' | 'defaultValue'
	> {
	name: Path<TFieldValues>
	control: Control<TFieldValues>
}

const MultiSelectField = <
	TFieldValues extends FieldValues,
	TValue extends string | number = string,
>({
	options,
	label,
	labelId,
	name,
	infoDropdown,
	errorMessage,
	className,
	control,
	...rest
}: MultiSelectFieldProps<TFieldValues, TValue>) => {
	const { isOpen, toggle, dropdownRef } = useDropdown()

	return (
		<Controller
			name={name}
			control={control}
			{...rest}
			render={({ field: { value, onChange, onBlur } }) => {
				const selectedValues = Array.isArray(value) ? (value as TValue[]) : []

				const displaySelected =
					selectedValues.length === 0
						? '選択してください'
						: selectedValues
								.map((val) => {
									const entry = Object.entries(options).find(
										([, optionVal]) => optionVal === val,
									)
									return entry ? entry[0] : String(val)
								})
								.join(', ')

				const handleCheckboxChange = (optionValue: TValue) => {
					const newValueArray = selectedValues.includes(optionValue)
						? selectedValues.filter((item) => item !== optionValue)
						: [...selectedValues, optionValue]

					onChange(newValueArray)
				}

				const handleToggle = () => {
					toggle()
					if (isOpen) {
						onBlur()
					}
				}

				return (
					<div className="form-control w-full" ref={dropdownRef}>
						{label && (
							<LabelInputField
								label={label}
								infoDropdown={infoDropdown}
								labelId={labelId}
							/>
						)}
						<div
							className={`dropdown w-full ${isOpen ? 'dropdown-open' : ''}`}
							id={labelId}
						>
							<button
								type="button"
								className={`select w-full bg-white text-left ${className ?? ''}`}
								onClick={handleToggle}
								aria-expanded={isOpen}
							>
								{displaySelected}
							</button>
							<div className="dropdown-content menu relative z-[20] w-1/2 min-w-[210px] rounded-box bg-white p-2 shadow">
								<ul className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 max-h-60 space-y-2 overflow-y-auto pb-4">
									{Object.entries(options).map(([optionLabel, optionValue]) => (
										<li key={`li-${String(optionValue)}`}>
											<label className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-base-200">
												<input
													type="checkbox"
													checked={selectedValues.includes(
														optionValue as TValue,
													)}
													onChange={() =>
														handleCheckboxChange(optionValue as TValue)
													}
													className="checkbox checkbox-primary"
												/>
												<span className="label-text">{optionLabel}</span>
											</label>
										</li>
									))}
								</ul>
								{Object.keys(options).length > 8 && (
									<div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-white to-transparent"></div>
								)}
							</div>
						</div>
						<InputFieldError errorMessage={errorMessage} />
					</div>
				)
			}}
		/>
	)
}

export default MultiSelectField
