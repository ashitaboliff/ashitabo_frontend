'use client'

import { addDays } from 'date-fns'
import { useCallback, useEffect, useId } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import {
	useBookingCalendarData,
	useBookingWeekNavigation,
} from '@/domains/booking/hooks/bookingHooks'
import type { BookingResponse } from '@/domains/booking/model/bookingTypes'
import type { BookingEditFormValues } from '@/domains/booking/schemas/bookingSchema'
import { useFeedback } from '@/shared/hooks/useFeedback'
import Popup from '@/shared/ui/molecules/Popup'
import type { ApiError } from '@/types/responseTypes'
import { BookingErrorMessage } from './BookingActionFeedback'
import BookingEditCalendar from './BookingEditCalendar'

interface Props {
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
			onError: (err: ApiError) => calendarFeedback.showApiError(err),
		},
	})

	const bookingResponse = bookingCalendarData ?? null
	const popupId = useId()

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
			id={popupId}
			title="カレンダー"
			maxWidth="lg"
			open={open}
			onClose={onClose}
		>
			<div className="flex flex-col gap-y-2 items-center justify-center">
				<div className="flex flex-row justify中心 space-x-2">
					<button
						type="button"
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
						type="button"
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
