'use client'

import { useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { BookingLog } from '@/domains/booking/model/bookingTypes'
import Pagination from '@/shared/ui/atoms/Pagination'
import SelectField from '@/shared/ui/atoms/SelectField'
import { TiDeleteOutline } from '@/shared/ui/icons'
import Popup from '@/shared/ui/molecules/Popup'
import {
	formatDateJaWithWeekday,
	formatDateSlashWithWeekday,
	formatDateTimeSlash,
} from '@/shared/utils/dateFormat'

interface Props {
	readonly bookingLog: BookingLog[]
}

const BookingLogs = ({ bookingLog }: Props) => {
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [logsPerPage, setLogsPerPage] = useState(10)
	const [popupData, setPopupData] = useState<BookingLog | undefined>(
		bookingLog?.[0] ?? undefined,
	)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

	const totalLogs = bookingLog?.length ?? 0
	const pageMax = Math.ceil(totalLogs / logsPerPage)

	const indexOfLastLog = currentPage * logsPerPage
	const indexOfFirstLog = indexOfLastLog - logsPerPage
	const currentLogs = bookingLog?.slice(indexOfFirstLog, indexOfLastLog) ?? []

	return (
		<div className="container mx-auto px-2 py-8 sm:px-4">
			<div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
				<h1 className="font-bold text-2xl sm:text-3xl">予約ログ</h1>
				<div className="flex w-full xs:flex-row flex-col items-center gap-2 sm:w-auto sm:gap-4">
					<div className="flex w-full xs:w-auto items-center gap-2">
						<span className="whitespace-nowrap text-sm">表示件数:</span>
						<SelectField
							value={logsPerPage}
							onChange={(e) => {
								setLogsPerPage(Number(e.target.value))
								setCurrentPage(1)
							}}
							options={{ '10件': 10, '20件': 20, '50件': 50, '100件': 100 }}
							name="logsPerPage"
							className="select-sm w-full xs:w-auto"
						/>
					</div>
				</div>
			</div>

			{currentLogs.length > 0 ? (
				<div className="overflow-x-auto rounded-lg shadow-md">
					<table className="table-zebra table w-full">
						<thead className="bg-base-200">
							<tr>
								<th className="w-10 p-3 text-left font-semibold text-xs-custom tracking-wider sm:w-12 sm:text-sm"></th>
								<th className="p-3 text-left font-semibold text-xs-custom tracking-wider sm:text-sm">
									予約日
								</th>
								<th className="hidden p-3 text-left font-semibold text-xs-custom tracking-wider sm:table-cell sm:text-sm">
									時間
								</th>
								<th className="p-3 text-left font-semibold text-xs-custom tracking-wider sm:text-sm">
									バンド名
								</th>
								<th className="hidden p-3 text-left font-semibold text-xs-custom tracking-wider sm:text-sm md:table-cell">
									責任者
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-base-300 bg-base-100">
							{currentLogs.map((log) => (
								<tr
									key={log.id}
									className="cursor-pointer transition-colors duration-200 hover:bg-base-200"
									onClick={() => {
										setIsPopupOpen(true)
										setPopupData(log)
									}}
								>
									<td className="whitespace-nowrap p-3 text-center">
										{log.isDeleted && (
											<div className="tooltip tooltip-error" data-tip="削除済">
												<TiDeleteOutline className="text-error" size={20} />
											</div>
										)}
									</td>
									<td className="whitespace-nowrap p-3 text-xs-custom sm:text-sm">
										{formatDateSlashWithWeekday(log.bookingDate)}
									</td>
									<td className="hidden whitespace-nowrap p-3 text-xs-custom sm:table-cell sm:text-sm">
										{BOOKING_TIME_LIST[log.bookingTime]}
									</td>
									<td className="break-words p-3 text-xs-custom sm:text-sm">
										{log.registName}
									</td>
									<td className="hidden whitespace-nowrap p-3 text-xs-custom sm:text-sm md:table-cell">
										{log.name}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="card bg-base-100 py-10 text-center shadow">
					<div className="card-body">
						<p className="text-base-content/70 text-xl">
							予約ログはありません。
						</p>
					</div>
				</div>
			)}

			{pageMax > 1 && (
				<div className="mt-8 flex justify-center">
					<Pagination
						currentPage={currentPage}
						totalPages={pageMax}
						onPageChange={(page) => setCurrentPage(page)}
					/>
				</div>
			)}

			<Popup
				id={`popup-${popupData?.id}`}
				title="予約詳細"
				maxWidth="lg"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<div className="p-4 sm:p-6">
					<dl className="space-y-2 text-sm sm:text-base">
						{[
							{ label: '予約ID', value: popupData?.id, break: true },
							{
								label: '予約日',
								value: popupData
									? formatDateJaWithWeekday(popupData.bookingDate, {
											space: true,
										})
									: '',
							},
							{
								label: '予約時間',
								value: popupData && BOOKING_TIME_LIST[popupData.bookingTime],
							},
							{ label: 'バンド名', value: popupData?.registName, break: true },
							{ label: '責任者', value: popupData?.name, break: true },
							{
								label: '作成日時',
								value: popupData
									? formatDateTimeSlash(popupData.createdAt)
									: '',
							},
							{
								label: '更新日時',
								value: popupData
									? formatDateTimeSlash(popupData.updatedAt)
									: '',
							},
						].map((item) =>
							item.value ? (
								<div
									key={item.label}
									className="grid grid-cols-1 gap-1 border-base-300 border-b py-2 last:border-b-0 sm:grid-cols-3"
								>
									<dt className="font-semibold text-base-content/80 sm:col-span-1">
										{item.label}:
									</dt>
									<dd
										className={`sm:col-span-2 ${item.break ? 'break-all' : 'whitespace-nowrap'}`}
									>
										{item.value}
									</dd>
								</div>
							) : null,
						)}
					</dl>
					<div className="mt-6 flex justify-end">
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => {
								setIsPopupOpen(false)
							}}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
		</div>
	)
}

export default BookingLogs
