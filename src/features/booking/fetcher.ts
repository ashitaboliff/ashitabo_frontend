import { addDays, format } from 'date-fns'
import { getBookingByDateAction } from '@/features/booking/actions'
import type { BookingResponse } from '@/features/booking/types'
import { BOOKING_CALENDAR_SWR_KEY } from '@/features/booking/constants'

type BookingRangeKey = [typeof BOOKING_CALENDAR_SWR_KEY, string, string]

export const buildBookingRangeKey = (
	viewDate: Date,
	viewRangeDays: number,
): BookingRangeKey => {
	const startDate = format(viewDate, 'yyyy-MM-dd')
	const endDate = format(addDays(viewDate, viewRangeDays), 'yyyy-MM-dd')
	return [BOOKING_CALENDAR_SWR_KEY, startDate, endDate]
}

export const bookingRangeFetcher = async ([
	cacheKey,
	startDate,
	endDate,
]: BookingRangeKey): Promise<BookingResponse | null> => {
	if (cacheKey !== BOOKING_CALENDAR_SWR_KEY) {
		throw new Error('Invalid cache key for booking calendar fetcher')
	}

	const res = await getBookingByDateAction({ startDate, endDate })
	if (res.ok) {
		return res.data
	}

	throw res
}
