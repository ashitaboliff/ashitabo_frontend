'use client'

import { useCallback, useState } from 'react'
import { formatErrorMessage } from '@/shared/lib/error'
import type { FeedbackMessageType } from '@/types/feedback'
import type { ApiError } from '@/types/response'

const normalizeApiError = (error: ApiError): FeedbackMessageType => {
	const formatted = formatErrorMessage(
		error.status,
		error.message,
		error.details,
	)

	return {
		kind: 'error',
		title: formatted.title,
		message: formatted.action
			? `${formatted.message} ${formatted.action}`
			: formatted.message,
		code: error.status,
		details: formatted.details,
	}
}

export const useFeedback = (initial?: FeedbackMessageType | null) => {
	const [feedback, setFeedback] = useState<FeedbackMessageType | null>(
		initial ?? null,
	)

	const showMessage = useCallback((message: FeedbackMessageType) => {
		setFeedback(message)
	}, [])

	const showError = useCallback(
		(
			message: string,
			options?: Partial<Omit<FeedbackMessageType, 'kind' | 'message'>>,
		) => {
			setFeedback({
				kind: 'error',
				message,
				title: options?.title,
				details: options?.details,
				code: options?.code,
			})
		},
		[],
	)

	const showApiError = useCallback((error: ApiError) => {
		setFeedback(normalizeApiError(error))
	}, [])

	const showSuccess = useCallback(
		(
			message: string,
			options?: Partial<Omit<FeedbackMessageType, 'kind' | 'message'>>,
		) => {
			setFeedback({
				kind: 'success',
				message,
				title: options?.title,
				details: options?.details,
			})
		},
		[],
	)

	const clearFeedback = useCallback(() => setFeedback(null), [])

	return {
		feedback,
		showMessage,
		showError,
		showApiError,
		showSuccess,
		clearFeedback,
	}
}

export type UseFeedbackReturn = ReturnType<typeof useFeedback>
