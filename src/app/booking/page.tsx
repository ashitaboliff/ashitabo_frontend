'use server'

import { cookies } from 'next/headers'
import MainPage from '@/features/booking/components/MainPage'
import MainPageLayout from '@/features/booking/components/MainPageLayout'
import { getCurrentJSTDateString } from '@/utils'
import type { NoticeType } from '@/components/ui/atoms/FlashMessage'

const Page = async () => {
	const cookieStore = await cookies()
	const flash = cookieStore.get('booking:flash')?.value
	let type: NoticeType | undefined = undefined
	let message: string | undefined = undefined

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
