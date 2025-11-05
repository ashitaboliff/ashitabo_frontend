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
		<div className="card mx-auto my-4 w-full max-w-md bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title justify-center text-2xl">予約詳細</h2>
				<div className="divider my-1"></div>
				<dl className="space-y-2">
					{data.map((item) => (
						<div
							key={item.label}
							className="grid grid-cols-1 items-center gap-1 border-base-300 border-b py-2 last:border-b-0 sm:grid-cols-3"
						>
							<dt className="font-semibold text-base-content sm:col-span-1">
								{item.label}
							</dt>
							<dd className="break-words text-base-content sm:col-span-2">
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
