import { useCallback, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { YoutubeSearchQuery } from '@/features/video/types'

const parseSearchParams = (
	params: URLSearchParams,
	defaultQuery: YoutubeSearchQuery,
): YoutubeSearchQuery => {
	const query: YoutubeSearchQuery = { ...defaultQuery }

	const liveOrBand = params.get('liveOrBand')
	if (liveOrBand === 'live' || liveOrBand === 'band') {
		query.liveOrBand = liveOrBand
	}

	const bandName = params.get('bandName')
	if (bandName !== null) {
		query.bandName = bandName
	}

	const liveName = params.get('liveName')
	if (liveName !== null) {
		query.liveName = liveName
	}

	const tags = params.getAll('tag')
	query.tag = tags.length > 0 ? tags : defaultQuery.tag

	const tagSearchMode = params.get('tagSearchMode')
	if (tagSearchMode === 'and' || tagSearchMode === 'or') {
		query.tagSearchMode = tagSearchMode
	}

	const sort = params.get('sort')
	if (sort === 'new' || sort === 'old') {
		query.sort = sort
	}

	const page = Number(params.get('page'))
	query.page = Number.isFinite(page) && page > 0 ? page : defaultQuery.page

	const videoPerPage = Number(params.get('videoPerPage'))
	query.videoPerPage =
		Number.isFinite(videoPerPage) && videoPerPage > 0
			? videoPerPage
			: defaultQuery.videoPerPage

	return query
}

const areArraysEqual = (a: string[], b: string[]) => {
	if (a.length !== b.length) {
		return false
	}
	return a.every((value, index) => value === b[index])
}

const serializeQuery = (
	query: YoutubeSearchQuery,
	defaultQuery: YoutubeSearchQuery,
) => {
	const params = new URLSearchParams()

	;(
		Object.entries(query) as Array<
			[keyof YoutubeSearchQuery, YoutubeSearchQuery[keyof YoutubeSearchQuery]]
		>
	).forEach(([key, value]) => {
		const defaultValue = defaultQuery[key]

		if (Array.isArray(value)) {
			const defaultArray = Array.isArray(defaultValue) ? defaultValue : []

			if (value.length === 0 || areArraysEqual(value, defaultArray)) {
				return
			}

			value.forEach((item) => {
				if (item !== undefined && item !== null && item !== '') {
					params.append(key, String(item))
				}
			})
			return
		}

		if (value === undefined || value === null || value === '') {
			return
		}

		const valueString = String(value)
		const defaultString =
			defaultValue === undefined || defaultValue === null
				? undefined
				: String(defaultValue)

		if (defaultString !== undefined && valueString === defaultString) {
			return
		}

		params.set(key, valueString)
	})

	return params
}

export const useYoutubeSearchQuery = (defaultQuery: YoutubeSearchQuery) => {
	const pathname = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const query = useMemo(
		() => parseSearchParams(searchParams, defaultQuery),
		[defaultQuery, searchParams],
	)

	const isSearching = useMemo(
		() => searchParams.toString().length > 0,
		[searchParams],
	)

	const updateQuery = useCallback(
		(nextQuery: Partial<YoutubeSearchQuery>) => {
			const mergedQuery: YoutubeSearchQuery = {
				...query,
				...nextQuery,
			}

			const params = serializeQuery(mergedQuery, defaultQuery)

			startTransition(() => {
				const nextQueryString = params.toString()
				const target = nextQueryString
					? `${pathname}?${nextQueryString}`
					: pathname
				router.replace(target)
			})
		},
		[defaultQuery, pathname, query, router, startTransition],
	)

	return {
		query,
		isSearching,
		updateQuery,
		isPending,
	}
}
