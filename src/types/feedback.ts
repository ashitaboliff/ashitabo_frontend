export type FeedbackKind = 'error' | 'success' | 'info' | 'warning'

export type FeedbackMessageType = {
	kind: FeedbackKind
	message: string
	title?: string
	details?: string
	code?: number
}
