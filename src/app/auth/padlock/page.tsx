import AuthPadLock from '@/features/auth/components/AuthPadLock'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/utils/metaData'

export async function metadata() {
	return createMetaData({
		title: '部室鍵認証 | あしたぼホームページ',
		description: '部室鍵認証ページです。部室の鍵を入力してください。',
		url: '/auth/padlock',
	})
}

const Page = async () => {
	return (
		<AuthPage allowUnauthenticated={true} redirectIfAuthenticated={true}>
			{() => <AuthPadLock />}
		</AuthPage>
	)
}

export default Page
