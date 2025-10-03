import type { Session as AppSession } from '@/types/session'

declare global {
	type Session = AppSession
}

export {}
