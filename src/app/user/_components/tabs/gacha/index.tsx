'use client'

import { type ChangeEvent, useEffect } from 'react'
import GachaLogList from '@/app/user/_components/tabs/gacha/GachaLogList'
import GachaPreviewPopup from '@/app/user/_components/tabs/gacha/GachaPreviewPopup'
import { useGachaPreview } from '@/domains/gacha/hooks/useGachaPreview'
import type { GachaData, GachaSort } from '@/domains/gacha/model/gachaTypes'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'
import type { Session } from '@/types/session'

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
		<div className="mt-4 flex flex-col justify-center">
			<div className="flex flex-col gap-y-2">
				<div className="ml-auto flex w-full flex-row items-center space-x-2 sm:w-1/2 md:w-1/3 lg:w-1/4">
					<p className="whitespace-nowrap text-sm">表示件数:</p>
					<SelectField<number>
						name="gachaLogsPerPage"
						options={{ '15件': 15, '25件': 25, '35件': 35 }}
						value={perPage}
						onChange={handleLogsPerPageChange}
					/>
				</div>
				<div className="my-2 flex flex-row gap-x-2">
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
					<div className="mx-auto mt-4">
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
