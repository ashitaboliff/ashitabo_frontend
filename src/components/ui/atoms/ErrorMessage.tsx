import { ApiError } from '@/types/responseTypes'

type ErrorMessageProps = {
	error?: ApiError | null
	className?: string
	prefix?: string
}

const ErrorMessage = ({
	error,
	className = '',
	prefix = 'エラーコード',
}: ErrorMessageProps) => {
	if (!error) {
		return null
	}

	return (
		<p className={`text-sm text-error text-center ${className}`.trim()}>
			{prefix}
			{error.status}:{error.message}
		</p>
	)
}

export default ErrorMessage
