'use server'

import { notFound } from 'next/navigation'
import VideoDetailPage from '@/features/video/components/VideoDetailPage' // 修正
import {
	getPlaylistByIdAction,
	getVideoByIdAction,
} from '@/features/video/components/actions'
import { getUnifiedAuthState } from '@/features/auth/components/actions'
import { createMetaData } from '@/hooks/useMetaData'
import { Metadata, ResolvingMetadata } from 'next'
import { cache } from 'react'

type PageParams = Promise<{ id: string }>
type PageProps = { params: PageParams }

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
	{ params }: { params: PageParams },
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const liveOrBand = id.startsWith('PL') && id.length > 12 ? 'live' : 'band'
	let title = liveOrBand === 'live' ? 'ライブ動画詳細' : 'バンド動画詳細'
	let description = `あしたぼの${liveOrBand}動画 (${id}) の詳細ページです。`

	if (liveOrBand === 'live') {
		const playlistData = await getPlaylist(id)
		if (playlistData) {
			title = playlistData.title
				? `${playlistData.title} | ライブ動画`
				: `ライブ動画 ${id}`
			// Playlist type does not have a description property, using title for description
			description = `あしたぼのライブ動画 (${playlistData.title || id}) の詳細ページです。`
		}
	} else {
		const videoData = await getVideo(id)
		if (videoData) {
			title = videoData.title
				? `${videoData.title} | バンド動画`
				: `バンド動画 ${id}`
			// Video type does not have a direct description property, using title for description
			description = `あしたぼのバンド動画 (${videoData.title || id}) の詳細ページです。`
		}
	}

	return createMetaData({
		title,
		description,
		pathname: `/video/${id}`,
	})
}

const Page = async ({ params }: PageProps) => {
	const { session } = await getUnifiedAuthState()
	const { id } = await params
	const liveOrBand = id.startsWith('PL') && id.length > 12 ? 'live' : 'band'

	if (liveOrBand === 'live') {
		const playlist = await getPlaylist(id)
		if (!playlist) {
			return notFound()
		}
		return (
			<VideoDetailPage
				detail={playlist}
				liveOrBand={liveOrBand}
				session={session}
			/>
		)
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
		<VideoDetailPage
			detail={video}
			liveOrBand={liveOrBand}
			session={session}
			playlist={playlist}
		/>
	)
}

export default Page
