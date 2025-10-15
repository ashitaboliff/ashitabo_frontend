'use client'

import { useTransition } from 'react'
import { useSWRConfig } from 'swr'
import { mutateAllBookingCalendars } from '@/utils/calendarCache'

const RefreshButton = () => {
	const [isPending, startTransition] = useTransition()
	const { mutate } = useSWRConfig()

	const handleClick = () => {
		startTransition(async () => {
			await mutateAllBookingCalendars(mutate)
		})
	}

	return (
		<button
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

export default RefreshButton
