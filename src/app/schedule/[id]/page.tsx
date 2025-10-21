import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import IdPage from '@/app/schedule/[id]/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getScheduleByIdAction } from '@/domains/schedule/api/scheduleActions'
import { createMetaData } from '@/shared/hooks/useMetaData'

type PageParams = Promise<{ id: string }>
type PageProps = { params: PageParams }

const getScheduleDetail = cache(async (id: string) => {
	const result = await getScheduleByIdAction(id)
	if (result.ok) {
		return result.data
	}
	return null
})

export async function generateMetadata(
	{ params }: { params: PageParams },
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const schedule = await getScheduleDetail(id)

	let title = `日程調整詳細 ${id}`
	let description = `日程調整の詳細 (${id}) です。`

	if (schedule) {
		title = schedule.id ? `日程調整 ${schedule.id}` : title
		description = `あしたぼの日程調整 (${schedule.id || id}) の詳細ページです。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/schedule/${id}`,
	})
}

const Page = async ({ params }: PageProps) => {
	const scheduleDetail = await getScheduleDetail((await params).id)
	if (!scheduleDetail) {
		notFound()
	}
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				if (!authResult.session) {
					notFound()
				}

				const userId = authResult.session.user.id
				const mentionList = Array.isArray(scheduleDetail.mention)
					? (scheduleDetail.mention as string[])
					: []
				const isMentioned =
					mentionList.length === 0 ||
					mentionList.includes(userId) ||
					scheduleDetail.userId === userId

				if (!isMentioned) {
					notFound()
				}

				return <IdPage />
			}}
		</AuthPage>
	)
}

export default Page
