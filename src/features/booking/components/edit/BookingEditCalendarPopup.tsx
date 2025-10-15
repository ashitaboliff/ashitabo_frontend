'use client'

import { useCallback, useEffect } from 'react'
import { addDays } from 'date-fns'
import Popup from '@/components/ui/molecules/Popup'
import BookingEditCalendar from '@/features/booking/components/edit/BookingEditCalendar'
import { BookingErrorMessage } from '@/features/booking/components/BookingActionFeedback'
import type { BookingResponse } from '@/features/booking/types'
import type { UseFormSetValue } from 'react-hook-form'
import { BookingEditFormValues } from '@/features/booking/schema'
import {
	useBookingCalendarData,
	useBookingWeekNavigation,
} from '@/features/booking/hooks'
import { useFeedback } from '@/hooks/useFeedback'
import type { ApiError } from '@/types/responseTypes'

type Props = {
	open: boolean
	onClose: () => void
	initialViewDay: Date
	initialBookingResponse: BookingResponse | null
	actualBookingDate: string
	actualBookingTime: number
	bookingDate: string
	bookingTime: number
	setValue: UseFormSetValue<BookingEditFormValues>
}

const BookingEditCalendarPopup = ({
	open,
	onClose,
	initialViewDay,
	initialBookingResponse,
	actualBookingDate,
	actualBookingTime,
	bookingDate,
	bookingTime,
	setValue,
}: Props) => {
	const calendarFeedback = useFeedback()

	const {
		viewDate,
		viewRangeDays,
		goPrevWeek,
		goNextWeek,
		canGoPrevWeek,
		canGoNextWeek,
		setViewDate,
	} = useBookingWeekNavigation({
		initialDate: initialViewDay,
	})

	useEffect(() => {
		setViewDate(initialViewDay)
	}, [initialViewDay, setViewDate])

	const { data: bookingCalendarData, isLoading } = useBookingCalendarData({
		viewDate,
		viewRangeDays,
		fallbackData: initialBookingResponse,
		config: {
			onError: (err) => calendarFeedback.showApiError(err as ApiError),
		},
	})

	const bookingResponse = bookingCalendarData ?? null

	useEffect(() => {
		if (bookingResponse) {
			calendarFeedback.clearFeedback()
		}
	}, [bookingResponse, calendarFeedback])

	const handleSelectClose = useCallback(() => {
		onClose()
	}, [onClose])

	return (
		<Popup
			id="booking-edit-calendar-popup"
			title="カレンダー"
			maxWidth="lg"
			open={open}
			onClose={onClose}
		>
			<div className="flex flex-col gap-y-2 items-center justify-center">
				<div className="flex flex-row justify-center space-x-2">
					<button
						className="btn btn-outline"
						onClick={goPrevWeek}
						disabled={!canGoPrevWeek || isLoading}
					>
						{'<'}
					</button>
					<div className="text-lg font-bold mx-2 w-60 text-center">
						{viewDate.toLocaleDateString()}~
						{addDays(viewDate, viewRangeDays - 1).toLocaleDateString()}
					</div>
					<button
						className="btn btn-outline"
						onClick={goNextWeek}
						disabled={!canGoNextWeek || isLoading}
					>
						{'>'}
					</button>
				</div>
				<BookingErrorMessage feedback={calendarFeedback.feedback} />
				{bookingResponse ? (
					<BookingEditCalendar
						bookingResponse={bookingResponse}
						actualBookingDate={actualBookingDate}
						actualBookingTime={actualBookingTime}
						bookingDate={bookingDate}
						bookingTime={bookingTime}
						setCalendarOpen={handleSelectClose}
						setValue={setValue}
					/>
				) : isLoading ? (
					<div className="flex justify-center">
						<div className="skeleton h-96 w-96"></div>
					</div>
				) : (
					<p className="text-sm text-center text-error">
						予約枠を取得できませんでした。時間をおいて再度お試しください。
					</p>
				)}
				<div className="flex justify-center space-x-2">
					<button type="button" className="btn btn-outline" onClick={onClose}>
						閉じる
					</button>
				</div>
			</div>
		</Popup>
	)
}

export default BookingEditCalendarPopup
