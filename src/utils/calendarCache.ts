import { addDays, isWithinInterval, parseISO } from 'date-fns'
import type { useSWRConfig } from 'swr'
import {
	BOOKING_CALENDAR_SWR_KEY,
	BOOKING_CALENDAR_TAG,
	BOOKING_VIEW_RANGE_DAYS,
} from '@/features/booking/constants'
import { toDateKey } from '@/utils'

type Range = {
	startDate: string
	endDate: string
}

export const buildBookingCalendarTag = (startDate: string, endDate: string) =>
	`${BOOKING_CALENDAR_TAG}-${startDate}-${endDate}`

export const getBookingCalendarRangesForDate = (
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

export const isDateWithinRange = (
	date: string,
	startDate: string,
	endDate: string,
): boolean => {
	const normalized = toDateKey(date)
	const target = parseISO(normalized)
	const start = parseISO(toDateKey(startDate))
	const endExclusive = parseISO(toDateKey(endDate))
	const endInclusive = addDays(endExclusive, -1)
	const interval =
		start <= endInclusive
			? { start, end: endInclusive }
			: { start: endInclusive, end: start }
	return isWithinInterval(target, interval)
}

export type MutateFn = ReturnType<typeof useSWRConfig>['mutate']

export const mutateBookingCalendarsForDate = async (
	mutate: MutateFn,
	date: string,
) => {
	const normalized = toDateKey(date)
	await mutate(
		(key) =>
			Array.isArray(key) &&
			key[0] === BOOKING_CALENDAR_SWR_KEY &&
			typeof key[1] === 'string' &&
			typeof key[2] === 'string' &&
			isDateWithinRange(normalized, key[1], key[2]),
		undefined,
		{ revalidate: true },
	)
}

export const mutateAllBookingCalendars = async (mutate: MutateFn) => {
	await mutate(
		(key) => Array.isArray(key) && key[0] === BOOKING_CALENDAR_SWR_KEY,
		undefined,
		{ revalidate: true },
	)
}
