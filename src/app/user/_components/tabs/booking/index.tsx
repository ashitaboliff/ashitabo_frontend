'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { getBookingByUserIdAction } from '@/domains/booking/api/bookingActions'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import BookingDetailPopup from '@/domains/booking/ui/BookingDetailPopup'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import PaginatedResourceLayout from '@/shared/ui/molecules/PaginatedResourceLayout'
import type { Session } from '@/types/session'
import BookingLogList from './BookingLogList'

type Props = {
	readonly session: Session
}

type BookingLogsKey = ['booking-logs', string, number, number, 'new' | 'old']

const bookingLogsFetcher = async ([
	,
	userId,
	page,
	perPage,
	sort,
]: BookingLogsKey) => {
	const res = await getBookingByUserIdAction({ userId, page, perPage, sort })
	if (res.ok) {
		return res.data
	}
	throw res
}

const perPageOptions = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

const sortOptions: { value: 'new' | 'old'; label: string }[] = [
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
]

const UserBookingLogs = ({ session }: Props) => {
	const {
		state: { page, perPage, sort, totalCount },
		pageCount,
		setPage,
		setPerPage,
		setSort,
		setTotalCount,
	} = usePagedResource<'new' | 'old'>({
		initialPerPage: 10,
		initialSort: 'new',
	})
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const bookingFeedback = useFeedback()

	const swrKey: BookingLogsKey = [
		'booking-logs',
		session.user.id,
		page,
		perPage,
		sort,
	]

	const { data, isLoading } = useSWR(swrKey, bookingLogsFetcher, {
		keepPreviousData: true,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		revalidateIfStale: true,
		dedupingInterval: 60 * 1000,
		shouldRetryOnError: false,
		onError(error) {
			bookingFeedback.showApiError(error)
		},
		onSuccess(data) {
			if (data) {
				setTotalCount(data.totalCount)
				bookingFeedback.clearFeedback()
			}
		},
	})

	const handleBookingItemClick = (booking: Booking) => {
		setSelectedBooking(booking)
		setIsPopupOpen(true)
	}

	return (
		<div className="mt-4 flex flex-col justify-center">
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'booking_logs_per_page',
					options: perPageOptions,
					value: perPage,
					onChange: setPerPage,
				}}
				sort={{
					name: 'booking_sort_options',
					options: sortOptions,
					value: sort,
					onChange: setSort,
				}}
				pagination={{
					currentPage: page,
					totalPages: pageCount,
					totalCount,
					onPageChange: setPage,
				}}
			>
				<BookingLogList
					bookings={data?.bookings}
					isLoading={isLoading && !data}
					error={bookingFeedback.feedback}
					onBookingItemClick={handleBookingItemClick}
				/>
			</PaginatedResourceLayout>
			<BookingDetailPopup
				booking={selectedBooking}
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			/>
		</div>
	)
}

export default UserBookingLogs
