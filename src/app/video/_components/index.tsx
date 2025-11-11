'use client'

import { useMemo } from 'react'
import { useYoutubeSearchQuery } from '@/domains/video/hooks/useYoutubeSearchQuery'
import type {
	PlaylistDoc,
	Video,
	YoutubeSearchQuery,
} from '@/domains/video/model/videoTypes'
import { buildYoutubeQueryString } from '@/domains/video/query/youtubeQuery'
import { gkktt } from '@/shared/lib/fonts'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PaginatedResourceLayout from '@/shared/ui/molecules/PaginatedResourceLayout'
import type { ApiError } from '@/types/response'
import VideoItem from './VideoItem'
import VideoSearchForm from './VideoSearchForm'

interface Props {
	readonly youtubeDetails: Video[] | PlaylistDoc[]
	readonly pageMax: number
	readonly error?: ApiError
	readonly defaultQuery: YoutubeSearchQuery
	readonly initialQuery: YoutubeSearchQuery
	readonly extraSearchParams?: string
}

const PER_PAGE_OPTIONS: Record<string, number> = {
	'15件': 15,
	'20件': 20,
	'30件': 30,
}

const SORT_OPTIONS = [
	{ label: '新しい順', value: 'new' as const },
	{ label: '古い順', value: 'old' as const },
]

const VideoListPage = ({
	youtubeDetails,
	pageMax,
	error,
	defaultQuery,
	initialQuery,
	extraSearchParams,
}: Props) => {
	const {
		query: currentQuery,
		isSearching,
		updateQuery,
		isPending,
	} = useYoutubeSearchQuery({
		defaultQuery,
		initialQuery,
		extraSearchParams,
	})

	const skeletonKeys = useMemo(
		() =>
			Array.from(
				{ length: currentQuery.videoPerPage },
				(_, idx) => `placeholder-${idx + 1}`,
			),
		[currentQuery.videoPerPage],
	)

	const shareQueryString = buildYoutubeQueryString(
		currentQuery,
		defaultQuery,
		extraSearchParams,
	)

	const shareUrl = shareQueryString ? `/video?${shareQueryString}` : '/video'

	const handleSearch = (searchQuery: Partial<YoutubeSearchQuery>) => {
		updateQuery({ ...searchQuery, page: 1 })
	}

	const isBand = currentQuery.liveOrBand === 'band'
	const bandDetails = isBand ? (youtubeDetails as Video[]) : []
	const playlistDetails = !isBand ? (youtubeDetails as PlaylistDoc[]) : []

	return (
		<div className="container mx-auto px-2 sm:px-4">
			<div
				className={`font-bold text-3xl sm:text-4xl ${gkktt.className} mb-6 text-center`}
			>
				過去ライブ映像
			</div>
			<VideoSearchForm
				currentQuery={currentQuery}
				isSearching={isSearching}
				onSearch={handleSearch}
				onReset={() => updateQuery(defaultQuery)}
				shareUrl={shareUrl}
			/>
			<PaginatedResourceLayout
				perPage={{
					label: '表示件数:',
					name: 'videoPerPage',
					options: PER_PAGE_OPTIONS,
					value: currentQuery.videoPerPage,
					onChange: (value) => updateQuery({ videoPerPage: value, page: 1 }),
				}}
				sort={{
					name: 'videoSort',
					options: SORT_OPTIONS,
					value: currentQuery.sort,
					onChange: (sort) => updateQuery({ sort }),
				}}
				pagination={
					pageMax > 1
						? {
								currentPage: currentQuery.page,
								totalPages: pageMax,
								totalCount: youtubeDetails.length,
								onPageChange: (page) => updateQuery({ page }),
							}
						: undefined
				}
			>
				<FeedbackMessage source={error} defaultVariant="error" />
				{isPending ? (
					<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{skeletonKeys.map((placeholderKey) => (
							<div
								key={placeholderKey}
								className="flex w-full flex-col items-center rounded-lg border p-4 shadow-sm"
							>
								<div className="skeleton mb-2 aspect-[16/9] w-full"></div>
								<div className="skeleton mb-1 h-6 w-3/4"></div>
								<div className="skeleton mb-1 h-5 w-1/2"></div>
								<div className="skeleton h-5 w-1/3"></div>
							</div>
						))}
					</div>
				) : youtubeDetails?.length > 0 ? (
					<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
					<div className="w-full py-10 text-center text-base-content">
						該当する動画がありません
					</div>
				)}
			</PaginatedResourceLayout>
		</div>
	)
}

export default VideoListPage
