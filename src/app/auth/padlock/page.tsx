import {
	getPadlockCallbackUrl,
	getPadlockCsrfToken,
} from '@/domains/auth/api/authActions'
import AuthPadLock from '@/domains/auth/ui/AuthPadLock'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { createMetaData } from '@/shared/hooks/useMetaData'

export async function metadata() {
	return createMetaData({
		title: '部室鍵認証 | あしたぼホームページ',
		description: '部室鍵認証ページです。部室の鍵を入力してください。',
		url: '/auth/padlock',
	})
}

const Page = async () => {
	const csrfToken = await getPadlockCsrfToken()
	const callbackUrl = await getPadlockCallbackUrl()
	return (
		<AuthPage
			requireProfile={false}
			allowUnauthenticated={true}
			redirectIfAuthenticated={true}
		>
			{() => <AuthPadLock csrfToken={csrfToken} callbackUrl={callbackUrl} />}
		</AuthPage>
	)
}

export default Page
