'use client'

import { useMemo } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { addDays } from 'date-fns'
import { BookingResponse } from '@/features/booking/types'
import CalendarFrame from '@/components/ui/molecules/CalendarFrame'
import { DateToDayISOstring, toDateKey } from '@/utils'
import {
	FORBIDDEN_BOOKING,
	ABLE_BOOKING_DAYS,
} from '@/features/booking/constants'
import {
	AvailableCell,
	BookingInfoCell,
	ForbiddenCell,
} from '@/features/booking/components/CalendarCellContent'

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
					router.push(`/booking/new?date=${toDateKey(date)}&time=${timeIndex}`)

				if (!booking) {
					return {
						key: cellKey,
						className: disabledClass,
						onClick: withinRange ? navigateToNewBooking : undefined,
						content: <AvailableCell />,
					}
				}

				if (booking.registName === FORBIDDEN_BOOKING) {
					return {
						key: cellKey,
						className: baseClass,
						content: <ForbiddenCell label={booking.name} />,
					}
				}

				return {
					key: cellKey,
					className: disabledClass,
					onClick: withinRange
						? () => router.push(`/booking/${booking.id}`)
						: undefined,
					content: (
						<BookingInfoCell
							registName={booking.registName}
							name={booking.name}
						/>
					),
				}
			}}
		/>
	)
}

export default BookingCalendar
