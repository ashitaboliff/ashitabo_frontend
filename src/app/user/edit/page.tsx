import type { Profile } from '@/features/user/types'
import { notFound } from 'next/navigation'
import ProfileEdit from '@/features/user/components/ProfileEdit'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

export async function metadata() {
	return {
		title: 'プロフィール編集',
		description: 'プロフィールを編集します',
		url: '/user/edit',
	}
}

const userPage = async () => {
	return (
		<AuthPage requireProfile={true}>
			{(authResult) => {
				const userProfile = authResult.profile
				if (!userProfile) {
					return notFound()
				}
				return <ProfileEdit profile={userProfile as Profile} />
			}}
		</AuthPage>
	)
}

export default userPage
