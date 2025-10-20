'use client'

import FeedbackMessage from '@/components/ui/molecules/FeedbackMessage'
import type { FeedbackMessageType } from '@/types/feedback'

type PadlockErrorDisplayProps = {
	feedback?: FeedbackMessageType | null
	fieldError?: string
}

const PadlockErrorDisplay = ({
	feedback,
	fieldError,
}: PadlockErrorDisplayProps) => {
	return (
		<div className="space-y-2">
			<FeedbackMessage source={feedback} />
			{fieldError ? (
				<p className="text-sm text-error text-center">{fieldError}</p>
			) : null}
		</div>
	)
}

export default PadlockErrorDisplay
