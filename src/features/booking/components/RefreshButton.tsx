'use client'

import { useTransition } from 'react'
import { useSWRConfig } from 'swr'
import { BOOKING_CALENDAR_SWR_KEY } from '@/features/booking/constants'

const RefreshButton = () => {
	const [isPending, startTransition] = useTransition()
	const { mutate } = useSWRConfig()

	const handleClick = () => {
		startTransition(async () => {
			await mutate(
				(key) => Array.isArray(key) && key[0] === BOOKING_CALENDAR_SWR_KEY,
				undefined,
				{ revalidate: true },
			)
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
