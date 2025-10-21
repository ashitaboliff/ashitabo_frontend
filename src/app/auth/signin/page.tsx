import SigninPage from '@/app/auth/signin/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { createMetaData } from '@/shared/hooks/useMetaData'

export async function metadata() {
	return createMetaData({
		title: 'サインイン | あしたぼホームページ',
		description: 'あしたぼホームページのサインインページです。',
		url: '/auth/signin',
	})
}

/**
 * セッションがない場合、このページを表示
 * 統一された認証システムを使用してリダイレクト処理を簡素化
 */
const Signin = async () => {
	return (
		<AuthPage
			requireProfile={false}
			allowUnauthenticated={true}
			redirectIfAuthenticated={true}
		>
			{() => <SigninPage />}
		</AuthPage>
	)
}

export default Signin
