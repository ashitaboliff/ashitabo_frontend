export type Video = {
	type: 'video' // live or bandでband側
	videoId: string
	title: string
	link: string
	liveDate: string
	playlistId: string
	playlistTitle: string
	createdAt: Date | null
	updatedAt: Date | null
}

export type PlaylistItem = {
	type: 'playlist' // live or bandでlive側
	playlistId: string
	title: string
	link: string
	liveDate: string
	videos: Video[]
	createdAt: Date | null
	updatedAt: Date | null
}

export type PlaylistDoc = {
	type: 'playlist'
	playlistId: string
	title: string
	link: string
	liveDate: string
	videoId: string
	createdAt: Date | null
	updatedAt: Date | null
}

export type liveOrBand = 'live' | 'band'

export type YoutubeSearchQuery = {
	liveOrBand: liveOrBand
	bandName?: string
	liveName?: string
	sort: 'new' | 'old'
	page: number
	videoPerPage: number
}
