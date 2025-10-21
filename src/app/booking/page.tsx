'use server'

import { cookies } from 'next/headers'
import type { NoticeType } from '@/shared/ui/molecules/FlashMessage'
import MainPage from '@/app/booking/_components/MainPage'
import MainPageLayout from '@/app/booking/_components/MainPageLayout'
import { getCurrentJSTDateString } from '@/shared/utils'

const Page = async () => {
	const cookieStore = await cookies()
	const flash = cookieStore.get('booking:flash')?.value
	let type: NoticeType | undefined
	let message: string | undefined

	if (flash) {
		;({ type, message } = JSON.parse(flash) as {
			type: NoticeType
			message: string
		})
	}

	const initialViewDate = new Date(getCurrentJSTDateString({ yesterday: true }))

	return (
		<>
			<MainPageLayout />
			<MainPage
				initialViewDate={initialViewDate.toISOString()}
				type={type}
				message={message}
			/>
		</>
	)
}

export default Page
