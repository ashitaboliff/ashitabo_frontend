'use client'

import { useRouter } from 'next/navigation'
import YouTube from 'react-youtube'
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
						className={`text-3xl sm:text-4xl font-bold text-center mt-6 mb-4 ${gkktt.className}`}
					>
						動画詳細
					</div>
					<div className="w-full max-w-xl md:max-w-2xl my-2">
						{videoId && (
							<YouTube
								videoId={videoId}
								className="aspect-video w-full"
								iframeClassName="w-full h-full"
							/>
						)}
					</div>
					<div className="flex flex-col justify-center w-full max-w-xl md:max-w-2xl lg:max-w-3xl px-2">
						<div className="text-xl sm:text-2xl font-bold mt-2">
							{detail.title.split('(')[0]}
						</div>
						<div className="flex flex-col sm:flex-row sm:items-center justify-start gap-x-2 text-xs-custom sm:text-sm text-gray-600 mt-1">
							<div>ライブ: {playlist.title.split('(')[0]}</div>
							<div>{detail.liveDate}</div>
						</div>
						<button
							type="button"
							className="btn btn-secondary w-auto sm:w-44 mt-4 self-start"
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
						className="flex flex-col items-center gap-y-2 mt-6 p-3 border rounded-lg shadow-sm w-full max-w-xl md:max-w-2xl lg:max-w-3xl cursor-pointer hover:bg-base-200 transition"
						onClick={() => {
							if (playlist.playlistId) {
								openWindow(
									`https://www.youtube.com/playlist?list=${playlist.playlistId}`,
									'_blank',
								)
							}
						}}
					>
						<div className="text-md sm:text-lg font-bold flex flex-row items-center">
							この動画のあるプレイリスト{' '}
							<HiOutlineExternalLink size={15} className="ml-1" />
						</div>
						<div className="flex flex-col sm:flex-row w-full justify-start items-center gap-2 sm:gap-3">
							{playlist.videos?.[0]?.videoId && (
								<div className="w-full sm:w-1/3 lg:w-1/4 flex-shrink-0">
									<div className="aspect-video rounded overflow-hidden">
										<YouTube
											videoId={playlist.videos[0].videoId}
											className="w-full h-full"
											iframeClassName="w-full h-full"
										/>
									</div>
								</div>
							)}
							<div className="flex flex-col justify-center w-full sm:w-2/3 lg:w-3/4">
								<div className="text-sm sm:text-base font-bold">
									{playlist.title.split('(')[0]}
								</div>
								<div className="text-xs-custom sm:text-sm text-gray-600">
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
					className={`text-3xl sm:text-4xl font-bold text-center mt-6 mb-4 ${gkktt.className}`}
				>
					プレイリスト詳細
				</div>
				<div className="w-full max-w-xl md:max-w-2xl my-2">
					{firstVideoId && (
						<div className="aspect-video">
							<YouTube
								videoId={firstVideoId}
								opts={{
									playerVars: {
										listType: 'playlist',
										list: detail.playlistId,
									},
								}}
								className="w-full h-full"
								iframeClassName="w-full h-full"
							/>
						</div>
					)}
				</div>
				<div className="flex flex-col justify-center w-full max-w-xl md:max-w-2xl lg:max-w-3xl px-2">
					<div className="text-xl sm:text-2xl font-bold mt-2">
						{detail.title.split('(')[0]}
					</div>
					<div className="text-xs-custom sm:text-sm text-gray-600 mt-1">
						{detail.liveDate}
					</div>
					<button
						type="button"
						className="btn btn-secondary w-auto sm:w-44 mt-4 self-start"
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
				<div className="mt-6 w-full max-w-xl md:max-w-2xl lg:max-w-3xl px-2">
					<h3 className="text-lg sm:text-xl font-semibold mb-2">収録動画:</h3>
					{detail.videos && detail.videos.length > 0 ? (
						<ul className="space-y-2">
							{detail.videos.map((video) => (
								<li key={video.videoId}>
									<button
										type="button"
										className="p-2 sm:p-3 border rounded-md hover:bg-base-200 cursor-pointer transition"
										onClick={() => router.push(`/video/band/${video.videoId}`)}
									>
										<div className="text-sm sm:text-base font-medium">
											{video.title.split('(')[0]}
										</div>
									</button>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-500">
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
