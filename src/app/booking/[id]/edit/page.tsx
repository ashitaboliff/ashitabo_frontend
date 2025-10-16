'use server'

import { addDays, subDays } from 'date-fns'
import type { Metadata, ResolvingMetadata } from 'next'
import { cookies } from 'next/headers'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import {
	getBookingByDateAction,
	getBookingByIdAction,
} from '@/features/booking/actions'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import BookingEdit from '@/features/booking/components/edit/BookingEdit'
import {
	BOOKING_TIME_LIST,
	BOOKING_VIEW_RANGE_DAYS,
} from '@/features/booking/constants'
import { createMetaData } from '@/hooks/useMetaData'
import { toDateKey } from '@/utils'
import { logError } from '@/utils/logger'

type PageParams = Promise<{ id: string }>
type PageProps = {
	params: PageParams
}

export async function generateMetadata(
	{ params }: { params: PageParams },
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const bookingDetailRes = await getBookingByIdAction(id)
	const bookingDetail = bookingDetailRes.ok ? bookingDetailRes.data : null

	let title = `予約編集 ${id} | あしたぼホームページ`
	let description = `コマ表の予約編集 (${id}) です。`

	if (bookingDetail) {
		const bookingData = bookingDetail
		title = bookingData.registName
			? `${bookingData.registName}の予約 | あしたぼホームページ`
			: `予約編集 ${id} | あしたぼホームページ`
		description = `コマ表の予約 (${bookingData.registName || id}さん、${bookingData.bookingDate} ${BOOKING_TIME_LIST[bookingData.bookingTime] || ''}) の編集ページです。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/booking/${id}/edit`,
	})
}

const Page = async ({ params }: PageProps) => {
	const cookieStore = await cookies()
	const flash = cookieStore.get('booking:flash')?.value
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session
				if (!session) {
					return null
				}

				const initialViewDayDate = subDays(new Date(), 1)

				const calendarStartDate = toDateKey(initialViewDayDate)
				const calendarEndDate = toDateKey(
					addDays(initialViewDayDate, BOOKING_VIEW_RANGE_DAYS - 1),
				)

				const { id } = await params

				const [bookingDetail, bookingResponse] = await Promise.all([
					getBookingByIdAction(id),
					getBookingByDateAction({
						startDate: calendarStartDate,
						endDate: calendarEndDate,
					}),
				])

				if (!bookingDetail.ok || !bookingDetail.data) {
					if (flash) {
						return null
					}
					logError('Failed to get booking detail for edit page', bookingDetail)
					return <DetailNotFoundPage />
				}

				const initialBookingResponse = bookingResponse.ok
					? bookingResponse.data
					: null

				return (
					<BookingEdit
						bookingDetail={bookingDetail.data}
						session={session}
						initialBookingResponse={initialBookingResponse}
						initialViewDay={initialViewDayDate}
					/>
				)
			}}
		</AuthPage>
	)
}

export default Page
