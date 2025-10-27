'use client'

import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import Popup from '@/shared/ui/molecules/Popup'
import {
	formatDateJa,
	formatDateTimeJaWithUnits,
} from '@/shared/utils/dateFormat'

interface DeniedBookingDetailDialogProps {
	readonly open: boolean
	readonly onClose: () => void
	readonly deniedBooking: DeniedBooking | null
	readonly onRequestDelete: () => void
}

const DeniedBookingDetailDialog = ({
	open,
	onClose,
	deniedBooking,
	onRequestDelete,
}: DeniedBookingDetailDialogProps) => {
	return (
		<Popup
			id={
				deniedBooking
					? `denied-booking-detail-${deniedBooking.id}`
					: 'denied-booking-detail'
			}
			title="予約禁止日詳細"
			open={open}
			onClose={onClose}
		>
			{deniedBooking && (
				<div className="flex flex-col space-y-2 text-sm">
					{deniedBooking.isDeleted && (
						<div className="text-error font-bold">削除済み</div>
					)}
					<div className="grid grid-cols-2 gap-2">
						<div className="font-bold">日付:</div>
						<div>{formatDateJa(deniedBooking.startDate)}</div>
						<div className="font-bold">時間:</div>
						<div>
							{typeof deniedBooking.endTime === 'number'
								? `${BOOKING_TIME_LIST[deniedBooking.startTime].split('~')[0]} ~ ${
										BOOKING_TIME_LIST[deniedBooking.endTime].split('~')[1]
									}`
								: BOOKING_TIME_LIST[deniedBooking.startTime]}
						</div>
						<div className="font-bold">禁止理由:</div>
						<div>{deniedBooking.description}</div>
						<div className="font-bold">作成日:</div>
						<div>
							{deniedBooking.createdAt
								? formatDateTimeJaWithUnits(deniedBooking.createdAt, {
										hour12: true,
									})
								: ''}
						</div>
						<div className="font-bold">更新日:</div>
						<div>
							{deniedBooking.updatedAt
								? formatDateTimeJaWithUnits(deniedBooking.updatedAt, {
										hour12: true,
									})
								: ''}
						</div>
					</div>
					<div className="flex flex-row gap-x-2 justify-center">
						<button
							type="button"
							className="btn btn-error"
							onClick={onRequestDelete}
						>
							削除
						</button>
						<button type="button" className="btn btn-outline" onClick={onClose}>
							閉じる
						</button>
					</div>
				</div>
			)}
		</Popup>
	)
}

export default DeniedBookingDetailDialog
