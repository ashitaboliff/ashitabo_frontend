'use client'

import { FeedbackMessage as FeedbackMessageView } from '@/components/ui/atoms/Message'
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
			<FeedbackMessageView source={feedback} />
			{fieldError ? (
				<p className="text-sm text-error text-center">{fieldError}</p>
			) : null}
		</div>
	)
}

export default PadlockErrorDisplay
