import { Suspense } from 'react'
import VideoListPage from '@/app/video/_components/VideoListPage'
import {
	searchPlaylistAction,
	searchVideoAction,
} from '@/domains/video/api/videoActions'
import type {
	PlaylistDoc,
	Video,
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
		sort: 'new',
		page: 1,
		videoPerPage: 15,
	}
	return {
		liveOrBand:
			(params.get('liveOrBand') as 'live' | 'band') ?? defaultQuery.liveOrBand,
		bandName: params.get('bandName') ?? defaultQuery.bandName,
		liveName: params.get('liveName') ?? defaultQuery.liveName,
		sort: (params.get('sort') as 'new' | 'old') ?? defaultQuery.sort,
		page: Number(params.get('page')) || defaultQuery.page,
		videoPerPage:
			Number(params.get('videoPerPage')) || defaultQuery.videoPerPage,
	}
}

type Props = {
	readonly searchParams: Promise<{
		[key: string]: string | string[] | undefined
	}>
}

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

	const currentQuery = parseVideoPageSearchParams(queryParams)
	const searchParamsString = queryParams.toString()

	if (currentQuery.liveOrBand === 'band') {
		try {
			const res = await searchVideoAction(currentQuery)
			if (res.ok) {
				const initialYoutubeDetails: Video[] = res.data.items
				const initialPageMax = Math.ceil(
					res.data.total / currentQuery.videoPerPage,
				)
				return (
					<Suspense fallback={<Loading />}>
						<VideoListPage
							key={searchParamsString}
							initialYoutubeDetails={initialYoutubeDetails}
							initialPageMax={initialPageMax}
						/>
					</Suspense>
				)
			} else {
				logError('Video Page', 'Failed to fetch videos', res)
				return (
					<Suspense fallback={<Loading />}>
						<VideoListPage
							key={searchParamsString}
							initialYoutubeDetails={[]}
							initialPageMax={0}
							initialError={res}
						/>
					</Suspense>
				)
			}
		} catch (error) {
			logError('Video Page', 'Unexpected error while fetching videos', error)
			const initialError: ApiError = {
				ok: false,
				status: 500,
				message: '予期せぬエラーが発生しました。',
			}
			return (
				<Suspense fallback={<Loading />}>
					<VideoListPage
						key={searchParamsString}
						initialYoutubeDetails={[]}
						initialPageMax={0}
						initialError={initialError}
					/>
				</Suspense>
			)
		}
	} else {
		try {
			const res = await searchPlaylistAction(currentQuery)
			if (res.ok) {
				const initialYoutubeDetails: PlaylistDoc[] = res.data.items
				const initialPageMax = Math.ceil(
					res.data.total / currentQuery.videoPerPage,
				)
				return (
					<Suspense fallback={<Loading />}>
						<VideoListPage
							key={searchParamsString}
							initialYoutubeDetails={initialYoutubeDetails}
							initialPageMax={initialPageMax}
						/>
					</Suspense>
				)
			} else {
				logError('Video Page', 'Failed to fetch playlists', res)
				return (
					<Suspense fallback={<Loading />}>
						<VideoListPage
							key={searchParamsString}
							initialYoutubeDetails={[]}
							initialPageMax={0}
							initialError={res}
						/>
					</Suspense>
				)
			}
		} catch (error) {
			logError('Video Page', 'Unexpected error while fetching playlists', error)
			const initialError: ApiError = {
				ok: false,
				status: 500,
				message: '予期せぬエラーが発生しました。',
			}
			return (
				<Suspense fallback={<Loading />}>
					<VideoListPage
						key={searchParamsString}
						initialYoutubeDetails={[]}
						initialPageMax={0}
						initialError={initialError}
					/>
				</Suspense>
			)
		}
	}
}

export default Page
