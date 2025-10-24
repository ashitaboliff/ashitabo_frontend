'use client'

import { useMemo } from 'react'
import { useYoutubeSearchQuery } from '@/domains/video/hooks/useYoutubeSearchQuery'
import type {
	PlaylistDoc,
	Video,
	YoutubeSearchQuery,
} from '@/domains/video/model/videoTypes'
import { gkktt } from '@/shared/lib/fonts'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import type { ApiError } from '@/types/responseTypes'
import VideoItem from './VideoItem'
import VideoSearchForm from './VideoSearchForm'

const defaultSearchQuery: YoutubeSearchQuery = {
	liveOrBand: 'band',
	bandName: '',
	liveName: '',
	sort: 'new',
	page: 1,
	videoPerPage: 15,
}

interface Props {
	initialYoutubeDetails: Video[] | PlaylistDoc[]
	initialPageMax: number
	initialError?: ApiError
}

const VideoListPage = ({
	initialYoutubeDetails,
	initialPageMax,
	initialError,
}: Props) => {
	const {
		query: currentQuery,
		isSearching,
		updateQuery,
		isPending,
	} = useYoutubeSearchQuery(defaultSearchQuery)

	const skeletonKeys = useMemo(
		() =>
			Array.from(
				{ length: currentQuery.videoPerPage },
				(_, idx) => `placeholder-${idx + 1}`,
			),
		[currentQuery.videoPerPage],
	)

	const handleSearch = (searchQuery: Partial<YoutubeSearchQuery>) => {
		updateQuery({ ...searchQuery, page: 1 })
	}

	const pageMax = initialPageMax
	const youtubeDetails = initialYoutubeDetails
	const isBand = currentQuery.liveOrBand === 'band'
	const bandDetails = isBand ? (youtubeDetails as Video[]) : []
	const playlistDetails = !isBand ? (youtubeDetails as PlaylistDoc[]) : []
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
						<RadioSortGroup
							name="videoSort"
							currentSort={currentQuery.sort}
							onSortChange={(sort) => updateQuery({ sort })}
							options={[
								{ label: '新しい順', value: 'new' },
								{ label: '古い順', value: 'old' },
							]}
							size="xs"
						/>
					</div>
				</div>

				<FeedbackMessage source={error} defaultVariant="error" />

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
						{skeletonKeys.map((placeholderKey) => (
							<div
								key={placeholderKey}
								className="flex flex-col items-center p-4 border rounded-lg shadow-sm w-full"
							>
								<div className="skeleton h-48 w-full mb-2"></div>
								<div className="skeleton h-6 w-3/4 mb-1"></div>
								<div className="skeleton h-5 w-1/2 mb-1"></div>
								<div className="skeleton h-5 w-1/3"></div>
							</div>
						))}
					</div>
				) : youtubeDetails?.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
						{isBand
							? bandDetails.map((detail) => (
									<VideoItem
										key={detail.videoId}
										youtubeDetail={detail}
										liveOrBand="band"
									/>
								))
							: playlistDetails.map((detail) => (
									<VideoItem
										key={detail.playlistId}
										youtubeDetail={detail}
										liveOrBand="live"
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
