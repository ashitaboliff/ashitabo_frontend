import type { Profile } from '@/features/user/types'
import { notFound } from 'next/navigation'
import ProfileEdit from '@/features/user/components/ProfileEdit'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { apiGet } from '@/lib/api/crud'

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
			{async (authResult) => {
				const session = authResult.session
				if (!session || !session.user.hasProfile) {
					return notFound()
				}
				const profileRes = await apiGet<Profile>(
					`/users/${session.user.id}/profile`,
					{ cache: 'no-store' },
				)
				if (!profileRes.ok || !profileRes.data) {
					return notFound()
				}
				return <ProfileEdit profile={profileRes.data} />
			}}
		</AuthPage>
	)
}

export default userPage
