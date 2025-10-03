import 'server-only'

const API_PREFIX = '/api'
const DEFAULT_APP_URL = 'http://localhost:3000'

const normalizePath = (path: string) => {
	if (!path.startsWith('/')) {
		return `/${path}`
	}
	return path
}

const resolveAppUrl = () => {
	const envValue = process.env.NEXT_PUBLIC_APP_URL?.trim()
	if (envValue && envValue.length > 0) {
		return envValue.endsWith('/') ? envValue.slice(0, -1) : envValue
	}
	return DEFAULT_APP_URL
}

const buildAbsoluteApiUrl = (path: string) => {
	const normalized = normalizePath(path)
	const base = resolveAppUrl()
	return `${base}${API_PREFIX}${normalized}`
}

export class ApiError extends Error {
	status: number
	constructor(status: number, message: string) {
		super(message)
		this.name = 'ApiError'
		this.status = status
	}
}

type FetchOptions = RequestInit & {
	parseJson?: boolean
}

export async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
	const { parseJson = true, ...init } = options ?? {}
	const response = await fetch(buildAbsoluteApiUrl(path), {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
		...init,
	})

	if (!response.ok) {
		const message = await response.text()
		throw new ApiError(response.status, message || 'API request failed')
	}

	if (!parseJson) {
		// @ts-expect-error -- caller is responsible for handling non-JSON responses
		return response
	}

	return (await response.json()) as T
}

export const clientSideFetcher = async <T>(input: string | URL): Promise<T> => {
	const url = typeof input === 'string' ? input : input.toString()
	const response = await fetch(`${API_PREFIX}${normalizePath(url)}`, {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		const message = await response.text()
		throw new ApiError(response.status, message || 'API request failed')
	}

	return (await response.json()) as T
}
