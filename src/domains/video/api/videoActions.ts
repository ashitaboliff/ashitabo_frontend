'use server'

import { revalidateTag } from 'next/cache'
import {
	mapRawPlaylistDocs,
	mapRawPlaylistItem,
	mapRawVideo,
	mapRawVideos,
	type RawPlaylistDoc,
	type RawPlaylistItem,
	type RawVideo,
} from '@/domains/video/api/dto'
import type {
	PlaylistDoc,
	PlaylistItem,
	Video,
	YoutubeSearchQuery,
} from '@/domains/video/model/videoTypes'
import { apiGet, apiPost } from '@/shared/lib/api/crud'
import {
	mapSuccess,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { recordJoinSorted } from '@/shared/utils/cacheTag'
import type { ApiResponse } from '@/types/responseTypes'

export const searchVideoAction = async (
	query: YoutubeSearchQuery,
): Promise<ApiResponse<{ items: Video[]; total: number }>> => {
	const res = await apiGet<{ items: RawVideo[]; total: number }>(
		'/video/search',
		{
			searchParams: {
				liveOrBand: query.liveOrBand,
				bandName: query.bandName,
				liveName: query.liveName,
				sort: query.sort,
				page: query.page.toString(),
				videoPerPage: query.videoPerPage.toString(),
			},
			next: {
				revalidate: 60 * 60,
				tags: ['videos', `video-search-${recordJoinSorted(query)}`],
			},
		},
	)

	return mapSuccess(
		res,
		(raw) => ({
			items: mapRawVideos(raw.items),
			total: raw.total,
		}),
		'検索に失敗しました。',
	)
}

export const searchPlaylistAction = async (
	query: YoutubeSearchQuery,
): Promise<ApiResponse<{ items: PlaylistDoc[]; total: number }>> => {
	const res = await apiGet<{ items: RawPlaylistDoc[]; total: number }>(
		'/video/search',
		{
			searchParams: {
				liveOrBand: query.liveOrBand,
				bandName: query.bandName,
				liveName: query.liveName,
				sort: query.sort,
				page: query.page.toString(),
				videoPerPage: query.videoPerPage.toString(),
			},
			next: {
				revalidate: 60 * 60,
				tags: ['videos', `playlist-search-${recordJoinSorted(query)}`],
			},
		},
	)

	return mapSuccess(
		res,
		(raw) => ({
			items: mapRawPlaylistDocs(raw.items),
			total: raw.total,
		}),
		'検索に失敗しました。',
	)
}

export const getVideoByIdAction = async (
	videoId: string,
): Promise<ApiResponse<Video>> => {
	const res = await apiGet<RawVideo>(`/video/videos/${videoId}`, {
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: ['videos', `video-${videoId}`],
		},
	})

	return mapSuccess(res, mapRawVideo, '動画の取得に失敗しました。')
}

export const getPlaylistByIdAction = async (
	playlistId: string,
): Promise<ApiResponse<PlaylistItem>> => {
	const res = await apiGet<RawPlaylistItem>(`/video/playlists/${playlistId}`, {
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: ['videos', `playlist-${playlistId}`],
		},
	})

	return mapSuccess(
		res,
		mapRawPlaylistItem,
		'プレイリストの取得に失敗しました。',
	)
}

export const getPlaylistAction = async (): Promise<
	ApiResponse<PlaylistDoc[]>
> => {
	const res = await apiGet<{ items: RawPlaylistDoc[]; total: number }>(
		'/video/search',
		{
			searchParams: {
				liveOrBand: 'live',
				page: '1',
				videoPerPage: '200',
			},
			next: { revalidate: 7 * 24 * 60 * 60, tags: ['videos'] },
		},
	)

	if (!res.ok) {
		return withFallbackMessage(res, 'プレイリスト一覧の取得に失敗しました。')
	}

	return okResponse(mapRawPlaylistDocs(res.data.items))
}

type PlaylistWebhook = {
	ok: boolean
	playlist: string
	video: string
}

const YOUTUBE_IDS_TAG = (type: 'video' | 'playlist') => `youtube-${type}-ids`

export const postSyncPlaylistAction = async (): Promise<
	ApiResponse<PlaylistWebhook>
> => {
	const res = await apiPost<PlaylistWebhook>('/video/webhook', {
		body: {},
	})

	if (res.ok) {
		revalidateTag('videos')
		revalidateTag(YOUTUBE_IDS_TAG('video'))
		revalidateTag(YOUTUBE_IDS_TAG('playlist'))
	}

	return withFallbackMessage(res, 'プレイリストの作成に失敗しました。')
}

export const getYoutubeIds = async (
	type: 'video' | 'playlist',
): Promise<string[]> => {
	const response = await apiGet<string[]>('/video/ids', {
		searchParams: { type },
		next: {
			revalidate: 24 * 60 * 60,
			tags: [YOUTUBE_IDS_TAG(type)],
		},
		cache: 'no-store',
	})

	if (response.ok && Array.isArray(response.data)) {
		return response.data
	}
	return []
}
