import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	Playlist,
	Video,
	YoutubeDetail,
	YoutubeSearchQuery,
} from '@/features/video/types'

const mapVideoDetail = (input: any): YoutubeDetail => ({
	id: input.id,
	title: input.title,
	link: input.link,
	tags: input.tags ?? [],
	liveDate: input.liveDate,
	playlistId: input.playlistId,
	videoId: input.videoId,
	playlistTitle: input.playlistTitle ?? null,
	liveOrBand: input.liveOrBand,
})

const mapVideo = (input: any): Video => ({
	title: input.title,
	link: input.link,
	videoId: input.videoId,
	liveDate: input.liveDate,
	playlistId: input.playlistId,
	createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
	updatedAt: input.updatedAt ? new Date(input.updatedAt) : undefined,
	tags: input.tags ?? [],
})

const mapPlaylist = (input: any): Playlist => ({
	playlistId: input.playlistId,
	title: input.title,
	link: input.link,
	liveDate: input.liveDate,
	videos: Array.isArray(input.videos) ? input.videos.map(mapVideo) : [],
	createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
	updatedAt: input.updatedAt ? new Date(input.updatedAt) : undefined,
	tags: input.tags ?? [],
})

const withFallbackMessage = <T>(
	res: ApiResponse<T>,
	message: string,
): ApiResponse<T> => {
	if (res.ok) {
		return res
	}
	return {
		...res,
		message: res.message || message,
	}
}

export const searchYoutubeDetailsAction = async (
	query: YoutubeSearchQuery,
): Promise<ApiResponse<{ results: YoutubeDetail[]; totalCount: number }>> => {
	const res = await apiRequest<{
		results: any[]
		totalCount: number
	}>('/video/search', {
		method: 'GET',
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
		cache: 'no-store',
	})

	if (!res.ok) {
		return withFallbackMessage(res, '動画検索に失敗しました。')
	}

	const payload = res.data ?? { results: [], totalCount: 0 }
	return {
		ok: true,
		status: res.status,
		data: {
			results: (payload.results ?? []).map(mapVideoDetail),
			totalCount: payload.totalCount ?? 0,
		},
	}
}

export const getVideoByIdAction = async (
	videoId: string,
): Promise<ApiResponse<Video>> => {
	const res = await apiRequest<any>(`/video/videos/${videoId}`, {
		method: 'GET',
		cache: 'force-cache',
		next: { revalidate: 300, tags: ['videos', `video:${videoId}`] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '動画の取得に失敗しました。')
	}

	return {
		ok: true,
		status: res.status,
		data: mapVideo(res.data),
	}
}

export const getPlaylistByIdAction = async (
	playlistId: string,
): Promise<ApiResponse<Playlist>> => {
	const res = await apiRequest<any>(`/video/playlists/${playlistId}`, {
		method: 'GET',
		cache: 'force-cache',
		next: {
			revalidate: 600,
			tags: ['video-playlists', `playlist:${playlistId}`],
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'プレイリストの取得に失敗しました。')
	}

	return {
		ok: true,
		status: res.status,
		data: mapPlaylist(res.data),
	}
}

export const getPlaylistAction = async (): Promise<ApiResponse<Playlist[]>> => {
	const res = await apiRequest<any[]>('/video/playlists', {
		method: 'GET',
		cache: 'force-cache',
		next: { revalidate: 600, tags: ['video-playlists'] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'プレイリスト一覧の取得に失敗しました。')
	}

	return {
		ok: true,
		status: res.status,
		data: (res.data ?? []).map(mapPlaylist),
	}
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
	const res = await apiRequest<null>('/video/tags', {
		method: 'POST',
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
