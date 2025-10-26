import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import VideoDetailPage from '@/app/video/[slug]/[id]/_components'
import {
	getPlaylistByIdAction,
	getVideoByIdAction,
} from '@/domains/video/api/videoActions'
import { createMetaData } from '@/shared/hooks/useMetaData'

type Params = Promise<{ slug: 'live' | 'band'; id: string }>
type Props = { params: Params }

const getPlaylist = cache(async (id: string) => {
	const res = await getPlaylistByIdAction(id)
	if (res.ok) {
		return res.data
	}
	return null
})

const getVideo = cache(async (id: string) => {
	const res = await getVideoByIdAction(id)
	if (res.ok) {
		return res.data
	}
	return null
})

export async function generateMetadata(
	{ params }: { params: Params },
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id, slug } = await params
	let title = slug === 'live' ? 'ライブ動画詳細' : 'バンド動画詳細'
	let description = `あしたぼの${slug}動画 (${id}) の詳細ページです。`

	if (slug === 'live') {
		const playlistData = await getPlaylist(id)
		if (playlistData) {
			title = playlistData.title
				? `${playlistData.title} | ライブ動画`
				: `ライブ動画 ${id}`
			description = `あしたぼのライブ動画 (${playlistData.title || id}) の詳細ページです。`
		}
	} else {
		const videoData = await getVideo(id)
		if (videoData) {
			title = videoData.title
				? `${videoData.title} | バンド動画`
				: `バンド動画 ${id}`
			description = `あしたぼのバンド動画 (${videoData.title || id}) の詳細ページです。`
		}
	}

	return createMetaData({
		title,
		description,
		pathname: `/video/${slug}/${id}`,
	})
}

const Page = async ({ params }: Props) => {
	const { id, slug } = await params

	if (slug === 'live') {
		const playlist = await getPlaylist(id)
		if (!playlist) {
			return notFound()
		}
		return <VideoDetailPage detail={playlist} liveOrBand={slug} />
	}

	const video = await getVideo(id)
	if (!video) {
		return notFound()
	}
	const playlist = await getPlaylist(video.playlistId)
	if (!playlist) {
		return notFound()
	}

	return (
		<VideoDetailPage detail={video} liveOrBand={slug} playlist={playlist} />
	)
}

export default Page
