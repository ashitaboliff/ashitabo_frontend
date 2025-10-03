import { ApiResponse, StatusCode } from '@/types/responseTypes'

const DEFAULT_FRONTEND_ORIGIN =
	process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ??
	process.env.NEXT_PUBLIC_APP_BASE_URL ??
	process.env.NEXTAUTH_URL ??
	process.env.AUTH_URL ??
	'http://localhost:3000'

export type QueryValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Array<string | number | boolean>

const buildUrl = (
	path: string,
	searchParams?: Record<string, QueryValue>,
) => {
	const normalizedPath = path.startsWith('/api')
		? path
		: `/api${path.startsWith('/') ? path : `/${path}`}`

	if (typeof window !== 'undefined') {
		const url = new URL(normalizedPath, window.location.origin)
		appendSearchParams(url, searchParams)
		return url.toString()
	}

	const url = new URL(normalizedPath, DEFAULT_FRONTEND_ORIGIN)
	appendSearchParams(url, searchParams)
	return url.toString()
}

const appendSearchParams = (
	url: URL,
	params?: Record<string, QueryValue>,
) => {
	if (!params) return
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return
		if (Array.isArray(value)) {
			value.forEach((item) => {
				url.searchParams.append(key, String(item))
			})
			return
		}
		url.searchParams.set(key, String(value))
	})
}

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
	searchParams?: Record<string, QueryValue>
	body?: unknown
}

const resolveBody = (body: unknown): BodyInit | undefined => {
	if (body === undefined || body === null) {
		return undefined
	}
	if (typeof body === 'string') {
		return body
	}
	if (
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		ArrayBuffer.isView(body) ||
		body instanceof FormData ||
		body instanceof URLSearchParams
	) {
		return body as BodyInit
	}
	return JSON.stringify(body)
}

const normalizeHeaders = (headersInit?: HeadersInit) => {
	const headers = new Headers(headersInit)
	if (!headers.has('Accept')) {
		headers.set('Accept', 'application/json')
	}
	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json')
	}
	return headers
}

const parseResponse = async (response: Response) => {
	const contentType = response.headers.get('content-type') ?? ''
	if (response.status === StatusCode.NO_CONTENT) {
		return null
	}
	if (contentType.includes('application/json')) {
		return response.json()
	}
	return response.text()
}

const toErrorMessage = (payload: unknown, fallback: string) => {
	if (typeof payload === 'string') return payload
	if (payload && typeof payload === 'object') {
		const maybeMessage = (payload as Record<string, unknown>).message
		if (typeof maybeMessage === 'string') {
			return maybeMessage
		}
		const maybeError = (payload as Record<string, unknown>).error
		if (typeof maybeError === 'string') {
			return maybeError
		}
	}
	return fallback
}

export const apiRequest = async <T>(
	path: string,
	options?: ApiClientOptions,
): Promise<ApiResponse<T>> => {
	const { searchParams, headers, body, ...rest } = options ?? {}

	const url = buildUrl(path, searchParams)

	const requestInit: RequestInit = {
		...rest,
		credentials: 'include',
		headers: normalizeHeaders(headers),
		body:
			rest.method && rest.method !== 'GET' && rest.method !== 'HEAD'
				? resolveBody(body)
				: undefined,
	}

	const response = await fetch(url, requestInit)
	const payload = await parseResponse(response)

	if (response.ok) {
		if (response.status === StatusCode.NO_CONTENT) {
			return { status: StatusCode.NO_CONTENT, response: null } as ApiResponse<T>
		}
		const successStatus =
			response.status === StatusCode.CREATED
				? StatusCode.CREATED
				: StatusCode.OK
		return {
			status: successStatus,
			response: payload as T,
		}
	}

	const errorMessage = toErrorMessage(payload, response.statusText)

	return {
		status: response.status as StatusCode,
		response: errorMessage,
	} as ApiResponse<T>
}

export const swrJsonFetcher = async <T>(path: string) => {
	const res = await apiRequest<T>(path)
	if (res.status === StatusCode.OK || res.status === StatusCode.CREATED) {
		return res.response
	}
	const message =
		typeof res.response === 'string' ? res.response : 'Failed to fetch data'
	throw new Error(message)
}
