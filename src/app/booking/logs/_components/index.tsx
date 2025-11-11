'use client'

import { useState } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { BookingLog } from '@/domains/booking/model/bookingTypes'
import { TiDeleteOutline } from '@/shared/ui/icons'
import GenericTable from '@/shared/ui/molecules/GenericTableBody'
import PaginatedResourceLayout from '@/shared/ui/molecules/PaginatedResourceLayout'
import Popup from '@/shared/ui/molecules/Popup'
import {
	formatDateJaWithWeekday,
	formatDateSlashWithWeekday,
	formatDateTimeSlash,
} from '@/shared/utils/dateFormat'

interface Props {
	readonly bookingLog: BookingLog[]
}

const LOGS_PER_PAGE_OPTIONS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'50件': 50,
	'100件': 100,
}

const headers = [
	{ key: 'status', label: '' },
	{ key: 'date', label: '予約日' },
	{ key: 'time', label: '時間' },
	{ key: 'band', label: 'バンド名' },
	{ key: 'owner', label: '責任者' },
]

const BookingLogs = ({ bookingLog }: Props) => {
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [logsPerPage, setLogsPerPage] = useState(10)
	const [popupData, setPopupData] = useState<BookingLog | undefined>(
		bookingLog?.[0] ?? undefined,
	)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

	const totalLogs = bookingLog?.length ?? 0
	const pageMax = Math.max(1, Math.ceil(totalLogs / logsPerPage) || 1)

	const indexOfLastLog = currentPage * logsPerPage
	const indexOfFirstLog = indexOfLastLog - logsPerPage
	const currentLogs = bookingLog?.slice(indexOfFirstLog, indexOfLastLog) ?? []

	return (
		<div className="container mx-auto px-2 py-8 sm:px-4">
			<div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
				<h1 className="font-bold text-2xl sm:text-3xl">予約ログ</h1>
			</div>

			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'logsPerPage',
					options: LOGS_PER_PAGE_OPTIONS,
					value: logsPerPage,
					onChange: (value) => {
						setLogsPerPage(value)
						setCurrentPage(1)
					},
				}}
				pagination={{
					currentPage,
					totalPages: pageMax,
					totalCount: totalLogs,
					onPageChange: setCurrentPage,
				}}
			>
				<GenericTable<BookingLog>
					headers={headers}
					data={currentLogs}
					isLoading={false}
					emptyDataMessage="予約ログはありません。"
					loadingMessage="予約ログを読み込み中です..."
					onRowClick={(log) => {
						setIsPopupOpen(true)
						setPopupData(log)
					}}
					itemKeyExtractor={(log) => log.id}
					tableClassName="table table-zebra w-full"
					rowClassName="cursor-pointer transition-colors duration-200 hover:bg-base-200"
					colSpan={headers.length}
					renderCells={(log) => (
						<>
							<td className="w-12 whitespace-nowrap p-3 text-center">
								{log.isDeleted ? (
									<div className="tooltip tooltip-error" data-tip="削除済">
										<TiDeleteOutline className="text-error" size={20} />
									</div>
								) : null}
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
						</>
					)}
				/>
			</PaginatedResourceLayout>

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
