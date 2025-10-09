import { notFound } from 'next/navigation'
import LogsPage from '@/features/booking/components/Logs' // インポート名とパスを変更
import { getAllBookingAction } from '@/features/booking/components/actions'
import { createMetaData } from '@/hooks/useMetaData'

export async function metadata() {
	return createMetaData({
		title: 'コマ表予約ログ | あしたぼホームページ',
		url: '/booking/logs',
	})
}

const BookingLog = async () => {
	const bookingLog = await getAllBookingAction()
	if (!bookingLog.ok) return notFound()

	return <LogsPage bookingLog={bookingLog.data} />
}

export default BookingLog
