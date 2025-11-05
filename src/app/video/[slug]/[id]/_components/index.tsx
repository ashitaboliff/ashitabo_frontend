'use client'

import { YouTubeEmbed } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'
import type { PlaylistItem, Video } from '@/domains/video/model/videoTypes'
import { useWindowOpen } from '@/shared/hooks/useBrowserApis'
import { gkktt } from '@/shared/lib/fonts'
import { HiOutlineExternalLink } from '@/shared/ui/icons'

type Props =
	| { liveOrBand: 'live'; detail: PlaylistItem }
	| { liveOrBand: 'band'; detail: Video; playlist: PlaylistItem }

const VideoDetailPage = (props: Props) => {
	const router = useRouter()
	const openWindow = useWindowOpen()

	if (props.liveOrBand === 'band') {
		const { detail, playlist } = props
		const videoId = detail.videoId

		return (
			<div className="container mx-auto px-2 sm:px-4">
				<div className="flex flex-col items-center">
					<div
						className={`mt-6 mb-4 text-center font-bold text-3xl sm:text-4xl ${gkktt.className}`}
					>
						動画詳細
					</div>
					<div className="my-2 aspect-[16/9] w-full max-w-xl md:max-w-2xl">
						{videoId && <YouTubeEmbed videoid={videoId} />}
					</div>
					<div className="flex w-full max-w-xl flex-col justify-center px-2 md:max-w-2xl lg:max-w-3xl">
						<div className="mt-2 font-bold text-xl sm:text-2xl">
							{detail.title.split('(')[0]}
						</div>
						<div className="mt-1 flex flex-col justify-start gap-x-2 text-gray-600 text-xs-custom sm:flex-row sm:items-center sm:text-sm">
							<div>ライブ: {playlist.title.split('(')[0]}</div>
							<div>{detail.liveDate}</div>
						</div>
						<button
							type="button"
							className="btn btn-secondary mt-4 w-auto self-start sm:w-44"
							onClick={() => {
								if (videoId) {
									openWindow(
										`https://www.youtube.com/watch?v=${videoId}`,
										'_blank',
									)
								}
							}}
							disabled={!videoId}
						>
							YouTubeで見る <HiOutlineExternalLink size={20} className="ml-1" />
						</button>
					</div>
					<button
						type="button"
						className="mt-6 flex w-full max-w-xl cursor-pointer flex-col items-center gap-y-2 rounded-lg border p-3 shadow-sm transition hover:bg-base-200 md:max-w-2xl lg:max-w-3xl"
						onClick={() => {
							if (playlist.playlistId) {
								openWindow(
									`https://www.youtube.com/playlist?list=${playlist.playlistId}`,
									'_blank',
								)
							}
						}}
					>
						<div className="flex flex-row items-center font-bold text-md sm:text-lg">
							この動画のあるプレイリスト{' '}
							<HiOutlineExternalLink size={15} className="ml-1" />
						</div>
						<div className="flex w-full flex-col items-center justify-start gap-2 sm:flex-row sm:gap-3">
							{playlist.videos?.[0]?.videoId && (
								<div className="aspect-[16/9] w-full flex-shrink-0 overflow-hidden rounded sm:w-1/3 lg:w-1/4">
									<YouTubeEmbed videoid={playlist.videos[0].videoId} />
								</div>
							)}
							<div className="flex w-full flex-col justify-center sm:w-2/3 lg:w-3/4">
								<div className="font-bold text-sm sm:text-base">
									{playlist.title.split('(')[0]}
								</div>
								<div className="text-gray-600 text-xs-custom sm:text-sm">
									{playlist.liveDate}
								</div>
							</div>
						</div>
					</button>
					<button
						type="button"
						className="btn btn-outline mt-6 w-full max-w-xs sm:max-w-sm"
						onClick={() => router.back()}
					>
						戻る
					</button>
				</div>
			</div>
		)
	}

	const { detail } = props
	const firstVideoId = detail.videos?.[0]?.videoId

	return (
		<div className="container mx-auto px-2 sm:px-4">
			<div className="flex flex-col items-center">
				<div
					className={`mt-6 mb-4 text-center font-bold text-3xl sm:text-4xl ${gkktt.className}`}
				>
					プレイリスト詳細
				</div>
				<div className="my-2 aspect-[16/9] w-full max-w-xl md:max-w-2xl">
					{firstVideoId && <YouTubeEmbed videoid={firstVideoId} />}
				</div>
				<div className="flex w-full max-w-xl flex-col justify-center px-2 md:max-w-2xl lg:max-w-3xl">
					<div className="mt-2 font-bold text-xl sm:text-2xl">
						{detail.title.split('(')[0]}
					</div>
					<div className="mt-1 text-gray-600 text-xs-custom sm:text-sm">
						{detail.liveDate}
					</div>
					<button
						type="button"
						className="btn btn-secondary mt-4 w-auto self-start sm:w-44"
						onClick={() => {
							openWindow(
								`https://www.youtube.com/playlist?list=${detail.playlistId}`,
								'_blank',
							)
						}}
					>
						YouTubeで見る <HiOutlineExternalLink size={20} className="ml-1" />
					</button>
				</div>
				<div className="mt-6 w-full max-w-xl px-2 md:max-w-2xl lg:max-w-3xl">
					<h3 className="mb-2 font-semibold text-lg sm:text-xl">収録動画:</h3>
					{detail.videos && detail.videos.length > 0 ? (
						<ul className="space-y-2">
							{detail.videos.map((video) => (
								<li key={video.videoId}>
									<button
										type="button"
										className="w-full cursor-pointer rounded-md border p-2 text-left transition hover:bg-base-200 sm:p-3"
										onClick={() => router.push(`/video/band/${video.videoId}`)}
									>
										<div className="font-medium text-sm sm:text-base">
											{video.title.split('(')[0]}
										</div>
									</button>
								</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500 text-sm">
							このプレイリストには動画が登録されていません。
						</p>
					)}
				</div>
				<button
					type="button"
					className="btn btn-outline mt-6 w-full max-w-xs sm:max-w-sm"
					onClick={() => router.back()}
				>
					戻る
				</button>
			</div>
		</div>
	)
}

export default VideoDetailPage
