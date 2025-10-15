'use client'

import { UseFormSetValue } from 'react-hook-form'
import { BookingResponse } from '@/features/booking/types'
import CalendarFrame from '@/components/ui/molecules/CalendarFrame'
import {
	FORBIDDEN_BOOKING,
	BOOKING_TIME_LIST,
} from '@/features/booking/constants'
import {
	AvailableCell,
	BookingInfoCell,
	ForbiddenCell,
} from '@/features/booking/components/CalendarCellContent'
import { BookingEditFormValues } from '@/features/booking/schemas/bookingEditSchema'

interface Props {
	bookingResponse: BookingResponse
	actualBookingDate: string
	actualBookingTime: number
	bookingDate: string
	bookingTime: number
	setCalendarOpen: (calendarOpen: boolean) => void
	setValue: UseFormSetValue<BookingEditFormValues>
}

const BookingEditCalendar = ({
	bookingResponse,
	actualBookingDate,
	actualBookingTime,
	bookingDate,
	bookingTime,
	setCalendarOpen,
	setValue,
}: Props) => {
	const dateList = Object.keys(bookingResponse)

	const handleSelect = (date: string, timeIndex: number) => {
		setValue('bookingDate', date)
		setValue('bookingTime', timeIndex)
		setCalendarOpen(false)
	}

	return (
		<CalendarFrame
			dates={dateList}
			times={BOOKING_TIME_LIST}
			cornerCellClassName="border border-base-200 w-11 sm:w-14 md:w-16"
			headerCellClassName="border border-base-200 p-1 sm:p-2 w-11 h-9 sm:w-14 sm:h-12 md:w-16 md:h-14"
			timeCellClassName="border border-base-200 p-1 sm:p-2 w-11 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 break-words"
			renderCell={({ date, timeIndex }) => {
				const booking = bookingResponse[date]?.[timeIndex]
				const isSelected = date === bookingDate && timeIndex === bookingTime
				const isOriginalBooking =
					date === actualBookingDate && timeIndex === actualBookingTime
				const className = isSelected ? 'bg-primary-light' : undefined
				const key = `edit-calendar-${date}-${timeIndex}`

				if (!booking) {
					return {
						key,
						className,
						onClick: () => handleSelect(date, timeIndex),
						content: <AvailableCell />,
					}
				}

				if (booking.registName === FORBIDDEN_BOOKING) {
					return {
						key,
						className,
						content: <ForbiddenCell />,
					}
				}

				if (isOriginalBooking) {
					return {
						key,
						className,
						onClick: () => handleSelect(date, timeIndex),
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
					content: <ForbiddenCell />,
				}
			}}
		/>
	)
}

export default BookingEditCalendar
