import { notFound } from 'next/navigation'
import ProfileEdit from '@/app/user/edit/_components/ProfileEdit'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import type { Profile } from '@/domains/user/model/userTypes'
import { apiGet } from '@/shared/lib/api/crud'

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
