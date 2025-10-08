import CreatePage from '@/features/booking/components/Create'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/hooks/useMetaData'

export async function metadata() {
	return createMetaData({
		title: 'コマ表新規予約 | あしたぼホームページ',
		url: '/booking/new',
	})
}

type PageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const Page = async ({ searchParams }: PageProps) => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session!
				const { date, time } = await searchParams

				const dateParam = typeof date === 'string' ? date : undefined
				const timeParam = typeof time === 'string' ? time : undefined

				return (
					<CreatePage
						session={session}
						initialDateParam={dateParam}
						initialTimeParam={timeParam}
					/>
				)
			}}
		</AuthPage>
	)
}

export default Page
