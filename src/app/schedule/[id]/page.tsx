'use server'

import IdPage from '@/features/schedule/components/IdPage'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { getScheduleByIdAction } from '@/features/schedule/components/actions'
import { createMetaData } from '@/hooks/useMetaData'
import { Metadata, ResolvingMetadata } from 'next'
import { cache } from 'react'
import { StatusCode } from '@/types/responseTypes'
import { redirect, notFound } from 'next/navigation'

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
	parent: ResolvingMetadata,
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
		<AuthPage>
			{async (authResult) => {
				const session = authResult.session
				if (!session?.user?.id || authResult.authState !== 'profile') {
					const redirectPath = `/auth/signin?from=${encodeURIComponent(`/schedule/${(await params).id}`)}`
					redirect(redirectPath)
				}

				const mentionList = Array.isArray(scheduleDetail.mention)
					? (scheduleDetail.mention as string[])
					: []
				const isMentioned =
					mentionList.length === 0 ||
					mentionList.includes(session.user.id) ||
					scheduleDetail.userId === session.user.id

				if (!isMentioned) {
					notFound()
				}

				return <IdPage />
			}}
		</AuthPage>
	)
}

export default Page
