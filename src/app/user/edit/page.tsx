import { notFound } from 'next/navigation'
import ProfileEdit from '@/app/user/edit/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getUserProfile } from '@/domains/user/api/userActions'

export const metadata = {
	title: 'プロフィール編集',
	description: 'プロフィールを編集します',
	url: '/user/edit',
}

const userPage = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session
				if (!session || !session.user.hasProfile) {
					return notFound()
				}
				const profileRes = await getUserProfile(session.user.id)
				if (!profileRes.ok || !profileRes.data) {
					return notFound()
				}
				return <ProfileEdit profile={profileRes.data} />
			}}
		</AuthPage>
	)
}

export default userPage
