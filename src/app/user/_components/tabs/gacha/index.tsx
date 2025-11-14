'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import GachaLogList from '@/app/user/_components/tabs/gacha/GachaLogList'
import GachaPreviewPopup from '@/app/user/_components/tabs/gacha/GachaPreviewPopup'
import { getGachaByUserIdAction } from '@/domains/gacha/api/gachaActions'
import { useGachaPreview } from '@/domains/gacha/hooks/useGachaPreview'
import type { GachaData, GachaSort } from '@/domains/gacha/model/gachaTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import PaginatedResourceLayout from '@/shared/ui/molecules/PaginatedResourceLayout'
import type { Session } from '@/types/session'

type GachaLogsKey = ['gacha-logs', string, number, number, GachaSort]

type GachaLogsResponse = {
	gacha: GachaData[]
	totalCount: number
}

const gachaLogsFetcher = async ([
	,
	userId,
	page,
	perPage,
	sort,
]: GachaLogsKey) => {
	const res = await getGachaByUserIdAction({ userId, page, perPage, sort })
	if (res.ok) {
		return res.data
	}
	throw res
}

const perPageOptions = {
	'15件': 15,
	'25件': 25,
	'35件': 35,
}

const sortOptions: { value: GachaSort; label: string }[] = [
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
	{ value: 'rare', label: 'レア順' },
	{ value: 'notrare', label: 'コモン順' },
]

interface Props {
	readonly session: Session
}

const UserGachaLogs = ({ session }: Props) => {
	const {
		state: { page, perPage, sort, totalCount },
		pageCount,
		setPage,
		setPerPage,
		setSort,
		setTotalCount,
	} = usePagedResource<GachaSort>({
		initialPerPage: 15,
		initialSort: 'new',
	})
	const feedback = useFeedback()

	const {
		isPopupOpen,
		isPopupLoading,
		popupData,
		openGachaPreview,
		closeGachaPreview,
		error: previewError,
	} = useGachaPreview({ session })

	const swrKey: GachaLogsKey = [
		'gacha-logs',
		session.user.id,
		page,
		perPage,
		sort,
	]

	const { data, isLoading } = useSWR<GachaLogsResponse>(
		swrKey,
		gachaLogsFetcher,
		{
			keepPreviousData: true,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: true,
			dedupingInterval: 60 * 1000,
			shouldRetryOnError: false,
			onError(error) {
				feedback.showApiError(error)
			},
		},
	)

	useEffect(() => {
		if (data) {
			setTotalCount(data.totalCount)
			feedback.clearFeedback()
		}
	}, [data, feedback, setTotalCount])

	return (
		<div className="mt-4 flex flex-col justify-center">
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'gacha_logs_per_page',
					options: perPageOptions,
					value: perPage,
					onChange: setPerPage,
				}}
				sort={{
					name: 'gacha_sort_options',
					options: sortOptions,
					value: sort,
					onChange: setSort,
				}}
				pagination={{
					currentPage: page,
					totalPages: pageCount,
					totalCount,
					onPageChange: setPage,
				}}
			>
				<GachaLogList
					gachaItems={data?.gacha}
					logsPerPage={perPage}
					isLoading={isLoading && !data}
					error={feedback.feedback}
					onGachaItemClick={openGachaPreview}
				/>
			</PaginatedResourceLayout>
			{popupData?.gacha && !isPopupLoading && (
				<GachaPreviewPopup
					gachaItem={popupData.gacha}
					count={popupData.totalCount}
					open={isPopupOpen}
					onClose={closeGachaPreview}
				/>
			)}
			{isPopupLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<span className="loading loading-spinner loading-lg"></span>
				</div>
			)}
			{previewError && (
				<div className="mt-2 text-center text-red-500">
					ガチャプレビューの取得に失敗しました。
				</div>
			)}
		</div>
	)
}

export default UserGachaLogs
