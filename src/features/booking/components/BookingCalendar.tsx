'use client'

import React, { useCallback, useMemo } from 'react'
import { BookingResponse } from '@/features/booking/types'
import BookingTableBox from '@/features/booking/components/BookingTableBox'
import CalendarFrame, {
	CalendarCellRenderProps,
} from '@/components/ui/molecules/CalendarFrame'

/**
 * これは予約カレンダーを描画するためだけのコンポーネント
 * @param booking_date
 * @returns
 */
const BookingCalendarComponent = ({
	bookingDate,
	timeList,
}: {
	bookingDate: BookingResponse
	timeList: string[]
}) => {
	const dateList = useMemo(() => Object.keys(bookingDate), [bookingDate])

	const renderCell = useCallback(
		({ date, timeIndex }: CalendarCellRenderProps) => {
			const booking = bookingDate[date]?.[timeIndex]
			return (
				<BookingTableBox
					key={`booking-cell-${date}-${timeIndex}`}
					index={`booking-${date}-${timeIndex}`}
					id={booking?.id}
					bookingDate={date}
					bookingTime={timeIndex}
					registName={booking?.registName}
					name={booking?.name}
				/>
			)
		},
		[bookingDate],
	)

	return <CalendarFrame dates={dateList} times={timeList} renderCell={renderCell} />
}

BookingCalendarComponent.displayName = 'BookingCalendar'

export default React.memo(BookingCalendarComponent)
