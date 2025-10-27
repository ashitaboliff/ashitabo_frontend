import type { DeniedBookingSort } from '@/domains/admin/model/adminTypes'
import {
	buildQueryString,
	type ParsedQuery,
	parseQueryParams,
	type QueryOptions,
} from '@/shared/utils/queryParams'

export type DeniedBookingQuery = {
	page: number
	perPage: number
	sort: DeniedBookingSort
}

const clampPositiveInt = (values: string[], fallback: number, max?: number) => {
	if (values.length === 0) return fallback
	const parsed = Number(values[values.length - 1])
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback
	const bounded = Math.floor(parsed)
	return max !== undefined && bounded > max ? max : bounded
}

const DENIED_BOOKING_QUERY_DEFINITIONS: QueryOptions<DeniedBookingQuery>['definitions'] =
	{
		page: {
			parse: ({ values, defaultValue }) =>
				clampPositiveInt(values, defaultValue),
		},
		perPage: {
			parse: ({ values, defaultValue }) =>
				clampPositiveInt(values, defaultValue, 100),
		},
		sort: {
			parse: ({ values, defaultValue }) => {
				const latest = values[values.length - 1]
				return latest === 'new' ||
					latest === 'old' ||
					latest === 'relativeCurrent'
					? (latest as DeniedBookingSort)
					: defaultValue
			},
		},
	}

export const DENIED_BOOKING_DEFAULT_QUERY: DeniedBookingQuery = {
	page: 1,
	perPage: 10,
	sort: 'relativeCurrent',
}

export const createDeniedBookingQueryOptions = (
	defaultQuery: DeniedBookingQuery,
): QueryOptions<DeniedBookingQuery> => ({
	defaultQuery,
	definitions: DENIED_BOOKING_QUERY_DEFINITIONS,
})

export const parseDeniedBookingQuery = (
	params: URLSearchParams,
	defaultQuery: DeniedBookingQuery,
): ParsedQuery<DeniedBookingQuery> =>
	parseQueryParams(params, createDeniedBookingQueryOptions(defaultQuery))

export const buildDeniedBookingQueryString = (
	query: DeniedBookingQuery,
	defaultQuery: DeniedBookingQuery,
	extraSearchParams?: string,
) =>
	buildQueryString(
		query,
		createDeniedBookingQueryOptions(defaultQuery),
		extraSearchParams,
	)
