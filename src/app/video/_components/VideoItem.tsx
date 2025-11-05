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
		<div className="flex w-full flex-col items-start gap-4 rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
			{videoId && (
				<button
					type="button"
					className="w-full flex-shrink-0 cursor-pointer text-left"
					onClick={() => router.push(detailHref)}
					aria-label={`${displayTitle}の詳細を見る`}
				>
					<div className="aspect-[16/9] overflow-hidden rounded">
						<YouTubeEmbed videoid={videoId} />
					</div>
				</button>
			)}
			<div className="flex w-full flex-col gap-y-2">
				<button
					type="button"
					className="link link-hover text-left font-bold text-lg xl:text-xl"
					onClick={() => router.push(detailHref)}
				>
					{displayTitle}
				</button>
				{playlistTitle && (
					<div className="text-sm">ライブ名: {playlistTitle}</div>
				)}
				<div className="text-sm">{youtubeDetail.liveDate}</div>
				<div className="mt-2 flex flex-wrap gap-2">
					<button
						className="btn btn-outline btn-sm whitespace-nowrap text-xs-custom xl:text-sm"
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
