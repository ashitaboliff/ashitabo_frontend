import { cookies } from 'next/headers'
import AuthPadLock from '@/features/auth/components/AuthPadLock'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/utils/metaData'

const CSRF_COOKIE_KEYS = [
	'authjs.csrf-token',
	'next-auth.csrf-token',
	'__Secure-authjs.csrf-token',
	'__Host-authjs.csrf-token',
] as const

const CALLBACK_COOKIE_KEYS = [
	'authjs.callback-url',
	'next-auth.callback-url',
	'__Secure-authjs.callback-url',
	'__Host-authjs.callback-url',
] as const

const DEFAULT_CALLBACK_URL = '/user'

const extractCookieValue = async (keyList: readonly string[]) => {
	const store = await cookies()
	for (const key of keyList) {
		const value = store.get(key)?.value
		if (value && value !== 'undefined') {
			return value
		}
	}
	return null
}

const extractCsrfToken = async () => {
	const raw = await extractCookieValue(CSRF_COOKIE_KEYS)
	if (!raw) return null
	const [token] = raw.split('|')
	return token ?? null
}

const extractCallbackUrl = () => {
	return extractCookieValue(CALLBACK_COOKIE_KEYS) ?? DEFAULT_CALLBACK_URL
}

export async function metadata() {
	return createMetaData({
		title: '部室鍵認証 | あしたぼホームページ',
		description: '部室鍵認証ページです。部室の鍵を入力してください。',
		url: '/auth/padlock',
	})
}

const Page = async () => {
	const csrfToken = await extractCsrfToken()
	const callbackUrl = await extractCallbackUrl()
	return (
		<AuthPage allowUnauthenticated={true} redirectIfAuthenticated={true}>
			{() => <AuthPadLock csrfToken={csrfToken} callbackUrl={callbackUrl} />}
		</AuthPage>
	)
}

export default Page
