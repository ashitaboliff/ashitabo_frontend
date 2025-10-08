import {
	BookingDetailProps,
	BookingResponse,
	BookingTime,
} from '@/features/booking/types'
import {
	getBookingByIdAction,
	getBookingByDateAction,
} from '@/features/booking/components/actions'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import EditPage from '@/features/booking/components/Edit'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import { DateToDayISOstring } from '@/utils'
import { addDays, subDays, parseISO } from 'date-fns'
import { createMetaData } from '@/hooks/useMetaData'
import { Metadata, ResolvingMetadata } from 'next'
import { cache } from 'react'
import { StatusCode } from '@/types/responseTypes'

type PageParams = Promise<{ id: string }>
type PageSearchParams = Promise<{ viewStartDate?: string }>
type PageProps = {
	params: PageParams
	searchParams: PageSearchParams
}

const getBookingDetail = cache(async (id: string) => {
	const result = await getBookingByIdAction(id)
	if (result.ok) {
		return result.data as BookingDetailProps
	}
	return null
})

export async function generateMetadata(
	{ params }: { params: PageParams },
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const bookingDetail = await getBookingDetail(id)

	let title = `予約編集 ${id} | あしたぼホームページ`
	let description = `コマ表の予約編集 (${id}) です。`

	if (bookingDetail) {
		const bookingData = bookingDetail
		title = bookingData.registName
			? `${bookingData.registName}の予約 | あしたぼホームページ`
			: `予約編集 ${id} | あしたぼホームページ`
		description = `コマ表の予約 (${bookingData.registName || id}さん、${bookingData.bookingDate} ${BookingTime[bookingData.bookingTime] || ''}) の編集ページです。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/booking/${id}/edit`,
	})
}

const Page = async ({ params, searchParams }: PageProps) => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session!
				const bookingDetail = await getBookingDetail((await params).id)
				if (!bookingDetail) {
					return <DetailNotFoundPage />
				}

				// Fetch calendar data based on viewStartDate
				const viewDayMax = 7
				const { viewStartDate } = await searchParams
				const initialViewDayDate = viewStartDate
					? parseISO(viewStartDate)
					: subDays(new Date(), 1)

				const calendarStartDate =
					DateToDayISOstring(initialViewDayDate).split('T')[0]
				const calendarEndDate = DateToDayISOstring(
					addDays(initialViewDayDate, viewDayMax - 1),
				).split('T')[0]

				let initialBookingResponse: BookingResponse | null = null
				const calendarBookingRes = await getBookingByDateAction({
					startDate: calendarStartDate,
					endDate: calendarEndDate,
				})

				if (calendarBookingRes.ok) {
					initialBookingResponse = calendarBookingRes.data
				} else {
					console.error('Failed to get calendar booking data for edit page')
				}

				return (
					<EditPage
						bookingDetail={bookingDetail}
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
