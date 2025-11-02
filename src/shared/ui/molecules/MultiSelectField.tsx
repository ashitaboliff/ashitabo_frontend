import { type ChangeEvent, useCallback, useMemo } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import {
	createSyntheticEvent,
	useDropdown,
} from '@/shared/hooks/useSelectField'
import InputFieldError from '@/shared/ui/atoms/InputFieldError'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import type { BaseSelectFieldProps } from '@/shared/ui/atoms/SelectField'

interface MultiSelectFieldProps<TValue extends string | number>
	extends BaseSelectFieldProps<TValue> {
	// biome-ignore lint/suspicious/noExplicitAny: react-hook-form setter uses form-specific generics
	setValue?: UseFormSetValue<any>
	watchValue?: TValue[]
	value?: TValue[]
	onChange?: (
		event: ChangeEvent<HTMLSelectElement> & {
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
					) as ChangeEvent<HTMLSelectElement> & {
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
					className={`select w-full bg-white text-left ${className ?? ''}`}
					onClick={toggle}
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
						<div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-white to-transparent"></div>
					)}
				</div>
			</div>
			<InputFieldError errorMessage={errorMessage} />
		</div>
	)
}

export default MultiSelectField
