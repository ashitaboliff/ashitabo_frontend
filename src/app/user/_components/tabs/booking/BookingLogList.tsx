'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { getBookingByUserIdAction } from '@/domains/booking/api/bookingActions'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import GenericTableBody from '@/shared/ui/molecules/GenericTableBody'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'

interface Props {
	readonly userId: string
	readonly currentPage: number
	readonly logsPerPage: number
	readonly sort: 'new' | 'old'
	readonly onBookingItemClick: (booking: Booking) => void
	readonly onDataLoaded: (totalCount: number) => void
	readonly initialData?: { bookings: Booking[]; totalCount: number }
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
	initialData,
}: Props) => {
	const { data, error, isLoading } = useSWR(
		userId ? [userId, currentPage, logsPerPage, sort] : null,
		fetchBookings,
		{
			fallbackData: currentPage === 1 ? initialData : undefined,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: false,
			shouldRetryOnError: false,
			onSuccess: (fetchedData) => {
				if (fetchedData) {
					onDataLoaded(fetchedData.totalCount)
				}
			},
		},
	)

	useEffect(() => {
		if (initialData && currentPage === 1) {
			onDataLoaded(initialData.totalCount)
		}
	}, [currentPage, initialData, onDataLoaded])

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
