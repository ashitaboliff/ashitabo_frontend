import { notFound } from 'next/navigation'
import BookingLogs from '@/app/booking/logs/_components'
import { getAllBookingAction } from '@/domains/booking/api/bookingActions'
import { createMetaData } from '@/shared/hooks/useMetaData'

export async function metadata() {
	return createMetaData({
		title: 'コマ表予約ログ | あしたぼホームページ',
		url: '/booking/logs',
	})
}

const BookingLog = async () => {
	const bookingLog = await getAllBookingAction()
	if (!bookingLog.ok) return notFound()

	return <BookingLogs bookingLog={bookingLog.data} />
}

export default BookingLog
