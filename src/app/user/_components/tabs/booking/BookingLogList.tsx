'use client'

import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'
import type { FeedbackMessageType } from '@/types/feedback'

interface Props {
	readonly bookings?: Booking[]
	readonly isLoading: boolean
	readonly error?: FeedbackMessageType | null
	readonly onBookingItemClick: (booking: Booking) => void
}

const BookingLogList = ({
	bookings,
	isLoading,
	error,
	onBookingItemClick,
}: Props) => {
	const renderBookingCells = (booking: Booking) => (
		<>
			<td>{formatDateSlashWithWeekday(booking.bookingDate)}</td>
			<td>{BOOKING_TIME_LIST[booking.bookingTime]}</td>
			<td>{booking.name}</td>
			<td>{booking.registName}</td>
		</>
	)

	return (
		<GenericTable
			headers={[
				{ key: 'booking-date', label: '予約日' },
				{ key: 'booking-time', label: '予約時間' },
				{ key: 'band-name', label: 'バンド名' },
				{ key: 'registrant-name', label: '登録者名' },
			]}
			data={bookings}
			isLoading={isLoading}
			error={error}
			renderCells={renderBookingCells}
			onRowClick={onBookingItemClick}
			itemKeyExtractor={(booking) => booking.id}
			loadingMessage="予約履歴を読み込み中..."
			emptyDataMessage="予約履歴はありません。"
		/>
	)
}

export default BookingLogList
