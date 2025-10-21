import type { MouseEvent } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import { MdVisibility, MdVisibilityOff } from '@/shared/ui/icons'

/**
 * パスワード入力フィールド
 * @param register react-hook-formのregister
 * @param showPassword パスワード表示の有無
 * @param handleClickShowPassword パスワード表示の切り替え関数、見えるほう
 * @param handleMouseDownPassword パスワード表示の切り替え関数、見えなくするほう
 */
const PasswordInputField = ({
	label,
	labelId,
	register,
	showPassword,
	handleClickShowPassword,
	handleMouseDownPassword,
	errorMessage,
	className = '',
}: {
	label?: string
	labelId?: string
	register: UseFormRegisterReturn
	showPassword: boolean
	handleClickShowPassword: () => void
	handleMouseDownPassword: (event: MouseEvent<HTMLButtonElement>) => void
	errorMessage?: string
	className?: string
}) => {
	return (
		<div>
			{label && <LabelInputField label={label} labelId={labelId} />}
			<div className="relative">
				<input
					id={labelId}
					{...register}
					className={`input w-full pr-10 bg-white ${className}`}
					type={showPassword ? 'text' : 'password'}
					placeholder="パスワード"
					autoComplete="off"
				/>
				<button
					type="button"
					className="absolute inset-y-0 right-0 flex items-center px-2 z-20"
					onClick={handleClickShowPassword}
					onMouseDown={handleMouseDownPassword}
				>
					{showPassword ? (
						<MdVisibilityOff className="text-xl" />
					) : (
						<MdVisibility className="text-xl" />
					)}
				</button>
			</div>
			{errorMessage && (
				<div className="label">
					<span className="text-error label-text-alt">{errorMessage}</span>
				</div>
			)}
		</div>
	)
}

export default PasswordInputField
