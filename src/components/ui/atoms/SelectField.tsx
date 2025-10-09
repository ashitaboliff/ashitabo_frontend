import { useState, useEffect, useRef, ReactNode } from 'react'
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form'
import LabelInputField from '@/components/ui/atoms/LabelInputField'
import InputFieldError from '@/components/ui/atoms/InputFieldError'

interface SelectFieldProps<TValue extends string | number = string>
	extends Omit<
		React.SelectHTMLAttributes<HTMLSelectElement>,
		'multiple' | 'value' | 'onChange'
	> {
	register?: UseFormRegisterReturn
	options: Record<string, TValue>
	label?: string
	labelId?: string
	isMultiple?: boolean
	setValue?: UseFormSetValue<any>
	watchValue?: TValue[]
	name: string
	infoDropdown?: ReactNode
	errorMessage?: string
	value?: TValue | TValue[] // Controlled component value (single TValue or array of TValue for multiple)
	onChange?: (
		event:
			| React.ChangeEvent<HTMLSelectElement>
			| { target: { name: string; value: TValue | TValue[] } },
	) => void
}

/**
 * 汎用セレクトボックス（文字列または数値のオプション値をサポート）
 * Options: Record<label, value> (キーが表示ラベル, 値がoptionのvalue)
 */
const SelectField = <TValue extends string | number = string>({
	register,
	options,
	label,
	labelId,
	isMultiple = false,
	setValue, // RHF specific
	watchValue = [], // RHF specific for multiple
	name,
	infoDropdown,
	errorMessage,
	value: controlledValue, // Renamed to avoid conflict with HTMLAttributes
	onChange: controlledOnChange,
	className, // Ensure className is destructured
	...props // Spread the rest of the props (like defaultValue, disabled, etc.)
}: SelectFieldProps<TValue>) => {
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const getSelectedValues = (): TValue[] => {
		if (setValue && watchValue) {
			// RHF context for multiple
			return watchValue
		}
		if (Array.isArray(controlledValue)) {
			// Controlled component for multiple
			return controlledValue
		}
		return []
	}

	const handleCheckboxChange = (optionValue: TValue) => {
		if (isMultiple) {
			const currentSelectedValues = getSelectedValues()
			const newValueArray = currentSelectedValues.includes(optionValue)
				? currentSelectedValues.filter((item) => item !== optionValue)
				: [...currentSelectedValues, optionValue]

			if (setValue) {
				// RHF: Update form state
				setValue(name, newValueArray, {
					shouldValidate: true,
					shouldDirty: true,
				})
			}
			if (controlledOnChange) {
				// Controlled: Notify parent of change
				controlledOnChange({ target: { name, value: newValueArray } } as any)
			}
		}
	}

	const toggleDropdown = () => setIsOpen((prev) => !prev)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		} else {
			document.removeEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isOpen])

	const displaySelectedMultiple = () => {
		const selected = getSelectedValues()
		if (selected.length === 0) return '選択してください'
		// Find labels for selected values
		return selected
			.map((val) => {
				const entry = Object.entries(options).find(
					([_, optionVal]) => optionVal === val,
				)
				return entry ? entry[0] : String(val) // entry[0] is the label
			})
			.join(', ')
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
			{isMultiple ? (
				<div
					className={`dropdown select-bordered w-full ${isOpen ? 'dropdown-open' : ''}`}
					id={labelId}
				>
					<div
						tabIndex={0}
						role="button"
						className={`select bg-white w-full ${className || ''}`}
						onClick={toggleDropdown}
					>
						{displaySelectedMultiple()}
					</div>
					<div
						tabIndex={0}
						className="dropdown-content menu bg-white rounded-box z-[20] min-w-[210px] w-1/2 p-2 shadow relative"
					>
						<ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pb-4">
							{Object.entries(options).map(
								(
									[optionLabel, optionValue], // key is label, value is option's value
								) => (
									<li key={`li-${String(optionValue)}`}>
										<label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-base-200 rounded-md">
											<input
												type="checkbox"
												checked={getSelectedValues().includes(
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
								),
							)}
						</ul>
						{Object.keys(options).length > 8 && (
							<div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
						)}
					</div>
				</div>
			) : (
				<select
					id={labelId}
					className={`select select-bordered w-full bg-white ${className || ''}`}
					{...(register
						? { ...register }
						: {
								name,
								value:
									controlledValue === undefined &&
									props.defaultValue !== undefined
										? undefined
										: String(controlledValue ?? ''),
								onChange: (e) => {
									if (controlledOnChange) {
										// For single select, find the original TValue type for the selected string value
										const selectedStringValue = e.target.value
										let actualValue: TValue | undefined = undefined

										const entry = Object.entries(options).find(
											([_, optVal]) => String(optVal) === selectedStringValue,
										)
										if (entry) {
											actualValue = entry[1] as TValue
										}

										if (typeof actualValue !== 'undefined') {
											const syntheticEvent = {
												target: {
													name: name,
													value: actualValue,
												},
											} as unknown as React.ChangeEvent<HTMLSelectElement>
											controlledOnChange(syntheticEvent)
										} else {
											controlledOnChange(e)
										}
									}
								},
							})}
					{...props} // Other HTML select attributes like disabled, defaultValue
				>
					<option
						value=""
						disabled={
							props.defaultValue === undefined && controlledValue === undefined
						}
						hidden
					>
						選択してください
					</option>
					{Object.entries(options).map(
						(
							[optionLabel, optionValue], // key is label, value is option's value
						) => (
							<option key={String(optionValue)} value={String(optionValue)}>
								{optionLabel}
							</option>
						),
					)}
				</select>
			)}
			<InputFieldError errorMessage={errorMessage} />
		</div>
	)
}

export default SelectField
