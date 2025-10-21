import { describe, expect, it } from 'vitest'
import { AUTH_ERROR_DEFAULT, resolveAuthErrorDetail } from '../authErrorMap'

describe('resolveAuthErrorDetail', () => {
	it('returns default detail when code is undefined', () => {
		expect(resolveAuthErrorDetail()).toEqual(AUTH_ERROR_DEFAULT)
	})

	it('returns mapped detail when code is known', () => {
		const detail = resolveAuthErrorDetail('AccessDenied')
		expect(detail.reason).toBe('access-denied')
		expect(detail.message).toContain('アクセスが拒否されました')
	})

	it('falls back to default when code is unknown', () => {
		expect(resolveAuthErrorDetail('UNKNOWN_CODE')).toEqual(AUTH_ERROR_DEFAULT)
	})
})
