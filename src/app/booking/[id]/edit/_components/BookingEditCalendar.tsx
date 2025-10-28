'use client'

import { addDays } from 'date-fns'
import type { UseFormSetValue } from 'react-hook-form'
import {
	ABLE_BOOKING_DAYS,
	BOOKING_TIME_LIST,
	DENIED_BOOKING,
} from '@/domains/booking/constants/bookingConstants'
import type { BookingEditFormValues } from '@/domains/booking/model/bookingSchema'
import type { BookingResponse } from '@/domains/booking/model/bookingTypes'
import {
	AvailableCell,
	BookingInfoCell,
	DeniedCell,
} from '@/domains/booking/ui/CalendarCellContent'
import CalendarFrame from '@/shared/ui/molecules/CalendarFrame'
import { DateToDayISOstring } from '@/shared/utils'

type Props = {
	readonly bookingResponse: BookingResponse
	readonly actualBookingDate: string
	readonly actualBookingTime: number
	readonly bookingDate: string
	readonly bookingTime: number
	readonly setCalendarOpen: (calendarOpen: boolean) => void
	readonly setValue: UseFormSetValue<BookingEditFormValues>
	readonly className?: string
}

const BookingEditCalendar = ({
	bookingResponse,
	actualBookingDate,
	actualBookingTime,
	bookingDate,
	bookingTime,
	setCalendarOpen,
	setValue,
	className,
}: Props) => {
	const dateList = Object.keys(bookingResponse)

	const handleSelect = (date: string, timeIndex: number) => {
		setValue('bookingDate', date)
		setValue('bookingTime', timeIndex)
		setCalendarOpen(false)
	}

	const bookingAbleMaxDate = DateToDayISOstring(
		addDays(new Date(), ABLE_BOOKING_DAYS),
	)
	const bookingAbleMinDate = DateToDayISOstring(addDays(new Date(), -1))

	return (
		<CalendarFrame
			dates={dateList}
			times={BOOKING_TIME_LIST}
			containerClassName={`flex justify-center ${className}`}
			cornerCellClassName="border border-base-200 w-11 sm:w-14 md:w-16"
			headerCellClassName="border border-base-200 p-1 sm:p-2 w-11 h-9 sm:w-14 sm:h-12 md:w-16 md:h-14"
			timeCellClassName="border border-base-200 p-1 sm:p-2 w-11 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 break-words"
			renderCell={({ date, timeIndex }) => {
				const booking = bookingResponse[date]?.[timeIndex]
				const isSelected = date === bookingDate && timeIndex === bookingTime
				const isOriginalBooking =
					date === actualBookingDate && timeIndex === actualBookingTime
				const withinRange =
					date >= bookingAbleMinDate && date <= bookingAbleMaxDate

				const className = withinRange
					? isSelected
						? 'bg-primary-light'
						: undefined
					: 'bg-base-300'
				const key = `edit-calendar-${date}-${timeIndex}`

				if (!booking) {
					return {
						key,
						className,
						onClick: withinRange
							? () => handleSelect(date, timeIndex)
							: undefined,
						content: <AvailableCell />,
					}
				}

				if (booking.registName === DENIED_BOOKING) {
					return {
						key,
						className,
						content: <DeniedCell />,
					}
				}

				if (isOriginalBooking) {
					return {
						key,
						className,
						onClick: withinRange
							? () => handleSelect(date, timeIndex)
							: undefined,
						content: (
							<BookingInfoCell
								registName={booking.registName}
								name={booking.name}
							/>
						),
					}
				}

				return {
					key,
					className,
					content: <DeniedCell />,
				}
			}}
		/>
	)
}

export default BookingEditCalendar
