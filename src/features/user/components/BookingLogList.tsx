'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import useSWR from 'swr'
import { Booking, BookingTime } from '@/features/booking/types'
import GenericTableBody from '@/components/ui/molecules/GenericTableBody'
import { getBookingByUserIdAction } from '@/features/booking/actions'

interface BookingLogListProps {
	userId: string
	currentPage: number
	logsPerPage: number
	sort: 'new' | 'old'
	onBookingItemClick: (booking: Booking) => void
	onDataLoaded: (totalCount: number) => void
}

const fetchBookings = async ([userId, page, perPage, sort]: [
	string,
	number,
	number,
	'new' | 'old',
]) => {
	const res = await getBookingByUserIdAction({ userId, page, perPage, sort })
	if (res.ok) {
		return res.data
	}
	const errorMessage = res.message || 'Failed to fetch bookings'
	throw new Error(errorMessage)
}

const BookingLogList = ({
	userId,
	currentPage,
	logsPerPage,
	sort,
	onBookingItemClick,
	onDataLoaded,
}: BookingLogListProps) => {
	const { data, error, isLoading } = useSWR(
		userId ? [userId, currentPage, logsPerPage, sort] : null,
		fetchBookings,
		{
			revalidateOnFocus: false,
			onSuccess: (fetchedData) => {
				if (fetchedData) {
					onDataLoaded(fetchedData.totalCount)
				}
			},
		},
	)

	const bookings = data?.bookings

	const renderBookingCells = (booking: Booking) => (
		<>
			<td>
				{format(new Date(booking.bookingDate), 'yyyy年MM月dd日', {
					locale: ja,
				})}
			</td>
			<td>{BookingTime[booking.bookingTime]}</td>
			<td>{booking.name}</td>
			<td>{booking.registName}</td>
		</>
	)

	return (
		<GenericTableBody
			isLoading={isLoading}
			error={error}
			data={bookings}
			renderCells={renderBookingCells}
			onItemClick={onBookingItemClick}
			colSpan={4}
			itemKeyExtractor={(booking) => booking.id}
			loadingMessage="予約履歴を読み込み中..."
			errorMessagePrefix="予約履歴の読み込みに失敗しました"
			emptyDataMessage="予約履歴はありません。"
		/>
	)
}

export default BookingLogList
