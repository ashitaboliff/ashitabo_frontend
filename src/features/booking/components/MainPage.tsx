'use client'

import { addDays, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useMemo } from 'react'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import FlashMessage, {
	type NoticeType,
} from '@/components/ui/atoms/FlashMessage'
import BookingCalendar from '@/features/booking/components/BookingCalendar'
import {
	BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	BOOKING_TIME_LIST,
	BOOKING_VIEW_RANGE_DAYS,
} from '@/features/booking/constants'
import {
	useBookingCalendarData,
	useBookingWeekNavigation,
} from '@/features/booking/hooks'
import { useFeedback } from '@/hooks/useFeedback'
import type { ApiError } from '@/types/responseTypes'

type MainPageProps = {
	initialViewDate: string
	type?: NoticeType
	message?: string
}

const MainPage = ({ initialViewDate, type, message }: MainPageProps) => {
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

	useEffect(() => {
		if (bookingData) {
			errorFeedback.clearFeedback()
		}
	}, [bookingData, errorFeedback])

	const handleRetry = async () => {
		errorFeedback.clearFeedback()
		await mutate()
	}

	const showSkeleton = isLoading && !bookingData

	return (
		<>
			{type && message && <FlashMessage type={type}>{message}</FlashMessage>}
			{errorFeedback.feedback && (
				<div className="my-4 flex flex-col items-center gap-3 border border-error p-4 rounded bg-error/10">
					<div className="w-full max-w-lg">
						<ErrorMessage message={errorFeedback.feedback} />
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
						{format(viewDate, 'M/d(E)', { locale: ja })}~
						{format(addDays(viewDate, viewRangeDays - 1), 'M/d(E)', {
							locale: ja,
						})}
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

export default MainPage
