'use client'

import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import { TiDeleteOutline } from '@/shared/ui/icons'
import { formatDateJa } from '@/shared/utils/dateFormat'

interface Props {
	readonly deniedBookings: DeniedBooking[]
	readonly onDeniedBookingItemClick: (deniedBooking: DeniedBooking) => void
}

const DeniedBookingList = ({
	deniedBookings,
	onDeniedBookingItemClick,
}: Props) => {
	if (deniedBookings.length === 0) {
		return (
			<tr>
				<td colSpan={4} className="py-6 text-center text-sm">
					予約禁止日はありません。
				</td>
			</tr>
		)
	}

	return (
		<>
			{deniedBookings.map((deniedBooking) => {
				const startLabel =
					BOOKING_TIME_LIST[deniedBooking.startTime]?.split('~')[0]
				const endLabel =
					typeof deniedBooking.endTime === 'number'
						? BOOKING_TIME_LIST[deniedBooking.endTime]?.split('~')[1]
						: null
				const timeLabel =
					startLabel && endLabel
						? `${startLabel} ~ ${endLabel}`
						: BOOKING_TIME_LIST[deniedBooking.startTime]

				return (
					<tr
						key={deniedBooking.id}
						onClick={() => onDeniedBookingItemClick(deniedBooking)}
						className="cursor-pointer hover:bg-base-200"
					>
						<td>
							{deniedBooking.isDeleted && (
								<div className="badge badge-error text-bg-light">
									<TiDeleteOutline className="inline" />
								</div>
							)}
						</td>
						<td>{formatDateJa(deniedBooking.startDate)}</td>
						<td>{timeLabel}</td>
						<td>{deniedBooking.description}</td>
					</tr>
				)
			})}
		</>
	)
}

export default DeniedBookingList
