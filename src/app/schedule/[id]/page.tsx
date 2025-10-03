'use server'

import IdPage from '@/features/schedule/components/IdPage'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import SessionForbidden from '@/components/ui/atoms/SessionNotFound'
import { getScheduleByIdAction } from '@/features/schedule/components/actions' // Corrected import path
import { redirectFrom } from '@/core/actions'
import { createMetaData } from '@/utils/metaData'
import { Metadata, ResolvingMetadata } from 'next'

type Props = {
	params: Promise<{ id: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
	{ params, searchParams }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const id = (await params).id
	const schedule = await getScheduleByIdAction(id)

	let title = `日程調整詳細 ${id}`
	let description = `日程調整の詳細 (${id}) です。`

	if (schedule.status === 200 && schedule.response) {
		// schedule.response.title や schedule.response.description のようなプロパティが存在すると仮定
		// 実際のプロパティ名に合わせて調整してください
		// 例: title = schedule.response.eventName || `日程調整 ${id}`
		// 例: description = schedule.response.details || `日程調整 (${id}) の詳細です。`
		// 現在の Schedule 型には title や description に相当する明確なフィールドがないため、
		// 必要に応じて型定義と合わせて調整してください。
		// ここでは仮に schedule.response.id を使ってタイトルを生成します。
		title = schedule.response.id
			? `日程調整 ${schedule.response.id}`
			: `日程調整詳細 ${id}`
		description = `あしたぼの日程調整 (${schedule.response.id || id}) の詳細ページです。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/schedule/${id}`,
	})
}

const ScheduleDetailPage = async ({
	params,
	session,
	authState,
}: {
	params: { id: string }
	session: Session
	authState: string | undefined
}) => {
	const id = params.id

	// authStateが 'profile' でない場合、または session自体がない場合はリダイレクト
	if (authState !== 'profile' || !session?.user?.id) {
		// 元のコードでは '/schedule/new' にリダイレクトしていましたが、
		// 詳細ページなので、サインイン後に元の詳細ページに戻るのが自然かもしれません。
		// ここでは元の挙動を維持しつつ、リダイレクト先を /schedule/new のままにします。
		// 必要であれば、リダイレクト先を `/schedule/${id}` などに変更してください。
		const redirectPath = `/auth/signin?from=${encodeURIComponent(`/schedule/${id}`)}` // from を現在のページに修正
		await redirectFrom(redirectPath, '')
		return null // redirect後は何もレンダリングしない
	}
	// ここに来る場合は authState === 'profile' かつ session.user.id が存在する

	const schedule = await getScheduleByIdAction(id)
	if (schedule.status !== 200) {
		return <div>Not Found</div>
	}

	if (
		(schedule.response.mention as string[]).length !== 0 && // Added type assertion for mention
		((schedule.response.mention as string[]).filter(
			(mention) => mention === session.user.id,
		).length === 0 ||
			schedule.response.userId !== session.user.id)
	) {
		return <div>Not Found</div>
	}

	return <IdPage />
}

const Page = async ({ params }: Props) => {
	const resolvedParams = await params
	return (
		<AuthPage>
			{(authResult) => (
				<ScheduleDetailPage
					params={resolvedParams}
					session={authResult.session!}
					authState={authResult.authState}
				/>
			)}
		</AuthPage>
	)
}

export default Page
