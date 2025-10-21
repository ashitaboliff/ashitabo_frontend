const isDevelopment = process.env.NODE_ENV !== 'production'

export const logError = (message: string, ...details: unknown[]) => {
	if (isDevelopment) {
		console.error(message, ...details)
	}
	// TODO: Integrate external error tracking service (e.g., Sentry) here.
}

export const logInfo = (message: string, ...details: unknown[]) => {
	if (isDevelopment) {
		console.info(message, ...details)
	}
}
