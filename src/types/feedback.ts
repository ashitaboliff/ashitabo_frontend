export type FeedbackKind = 'error' | 'success' | 'info'

export type FeedbackMessage = {
	kind: FeedbackKind
	message: string
	title?: string
	details?: string
	code?: number
}
