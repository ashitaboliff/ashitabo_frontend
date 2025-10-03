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
import { createMetaData } from '@/utils/metaData'
import { Metadata, ResolvingMetadata } from 'next'

type Props = {
	params: Promise<{ id: string }>
	searchParams: Promise<{ viewStartDate?: string }>
}

export async function generateMetadata(
	{ params, searchParams }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const id = (await params).id
	const bookingDetail = await getBookingByIdAction(id)

	let title = `予約編集 ${id} | あしたぼホームページ`
	let description = `コマ表の予約編集 (${id}) です。`

	if (bookingDetail.status === 200 && bookingDetail.response) {
		const bookingData = bookingDetail.response as BookingDetailProps
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

const Page = async ({ params, searchParams }: Props) => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session!
				const { id } = await params

				let bookingDetailProps: BookingDetailProps
				const bookingDetailResult = await getBookingByIdAction(id)

				if (bookingDetailResult.status === 200) {
					bookingDetailProps = bookingDetailResult.response
				} else {
					return <DetailNotFoundPage />
				}
				if (!bookingDetailProps) {
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

				if (calendarBookingRes.status === 200) {
					initialBookingResponse = calendarBookingRes.response
				} else {
					console.error('Failed to get calendar booking data for edit page')
				}

				return (
					<EditPage
						bookingDetail={bookingDetailProps}
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
