'use client'

import { type ChangeEvent, useEffect } from 'react'
import { useGachaPreview } from '@/domains/gacha/hooks/useGachaPreview'
import type { GachaData, GachaSort } from '@/domains/gacha/model/gachaTypes'
import GachaPreviewPopup from '@/domains/gacha/ui/GachaPreviewPopup'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'
import type { Session } from '@/types/session'
import GachaLogList from './GachaLogList'

interface Props {
	readonly session: Session
	readonly initialData?: { gacha: GachaData[]; totalCount: number }
}

const UserGachaLogs = ({ session, initialData }: Props) => {
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

	const {
		isPopupOpen,
		isPopupLoading,
		popupData,
		openGachaPreview,
		closeGachaPreview,
		error: previewError,
	} = useGachaPreview({ session })

	const userId = session.user.id

	useEffect(() => {
		if (initialData && totalCount === 0) {
			setTotalCount(initialData.totalCount)
		}
	}, [initialData, setTotalCount, totalCount])

	const handleLogsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setPerPage(Number(event.target.value))
	}

	return (
		<div className="flex flex-col justify-center mt-4">
			<div className="flex flex-col gap-y-2">
				<div className="flex flex-row items-center ml-auto space-x-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
					<p className="text-sm whitespace-nowrap">表示件数:</p>
					<SelectField<number>
						name="gachaLogsPerPage"
						options={{ '15件': 15, '25件': 25, '35件': 35 }}
						value={perPage}
						onChange={handleLogsPerPageChange}
					/>
				</div>
				<div className="flex flex-row gap-x-2 my-2">
					<RadioSortGroup
						name="gacha_sort_options"
						options={[
							{ value: 'new', label: '新しい順' },
							{ value: 'old', label: '古い順' },
							{ value: 'rare', label: 'レア順' },
							{ value: 'notrare', label: 'コモン順' },
						]}
						currentSort={sort}
						onSortChange={setSort}
						buttonClassName="btn-outline"
					/>
				</div>
				<GachaLogList
					userId={userId}
					currentPage={page}
					logsPerPage={perPage}
					sort={sort}
					onGachaItemClick={openGachaPreview}
					onDataLoaded={setTotalCount}
					initialData={page === 1 ? initialData : undefined}
				/>
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
			{popupData?.gacha && !isPopupLoading && (
				<GachaPreviewPopup
					gachaItem={popupData.gacha}
					count={popupData.totalCount}
					open={isPopupOpen}
					onClose={closeGachaPreview}
				/>
			)}
			{isPopupLoading && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<span className="loading loading-spinner loading-lg"></span>
				</div>
			)}
			{previewError && (
				<div className="text-red-500 text-center mt-2">
					ガチャプレビューの取得に失敗しました。
				</div>
			)}
		</div>
	)
}

export default UserGachaLogs
