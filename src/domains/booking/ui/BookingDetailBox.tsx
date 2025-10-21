import type { ReactNode } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import { formatDateJaWithWeekday } from '@/shared/utils/dateFormat'

interface BookingDetailItem {
	label: string
	value: string | ReactNode
}

interface Props {
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
}

const BookingDetailBox = ({
	bookingDate,
	bookingTime,
	registName,
	name,
}: Props) => {
	const data: BookingDetailItem[] = [
		{
			label: '日付',
			value: formatDateJaWithWeekday(bookingDate),
		},
		{
			label: '時間',
			value: BOOKING_TIME_LIST[bookingTime],
		},
		{
			label: 'バンド名',
			value: registName,
		},
		{
			label: '責任者',
			value: name,
		},
	]

	return (
		<div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto my-4">
			<div className="card-body">
				<h2 className="card-title justify-center text-2xl">予約詳細</h2>
				<div className="divider my-1"></div>
				<dl className="space-y-2">
					{data.map((item) => (
						<div
							key={item.label}
							className="grid grid-cols-1 sm:grid-cols-3 gap-1 items-center py-2 border-b border-base-300 last:border-b-0"
						>
							<dt className="font-semibold text-base-content sm:col-span-1">
								{item.label}
							</dt>
							<dd className="text-base-content sm:col-span-2 break-words">
								{item.value}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</div>
	)
}

export default BookingDetailBox
