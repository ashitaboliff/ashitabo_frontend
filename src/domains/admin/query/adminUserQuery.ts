import type { AdminUserSort } from '@/domains/admin/model/adminTypes'
import {
	buildQueryString,
	type ParsedQuery,
	parseQueryParams,
	type QueryOptions,
} from '@/shared/utils/queryParams'

export type AdminUserQuery = {
	page: number
	perPage: number
	sort: AdminUserSort
}

const clampPositiveInt = (values: string[], fallback: number, max?: number) => {
	if (values.length === 0) return fallback
	const parsed = Number(values[values.length - 1])
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback
	const bounded = Math.floor(parsed)
	return max !== undefined && bounded > max ? max : bounded
}

const ADMIN_USER_QUERY_DEFINITIONS: QueryOptions<AdminUserQuery>['definitions'] =
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
				return latest === 'new' || latest === 'old'
					? (latest as AdminUserSort)
					: defaultValue
			},
		},
	}

export const ADMIN_USER_DEFAULT_QUERY: AdminUserQuery = {
	page: 1,
	perPage: 10,
	sort: 'new',
}

export const createAdminUserQueryOptions = (
	defaultQuery: AdminUserQuery,
): QueryOptions<AdminUserQuery> => ({
	defaultQuery,
	definitions: ADMIN_USER_QUERY_DEFINITIONS,
})

export const parseAdminUserQuery = (
	params: URLSearchParams,
	defaultQuery: AdminUserQuery,
): ParsedQuery<AdminUserQuery> =>
	parseQueryParams(params, createAdminUserQueryOptions(defaultQuery))

export const buildAdminUserQueryString = (
	query: AdminUserQuery,
	defaultQuery: AdminUserQuery,
	extraSearchParams?: string,
) =>
	buildQueryString(
		query,
		createAdminUserQueryOptions(defaultQuery),
		extraSearchParams,
	)
