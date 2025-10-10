'use client'

import { useRouter } from 'next-nprogress-bar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { gkktt } from '@/lib/fonts'
import YouTube from 'react-youtube'
import { liveOrBand, Playlist, Video } from '@/features/video/types'
import Tags from '@/components/ui/atoms/Tags'
import TagEditPopup from './TagEditPopup'
import { useWindowOpen } from '@/hooks/useBrowserApis'

import { HiOutlineExternalLink } from 'react-icons/hi'
import type { Session } from '@/types/session'

type Props = {
	session: Session | null
	liveOrBand: liveOrBand
} & (
	| { liveOrBand: 'live'; playlist?: Playlist; detail: Playlist }
	| { liveOrBand: 'band'; playlist: Playlist; detail: Video }
)

const VideoDetailPage = ({ session, detail, liveOrBand, playlist }: Props) => {
	const router = useRouter()
	const openWindow = useWindowOpen()

	const currentPlaylist =
		liveOrBand === 'band'
			? playlist
			: liveOrBand === 'live'
				? detail
				: undefined

	const videoId =
		liveOrBand === 'band' ? detail.videoId : detail.videos?.[0]?.videoId
	const entityId = liveOrBand === 'band' ? detail.videoId : detail.playlistId
	const currentTags = detail.tags || []

	return (
		<div className="container mx-auto px-2 sm:px-4 py-6">
			{liveOrBand === 'band' && currentPlaylist && (
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
							<div>ライブ: {currentPlaylist.title.split('(')[0]}</div>
							<div>
								{format(detail.liveDate, 'yyyy年MM月dd日', { locale: ja })}
							</div>
						</div>
						<div className="flex flex-row justify-between w-full mt-3 items-center">
							<div className="flex flex-row flex-wrap gap-1">
								{currentTags.length > 0 && (
									<Tags
										tags={currentTags}
										size="text-xs-custom"
										isLink
										liveOrBand={liveOrBand}
									/>
								)}
							</div>
							<TagEditPopup
								session={session}
								id={entityId}
								currentTags={currentTags}
								liveOrBand={liveOrBand}
								isFullButton={true}
							/>
						</div>
						<button
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
					<div
						className="flex flex-col items-center gap-y-2 mt-6 p-3 border rounded-lg shadow-sm w-full max-w-xl md:max-w-2xl lg:max-w-3xl cursor-pointer hover:bg-base-200 transition"
						onClick={() => {
							if (currentPlaylist.playlistId) {
								openWindow(
									`https://www.youtube.com/playlist?list=${currentPlaylist.playlistId}`,
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
							{currentPlaylist.videos?.[0]?.videoId && (
								<div className="w-full sm:w-1/3 lg:w-1/4 flex-shrink-0">
									<div className="aspect-video rounded overflow-hidden">
										<YouTube
											videoId={currentPlaylist.videos[0].videoId}
											className="w-full h-full"
											iframeClassName="w-full h-full"
										/>
									</div>
								</div>
							)}
							<div className="flex flex-col justify-center w-full sm:w-2/3 lg:w-3/4">
								<div className="text-sm sm:text-base font-bold">
									{currentPlaylist.title.split('(')[0]}
								</div>
								<div className="text-xs-custom sm:text-sm text-gray-600">
									{format(currentPlaylist.liveDate, 'yyyy年MM月dd日', {
										locale: ja,
									})}
								</div>
							</div>
						</div>
					</div>
					<button
						className="btn btn-outline mt-6 w-full max-w-xs sm:max-w-sm"
						onClick={() => router.back()}
					>
						戻る
					</button>
				</div>
			)}
			{liveOrBand === 'live' && (
				<div className="flex flex-col items-center">
					<div
						className={`text-3xl sm:text-4xl font-bold text-center mt-6 mb-4 ${gkktt.className}`}
					>
						プレイリスト詳細
					</div>
					<div className="w-full max-w-xl md:max-w-2xl my-2">
						{detail.videos?.[0]?.videoId && (
							<div className="aspect-video">
								<YouTube
									videoId={detail.videos[0].videoId}
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
							{format(detail.liveDate, 'yyyy年MM月dd日', { locale: ja })}
						</div>
						<div className="flex flex-row justify-between w-full mt-3 items-center">
							<div className="flex flex-row flex-wrap gap-1">
								{currentTags.length > 0 && (
									<Tags
										tags={currentTags}
										size="text-xs-custom"
										isLink
										liveOrBand={liveOrBand}
									/>
								)}
							</div>
							<TagEditPopup
								session={session}
								id={entityId}
								currentTags={currentTags}
								liveOrBand={liveOrBand}
								isFullButton={true}
							/>
						</div>
						<button
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
									<li
										key={video.videoId}
										className="p-2 sm:p-3 border rounded-md hover:bg-base-200 cursor-pointer transition"
										onClick={() => router.push(`/video/${video.videoId}`)}
									>
										<div className="text-sm sm:text-base font-medium">
											{video.title.split('(')[0]}
										</div>
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
						className="btn btn-outline mt-6 w-full max-w-xs sm:max-w-sm"
						onClick={() => router.back()}
					>
						戻る
					</button>
				</div>
			)}
		</div>
	)
}

export default VideoDetailPage
