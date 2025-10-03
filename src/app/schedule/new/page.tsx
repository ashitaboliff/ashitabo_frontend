import { getUserIdWithNames } from '@/features/schedule/components/actions'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/utils/metaData'
import ScheduleCreatePage from '@/features/schedule/components/CreatePage'

export async function metadata() {
	return createMetaData({
		title: '日程調整新規作成',
		url: '/schedule/new',
	})
}

const Page = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session!

				const usersRes = await getUserIdWithNames()
				let initialUsers: Record<string, string> = {}
				if (usersRes.status === 200) {
					initialUsers = usersRes.response.reduce(
						(acc, user) => {
							acc[user.id ?? ''] = user.name ?? ''
							return acc
						},
						{} as Record<string, string>,
					)
				} else {
					console.error('Failed to fetch mention users:', usersRes.response)
				}

				return (
					<ScheduleCreatePage session={session} initialUsers={initialUsers} />
				)
			}}
		</AuthPage>
	)
}

export default Page
