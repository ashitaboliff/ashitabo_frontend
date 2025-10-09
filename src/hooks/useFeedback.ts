'use client'

import { useCallback, useState } from 'react'
import type { ApiError } from '@/types/responseTypes'
import type { FeedbackMessage, FeedbackKind } from '@/types/feedback'

const normalizeApiError = (error: ApiError): FeedbackMessage => ({
	kind: 'error',
	message: error.message,
	title: 'エラーが発生しました',
	code: error.status,
	details:
		typeof error.details === 'string'
			? error.details
			: error.details
				? JSON.stringify(error.details)
				: undefined,
})

export const useFeedback = (initial?: FeedbackMessage | null) => {
	const [feedback, setFeedback] = useState<FeedbackMessage | null>(
		initial ?? null,
	)

	const showMessage = useCallback((message: FeedbackMessage) => {
		setFeedback(message)
	}, [])

	const showError = useCallback(
		(
			message: string,
			options?: Partial<Omit<FeedbackMessage, 'kind' | 'message'>>,
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
			options?: Partial<Omit<FeedbackMessage, 'kind' | 'message'>>,
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
