import AuthPadLock from '@/features/auth/components/AuthPadLock'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/hooks/useMetaData'
import {
	getPadlockCallbackUrl,
	getPadlockCsrfToken,
} from '@/features/auth/actions'

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
		<AuthPage allowUnauthenticated={true} redirectIfAuthenticated={true}>
			{() => <AuthPadLock csrfToken={csrfToken} callbackUrl={callbackUrl} />}
		</AuthPage>
	)
}

export default Page
