'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useSWRConfig } from 'swr'
import { deleteDeniedBookingAction } from '@/domains/admin/api/deniedBookingActions'
import type { DeniedBookingSort } from '@/domains/admin/model/adminTypes'
import {
	createDeniedBookingQueryOptions,
	type DeniedBookingQuery,
} from '@/domains/admin/query/deniedBookingQuery'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import { mutateAllBookingCalendars } from '@/domains/booking/utils/calendarCache'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { useQueryState } from '@/shared/hooks/useQueryState'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import FlashMessage, {
	type NoticeType,
} from '@/shared/ui/molecules/FlashMessage'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/response'
import DeniedBookingDeleteDialog from './DeniedBookingDeleteDialog'
import DeniedBookingDetailDialog from './DeniedBookingDetailDialog'
import DeniedBookingList from './DeniedBookingList'

const PER_PAGE_OPTIONS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

const SORT_OPTIONS: Array<{ value: DeniedBookingSort; label: string }> = [
	{ value: 'relativeCurrent', label: '関連度順' },
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
]

type Props = {
	readonly deniedBookings: DeniedBooking[]
	readonly totalCount: number
	readonly defaultQuery: DeniedBookingQuery
	readonly initialQuery: DeniedBookingQuery
	readonly extraSearchParams?: string
	readonly initialError?: ApiError
	type?: NoticeType
	message?: string
}

const DeniedBookingPage = ({
	deniedBookings,
	totalCount,
	defaultQuery,
	initialQuery,
	extraSearchParams,
	initialError,
	type,
	message,
}: Props) => {
	const router = useRouter()
	const globalFeedback = useFeedback()
	const actionFeedback = useFeedback()
	const [selectedBooking, setSelectedBooking] = useState<DeniedBooking | null>(
		null,
	)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isActionLoading, setIsActionLoading] = useState(false)
	const { mutate } = useSWRConfig()

	const { query, updateQuery, isPending } = useQueryState<DeniedBookingQuery>({
		queryOptions: createDeniedBookingQueryOptions(defaultQuery),
		initialQuery,
		extraSearchParams,
	})

	const pageCount = useMemo(
		() => Math.max(1, Math.ceil(totalCount / query.perPage) || 1),
		[totalCount, query.perPage],
	)

	const handleSelectBooking = useCallback(
		(booking: DeniedBooking) => {
			actionFeedback.clearFeedback()
			setSelectedBooking(booking)
			setIsDetailOpen(true)
		},
		[actionFeedback],
	)

	const handleRequestDelete = useCallback(() => {
		if (!selectedBooking) return
		actionFeedback.clearFeedback()
		globalFeedback.clearFeedback()
		setIsDetailOpen(false)
		setIsDeleteOpen(true)
	}, [actionFeedback, selectedBooking, globalFeedback])

	const handleDelete = useCallback(async () => {
		if (!selectedBooking) return

		setIsActionLoading(true)
		actionFeedback.clearFeedback()
		globalFeedback.clearFeedback()
		try {
			const res = await deleteDeniedBookingAction({
				id: selectedBooking.id,
				date: selectedBooking.startDate,
			})
			if (res.ok) {
				await mutateAllBookingCalendars(mutate)
				setIsDeleteOpen(false)
				setSelectedBooking(null)
				globalFeedback.showSuccess('予約禁止日を削除しました。')
				router.refresh()
			} else {
				actionFeedback.showApiError(res)
			}
		} catch (error) {
			logError('deleteDeniedBookingAction failed', error)
			actionFeedback.showError(
				'予約禁止日の削除中に予期せぬエラーが発生しました。',
			)
		} finally {
			setIsActionLoading(false)
		}
	}, [actionFeedback, router, selectedBooking, globalFeedback, mutate])

	const handleCloseDelete = useCallback(() => {
		setIsDeleteOpen(false)
		actionFeedback.clearFeedback()
	}, [actionFeedback])

	return (
		<>
			{type && message && <FlashMessage type={type}>{message}</FlashMessage>}
			<div className="flex flex-col items-center justify-center gap-y-3">
				<div className="flex flex-col items-center gap-y-2 text-center">
					<h1 className="font-bold text-2xl">予約禁止管理</h1>
					<p className="text-sm">
						このページでは予約禁止日の確認、追加が可能です。
						<br />
						いつか画像認識で一括追加とか出来ると格好いいよなぁ。
						<br />
						んじゃ！
					</p>
				</div>
				<button
					type="button"
					className="btn btn-primary btn-outline btn-md"
					onClick={() => router.push('/admin/denied/new')}
				>
					予約禁止日を追加
				</button>
				<FeedbackMessage source={initialError} defaultVariant="error" />
				<FeedbackMessage source={globalFeedback.feedback} />
				<div className="flex w-full flex-col gap-y-3">
					<div className="flex flex-wrap items-center justify-end gap-2">
						<p className="whitespace-nowrap text-sm">表示件数:</p>
						<SelectField
							value={query.perPage}
							onChange={(event) =>
								updateQuery({
									perPage: Number(event.target.value),
									page: defaultQuery.page,
								})
							}
							options={PER_PAGE_OPTIONS}
							name="deniedBookingsPerPage"
							disabled={isPending}
						/>
					</div>
					<div className="flex flex-row gap-x-2">
						<RadioSortGroup
							name="deniedbooking_sort_options"
							options={SORT_OPTIONS}
							currentSort={query.sort}
							onSortChange={(sort) => updateQuery({ sort })}
						/>
					</div>
					<div className="w-full overflow-x-auto">
						<table className="table-zebra table-sm table w-full">
							<thead>
								<tr>
									<th></th>
									<th>日付</th>
									<th>時間</th>
									<th>禁止理由</th>
								</tr>
							</thead>
							<tbody>
								<DeniedBookingList
									deniedBookings={deniedBookings}
									onDeniedBookingItemClick={handleSelectBooking}
								/>
							</tbody>
						</table>
					</div>
				</div>
				<Pagination
					currentPage={query.page}
					totalPages={pageCount}
					onPageChange={(page) => updateQuery({ page })}
				/>
				<button
					type="button"
					className="btn btn-outline"
					onClick={() => router.push('/admin')}
					disabled={isPending}
				>
					戻る
				</button>
			</div>

			<DeniedBookingDetailDialog
				open={isDetailOpen}
				onClose={() => setIsDetailOpen(false)}
				deniedBooking={selectedBooking}
				onRequestDelete={handleRequestDelete}
			/>

			<DeniedBookingDeleteDialog
				open={isDeleteOpen}
				onClose={handleCloseDelete}
				deniedBooking={selectedBooking}
				actionLoading={isActionLoading}
				onConfirm={handleDelete}
				feedbackSource={actionFeedback.feedback}
				onClearFeedback={actionFeedback.clearFeedback}
			/>
		</>
	)
}

export default DeniedBookingPage
