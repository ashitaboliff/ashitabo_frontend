import CreatePage from '@/features/booking/components/Create'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { createMetaData } from '@/utils/metaData'

export async function metadata() {
	return createMetaData({
		title: 'コマ表新規予約 | あしたぼホームページ',
		url: '/booking/new',
	})
}

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const Page = async ({ searchParams }: PageProps) => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session!
				const { date, time } = await searchParams

				const dateParam = date as string | undefined
				const timeParam = time as string | undefined

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
