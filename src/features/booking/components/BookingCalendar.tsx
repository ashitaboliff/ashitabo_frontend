'use client'

import { BookingResponse } from '@/features/booking/types'
import BookingTableBox from '@/features/booking/components/BookingTableBox'
import CalendarFrame from '@/components/ui/molecules/CalendarFrame'

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
	const dateList = Object.keys(bookingDate)

	return (
		<CalendarFrame
			dates={dateList}
			times={timeList}
			renderCell={({ date, timeIndex }) => {
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
			}}
		/>
	)
}

export default BookingCalendar
