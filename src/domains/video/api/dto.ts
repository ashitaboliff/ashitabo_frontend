import type {
	PlaylistDoc,
	PlaylistItem,
	Video,
} from '@/domains/video/model/videoTypes'
import { toDate } from '@/shared/utils/dateFormat'

export type RawVideo = {
	type: 'video'
	videoId: string
	title: string
	link: string
	liveDate: string
	playlistId: string
	playlistTitle: string
	createdAt: string | Date
	updatedAt: string | Date
}

export const mapRawVideo = (raw: RawVideo): Video => ({
	...raw,
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
})

export const mapRawVideos = (raw: RawVideo[] | null | undefined): Video[] =>
	raw ? raw.map(mapRawVideo) : []

export type RawPlaylistItem = {
	type: 'playlist'
	playlistId: string
	title: string
	link: string
	liveDate: string
	videos: RawVideo[]
	createdAt: string | Date | null
	updatedAt: string | Date | null
}

export const mapRawPlaylistItem = (raw: RawPlaylistItem): PlaylistItem => ({
	...raw,
	videos: raw.videos?.map(mapRawVideo) ?? [],
	createdAt: toDate(raw.createdAt ?? new Date()),
	updatedAt: toDate(raw.updatedAt ?? new Date()),
})

export type RawPlaylistDoc = {
	type: 'playlist'
	playlistId: string
	title: string
	link: string
	liveDate: string
	videoId: string
	createdAt: string | Date | null
	updatedAt: string | Date | null
}

export const mapRawPlaylistDoc = (raw: RawPlaylistDoc): PlaylistDoc => ({
	...raw,
	createdAt: toDate(raw.createdAt ?? new Date()),
	updatedAt: toDate(raw.updatedAt ?? new Date()),
})

export const mapRawPlaylistDocs = (
	raw: RawPlaylistDoc[] | null | undefined,
): PlaylistDoc[] => (raw ? raw.map(mapRawPlaylistDoc) : [])
