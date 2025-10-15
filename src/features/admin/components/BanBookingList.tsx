'use client'

import useSWR from 'swr'
import GenericTableBody from '@/components/ui/molecules/GenericTableBody'
import { getBanBookingAction } from '../action'
import { BanBooking } from '@/features/booking/types'
import { BOOKING_TIME_LIST } from '@/features/booking/constants'
import { TiDeleteOutline } from 'react-icons/ti'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { BanBookingSort } from '../types'
import { getCurrentJSTDateString } from '@/utils'

interface BanBookingListProps {
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
}: BanBookingListProps) => {
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
			<td>
				{format(banBooking.startDate, 'yyyy年MM月dd日', {
					locale: ja,
				})}
			</td>
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
