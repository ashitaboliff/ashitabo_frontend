import { ReactNode } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { UseFormRegisterReturn } from 'react-hook-form'
import TextInputField from '@/components/ui/atoms/TextInputField'
import LabelInputField from '@/components/ui/atoms/LabelInputField'

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
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
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
