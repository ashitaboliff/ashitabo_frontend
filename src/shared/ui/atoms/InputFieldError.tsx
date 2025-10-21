interface InputFieldErrorProps {
	errorMessage?: string
}

const InputFieldError = ({ errorMessage }: InputFieldErrorProps) => {
	if (!errorMessage) return null

	return (
		<div className="label">
			<span className="label-text-alt text-error">{errorMessage}</span>
		</div>
	)
}

export default InputFieldError
