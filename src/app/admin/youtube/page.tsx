import YoutubeManagement from '@/app/admin/youtube/_components'
import { searchPlaylistAction } from '@/domains/video/api/videoActions'
import type { PlaylistDoc } from '@/domains/video/model/videoTypes'
import {
	ADMIN_YOUTUBE_DEFAULT_QUERY,
	parseYoutubeQuery,
} from '@/domains/video/query/youtubeQuery'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/response'

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const YoutubePage = async ({ searchParams }: Props) => {
	const rawParams = new URLSearchParams()
	for (const [key, value] of Object.entries(await searchParams)) {
		if (typeof value === 'string') {
			rawParams.set(key, value)
		} else if (Array.isArray(value)) {
			value.forEach((v) => {
				rawParams.append(key, v)
			})
		}
	}

	const { query: currentQuery, extraSearchParams } = parseYoutubeQuery(
		rawParams,
		ADMIN_YOUTUBE_DEFAULT_QUERY,
	)

	const playlistQuery = {
		...currentQuery,
		liveOrBand: 'live' as const,
		bandName: '',
		liveName: '',
		sort: 'new' as const,
	}

	const result = await searchPlaylistAction(playlistQuery)

	let error: ApiError | undefined
	let playlists: PlaylistDoc[] = []
	let total = 0

	if (result.ok) {
		playlists = result.data.items
		total = result.data.total
	} else {
		error = result
		logError('Admin Youtube Page', 'Failed to fetch playlists', result)
	}

	return (
		<YoutubeManagement
			playlists={playlists}
			total={total}
			defaultQuery={ADMIN_YOUTUBE_DEFAULT_QUERY}
			initialQuery={playlistQuery}
			extraSearchParams={extraSearchParams}
			error={error}
		/>
	)
}

const Page = async (props: Props) => {
	return <YoutubePage {...props} />
}

export default Page
