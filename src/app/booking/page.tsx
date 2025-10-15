import MainPage from '@/features/booking/components/MainPage'
import MainPageLayout from '@/features/booking/components/MainPageLayout'
import { getCurrentJSTDateString, toDateKey } from '@/utils'
import { addDays } from 'date-fns'
import { BOOKING_VIEW_RANGE_DAYS } from '@/features/booking/constants'
import { getBookingByDateAction } from '@/features/booking/actions'

const Page = async () => {
	const initialViewDate = new Date(getCurrentJSTDateString({ yesterday: true }))
	const initialRangeDays = BOOKING_VIEW_RANGE_DAYS

	const startDate = toDateKey(initialViewDate)
	const endDate = toDateKey(addDays(initialViewDate, initialRangeDays))
	const bookingResponse = await getBookingByDateAction({
		startDate,
		endDate,
	})

	const initialData = bookingResponse.ok ? bookingResponse.data : null
	const initialError = bookingResponse.ok ? undefined : bookingResponse.message

	return (
		<>
			<MainPageLayout />
			<MainPage
				initialViewDate={initialViewDate.toISOString()}
				initialRangeDays={initialRangeDays}
				initialData={initialData}
				initialError={initialError}
			/>
		</>
	)
}

export default Page
