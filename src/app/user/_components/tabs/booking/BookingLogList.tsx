'use client'

import useSWR from 'swr'
import { getBookingByUserIdAction } from '@/domains/booking/api/bookingActions'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import GenericTableBody from '@/shared/ui/molecules/GenericTableBody'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'
import type { ApiError } from '@/types/response'

interface Props {
	readonly userId: string
	readonly currentPage: number
	readonly logsPerPage: number
	readonly sort: 'new' | 'old'
	readonly onBookingItemClick: (booking: Booking) => void
	readonly onDataLoaded: (totalCount: number) => void
}

const fetchBookings = async ([userId, page, perPage, sort]: [
	string,
	number,
	number,
	'new' | 'old',
]): Promise<{
	bookings: Booking[]
	totalCount: number
}> => {
	const res = await getBookingByUserIdAction({ userId, page, perPage, sort })
	if (res.ok) {
		return res.data
	}
	throw res
}

const BookingLogList = ({
	userId,
	currentPage,
	logsPerPage,
	sort,
	onBookingItemClick,
	onDataLoaded,
}: Props) => {
	const errorFeedback = useFeedback()
	const swrKey = [userId, currentPage, logsPerPage, sort]
	const { data, isLoading } = useSWR(swrKey, fetchBookings, {
		keepPreviousData: true,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		revalidateIfStale: true,
		dedupingInterval: 60 * 1000,
		shouldRetryOnError: false,
		onSuccess(data) {
			onDataLoaded(data.totalCount)
		},
		onError(err: ApiError) {
			errorFeedback.showApiError(err)
		},
	})

	const bookings = data?.bookings

	const renderBookingCells = (booking: Booking) => (
		<>
			<td>{formatDateSlashWithWeekday(booking.bookingDate)}</td>
			<td>{BOOKING_TIME_LIST[booking.bookingTime]}</td>
			<td>{booking.name}</td>
			<td>{booking.registName}</td>
		</>
	)

	return (
		<GenericTableBody
			isLoading={isLoading}
			error={errorFeedback.feedback}
			data={bookings}
			renderCells={renderBookingCells}
			onItemClick={onBookingItemClick}
			colSpan={4}
			itemKeyExtractor={(booking) => booking.id}
			loadingMessage="予約履歴を読み込み中..."
			emptyDataMessage="予約履歴はありません。"
		/>
	)
}

export default BookingLogList
