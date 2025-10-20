import type { ReactNode } from 'react'
import FeedbackMessage from '@/components/ui/molecules/FeedbackMessage'
import type { FeedbackMessageType } from '@/types/feedback'

type BookingSuccessMessageProps = {
	feedback?: FeedbackMessageType | null
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
				<FeedbackMessage
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
	feedback?: FeedbackMessageType | null
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
			<FeedbackMessage
				source={feedback}
				defaultVariant={feedback.kind ?? 'error'}
			/>
		</div>
	)
}
