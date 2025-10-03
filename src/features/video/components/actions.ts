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

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: {
				results: res.response.results.map(mapVideoDetail),
				totalCount: res.response.totalCount,
			},
		}
	}

	return res
}

export const getVideoByIdAction = async (
	videoId: string,
): Promise<ApiResponse<Video>> => {
	const res = await apiRequest<Video>(`/video/videos/${videoId}`, {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapVideo(res.response),
		}
	}

	return res
}

export const getPlaylistByIdAction = async (
	playlistId: string,
): Promise<ApiResponse<Playlist>> => {
	const res = await apiRequest<Playlist>(`/video/playlists/${playlistId}`, {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapPlaylist(res.response),
		}
	}

	return res
}

export const getPlaylistAction = async (): Promise<
	ApiResponse<Playlist[]>
> => {
	const res = await apiRequest<Playlist[]>('/video/playlists', {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response.map(mapPlaylist),
		}
	}

	return res as ApiResponse<Playlist[]>
}

export const getAccessTokenAction = async (): Promise<
	ApiResponse<null>
> => {
	return {
		status: StatusCode.NOT_FOUND,
		response: 'Access token not configured',
	}
}

export const getAuthUrl = async (): Promise<ApiResponse<string>> => {
	return {
		status: StatusCode.OK,
		response: '/api/video/oauth',
	}
}

export const createPlaylistAction = async (): Promise<ApiResponse<string>> => {
	return {
		status: StatusCode.OK,
		response: 'Playlist sync placeholder executed.',
	}
}

export const revalidateYoutubeTag = async (): Promise<ApiResponse<null>> => {
	return {
		status: StatusCode.NO_CONTENT,
		response: null,
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
	const res = await apiRequest('/video/tags', {
		method: 'POST',
		body: {
			id,
			tags,
			liveOrBand,
			userId,
		},
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.OK, response: 'updated' }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'タグの更新に失敗しました。',
	} as ApiResponse<string>
}
