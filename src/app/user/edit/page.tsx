import type { Profile } from '@/features/user/types'
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
				const userProfile = authResult.session!.user!.dbProfile as Profile
				return <ProfileEdit profile={userProfile} />
			}}
		</AuthPage>
	)
}

export default userPage
