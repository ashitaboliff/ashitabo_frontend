import { Suspense } from 'react'
import VideoListPage from '@/app/video/_components/VideoListPage'
import { searchYoutubeDetailsAction } from '@/domains/video/api/videoActions'
import type {
	YoutubeDetail,
	YoutubeSearchQuery,
} from '@/domains/video/model/videoTypes'
import Loading from '@/shared/ui/atoms/Loading'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/responseTypes'

const parseVideoPageSearchParams = (
	params: URLSearchParams,
): YoutubeSearchQuery => {
	const defaultQuery: YoutubeSearchQuery = {
		liveOrBand: 'band',
		bandName: '',
		liveName: '',
		tag: [],
		tagSearchMode: 'or',
		sort: 'new',
		page: 1,
		videoPerPage: 15,
	}
	return {
		liveOrBand:
			(params.get('liveOrBand') as 'live' | 'band') ?? defaultQuery.liveOrBand,
		bandName: params.get('bandName') ?? defaultQuery.bandName,
		liveName: params.get('liveName') ?? defaultQuery.liveName,
		tag: (params.getAll('tag') as string[]) ?? defaultQuery.tag,
		tagSearchMode:
			(params.get('tagSearchMode') as 'and' | 'or') ??
			defaultQuery.tagSearchMode,
		sort: (params.get('sort') as 'new' | 'old') ?? defaultQuery.sort,
		page: Number(params.get('page')) || defaultQuery.page,
		videoPerPage:
			Number(params.get('videoPerPage')) || defaultQuery.videoPerPage,
	}
}

type VideoPageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const Page = async ({ searchParams: params }: VideoPageProps) => {
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

	const currentQuery = parseVideoPageSearchParams(queryParams)
	const searchParamsString = queryParams.toString() // keyとして使用する文字列

	let initialYoutubeDetails: YoutubeDetail[] = []
	let initialPageMax = 1
	let initialError: ApiError | undefined

	const res = await searchYoutubeDetailsAction(currentQuery)

	if (res.ok) {
		initialYoutubeDetails = res.data.results
		initialPageMax =
			Math.ceil(res.data.totalCount / currentQuery.videoPerPage) || 1
	} else {
		initialError = res
		logError('Failed to fetch youtube details', res)
	}

	return (
		<Suspense fallback={<Loading />}>
			<VideoListPage
				key={searchParamsString}
				initialYoutubeDetails={initialYoutubeDetails}
				initialPageMax={initialPageMax}
				initialError={initialError}
			/>
		</Suspense>
	)
}

export default Page
