'use client'

import useSWR from 'swr'
import { getBanBookingAction } from '@/domains/admin/api/adminActions'
import type { BanBookingSort } from '@/domains/admin/model/adminTypes'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { BanBooking } from '@/domains/booking/model/bookingTypes'
import { TiDeleteOutline } from '@/shared/ui/icons'
import GenericTableBody from '@/shared/ui/molecules/GenericTableBody'
import { getCurrentJSTDateString } from '@/shared/utils'
import { formatDateJa } from '@/shared/utils/dateFormat'

interface Props {
	currentPage: number
	banBookingsPerPage: number
	sort: BanBookingSort
	onBanBookingItemClick: (banBooking: BanBooking) => void
	onDataLoaded: (totalCount: number) => void
}

const fetchBanBookings = async ([page, perPage, sort, today]: [
	number,
	number,
	BanBookingSort,
	string,
]) => {
	const res = await getBanBookingAction({ page, perPage, sort, today })
	if (res.ok) {
		return res.data
	}
	throw res
}
const BanBookingList = ({
	currentPage,
	banBookingsPerPage,
	sort,
	onBanBookingItemClick,
	onDataLoaded,
}: Props) => {
	const today = getCurrentJSTDateString({})

	const { data, error, isLoading } = useSWR(
		[currentPage, banBookingsPerPage, sort, today],
		fetchBanBookings,
		{
			revalidateOnFocus: false,
			onSuccess: (fetchedData) => {
				if (fetchedData) {
					onDataLoaded(fetchedData.totalCount)
				}
			},
		},
	)

	const banBookings = data?.data

	const renderBanBookingCells = (banBooking: BanBooking) => (
		<>
			<td>
				{banBooking.isDeleted && (
					<div className="badge badge-error text-bg-light">
						<TiDeleteOutline className="inline" />
					</div>
				)}
			</td>
			<td>{formatDateJa(banBooking.startDate)}</td>
			<td>
				{banBooking.endTime
					? BOOKING_TIME_LIST[banBooking.startTime].split('~')[0] +
						'~' +
						BOOKING_TIME_LIST[banBooking.endTime].split('~')[1]
					: BOOKING_TIME_LIST[banBooking.startTime]}
			</td>
			<td>{banBooking.description}</td>
		</>
	)

	return (
		<GenericTableBody
			isLoading={isLoading}
			error={error}
			data={banBookings}
			renderCells={renderBanBookingCells}
			onItemClick={onBanBookingItemClick}
			colSpan={5}
			itemKeyExtractor={(banBookings) =>
				(banBookings.id + Math.random()).toString()
			}
			emptyDataMessage="予約禁止日はありません。"
		/>
	)
}

export default BanBookingList
