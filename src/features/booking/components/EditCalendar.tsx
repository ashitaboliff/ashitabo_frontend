'use client'

import { UseFormSetValue } from 'react-hook-form'
import { addDays } from 'date-fns'
import { BookingResponse } from '@/features/booking/types'
import { ABLE_BOOKING_DAYS } from '@/features/booking/config'
import CalendarFrame from '@/components/ui/molecules/CalendarFrame'
import { FORBIDDEN_BOOKING } from '@/features/booking/constants'
import {
	AvailableCell,
	BookingInfoCell,
	ForbiddenCell,
} from '@/features/booking/components/CalendarCellContent'

interface EditCalendarProps {
	bookingResponse: BookingResponse
	timeList: string[]
	actualBookingDate: string
	actualBookingTime: number
	bookingDate: string
	setBookingDate: (bookingDate: string) => void
	bookingTime: number
	setBookingTime: (bookingTime: number) => void
	setCalendarOpen: (calendarOpen: boolean) => void
	setValue: UseFormSetValue<any>
}

const EditCalendar = ({
	bookingResponse,
	timeList,
	actualBookingDate,
	actualBookingTime,
	bookingDate,
	setBookingDate,
	bookingTime,
	setBookingTime,
	setCalendarOpen,
	setValue,
}: EditCalendarProps) => {
	const bookingAbleMaxDate = addDays(new Date(), ABLE_BOOKING_DAYS)
	const dateList = Object.keys(bookingResponse)

	const handleSelect = (date: string, timeIndex: number) => {
		setBookingDate(date)
		setBookingTime(timeIndex)
		setValue('bookingDate', date)
		setValue('bookingTime', timeList[timeIndex])
		setCalendarOpen(false)
	}

	return (
		<CalendarFrame
			dates={dateList}
			times={timeList}
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

export default EditCalendar
