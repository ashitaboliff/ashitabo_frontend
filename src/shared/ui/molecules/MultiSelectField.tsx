import type React from 'react'
import { useCallback, useMemo } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import type { BaseSelectFieldProps } from '@/shared/ui/atoms/SelectField'
import { createSyntheticEvent, useDropdown } from '@/shared/hooks/useSelectField'

interface MultiSelectFieldProps<TValue extends string | number>
	extends BaseSelectFieldProps<TValue> {
	// biome-ignore lint/suspicious/noExplicitAny: react-hook-form setter uses form-specific generics
	setValue?: UseFormSetValue<any>
	watchValue?: TValue[]
	value?: TValue[]
	onChange?: (
		event: React.ChangeEvent<HTMLSelectElement> & {
			target: { name: string; value: TValue[] }
		},
	) => void
}

const MultiSelectField = <TValue extends string | number = string>({
	options,
	label,
	labelId,
	name,
	infoDropdown,
	errorMessage,
	setValue,
	watchValue = [],
	value: controlledValue,
	onChange: controlledOnChange,
	className,
}: MultiSelectFieldProps<TValue>) => {
	const { isOpen, toggle, dropdownRef } = useDropdown()

	const selectedValues = useMemo<TValue[]>(() => {
		if (setValue && watchValue) {
			return watchValue
		}
		if (controlledValue) {
			return controlledValue
		}
		return []
	}, [controlledValue, setValue, watchValue])

	const displaySelected = useMemo(() => {
		if (selectedValues.length === 0) return '選択してください'
		return selectedValues
			.map((val) => {
				const entry = Object.entries(options).find(
					([, optionVal]) => optionVal === val,
				)
				return entry ? entry[0] : String(val)
			})
			.join(', ')
	}, [options, selectedValues])

	const handleCheckboxChange = useCallback(
		(optionValue: TValue) => {
			const newValueArray = selectedValues.includes(optionValue)
				? selectedValues.filter((item) => item !== optionValue)
				: [...selectedValues, optionValue]

			if (setValue) {
				setValue(name, newValueArray, {
					shouldValidate: true,
					shouldDirty: true,
				})
			}
			if (controlledOnChange) {
				controlledOnChange(
					createSyntheticEvent(
						name,
						newValueArray,
					) as React.ChangeEvent<HTMLSelectElement> & {
						target: { name: string; value: TValue[] }
					},
				)
			}
		},
		[controlledOnChange, name, selectedValues, setValue],
	)

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
					className={`select bg-white w-full text-left ${className ?? ''}`}
					onClick={toggle}
					aria-expanded={isOpen}
				>
					{displaySelected}
				</button>
				<div className="dropdown-content menu bg-white rounded-box z-[20] min-w-[210px] w-1/2 p-2 shadow relative">
					<ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pb-4">
						{Object.entries(options).map(([optionLabel, optionValue]) => (
							<li key={`li-${String(optionValue)}`}>
								<label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-base-200 rounded-md">
									<input
										type="checkbox"
										checked={selectedValues.includes(optionValue as TValue)}
										onChange={() => handleCheckboxChange(optionValue as TValue)}
										className="checkbox checkbox-primary"
									/>
									<span className="label-text">{optionLabel}</span>
								</label>
							</li>
						))}
					</ul>
					{Object.keys(options).length > 8 && (
						<div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
					)}
				</div>
			</div>
			<InputFieldError errorMessage={errorMessage} />
		</div>
	)
}

export default MultiSelectField
