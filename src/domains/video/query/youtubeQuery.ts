import type { YoutubeSearchQuery } from '@/domains/video/model/videoTypes'
import {
	buildQueryString,
	type ParsedQuery,
	parseQueryParams,
	type QueryOptions,
} from '@/shared/utils/queryParams'

const clampPositiveInt = (value: string[], fallback: number, max?: number) => {
	if (value.length === 0) return fallback
	const parsed = Number(value[value.length - 1])
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback
	if (max !== undefined && parsed > max) return max
	return Math.floor(parsed)
}

const LIVE_OR_BAND_VALUES = new Set<YoutubeSearchQuery['liveOrBand']>([
	'live',
	'band',
])

const SORT_VALUES = new Set<YoutubeSearchQuery['sort']>(['new', 'old'])

const YOUTUBE_QUERY_DEFINITIONS = {
	liveOrBand: {
		parse: ({
			values,
			defaultValue,
		}: {
			values: string[]
			defaultValue: YoutubeSearchQuery['liveOrBand']
		}) => {
			const latest = values[values.length - 1]
			return LIVE_OR_BAND_VALUES.has(latest as YoutubeSearchQuery['liveOrBand'])
				? (latest as YoutubeSearchQuery['liveOrBand'])
				: defaultValue
		},
	},
	sort: {
		parse: ({
			values,
			defaultValue,
		}: {
			values: string[]
			defaultValue: YoutubeSearchQuery['sort']
		}) => {
			const latest = values[values.length - 1]
			return SORT_VALUES.has(latest as YoutubeSearchQuery['sort'])
				? (latest as YoutubeSearchQuery['sort'])
				: defaultValue
		},
	},
	page: {
		parse: ({
			values,
			defaultValue,
		}: {
			values: string[]
			defaultValue: number
		}) => clampPositiveInt(values, defaultValue),
	},
	videoPerPage: {
		parse: ({
			values,
			defaultValue,
		}: {
			values: string[]
			defaultValue: number
		}) => clampPositiveInt(values, defaultValue, 200),
	},
} satisfies QueryOptions<YoutubeSearchQuery>['definitions']

export const createYoutubeQueryOptions = (
	defaultQuery: YoutubeSearchQuery,
): QueryOptions<YoutubeSearchQuery> => ({
	defaultQuery,
	definitions: YOUTUBE_QUERY_DEFINITIONS,
})

export const VIDEO_PAGE_DEFAULT_QUERY: YoutubeSearchQuery = {
	liveOrBand: 'band',
	bandName: '',
	liveName: '',
	sort: 'new',
	page: 1,
	videoPerPage: 15,
}

export const ADMIN_YOUTUBE_DEFAULT_QUERY: YoutubeSearchQuery = {
	liveOrBand: 'live',
	bandName: '',
	liveName: '',
	sort: 'new',
	page: 1,
	videoPerPage: 20,
}

export const parseYoutubeQuery = (
	params: URLSearchParams,
	defaultQuery: YoutubeSearchQuery,
): ParsedQuery<YoutubeSearchQuery> =>
	parseQueryParams(params, createYoutubeQueryOptions(defaultQuery))

export const buildYoutubeQueryString = (
	query: YoutubeSearchQuery,
	defaultQuery: YoutubeSearchQuery,
	extraSearchParams?: string,
) =>
	buildQueryString(
		query,
		createYoutubeQueryOptions(defaultQuery),
		extraSearchParams,
	)
