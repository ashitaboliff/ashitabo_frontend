'use client'

import { YouTubeEmbed } from '@next/third-parties/google'
import { useRouter } from 'next-nprogress-bar'
import Tags from '@/components/ui/atoms/Tags'
import TagEditPopup from '@/features/video/components/TagEditPopup'
import type { liveOrBand, YoutubeDetail } from '@/features/video/types'
import type { Session } from '@/types/session'
import { formatDateJa } from '@/utils/dateFormat'

const VideoItem = ({
	session,
	youtubeDetail,
	liveOrBand,
}: {
	session: Session | null
	youtubeDetail: YoutubeDetail
	liveOrBand: liveOrBand
}) => {
	const router = useRouter()
	const videoId =
		liveOrBand === 'live' ? youtubeDetail.videoId : youtubeDetail.id
	const displayTitle = youtubeDetail.title.split('(')[0]
	const playlistTitle =
		liveOrBand === 'band'
			? youtubeDetail.playlistTitle?.split('(')[0]
			: undefined

	return (
		<div className="flex flex-col xl:flex-row items-start p-3 sm:p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow w-full gap-4">
			{videoId && (
				<button
					type="button"
					className="cursor-pointer w-full xl:w-1/3 flex-shrink-0 text-left"
					onClick={() => router.push(`/video/${youtubeDetail.id}`)}
					aria-label={`${displayTitle}の詳細を見る`}
				>
					<div className="aspect-video rounded overflow-hidden">
						<YouTubeEmbed videoid={videoId} />
					</div>
				</button>
			)}
			<div className="flex flex-col gap-y-2 w-full">
				<button
					type="button"
					className="text-left text-lg xl:text-xl font-bold link link-hover"
					onClick={() => router.push(`/video/${youtubeDetail.id}`)}
				>
					{displayTitle}
				</button>
				{playlistTitle && (
					<div className="text-sm">ライブ名: {playlistTitle}</div>
				)}
				<div className="text-sm">{formatDateJa(youtubeDetail.liveDate)}</div>
				{youtubeDetail.tags && youtubeDetail.tags.length > 0 && (
					<div className="mt-1 flex flex-wrap gap-1">
						<Tags tags={youtubeDetail.tags} size="text-xs-custom" />
					</div>
				)}
				<div className="flex flex-wrap gap-2 mt-2">
					<button
						className="btn btn-outline btn-sm text-xs-custom xl:text-sm whitespace-nowrap"
						onClick={() => router.push(`/video/${youtubeDetail.id}`)}
						type="button"
					>
						詳細を見る
					</button>
					<TagEditPopup
						session={session}
						id={youtubeDetail.id}
						currentTags={youtubeDetail.tags}
						liveOrBand={liveOrBand}
						isFullButton={true}
					/>
				</div>
			</div>
		</div>
	)
}

export default VideoItem
