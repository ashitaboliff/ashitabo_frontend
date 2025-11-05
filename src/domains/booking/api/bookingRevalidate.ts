'use server'

import { addDays, parseISO } from 'date-fns'
import { revalidateTag } from 'next/cache'
import {
	BOOKING_CALENDAR_TAG,
	BOOKING_VIEW_RANGE_DAYS,
} from '@/domains/booking/constants/bookingConstants'
import { buildBookingCalendarTag } from '@/domains/booking/utils/calendarCache'
import { toDateKey } from '@/shared/utils'

type Range = {
	startDate: string
	endDate: string
}

const getBookingCalendarRangesForDate = (
	date: string,
	viewRangeDays: number = BOOKING_VIEW_RANGE_DAYS,
): Range[] => {
	const normalized = toDateKey(date)
	const target = parseISO(normalized)
	const ranges: Range[] = []

	for (let offset = 0; offset < viewRangeDays; offset += 1) {
		const start = addDays(target, -offset)
		const end = addDays(start, viewRangeDays)
		const startDate = toDateKey(start)
		const endDate = toDateKey(end)
		ranges.push({ startDate, endDate })
	}

	return ranges
}

export const revalidateBookingCalendarsForDate = async (
	date: string | string[],
) => {
	if (Array.isArray(date)) {
		for (const d of date) {
			revalidateBookingCalendarsForDate(d)
		}
		return
	}
	const ranges = getBookingCalendarRangesForDate(date)
	ranges.forEach(({ startDate, endDate }) => {
		revalidateTag(buildBookingCalendarTag(startDate, endDate), 'max')
	})
	revalidateTag(BOOKING_CALENDAR_TAG, 'max')
}
