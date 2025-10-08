'use server'

import SigninPage from '@/features/auth/components/SigninPage'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/hooks/useMetaData'

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
		<AuthPage allowUnauthenticated={true} redirectIfAuthenticated={true}>
			{() => <SigninPage />}
		</AuthPage>
	)
}

export default Signin
