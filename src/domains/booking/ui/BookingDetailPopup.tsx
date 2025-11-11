'use client'

import { useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import AddCalendarPopup from '@/shared/ui/molecules/AddCalendarPopup'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateJa, formatDateTimeJa } from '@/shared/utils/dateFormat'

interface BookingDetailPopupProps {
	booking: Booking | null
	open: boolean
	onClose: () => void
}

const BookingDetailPopup = ({
	booking,
	open,
	onClose,
}: BookingDetailPopupProps) => {
	const [isAddCalendarPopupOpen, setIsAddCalendarPopupOpen] = useState(false)

	if (!booking) {
		return null
	}

	return (
		<>
			<Popup
				id={`booking-detail-${booking.id}`}
				open={open}
				onClose={onClose}
				title="予約詳細"
			>
				<div className="flex flex-col space-y-2 text-sm">
					<div className="grid grid-cols-2 gap-2">
						<div className="font-bold">予約日:</div>
						<div>{formatDateJa(booking.bookingDate)}</div>
						<div className="font-bold">予約時間:</div>
						<div>{BOOKING_TIME_LIST[booking.bookingTime]}</div>
						<div className="font-bold">バンド名:</div>
						<div>{booking.name}</div>
						<div className="font-bold">登録者名:</div>
						<div>{booking.registName}</div>
						<div className="font-bold">作成日:</div>
						<div>{formatDateTimeJa(booking.createdAt)}</div>
						<div className="font-bold">更新日:</div>
						<div>{formatDateTimeJa(booking.updatedAt)}</div>
					</div>
					<div className="mt-4 flex justify-center space-x-2">
						<button
							type="button"
							className="btn btn-primary btn-sm"
							onClick={() => setIsAddCalendarPopupOpen(true)}
						>
							カレンダーに追加
						</button>
						<button
							type="button"
							className="btn btn-outline btn-sm"
							onClick={onClose}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
			<AddCalendarPopup
				bookingDetail={booking}
				isPopupOpen={isAddCalendarPopupOpen}
				setIsPopupOpen={setIsAddCalendarPopupOpen}
			/>
		</>
	)
}

export default BookingDetailPopup
