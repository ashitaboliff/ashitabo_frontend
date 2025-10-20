import type { ReactNode } from 'react'
import { FeedbackMessage as FeedbackMessageView } from '@/components/ui/atoms/Message'
import type { FeedbackMessage } from '@/types/feedback'

type BookingSuccessMessageProps = {
	feedback?: FeedbackMessage | null
	children?: ReactNode
	onBack?: () => void
	backButtonLabel?: string
	className?: string
	backButtonClassName?: string
}

export const BookingSuccessMessage = ({
	feedback,
	children,
	onBack,
	backButtonLabel = 'コマ表に戻る',
	className = 'space-y-4 w-full',
	backButtonClassName = 'btn btn-outline w-full max-w-md',
}: BookingSuccessMessageProps) => {
	if (!feedback && !children && !onBack) {
		return null
	}

	return (
		<div className={className}>
			{feedback ? (
				<FeedbackMessageView
					source={feedback}
					defaultVariant={feedback.kind ?? 'success'}
				/>
			) : null}
			{children}
			{onBack ? (
				<div className="flex justify-center">
					<button
						type="button"
						className={backButtonClassName}
						onClick={onBack}
					>
						{backButtonLabel}
					</button>
				</div>
			) : null}
		</div>
	)
}

type BookingErrorMessageProps = {
	feedback?: FeedbackMessage | null
	className?: string
}

export const BookingErrorMessage = ({
	feedback,
	className = 'space-y-2',
}: BookingErrorMessageProps) => {
	if (!feedback) {
		return null
	}

	return (
		<div className={className}>
			<FeedbackMessageView
				source={feedback}
				defaultVariant={feedback.kind ?? 'error'}
			/>
		</div>
	)
}
