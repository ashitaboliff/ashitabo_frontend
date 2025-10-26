'use client'

import { useEffect, useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'
import AddCalendarPopup from '@/shared/ui/molecules/AddCalendarPopup'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateJa, formatDateTimeJa } from '@/shared/utils/dateFormat'
import type { Session } from '@/types/session'
import BookingLogList from './BookingLogList'

interface Props {
	readonly session: Session
	readonly initialData?: { bookings: Booking[]; totalCount: number }
}

const UserBookingLogs = ({ session, initialData }: Props) => {
	const {
		state: { page, perPage, sort, totalCount },
		pageCount,
		setPage,
		setPerPage,
		setSort,
		setTotalCount,
	} = usePagedResource<'new' | 'old'>({
		initialPerPage: 10,
		initialSort: 'new',
	})
	const [popupData, setPopupData] = useState<Booking>()
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const [isAddCalendarPopupOpen, setIsAddCalendarPopupOpen] =
		useState<boolean>(false)

	const userId = session.user.id

	useEffect(() => {
		if (initialData && totalCount === 0) {
			setTotalCount(initialData.totalCount)
		}
	}, [initialData, setTotalCount, totalCount])

	const handleBookingItemClick = (booking: Booking) => {
		setPopupData(booking)
		setIsPopupOpen(true)
	}

	return (
		<div className="flex flex-col justify-center mt-4">
			{' '}
			<div className="flex flex-col">
				<div className="flex flex-row items-center ml-auto space-x-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
					<p className="text-sm whitespace-nowrap">表示件数:</p>
					<SelectField<number>
						name="logsPerPage"
						options={{ '10件': 10, '20件': 20, '30件': 30 }}
						value={perPage}
						onChange={(event) => {
							setPerPage(Number(event.target.value))
						}}
					/>
				</div>
				<div className="flex flex-row gap-x-2 my-2">
					{' '}
					<RadioSortGroup
						name="booking_sort_options"
						options={[
							{ value: 'new', label: '新しい順' },
							{ value: 'old', label: '古い順' },
						]}
						currentSort={sort}
						onSortChange={setSort}
					/>
				</div>
				<div className="overflow-x-auto">
					<table className="table table-zebra table-sm w-full justify-center my-2">
						<thead>
							<tr>
								<th className="font-bold">予約日</th>
								<th className="font-bold">予約時間</th>
								<th className="font-bold">バンド名</th>
								<th className="font-bold">登録者名</th>
							</tr>
						</thead>
						<tbody>
							<BookingLogList
								userId={userId}
								currentPage={page}
								logsPerPage={perPage}
								sort={sort}
								onBookingItemClick={handleBookingItemClick}
								onDataLoaded={setTotalCount}
								initialData={page === 1 ? initialData : undefined}
							/>
						</tbody>
					</table>
				</div>
				{pageCount > 1 && totalCount > 0 && (
					<div className="mt-4 mx-auto">
						<Pagination
							currentPage={page}
							totalPages={pageCount}
							onPageChange={setPage}
						/>
					</div>
				)}
			</div>
			{popupData && (
				<>
					<Popup
						id={`logs-popup-${popupData.id}`}
						open={isPopupOpen}
						onClose={() => setIsPopupOpen(false)}
						title="予約詳細"
					>
						<div className="flex flex-col space-y-2 text-sm">
							<div className="grid grid-cols-2 gap-2">
								<div className="font-bold">予約ID:</div>
								<div>{popupData.id}</div>
								<div className="font-bold">予約日:</div>
								<div>{formatDateJa(popupData.bookingDate)}</div>
								<div className="font-bold">予約時間:</div>
								<div>{BOOKING_TIME_LIST[popupData.bookingTime]}</div>
								<div className="font-bold">バンド名:</div>
								<div>{popupData.name}</div>
								<div className="font-bold">登録者名:</div>{' '}
								<div>{popupData.registName}</div>
								<div className="font-bold">作成日:</div>
								<div>{formatDateTimeJa(popupData.createdAt)}</div>
								<div className="font-bold">更新日:</div>
								<div>{formatDateTimeJa(popupData.updatedAt)}</div>
							</div>
							<div className="flex justify-center space-x-2 mt-4">
								{' '}
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
									onClick={() => {
										setIsPopupOpen(false)
									}}
								>
									閉じる
								</button>
							</div>
						</div>
					</Popup>
					<AddCalendarPopup
						bookingDetail={popupData}
						isPopupOpen={isAddCalendarPopupOpen}
						setIsPopupOpen={setIsAddCalendarPopupOpen}
					/>
				</>
			)}
		</div>
	)
}

export default UserBookingLogs
