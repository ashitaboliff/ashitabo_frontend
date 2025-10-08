'use client'

import { UseFormSetValue } from 'react-hook-form'
import { addDays } from 'date-fns'
import { BookingResponse } from '@/features/booking/types'
import { ABLE_BOOKING_DAYS } from '@/features/booking/config'
import CalendarFrame, {
	CalendarCellRenderProps,
} from '@/components/ui/molecules/CalendarFrame'
import { FORBIDDEN_BOOKING } from '@/features/booking/constants'

import { PiCircle as CircleIcon } from 'react-icons/pi'
import { HiMiniXMark as ForbiddenIcon } from 'react-icons/hi2'

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

const cellContentClass =
	'w-11 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 flex flex-col justify-center items-center text-center break-words py-1'

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

	const renderCell = ({ date, timeIndex }: CalendarCellRenderProps) => {
		const booking = bookingResponse[date]?.[timeIndex]
		const isSelected = date === bookingDate && timeIndex === bookingTime
		const isOriginalBooking =
			date === actualBookingDate && timeIndex === actualBookingTime
		const baseClass = 'border border-base-200 p-0'
		const tdClassName = `${baseClass}${isSelected ? ' bg-primary-light' : ''}`

		if (!booking) {
			return (
				<td
					key={`edit-calendar-${date}-${timeIndex}`}
					className={tdClassName}
					onClick={() => handleSelect(date, timeIndex)}
				>
					<div className={cellContentClass}>
						<p className="text-xxxs sm:text-xs-custom text-base-content font-bold">
							<CircleIcon color="blue" size={20} />
						</p>
					</div>
				</td>
			)
		}

		if (booking.registName === FORBIDDEN_BOOKING) {
			return (
				<td key={`edit-calendar-${date}-${timeIndex}`} className={tdClassName}>
					<div className={cellContentClass}>
						<p className="text-xxxs sm:text-xs-custom text-base-content font-bold">
							<ForbiddenIcon color="red" size={20} />
						</p>
					</div>
				</td>
			)
		}

		if (isOriginalBooking) {
			return (
				<td
					key={`edit-calendar-${date}-${timeIndex}`}
					className={tdClassName}
					onClick={() => handleSelect(date, timeIndex)}
				>
					<div className={cellContentClass}>
						<p className="text-xxxs sm:text-xs-custom text-base-content font-bold">
							{booking.registName.length > 21
								? `${booking.registName.slice(0, 20)}...`
								: booking.registName}
						</p>
						<p className="text-xxxs sm:text-xs-custom text-base-content">
							{booking.name && booking.name.length > 14
								? `${booking.name.slice(0, 13)}...`
								: booking.name}
						</p>
					</div>
				</td>
			)
		}

		return (
			<td key={`edit-calendar-${date}-${timeIndex}`} className={tdClassName}>
				<div className={cellContentClass}>
					<p className="text-xxxs sm:text-xs-custom text-base-content font-bold">
						<ForbiddenIcon color="red" size={20} />
					</p>
				</div>
			</td>
		)
	}

	return (
		<CalendarFrame
			dates={dateList}
			times={timeList}
			tableClassName="w-auto border border-base-200 table-pin-rows table-pin-cols bg-white"
			cornerCellClassName="border border-base-200 w-11 sm:w-14 md:w-16"
			headerCellClassName="border border-base-200 p-1 sm:p-2 w-11 h-9 sm:w-14 sm:h-12 md:w-16 md:h-14"
			timeCellClassName="border border-base-200 p-1 sm:p-2 w-11 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 break-words"
			renderCell={renderCell}
		/>
	)
}

export default EditCalendar
