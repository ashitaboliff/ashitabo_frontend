import { Playlist, Video } from '@/features/video/types'

const toDate = (value: string | Date | undefined | null): Date | undefined => {
	if (!value) return undefined
	return value instanceof Date ? value : new Date(value)
}

export interface RawVideo {
	title: string
	link: string
	videoId: string
	liveDate: string
	playlistId: string
	createdAt?: string | Date | null
	updatedAt?: string | Date | null
	tags?: string[]
}

export const mapRawVideo = (raw: RawVideo): Video => ({
	...raw,
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
})

export interface RawPlaylist {
	playlistId: string
	title: string
	link: string
	liveDate: string
	videos: RawVideo[]
	createdAt?: string | Date | null
	updatedAt?: string | Date | null
	tags?: string[]
}

export const mapRawPlaylist = (raw: RawPlaylist): Playlist => ({
	...raw,
	videos: raw.videos?.map(mapRawVideo) ?? [],
	createdAt: toDate(raw.createdAt),
	updatedAt: toDate(raw.updatedAt),
})

export const mapRawPlaylists = (
	raw: RawPlaylist[] | null | undefined,
): Playlist[] => (raw ? raw.map(mapRawPlaylist) : [])
