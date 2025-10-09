import SigninSetting from '@/features/auth/components/SigninSetting'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/hooks/useMetaData'

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
			{() => <SigninSetting />}
		</AuthPage>
	)
}

export default Signin
