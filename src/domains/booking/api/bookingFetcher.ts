import { addDays } from 'date-fns'
import { getBookingByDateAction } from '@/domains/booking/api/bookingActions'
import { BOOKING_CALENDAR_SWR_KEY } from '@/domains/booking/constants/bookingConstants'
import type { BookingResponse } from '@/domains/booking/model/bookingTypes'
import { toDateKey } from '@/shared/utils'

type BookingRangeKey = [typeof BOOKING_CALENDAR_SWR_KEY, string, string]

export const buildBookingRangeKey = (
	viewDate: Date,
	viewRangeDays: number,
): BookingRangeKey => {
	const startDate = toDateKey(viewDate)
	const endDate = toDateKey(addDays(viewDate, viewRangeDays))
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
