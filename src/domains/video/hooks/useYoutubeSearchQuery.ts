'use client'

import { useMemo } from 'react'
import type { YoutubeSearchQuery } from '@/domains/video/model/videoTypes'
import { createYoutubeQueryOptions } from '@/domains/video/query/youtubeQuery'
import { useQueryState } from '@/shared/hooks/useQueryState'

type UseYoutubeSearchQueryArgs = {
	defaultQuery: YoutubeSearchQuery
	initialQuery: YoutubeSearchQuery
	extraSearchParams?: string
}

export const useYoutubeSearchQuery = ({
	defaultQuery,
	initialQuery,
	extraSearchParams,
}: UseYoutubeSearchQueryArgs) => {
	const queryOptions = useMemo(
		() => createYoutubeQueryOptions(defaultQuery),
		[defaultQuery],
	)

	const { query, updateQuery, isPending, hasCustomQuery } =
		useQueryState<YoutubeSearchQuery>({
			queryOptions,
			initialQuery,
			extraSearchParams,
		})

	return {
		query,
		updateQuery,
		isPending,
		isSearching: hasCustomQuery,
	}
}
