import PadLockPage from '@/app/auth/padlock/_components'
import {
	getPadlockCallbackUrl,
	getPadlockCsrfToken,
} from '@/domains/auth/api/authActions'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: '部室鍵認証 | あしたぼホームページ',
	description: '部室鍵認証ページです。部室の鍵を入力してください。',
	url: '/auth/padlock',
})

const Page = async () => {
	const csrfToken = await getPadlockCsrfToken()
	const callbackUrl = await getPadlockCallbackUrl()
	return (
		<AuthPage
			requireProfile={false}
			allowUnauthenticated={true}
			redirectIfAuthenticated={true}
		>
			{() => <PadLockPage csrfToken={csrfToken} callbackUrl={callbackUrl} />}
		</AuthPage>
	)
}

export default Page
