'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { addDays, subDays, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { getBookingByDateAction } from '../actions'
import { BookingResponse, BookingTime } from '@/features/booking/types'
import BookingCalendar from '@/features/booking/components/BookingCalendar'
import { getCurrentJSTDateString } from '@/utils'
import { ApiError } from '@/types/responseTypes'
import { BOOKING_CALENDAR_SWR_KEY } from '@/features/booking/constants'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import { useFeedback } from '@/hooks/useFeedback'

const fetchBookings = async ([cacheKey, startDate, endDate]: [
	string,
	string,
	string,
]): Promise<BookingResponse | null> => {
	if (cacheKey !== BOOKING_CALENDAR_SWR_KEY) {
		throw new Error('Invalid cache key for booking calendar fetcher')
	}
	const res = await getBookingByDateAction({ startDate, endDate })
	if (res.ok) {
		return res.data
	}
	throw res
}

const MainPage = () => {
	const [viewDay, setViewDay] = useState<string>(
		getCurrentJSTDateString({ yesterday: true }),
	)
	const VIEW_WINDOW_DAYS = 7
	const VIEW_DAY_MAX_OFFSET = 27
	const VIEW_DAY_MIN_OFFSET = 7
	const errorFeedback = useFeedback()
	const viewDate = new Date(viewDay)
	const yesterdayDate = new Date(getCurrentJSTDateString({ yesterday: true }))
	const endDateString = format(
		addDays(viewDate, VIEW_WINDOW_DAYS),
		'yyyy-MM-dd',
	)

	const {
		data: bookingData,
		isLoading,
		mutate,
	} = useSWR<BookingResponse | null>(
		[BOOKING_CALENDAR_SWR_KEY, viewDay, endDateString],
		fetchBookings,
		{
			revalidateOnFocus: false,
			onError: (err) => {
				errorFeedback.showApiError(err as ApiError)
			},
		},
	)

	useEffect(() => {
		if (bookingData) {
			errorFeedback.clearFeedback()
		}
	}, [bookingData, errorFeedback])

	const prevAble =
		subDays(viewDate, VIEW_WINDOW_DAYS) <
		subDays(yesterdayDate, VIEW_DAY_MIN_OFFSET)

	const nextAble =
		addDays(viewDate, VIEW_WINDOW_DAYS - 1) >=
		addDays(yesterdayDate, VIEW_DAY_MAX_OFFSET)

	const prevWeek = () => {
		if (prevAble) return
		const newDate = subDays(viewDate, VIEW_WINDOW_DAYS)
		setViewDay(format(newDate, 'yyyy-MM-dd'))
	}
	const nextWeek = () => {
		if (nextAble) return
		const newDate = addDays(viewDate, VIEW_WINDOW_DAYS)
		setViewDay(format(newDate, 'yyyy-MM-dd'))
	}

	const handleRetry = async () => {
		errorFeedback.clearFeedback()
		await mutate()
	}

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
						onClick={prevWeek}
						disabled={prevAble}
					>
						{'<'}
					</button>
					<div className="text-md sm:text-lg font-bold w-64 sm:w-72 text-center">
						{format(viewDate, 'M/d(E)', { locale: ja })}~
						{format(addDays(viewDate, VIEW_WINDOW_DAYS - 1), 'M/d(E)', {
							locale: ja,
						})}
						までのコマ表
					</div>
					<button
						className="btn btn-outline"
						onClick={nextWeek}
						disabled={nextAble}
					>
						{'>'}
					</button>
				</div>
				{isLoading || !bookingData ? (
					<div className="flex justify-center">
						<div className="skeleton w-[360px] h-[400px] sm:w-[520px] sm:h-[580px]"></div>
					</div>
				) : (
					<BookingCalendar bookingDate={bookingData} timeList={BookingTime} />
				)}
			</div>
		</>
	)
}

export default MainPage
