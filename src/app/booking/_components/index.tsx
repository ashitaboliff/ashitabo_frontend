'use client'

import { addDays } from 'date-fns'
import { useMemo } from 'react'
import BookingCalendar from '@/app/booking/_components/BookingCalendar'
import {
	BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	BOOKING_TIME_LIST,
	BOOKING_VIEW_RANGE_DAYS,
} from '@/domains/booking/constants/bookingConstants'
import {
	useBookingCalendarData,
	useBookingWeekNavigation,
} from '@/domains/booking/hooks/bookingHooks'
import { useFeedback } from '@/shared/hooks/useFeedback'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import FlashMessage, {
	type NoticeType,
} from '@/shared/ui/molecules/FlashMessage'
import { formatMonthDay, formatWeekday } from '@/shared/utils/dateFormat'
import type { ApiError } from '@/types/responseTypes'

interface Props {
	readonly initialViewDate: string
	readonly type?: NoticeType
	readonly message?: string
}

const BookingMainPage = ({ initialViewDate, type, message }: Props) => {
	const initialDate = useMemo(
		() => new Date(initialViewDate),
		[initialViewDate],
	)

	const {
		viewDate,
		viewRangeDays,
		goPrevWeek,
		goNextWeek,
		canGoPrevWeek,
		canGoNextWeek,
	} = useBookingWeekNavigation({
		initialDate,
		viewRangeDays: BOOKING_VIEW_RANGE_DAYS,
		minOffsetDays: BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	})

	const errorFeedback = useFeedback()

	const {
		data: bookingData,
		isLoading,
		mutate,
	} = useBookingCalendarData({
		viewDate,
		viewRangeDays,
		config: {
			onError: (err: ApiError) => {
				errorFeedback.showApiError(err)
			},
		},
	})

	const handleRetry = async () => {
		errorFeedback.clearFeedback()
		await mutate()
	}

	const showSkeleton = isLoading && !bookingData

	return (
		<>
			{type && message && <FlashMessage type={type}>{message}</FlashMessage>}
			{errorFeedback.feedback && (
				<div className="my-4 flex flex-col items-center gap-3">
					<div className="w-full max-w-lg">
						<FeedbackMessage source={errorFeedback.feedback} />
					</div>
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleRetry}
					>
						再試行
					</button>
				</div>
			)}
			<div className="flex flex-col justify-center space-x-2">
				<div className="flex justify-between items-center mb-4 m-auto">
					<button
						type="button"
						className="btn btn-outline"
						onClick={goPrevWeek}
						disabled={!canGoPrevWeek}
					>
						{'<'}
					</button>
					<div className="text-md sm:text-lg font-bold w-64 sm:w-72 text-center">
						{`${formatMonthDay(viewDate, {
							pad: false,
							separator: '/',
						})}${formatWeekday(viewDate, { enclosed: true })}`}
						~
						{`${formatMonthDay(addDays(viewDate, viewRangeDays - 1), {
							pad: false,
							separator: '/',
						})}${formatWeekday(addDays(viewDate, viewRangeDays - 1), {
							enclosed: true,
						})}`}
						までのコマ表
					</div>
					<button
						type="button"
						className="btn btn-outline"
						onClick={goNextWeek}
						disabled={!canGoNextWeek}
					>
						{'>'}
					</button>
				</div>
				{showSkeleton ? (
					<div className="flex justify-center">
						<div className="skeleton w-[360px] h-[466px] sm:w-[520px] sm:h-[578px]"></div>
					</div>
				) : bookingData ? (
					<BookingCalendar
						bookingDate={bookingData}
						timeList={BOOKING_TIME_LIST}
					/>
				) : null}
			</div>
		</>
	)
}

export default BookingMainPage
