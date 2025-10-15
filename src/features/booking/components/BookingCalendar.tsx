'use client'

import { useMemo } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { addDays } from 'date-fns'
import { BookingResponse } from '@/features/booking/types'
import CalendarFrame from '@/components/ui/molecules/CalendarFrame'
import { DateToDayISOstring } from '@/utils'
import { ABLE_BOOKING_DAYS } from '@/features/booking/config'
import { FORBIDDEN_BOOKING } from '@/features/booking/constants'
import { PiCircle as CircleIcon } from 'react-icons/pi'
import { HiMiniXMark as ForbiddenIcon } from 'react-icons/hi2'

/**
 * これは予約カレンダーを描画するためだけのコンポーネント
 * @param booking_date
 * @returns
 */
const BookingCalendar = ({
	bookingDate,
	timeList,
}: {
	bookingDate: BookingResponse
	timeList: string[]
}) => {
	const router = useRouter()
	const dateList = useMemo(() => Object.keys(bookingDate), [bookingDate])
	const bookingAbleMaxDate = DateToDayISOstring(
		addDays(new Date(), ABLE_BOOKING_DAYS),
	)
	const bookingAbleMinDate = DateToDayISOstring(addDays(new Date(), -1))

	return (
		<CalendarFrame
			dates={dateList}
			times={timeList}
			renderCell={({ date, timeIndex }) => {
				const booking = bookingDate[date]?.[timeIndex]
				const baseClass = 'border border-base-200 p-0'
				const cellKey = `booking-${date}-${timeIndex}`

				const withinRange =
					date >= bookingAbleMinDate && date <= bookingAbleMaxDate
				const disabledClass = withinRange
					? baseClass
					: `${baseClass} bg-base-300`

				const navigateToNewBooking = () =>
					router.push(
						`/booking/new?date=${date.split('T')[0]}&time=${timeIndex}`,
					)

				if (!booking) {
					return {
						key: cellKey,
						className: disabledClass,
						onClick: withinRange ? navigateToNewBooking : undefined,
						content: (
							<div className="w-11 h-13 sm:w-16 sm:h-16 flex flex-col justify-center items-center text-center break-words py-1">
								<CircleIcon color="blue" size={20} />
							</div>
						),
					}
				}

				if (booking.registName === FORBIDDEN_BOOKING) {
					return {
						key: cellKey,
						className: baseClass,
						content: (
							<div className="w-11 h-13 sm:w-16 sm:h-16 flex flex-col justify-center items-center text-center break-words py-1">
								<ForbiddenIcon color="red" size={20} />
								<p className="text-xxxs sm:text-xs-custom text-base-content">
									{booking.name}
								</p>
							</div>
						),
					}
				}

				return {
					key: cellKey,
					className: disabledClass,
					onClick: withinRange
						? () => router.push(`/booking/${booking.id}`)
						: undefined,
					content: (
						<div className="w-11 h-13 sm:w-16 sm:h-16 flex flex-col justify-center items-center text-center break-words py-1">
							<p className="text-xxxs sm:text-xs-custom text-base-content">
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
					),
				}
			}}
		/>
	)
}

export default BookingCalendar
