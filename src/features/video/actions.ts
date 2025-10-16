import {
	mapRawPlaylist,
	mapRawPlaylists,
	mapRawVideo,
	type RawPlaylist,
	type RawVideo,
} from '@/features/video/services/videoTransforms'
import type {
	Playlist,
	Video,
	YoutubeDetail,
	YoutubeSearchQuery,
} from '@/features/video/types'
import { apiGet, apiPost } from '@/lib/api/crud'
import { mapSuccess, okResponse, withFallbackMessage } from '@/lib/api/helper'
import { type ApiResponse, StatusCode } from '@/types/responseTypes'

export const searchYoutubeDetailsAction = async (
	query: YoutubeSearchQuery,
): Promise<ApiResponse<{ results: YoutubeDetail[]; totalCount: number }>> => {
	const res = await apiGet<{
		results: YoutubeDetail[]
		totalCount: number
	}>('/video/search', {
		searchParams: {
			liveOrBand: query.liveOrBand,
			bandName: query.bandName,
			liveName: query.liveName,
			sort: query.sort,
			page: query.page,
			videoPerPage: query.videoPerPage,
			tagSearchMode: query.tagSearchMode,
			tag: query.tag && query.tag.length > 0 ? query.tag : undefined,
		},
		next: { revalidate: 30, tags: ['video-search'] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '動画検索に失敗しました。')
	}

	return res
}

export const getVideoByIdAction = async (
	videoId: string,
): Promise<ApiResponse<Video>> => {
	const res = await apiGet<RawVideo>(`/video/videos/${videoId}`, {
		next: { revalidate: 300, tags: ['videos', `video:${videoId}`] },
	})

	return mapSuccess(res, mapRawVideo, '動画の取得に失敗しました。')
}

export const getPlaylistByIdAction = async (
	playlistId: string,
): Promise<ApiResponse<Playlist>> => {
	const res = await apiGet<RawPlaylist>(`/video/playlists/${playlistId}`, {
		next: {
			revalidate: 600,
			tags: ['video-playlists', `playlist:${playlistId}`],
		},
	})

	return mapSuccess(res, mapRawPlaylist, 'プレイリストの取得に失敗しました。')
}

export const getPlaylistAction = async (): Promise<ApiResponse<Playlist[]>> => {
	const res = await apiGet<RawPlaylist[]>('/video/playlists', {
		next: { revalidate: 600, tags: ['video-playlists'] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'プレイリスト一覧の取得に失敗しました。')
	}

	return okResponse(mapRawPlaylists(res.data))
}

export const getAccessTokenAction = async (): Promise<ApiResponse<null>> => {
	return {
		ok: false,
		status: StatusCode.NOT_FOUND,
		message: 'Access token not configured',
	}
}

export const getAuthUrl = async (): Promise<ApiResponse<string>> => {
	return {
		ok: true,
		status: StatusCode.OK,
		data: '/api/video/oauth',
	}
}

export const createPlaylistAction = async (): Promise<ApiResponse<string>> => {
	return {
		ok: true,
		status: StatusCode.OK,
		data: 'Playlist sync placeholder executed.',
	}
}

export const revalidateYoutubeTag = async (): Promise<ApiResponse<null>> => {
	return {
		ok: true,
		status: StatusCode.NO_CONTENT,
		data: null,
	}
}

export const updateTagsAction = async ({
	userId,
	id,
	tags,
	liveOrBand,
}: {
	userId: string
	id: string
	tags: string[]
	liveOrBand: 'live' | 'band'
}): Promise<ApiResponse<string>> => {
	const res = await apiPost<null>('/video/tags', {
		body: {
			id,
			tags,
			liveOrBand,
			userId,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'タグの更新に失敗しました。')
	}

	return {
		ok: true,
		status: StatusCode.OK,
		data: 'updated',
	}
}

export const getYoutubeIds = async (): Promise<string[]> => {
	const response = await apiGet<string[]>('/video/ids', {
		cache: 'no-store',
		next: { revalidate: 24 * 60 * 60, tags: ['youtube-ids'] },
	})

	if (response.ok && Array.isArray(response.data)) {
		return response.data
	}
	return []
}
