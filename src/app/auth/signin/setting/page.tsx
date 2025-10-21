import SigninSetting from '@/domains/auth/ui/SigninSetting'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { createMetaData } from '@/shared/hooks/useMetaData'

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
