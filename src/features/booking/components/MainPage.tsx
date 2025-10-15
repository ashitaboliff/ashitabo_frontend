'use client'

import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { addDays, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { BookingResponse, BookingTime } from '@/features/booking/types'
import BookingCalendar from '@/features/booking/components/BookingCalendar'
import {
	BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	BOOKING_VIEW_RANGE_DAYS,
} from '@/features/booking/constants'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import { useFeedback } from '@/hooks/useFeedback'
import {
	bookingRangeFetcher,
	buildBookingRangeKey,
	useBookingWeekNavigation,
} from '@/features/booking/hooks'
import type { ApiError } from '@/types/responseTypes'

type MainPageProps = {
	initialViewDate: string
	initialData?: BookingResponse | null
	initialRangeDays?: number
	initialError?: string
}

const MainPage = ({
	initialViewDate,
	initialData = null,
	initialRangeDays = BOOKING_VIEW_RANGE_DAYS,
	initialError,
}: MainPageProps) => {
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
		viewRangeDays: initialRangeDays,
		minOffsetDays: BOOKING_MAIN_VIEW_MIN_OFFSET_DAYS,
	})

	const errorFeedback = useFeedback()

	useEffect(() => {
		if (initialError) {
			errorFeedback.showError(initialError)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const swrKey = buildBookingRangeKey(viewDate, viewRangeDays)

	const {
		data: bookingData,
		isLoading,
		mutate,
	} = useSWR<BookingResponse | null>(swrKey, bookingRangeFetcher, {
		fallbackData: initialData,
		revalidateOnFocus: false,
		onError: (err) => {
			errorFeedback.showApiError(err as ApiError)
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
						className="btn btn-outline"
						onClick={goNextWeek}
						disabled={!canGoNextWeek}
					>
						{'>'}
					</button>
				</div>
				{showSkeleton ? (
					<div className="flex justify-center">
						<div className="skeleton w-[360px] h-[400px] sm:w-[520px] sm:h-[580px]"></div>
					</div>
				) : bookingData ? (
					<BookingCalendar bookingDate={bookingData} timeList={BookingTime} />
				) : null}
			</div>
		</>
	)
}

export default MainPage
