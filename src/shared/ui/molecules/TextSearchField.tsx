import type { ChangeEvent, ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import { HiOutlineSearch } from '@/shared/ui/icons'

/**
 * テキスト検索フィールド
 * @param register react-hook-formのregister
 */
const TextSearchField = ({
	name,
	register,
	placeholder,
	label,
	labelId,
	infoDropdown,
	disabled,
	className,
	defaultValue,
	value,
	onChange,
}: {
	name?: string
	register?: UseFormRegisterReturn
	placeholder?: string
	label?: string
	labelId?: string
	infoDropdown?: ReactNode
	disabled?: boolean
	className?: string
	defaultValue?: string
	value?: string
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}) => {
	const defaultPlaceholder = placeholder || '検索'
	return (
		<div>
			{label && (
				<LabelInputField
					label={label}
					infoDropdown={infoDropdown}
					labelId={labelId}
				/>
			)}
			<div className={`relative ${className}`}>
				<TextInputField
					labelId={labelId}
					name={name}
					register={register}
					placeholder={defaultPlaceholder}
					type="text"
					disabled={disabled}
					defaultValue={defaultValue}
					value={value}
					onChange={onChange}
				/>
				<div className="absolute inset-y-0 right-0 flex items-center px-2">
					<HiOutlineSearch className="text-xl" />
				</div>
			</div>
		</div>
	)
}

export default TextSearchField
