'use client'

import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import type { FeedbackMessage } from '@/types/feedback'

type PadlockErrorDisplayProps = {
	feedback?: FeedbackMessage | null
	fieldError?: string
}

const PadlockErrorDisplay = ({
	feedback,
	fieldError,
}: PadlockErrorDisplayProps) => {
	return (
		<div className="space-y-2">
			<ErrorMessage message={feedback} />
			{fieldError ? (
				<p className="text-sm text-error text-center">{fieldError}</p>
			) : null}
		</div>
	)
}

export default PadlockErrorDisplay
