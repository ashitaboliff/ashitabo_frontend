'use client'

import { useTransition } from 'react'
import { revalidateBookingDataAction } from './actions'

const RefreshButton = () => {
	const [isPending, startTransition] = useTransition()

	const handleClick = () => {
		startTransition(async () => {
			await revalidateBookingDataAction()
			window.dispatchEvent(new CustomEvent('refresh-booking-data'))
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
