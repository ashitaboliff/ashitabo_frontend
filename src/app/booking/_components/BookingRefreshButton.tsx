'use client'

import { useTransition } from 'react'
import { useSWRConfig } from 'swr'
import { mutateAllBookingCalendars } from '@/domains/booking/utils/calendarCache'

const BookingRefreshButton = () => {
	const [isPending, startTransition] = useTransition()
	const { mutate } = useSWRConfig()

	const handleClick = () => {
		startTransition(async () => {
			await mutateAllBookingCalendars(mutate)
		})
	}

	return (
		<button
			type="button"
			className="btn btn-info text-white"
			onClick={handleClick}
			disabled={isPending}
		>
			{isPending ? (
				<span className="loading loading-spinner"></span>
			) : (
				'コマ表を更新'
			)}
		</button>
	)
}

export default BookingRefreshButton
