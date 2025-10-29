'use client'

import { YouTubeEmbed } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'
import type { PlaylistDoc, Video } from '@/domains/video/model/videoTypes'

type BandItemProps = {
	liveOrBand: 'band'
	youtubeDetail: Video
}

type LiveItemProps = {
	liveOrBand: 'live'
	youtubeDetail: PlaylistDoc
}

type Props = BandItemProps | LiveItemProps

const VideoItem = ({ youtubeDetail, liveOrBand }: Props) => {
	const router = useRouter()
	const videoId = youtubeDetail.videoId
	const displayTitle = youtubeDetail.title.split('(')[0]
	const playlistTitle =
		liveOrBand === 'band'
			? youtubeDetail.playlistTitle.split('(')[0]
			: undefined
	const detailHref =
		liveOrBand === 'band'
			? `/video/band/${youtubeDetail.videoId}`
			: `/video/live/${youtubeDetail.playlistId}`

	return (
		<div className="flex flex-col xl:flex-row items-start p-3 sm:p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow w-full gap-4">
			{videoId && (
				<button
					type="button"
					className="cursor-pointer w-full xl:w-1/3 flex-shrink-0 text-left"
					onClick={() => router.push(detailHref)}
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
					onClick={() => router.push(detailHref)}
				>
					{displayTitle}
				</button>
				{playlistTitle && (
					<div className="text-sm">ライブ名: {playlistTitle}</div>
				)}
				<div className="text-sm">{youtubeDetail.liveDate}</div>
				<div className="flex flex-wrap gap-2 mt-2">
					<button
						className="btn btn-outline btn-sm text-xs-custom xl:text-sm whitespace-nowrap"
						onClick={() => router.push(detailHref)}
						type="button"
					>
						詳細を見る
					</button>
				</div>
			</div>
		</div>
	)
}

export default VideoItem
