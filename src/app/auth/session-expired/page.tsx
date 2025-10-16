import { redirect } from 'next/navigation'
import SessionExpiredClient from '@/features/auth/components/SessionExpiredClient'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/hooks/useMetaData'

export async function generateMetadata() {
	return createMetaData({
		title: 'セッションエラー | あしたぼホームページ',
		description: 'セッションが無効か期限切れです。再度ログインしてください。',
		url: '/auth/session-expired',
	})
}

const Page = async () => {
	return (
		<AuthPage allowUnauthenticated={true}>
			{(authResult) => {
				if (authResult.hasProfile) {
					redirect('/user')
				}

				if (authResult.needsProfile) {
					redirect('/auth/signin/setting')
				}

				return <SessionExpiredClient />
			}}
		</AuthPage>
	)
}

export default Page
