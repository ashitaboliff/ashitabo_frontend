import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import InputFieldError from '@/components/ui/atoms/InputFieldError'
import LabelInputField from '@/components/ui/atoms/LabelInputField'

/**
 * テキスト入力フィールド
 * @param register react-hook-formのregister
 * @param placeholder プレースホルダー
 * @param type 入力タイプ
 * @param label ラベル
 * @param infoDropdown ドロップダウンの情報
 * @param disabled フィールドの無効化
 * @param errorMessage エラーメッセージ
 * @param className クラス名
 * @param value 値
 * @param onChange 値の変更時の関数
 * @param defaultValue デフォルト値
 */

type TextareaInputFieldProps = {
	name?: string
	register?: UseFormRegisterReturn
	placeholder?: string
	label?: string
	labelId?: string
	infoDropdown?: ReactNode
	disabled?: boolean
	errorMessage?: string
	className?: string
	value?: string
	defaultValue?: string
}

const TextareaInputField = ({
	name,
	register,
	placeholder,
	label,
	labelId,
	infoDropdown,
	disabled,
	errorMessage,
	className,
	value,
	defaultValue, // 追加: defaultValue をサポート
	...props
}: TextareaInputFieldProps) => {
	return (
		<div className="flex flex-col w-full">
			{label && (
				<LabelInputField
					label={label}
					infoDropdown={infoDropdown}
					labelId={labelId}
				/>
			)}
			<textarea
				id={labelId}
				name={name}
				placeholder={placeholder}
				className={`textarea w-full pr-10 bg-white ${className}`}
				disabled={disabled}
				value={value}
				defaultValue={defaultValue} // 追加: defaultValue を設定
				{...register}
				{...props}
			/>

			<InputFieldError errorMessage={errorMessage} />
		</div>
	)
}

export default TextareaInputField
