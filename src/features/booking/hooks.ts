import { useCallback, useMemo, useState } from 'react'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'
import { addDays, format, subDays } from 'date-fns'
import {
	BOOKING_CALENDAR_SWR_KEY,
	BOOKING_VIEW_RANGE_DAYS,
	BOOKING_VIEW_MAX_OFFSET_DAYS,
	BOOKING_VIEW_MIN_OFFSET_DAYS,
} from './constants'
import { getBookingByDateAction } from './actions'
import type { BookingResponse } from './types'

type BookingWeekNavigationOptions = {
	initialDate: Date
	viewRangeDays?: number
	minOffsetDays?: number
	maxOffsetDays?: number
	onChange?: (nextDate: Date) => void
}

type BookingWeekNavigationResult = {
	viewDate: Date
	setViewDate: (nextDate: Date) => void
	goPrevWeek: () => void
	goNextWeek: () => void
	canGoPrevWeek: boolean
	canGoNextWeek: boolean
	viewRangeDays: number
	anchorDate: Date
}

/**
 * 予約カレンダーの「前週/翌週」ナビゲーションを共通で扱うフック。
 * 表示の開始日を保持しつつ、前後に移動する際の境界チェックを行う。
 * @param initialDate - 初期表示日
 * @param viewRangeDays - 表示範囲の日数（デフォルト: 7日間）
 * @param minOffsetDays - 過去に遡れる最小日数（デフォルト: 1日）
 * @param maxOffsetDays - 未来に進める最大日数（デフォルト: 27日）
 * @param onChange - 表示日が変更された際のコールバック
 * @returns ナビゲーション用の関数と状態
 */
export const useBookingWeekNavigation = ({
	initialDate,
	viewRangeDays = BOOKING_VIEW_RANGE_DAYS,
	minOffsetDays = BOOKING_VIEW_MIN_OFFSET_DAYS,
	maxOffsetDays = BOOKING_VIEW_MAX_OFFSET_DAYS,
	onChange,
}: BookingWeekNavigationOptions): BookingWeekNavigationResult => {
	const [viewDate, internalSetViewDate] = useState(initialDate)
	const anchorDate = useMemo(() => subDays(new Date(), 1), [])

	const earliestAllowed = useMemo(
		() => subDays(anchorDate, minOffsetDays),
		[anchorDate, minOffsetDays],
	)
	const latestAllowed = useMemo(
		() => addDays(anchorDate, maxOffsetDays),
		[anchorDate, maxOffsetDays],
	)

	const canGoPrevWeek = useMemo(() => {
		const candidate = subDays(viewDate, viewRangeDays)
		return candidate >= earliestAllowed
	}, [earliestAllowed, viewDate, viewRangeDays])

	const canGoNextWeek = useMemo(() => {
		const candidateEnd = addDays(viewDate, viewRangeDays - 1)
		return candidateEnd < latestAllowed
	}, [latestAllowed, viewDate, viewRangeDays])

	const emitChange = useCallback(
		(nextDate: Date) => {
			internalSetViewDate(nextDate)
			onChange?.(nextDate)
		},
		[onChange],
	)

	const goPrevWeek = useCallback(() => {
		if (!canGoPrevWeek) return
		const nextDate = subDays(viewDate, viewRangeDays)
		emitChange(nextDate)
	}, [canGoPrevWeek, emitChange, viewDate, viewRangeDays])

	const goNextWeek = useCallback(() => {
		if (!canGoNextWeek) return
		const nextDate = addDays(viewDate, viewRangeDays)
		emitChange(nextDate)
	}, [canGoNextWeek, emitChange, viewDate, viewRangeDays])

	const setViewDate = useCallback(
		(nextDate: Date) => {
			emitChange(nextDate)
		},
		[emitChange],
	)

	return {
		viewDate,
		setViewDate,
		goPrevWeek,
		goNextWeek,
		canGoPrevWeek,
		canGoNextWeek,
		viewRangeDays,
		anchorDate,
	}
}

type BookingRangeKey = [typeof BOOKING_CALENDAR_SWR_KEY, string, string]

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

export const buildBookingRangeKey = (
	viewDate: Date,
	viewRangeDays: number,
): BookingRangeKey => {
	const startDate = format(viewDate, 'yyyy-MM-dd')
	const endDate = format(addDays(viewDate, viewRangeDays), 'yyyy-MM-dd')
	return [BOOKING_CALENDAR_SWR_KEY, startDate, endDate]
}

type BookingCalendarDataOptions = {
	viewDate: Date
	viewRangeDays: number
	fallbackData?: BookingResponse | null
	config?: Omit<SWRConfiguration<BookingResponse | null>, 'fallbackData'>
}

export const useBookingCalendarData = ({
	viewDate,
	viewRangeDays,
	fallbackData,
	config,
}: BookingCalendarDataOptions): SWRResponse<
	BookingResponse | null,
	unknown
> => {
	const key = buildBookingRangeKey(viewDate, viewRangeDays)
	return useSWR<BookingResponse | null>(key, bookingRangeFetcher, {
		fallbackData: fallbackData ?? null,
		revalidateOnFocus: false,
		keepPreviousData: true,
		...config,
	})
}
