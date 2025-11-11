'use client'

import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import { TiDeleteOutline } from '@/shared/ui/icons'
import type { MessageSource } from '@/shared/ui/molecules/FeedbackMessage'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import { formatDateJa } from '@/shared/utils/dateFormat'

interface Props {
	readonly deniedBookings: DeniedBooking[]
	readonly onDeniedBookingItemClick: (deniedBooking: DeniedBooking) => void
	readonly isLoading: boolean
	readonly error: MessageSource
}

const headers = [
	{ key: 'status', label: '' },
	{ key: 'date', label: '日付' },
	{ key: 'time', label: '時間' },
	{ key: 'reason', label: '禁止理由' },
]

const DeniedBookingList = ({
	deniedBookings,
	onDeniedBookingItemClick,
	isLoading,
	error,
}: Props) => {
	return (
		<GenericTable<DeniedBooking>
			headers={headers}
			data={deniedBookings}
			isLoading={isLoading}
			error={error}
			onRowClick={onDeniedBookingItemClick}
			loadingMessage="予約禁止日を読み込み中です..."
			emptyDataMessage="予約禁止日はありません。"
			itemKeyExtractor={(booking) => booking.id}
			rowClassName="align-middle"
			renderCells={(booking) => {
				const startLabel = BOOKING_TIME_LIST[booking.startTime]?.split('~')[0]
				const endLabel =
					typeof booking.endTime === 'number'
						? BOOKING_TIME_LIST[booking.endTime]?.split('~')[1]
						: null
				const timeLabel =
					startLabel && endLabel
						? `${startLabel} ~ ${endLabel}`
						: BOOKING_TIME_LIST[booking.startTime]

				return (
					<>
						<td className="w-14">
							{booking.isDeleted ? (
								<span className="badge badge-error">
									<TiDeleteOutline className="inline" />
								</span>
							) : null}
						</td>
						<td>{formatDateJa(booking.startDate)}</td>
						<td>{timeLabel}</td>
						<td className="max-w-[300px] break-words">{booking.description}</td>
					</>
				)
			}}
		/>
	)
}

export default DeniedBookingList
