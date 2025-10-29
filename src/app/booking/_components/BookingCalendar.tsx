'use client'

import { addDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
	ABLE_BOOKING_DAYS,
	DENIED_BOOKING,
} from '@/domains/booking/constants/bookingConstants'
import type { BookingResponse } from '@/domains/booking/model/bookingTypes'
import {
	AvailableCell,
	BookingInfoCell,
	DeniedCell,
} from '@/domains/booking/ui/CalendarCellContent'
import CalendarFrame from '@/shared/ui/molecules/CalendarFrame'
import { DateToDayISOstring, toDateKey } from '@/shared/utils'

/**
 * これは予約カレンダーを描画するためだけのコンポーネント
 * @param booking_date
 * @returns
 */
type Props = {
	readonly bookingDate: BookingResponse
	readonly timeList: string[]
	readonly className?: string
}

const BookingCalendar = ({ bookingDate, timeList, className }: Props) => {
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
			containerClassName={className ? `flex justify-center ${className}` : 'flex justify-center'}
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

				if (booking.registName === DENIED_BOOKING) {
					return {
						key: cellKey,
						className: baseClass,
						content: <DeniedCell label={booking.name} />,
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
