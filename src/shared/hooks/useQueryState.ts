'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useTransition } from 'react'
import { buildQueryParams, type QueryOptions } from '@/shared/utils/queryParams'

type UseQueryStateOptions<T extends Record<string, unknown>> = {
	queryOptions: QueryOptions<T>
	initialQuery: T
	extraSearchParams?: string
	explicitPathname?: string
}

export const useQueryState = <T extends Record<string, unknown>>({
	queryOptions,
	initialQuery,
	extraSearchParams,
	explicitPathname,
}: UseQueryStateOptions<T>) => {
	const router = useRouter()
	const rawPathname = usePathname()
	const pathname = explicitPathname
		? explicitPathname.split('?')[0].split('#')[0]
		: rawPathname.split('?')[0].split('#')[0]
	const [isPending, startTransition] = useTransition()

	const extra = extraSearchParams ?? ''

	const query = initialQuery

	const updateQuery = useCallback(
		(patch: Partial<T>) => {
			const nextQuery = { ...query, ...patch }
			const params = buildQueryParams(nextQuery, queryOptions, extra)
			const queryString = params.toString()
			startTransition(() => {
				const target = queryString ? `${pathname}?${queryString}` : pathname
				router.replace(target)
			})
		},
		[extra, pathname, query, queryOptions, router],
	)

	const hasCustomQuery = useMemo(() => {
		const currentParams = buildQueryParams(query, queryOptions, extra)
		return currentParams.toString().length > 0
	}, [extra, query, queryOptions])

	return {
		query,
		updateQuery,
		isPending,
		hasCustomQuery,
	}
}
