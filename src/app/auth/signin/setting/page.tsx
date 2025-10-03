import SigninSetting from '@/features/auth/components/SigninSetting'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/utils/metaData'

export async function metadata() {
	return createMetaData({
		title: 'ユーザ設定 | あしたぼホームページ',
		description: 'ユーザ設定ページです。必要な情報を入力してください。',
		url: '/auth/signin/setting',
	})
}

const Signin = async () => {
	return (
		<AuthPage requireProfile={false} allowUnauthenticated={false}>
			{(authResult) => {
				// プロファイル設定済みの場合は自動でリダイレクトされる
				// ここに到達する時点で、認証済み&プロファイル未設定が保証される
				return <SigninSetting />
			}}
		</AuthPage>
	)
}

export default Signin
