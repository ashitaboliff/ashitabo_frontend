'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { deleteBanBookingAction, adminRevalidateTagAction } from './action'
import Pagination from '@/components/ui/atoms/Pagination'
import SelectField from '@/components/ui/atoms/SelectField'
import Popup from '@/components/ui/molecules/Popup'
import RadioSortGroup from '@/components/ui/atoms/RadioSortGroup'
import { BanBooking, BookingTime } from '@/features/booking/types'
import { ErrorType } from '@/types/responseTypes'
import { BanBookingSort } from '../types'
import BanBookingList from './BanBookingList'

import { TiDeleteOutline } from 'react-icons/ti'

const BanBookingPage = () => {
	const router = useRouter()
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [banBookingsPerPage, setBanBookingsPerPage] = useState(10)
	const [sort, setSort] = useState<BanBookingSort>('relativeCurrent')
	const [totalCount, setTotalCount] = useState<number>(0)
	const [popupData, setPopupData] = useState<BanBooking | null>()
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const [isdeletePopupOpen, setIsDeletePopupOpen] = useState<boolean>(false)
	const [error, setError] = useState<ErrorType>()
	const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState<boolean>(false)

	const pageMax = Math.ceil(totalCount / banBookingsPerPage) || 1

	const handleSortChange = (newSort: BanBookingSort) => {
		setSort(newSort)
		setCurrentPage(1)
	}

	const handleDataLoaded = (count: number) => {
		setTotalCount(count)
	}

	const onDelete = async (id: string) => {
		const res = await deleteBanBookingAction({
			id,
		})
		if (res.status === 200) {
			setPopupData(null)
			setIsPopupOpen(false)
			setIsDeletePopupOpen(false)
			setIsSuccessPopupOpen(true)
		} else {
			setError(res)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="text-2xl font-bold">予約禁止管理</h1>
			<p className="text-sm text-center">
				このページでは予約禁止日の確認、追加が可能です。
				<br />
				いつか画像認識で一括追加とか出来ると格好いいよなぁ。
				<br />
				んじゃ！
			</p>
			<div className="flex flex-row justify-center space-x-2 w-1/2">
				<button
					className="btn btn-primary btn-outline btn-md"
					onClick={() => router.push('/admin/forbidden/new')}
				>
					予約禁止日を追加
				</button>
				<button
					className="btn btn-outline btn-md"
					onClick={async () => await adminRevalidateTagAction('banBooking')}
				>
					予約禁止日を更新
				</button>
			</div>
			<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
				<div className="flex flex-row items-center ml-auto space-x-2 w-1/2">
					<p className="text-sm whitespace-nowrap">表示件数:</p>
					<SelectField
						value={banBookingsPerPage}
						onChange={(e) => {
							setBanBookingsPerPage(Number(e.target.value))
							setCurrentPage(1)
						}}
						options={{ '10件': 10, '20件': 20, '30件': 30 }}
						name="banBookingsPerPage"
					/>
				</div>
				<div className="flex flex-row gap-x-2">
					<RadioSortGroup
						name="banbooking_sort_options"
						options={[
							{ value: 'relativeCurrent', label: '関連度順' },
							{ value: 'new', label: '新しい順' },
							{ value: 'old', label: '古い順' },
						]}
						currentSort={sort}
						onSortChange={handleSortChange}
						buttonClassName="btn-outline"
					/>
				</div>
				<table className="table table-zebra table-sm w-full justify-center">
					<thead>
						<tr>
							<th></th>
							<th>日付</th>
							<th>時間</th>
							<th>禁止理由</th>
						</tr>
					</thead>
					<tbody>
						<BanBookingList
							currentPage={currentPage}
							banBookingsPerPage={banBookingsPerPage}
							sort={sort}
							onBanBookingItemClick={(booking) => {
								setPopupData(booking)
								setIsPopupOpen(true)
							}}
							onDataLoaded={handleDataLoaded}
						/>
					</tbody>
				</table>
				<Pagination
					currentPage={currentPage}
					totalPages={pageMax}
					onPageChange={(page) => setCurrentPage(page)}
				/>
			</div>
			<Popup
				id="forbidden-booking-popup"
				title="予約禁止日詳細"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				{popupData && (
					<div className="flex flex-col space-y-2 text-sm">
						{popupData.isDeleted && (
							<div className="text-error font-bold">削除済み</div>
						)}
						<div className="grid grid-cols-2 gap-2">
							<div className="font-bold">日付:</div>
							<div>
								{format(popupData.startDate, 'yyyy年MM月dd日', {
									locale: ja,
								})}
							</div>
							<div className="font-bold">時間:</div>
							<div>
								{popupData.endTime
									? BookingTime[popupData.startTime].split('~')[0] +
										' ~ ' +
										BookingTime[popupData.endTime].split('~')[1]
									: BookingTime[popupData.startTime]}
							</div>
							<div className="font-bold">禁止理由:</div>
							<div>{popupData.description}</div>
							<div className="font-bold">作成日:</div>
							<div>
								{popupData.createdAt &&
									format(popupData.createdAt, 'yyyy年MM月dd日hh時mm分ss秒', {
										locale: ja,
									})}
							</div>
							<div className="font-bold">更新日:</div>
							<div>
								{popupData.updatedAt &&
									format(popupData.updatedAt, 'yyyy年MM月dd日hh時mm分ss秒', {
										locale: ja,
									})}
							</div>
						</div>
						<div className="flex flex-row gap-x-2 justify-center">
							<button
								className="btn btn-error"
								onClick={() => {
									setIsDeletePopupOpen(true)
									setIsPopupOpen(false)
								}}
							>
								削除
							</button>
							<button
								className="btn btn-outline"
								onClick={() => setIsPopupOpen(false)}
							>
								閉じる
							</button>
						</div>
					</div>
				)}
			</Popup>
			<Popup
				id="forbidden-booking-delete-popup"
				title="予約禁止日削除"
				open={isdeletePopupOpen}
				onClose={() => setIsDeletePopupOpen(false)}
			>
				<div className="flex flex-col items-center space-y-2 text-sm">
					<p className="text-center">本当に削除しますか？</p>
					<div className="flex flex-row gap-x-2">
						<button
							className="btn btn-error"
							onClick={async () => {
								if (popupData) {
									onDelete(popupData.id)
								}
							}}
						>
							はい
						</button>
						<button
							className="btn btn-outline"
							onClick={() => setIsDeletePopupOpen(false)}
						>
							閉じる
						</button>
					</div>
					{error && (
						<p className="text-error text-center">
							エラーコード{error.status}:{error.response}
						</p>
					)}
				</div>
			</Popup>
			<Popup
				id="forbidden-booking-delete-success-popup"
				title="削除完了"
				open={isSuccessPopupOpen}
				onClose={() => setIsSuccessPopupOpen(false)}
			>
				<div className="flex flex-col items-center space-y-2 text-sm">
					<p className="text-center">削除が完了しました</p>
					<button
						className="btn btn-primary"
						onClick={() => setIsSuccessPopupOpen(false)}
					>
						閉じる
					</button>
				</div>
			</Popup>
			<button className="btn btn-outline" onClick={() => router.push('/admin')}>
				戻る
			</button>
		</div>
	)
}

export default BanBookingPage
