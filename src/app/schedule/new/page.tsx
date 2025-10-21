import ScheduleCreatePage from '@/app/schedule/new/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getUserIdWithNames } from '@/domains/schedule/api/scheduleActions'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { logError } from '@/shared/utils/logger'

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
				const session = authResult.session
				if (!session) {
					return null
				}

				const usersRes = await getUserIdWithNames()
				let initialUsers: Record<string, string> = {}
				if (usersRes.ok) {
					initialUsers = (usersRes.data ?? []).reduce<Record<string, string>>(
						(acc, user) => {
							acc[user.id ?? ''] = user.name ?? ''
							return acc
						},
						{},
					)
				} else {
					logError('Failed to fetch mention users', usersRes)
				}

				return (
					<ScheduleCreatePage session={session} initialUsers={initialUsers} />
				)
			}}
		</AuthPage>
	)
}

export default Page
