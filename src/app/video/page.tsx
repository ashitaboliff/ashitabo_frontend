import { Suspense } from 'react'
import VideoListPage from '@/app/video/_components'
import {
	searchPlaylistAction,
	searchVideoAction,
} from '@/domains/video/api/videoActions'
import type { PlaylistDoc, Video } from '@/domains/video/model/videoTypes'
import {
	buildYoutubeQueryString,
	parseYoutubeQuery,
	VIDEO_PAGE_DEFAULT_QUERY,
} from '@/domains/video/query/youtubeQuery'
import Loading from '@/shared/ui/atoms/Loading'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/responseTypes'

type Props = {
	readonly searchParams: Promise<{
		[key: string]: string | string[] | undefined
	}>
}

const UNEXPECTED_ERROR_MESSAGE = '予期せぬエラーが発生しました。'

const Page = async ({ searchParams: params }: Props) => {
	const queryParams = new URLSearchParams()
	for (const [key, value] of Object.entries(await params)) {
		if (typeof value === 'string') {
			queryParams.set(key, value)
		} else if (Array.isArray(value)) {
			value.forEach((v) => {
				queryParams.append(key, v)
			})
		}
	}

	const { query: currentQuery, extraSearchParams } = parseYoutubeQuery(
		queryParams,
		VIDEO_PAGE_DEFAULT_QUERY,
	)
	const searchParamsString = buildYoutubeQueryString(
		currentQuery,
		VIDEO_PAGE_DEFAULT_QUERY,
		extraSearchParams,
	)

	let youtubeDetails: Video[] | PlaylistDoc[] = []
	let pageMax = 0
	let error: ApiError | undefined

	const assignApiError = (scope: string, apiError: ApiError) => {
		logError('Video Page', scope, apiError)
		error = apiError
	}

	const assignUnexpectedError = (scope: string, cause: unknown) => {
		logError('Video Page', scope, cause)
		error = {
			ok: false,
			status: 500,
			message: UNEXPECTED_ERROR_MESSAGE,
		}
	}

	if (currentQuery.liveOrBand === 'band') {
		try {
			const res = await searchVideoAction(currentQuery)
			if (res.ok) {
				youtubeDetails = res.data.items
				pageMax = Math.ceil(res.data.total / currentQuery.videoPerPage)
			} else {
				assignApiError('Failed to fetch videos', res)
			}
		} catch (caughtError) {
			assignUnexpectedError(
				'Unexpected error while fetching videos',
				caughtError,
			)
		}
	} else {
		try {
			const res = await searchPlaylistAction(currentQuery)
			if (res.ok) {
				youtubeDetails = res.data.items
				pageMax = Math.ceil(res.data.total / currentQuery.videoPerPage)
			} else {
				assignApiError('Failed to fetch playlists', res)
			}
		} catch (caughtError) {
			assignUnexpectedError(
				'Unexpected error while fetching playlists',
				caughtError,
			)
		}
	}

	return (
		<Suspense fallback={<Loading />}>
			<VideoListPage
				key={searchParamsString}
				youtubeDetails={youtubeDetails}
				pageMax={pageMax}
				error={error}
				defaultQuery={VIDEO_PAGE_DEFAULT_QUERY}
				initialQuery={currentQuery}
				extraSearchParams={extraSearchParams}
			/>
		</Suspense>
	)
}

export default Page
