'use client'

import { gkktt } from '@/lib/fonts'
import { useSession } from '@/features/auth/hooks/useSession'
import { YoutubeDetail, YoutubeSearchQuery } from '@/features/video/types'
import { ApiError } from '@/types/responseTypes'
import SelectField from '@/components/ui/atoms/SelectField'
import Pagination from '@/components/ui/atoms/Pagination'
import VideoItem from '@/features/video/components/VideoItem'
import VideoSearchForm from '@/features/video/components/VideoSearchForm'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import { useYoutubeSearchQuery } from '@/features/video/hooks/useYoutubeSearchQuery'

const defaultSearchQuery: YoutubeSearchQuery = {
	liveOrBand: 'band',
	bandName: '',
	liveName: '',
	tag: [],
	tagSearchMode: 'or', // デフォルトはOR検索
	sort: 'new',
	page: 1,
	videoPerPage: 15,
}

interface VideoListPageProps {
	initialYoutubeDetails: YoutubeDetail[]
	initialPageMax: number
	initialError?: ApiError
}

const VideoListPage = ({
	initialYoutubeDetails,
	initialPageMax,
	initialError,
}: VideoListPageProps) => {
	const { data: session } = useSession() // session を取得

	const {
		query: currentQuery,
		isSearching,
		updateQuery,
		isPending,
	} = useYoutubeSearchQuery(defaultSearchQuery)

	const handleSearch = (searchQuery: Partial<YoutubeSearchQuery>) => {
		updateQuery({ ...searchQuery, page: 1 })
	}

	const pageMax = initialPageMax
	const youtubeDetails = initialYoutubeDetails
	const error = initialError
	const isLoading = isPending

	return (
		<div className="container mx-auto px-2 sm:px-4 py-6">
			<div
				className={`text-3xl sm:text-4xl font-bold ${gkktt.className} text-center mb-6`}
			>
				過去ライブ映像
			</div>
			<VideoSearchForm
				defaultQuery={defaultSearchQuery}
				isSearching={isSearching}
				onSearch={handleSearch}
			/>
			<div className="flex flex-col items-center justify-center gap-y-4">
				<div className="flex flex-row items-center justify-end w-full gap-2 sm:gap-4 mb-2 px-1">
					<div className="flex items-center space-x-2">
						<p className="text-xs-custom sm:text-sm whitespace-nowrap">
							表示件数:
						</p>
						<SelectField
							value={currentQuery.videoPerPage}
							onChange={(e) =>
								updateQuery({
									videoPerPage: Number(e.target.value),
									page: 1,
								})
							}
							options={{ '15件': 15, '20件': 20, '30件': 30 }}
							name="videoPerPage"
						/>
					</div>
					<div className="flex items-center space-x-2">
						<p className="text-xs-custom sm:text-sm whitespace-nowrap">
							並び順:
						</p>
						<div className="flex flex-row gap-x-1 sm:gap-x-2">
							<input
								type="radio"
								name="sort"
								value="new"
								checked={currentQuery.sort === 'new'}
								className="btn btn-tetiary btn-xs sm:btn-sm"
								aria-label="新しい順"
								onChange={() => updateQuery({ sort: 'new' })}
							/>
							<input
								type="radio"
								name="sort"
								value="old"
								checked={currentQuery.sort === 'old'}
								className="btn btn-tetiary btn-xs sm:btn-sm"
								aria-label="古い順"
								onChange={() => updateQuery({ sort: 'old' })}
							/>
						</div>
					</div>
				</div>

				<ErrorMessage error={error} />

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
						{[...Array(currentQuery.videoPerPage)].map((_, i) => (
							<div
								key={i}
								className="flex flex-col items-center p-4 border rounded-lg shadow-sm w-full"
							>
								<div className="skeleton h-48 w-full mb-2"></div>
								<div className="skeleton h-6 w-3/4 mb-1"></div>
								<div className="skeleton h-5 w-1/2 mb-1"></div>
								<div className="skeleton h-5 w-1/3"></div>
							</div>
						))}
					</div>
				) : youtubeDetails.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
						{youtubeDetails.map((youtubeDetail) => (
							<VideoItem
								session={session}
								key={youtubeDetail.id}
								youtubeDetail={youtubeDetail}
								liveOrBand={currentQuery.liveOrBand}
							/>
						))}
					</div>
				) : (
					<div className="text-base-content w-full text-center py-10">
						該当する動画がありません
					</div>
				)}
				{pageMax > 1 && (
					<Pagination
						currentPage={currentQuery.page}
						totalPages={pageMax}
						onPageChange={(page) => updateQuery({ page })}
					/>
				)}
			</div>
		</div>
	)
}

export default VideoListPage
