import { describe, expect, it } from 'vitest'
import type { Session } from '@/types/session'
import { makeAuthDetails } from '../sessionInfo'

const buildSession = (overrides: Partial<Session> = {}): Session => ({
	user: {
		id: 'user-1',
		name: 'User',
		email: 'user@example.com',
		image: null,
		role: 'USER',
		hasProfile: true,
	},
	expires: new Date().toISOString(),
	...overrides,
})

describe('makeAuthDetails', () => {
	it('returns guest status when session is null', () => {
		const result = makeAuthDetails(null)
		expect(result.status).toBe('guest')
		expect(result.issue).toBeNull()
	})

	it('treats missing user id as guest', () => {
		const session: Session = buildSession({
			user: {
				id: '',
				name: null,
				email: null,
				image: null,
				role: null,
				hasProfile: false,
			},
		})
		const result = makeAuthDetails(session)
		expect(result.status).toBe('guest')
		expect(result.issue).toBeNull()
	})

	it('marks profile-required issue when user lacks profile', () => {
		const session: Session = buildSession({
			user: {
				id: 'user-1',
				name: null,
				email: null,
				image: null,
				role: 'USER',
				hasProfile: false,
			},
		})
		const result = makeAuthDetails(session)
		expect(result.status).toBe('needs-profile')
		expect(result.issue).toBe('profile-required')
	})

	it('returns signed-in with no issue when profile exists', () => {
		const session = buildSession()
		const result = makeAuthDetails(session)
		expect(result.status).toBe('signed-in')
		expect(result.issue).toBeNull()
	})
})
