import { isValidElement, type ReactNode } from 'react'
import { formatErrorMessage } from '@/shared/lib/error'
import Message, { type MessageVariant } from '@/shared/ui/atoms/Message'
import type { FeedbackMessageType } from '@/types/feedback'
import type { ApiError } from '@/types/response'

export type MessageSource =
	| FeedbackMessageType
	| ApiError
	| ReactNode
	| string
	| null
	| undefined

interface FeedbackMessageProps {
	source?: MessageSource
	defaultVariant?: MessageVariant
	className?: string
	showIcon?: boolean
	iconClassName?: string
}

const isFeedbackMessage = (value: unknown): value is FeedbackMessageType => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'kind' in value &&
		'message' in value
	)
}

const isApiError = (value: unknown): value is ApiError => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'status' in value &&
		'message' in value
	)
}

const FeedbackMessage = ({
	source,
	defaultVariant = 'info',
	className,
	showIcon = true,
	iconClassName,
}: FeedbackMessageProps) => {
	if (
		source === null ||
		source === undefined ||
		source === '' ||
		(Array.isArray(source) && source.length === 0)
	) {
		return null
	}

	if (isApiError(source)) {
		const formatted = formatErrorMessage(
			source.status,
			source.message,
			source.details,
		)
		return (
			<Message
				variant="error"
				className={className}
				showIcon={showIcon}
				iconClassName={iconClassName}
				title={formatted.title}
			>
				<p>{formatted.message}</p>
				{formatted.action ? (
					<p className="mt-1 font-medium">{formatted.action}</p>
				) : null}
				{formatted.details ? (
					<p className="text-xs opacity-80 break-words mt-2">
						{formatted.details}
					</p>
				) : null}
			</Message>
		)
	}

	if (isFeedbackMessage(source)) {
		const variant = (source.kind ?? defaultVariant) as MessageVariant
		return (
			<Message
				variant={variant}
				className={className}
				showIcon={showIcon}
				iconClassName={iconClassName}
				title={source.title}
			>
				<p>{source.message}</p>
				{source.details ? (
					<p className="text-xs opacity-80 break-words mt-2">
						{source.details}
					</p>
				) : null}
			</Message>
		)
	}

	if (typeof source === 'string' || isValidElement(source)) {
		return (
			<Message
				variant={defaultVariant}
				className={className}
				showIcon={showIcon}
				iconClassName={iconClassName}
			>
				{source}
			</Message>
		)
	}

	return (
		<Message
			variant={defaultVariant}
			className={className}
			showIcon={showIcon}
			iconClassName={iconClassName}
		>
			{source as ReactNode}
		</Message>
	)
}

export default FeedbackMessage
