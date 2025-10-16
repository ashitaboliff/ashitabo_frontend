import type { FeedbackKind, FeedbackMessage } from '@/types/feedback'
import type { ApiError } from '@/types/responseTypes'

type MessageInput = FeedbackMessage | ApiError | string | null | undefined

type ErrorMessageProps = {
	message?: MessageInput
	error?: ApiError | null
	className?: string
	kind?: FeedbackKind
}

const kindToClass: Record<FeedbackKind, string> = {
	error: 'bg-error/10 text-error border-error/40',
	success: 'bg-success/10 text-success border-success/40',
	info: 'bg-info/10 text-info border-info/40',
}

const normalizeMessage = (
	message: MessageInput,
	fallbackKind: FeedbackKind,
) => {
	if (!message) return null
	if (typeof message === 'string') {
		return { kind: fallbackKind, message }
	}
	if ((message as FeedbackMessage).kind) {
		return message as FeedbackMessage
	}
	const apiError = message as ApiError
	return {
		kind: 'error' as FeedbackKind,
		message: apiError.message,
		title: 'エラーが発生しました',
		details:
			typeof apiError.details === 'string'
				? apiError.details
				: apiError.details
					? JSON.stringify(apiError.details)
					: undefined,
		code: apiError.status,
	}
}

const ErrorMessage = ({
	message,
	error,
	className = '',
	kind = 'error',
}: ErrorMessageProps) => {
	const normalized = normalizeMessage(message ?? error ?? null, kind)
	if (!normalized) {
		return null
	}

	const { title, details, code } = normalized
	const messageClass = kindToClass[normalized.kind]

	return (
		<div
			className={`border rounded-md px-3 py-2 text-sm text-center ${messageClass} ${className}`.trim()}
			role={normalized.kind === 'error' ? 'alert' : 'status'}
		>
			{title && <p className="font-semibold">{title}</p>}
			<p>
				{code ? `(${code}) ` : ''}
				{normalized.message}
			</p>
			{details && <p className="mt-1 text-xs opacity-80">{details}</p>}
		</div>
	)
}

export default ErrorMessage
