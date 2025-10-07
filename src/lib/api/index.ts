import {
	ApiResponse,
	ErrorStatus,
	StatusCode,
	SuccessStatus,
} from '@/types/responseTypes'

const DEFAULT_FRONTEND_ORIGIN =
	process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'http://localhost:3000'

export type QueryValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Array<string | number | boolean>

const buildUrl = (path: string, searchParams?: Record<string, QueryValue>) => {
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

const appendSearchParams = (url: URL, params?: Record<string, QueryValue>) => {
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

const normalizeHeaders = (
	headersInit?: HeadersInit,
	skipContentType = false,
) => {
	const headers = new Headers(headersInit)
	if (!headers.has('Accept')) {
		headers.set('Accept', 'application/json')
	}
	if (!skipContentType && !headers.has('Content-Type')) {
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

	const shouldSkipContentType = body instanceof FormData

	const requestInit: RequestInit = {
		...rest,
		credentials: 'include',
		headers: normalizeHeaders(headers, shouldSkipContentType),
		body:
			rest.method && rest.method !== 'GET' && rest.method !== 'HEAD'
				? resolveBody(body)
				: undefined,
	}

	const response = await fetch(url, requestInit)
	const payload = await parseResponse(response)

	if (response.ok) {
		const successStatus = response.status as SuccessStatus
		const data = (
			successStatus === StatusCode.NO_CONTENT ? null : (payload as T) ?? null
		) as T

		return {
			ok: true,
			status: successStatus,
			data,
		}
	}

	const errorMessage = toErrorMessage(payload, response.statusText)
	const errorStatus: ErrorStatus = (() => {
		switch (response.status) {
			case StatusCode.BAD_REQUEST:
			case StatusCode.UNAUTHORIZED:
			case StatusCode.FORBIDDEN:
			case StatusCode.NOT_FOUND:
			case StatusCode.CONFLICT:
			case StatusCode.INTERNAL_SERVER_ERROR:
			case StatusCode.BAD_GATEWAY:
			case StatusCode.SERVICE_UNAVAILABLE:
				return response.status
			default:
				return StatusCode.INTERNAL_SERVER_ERROR
		}
	})()

	return {
		ok: false,
		status: errorStatus,
		message: errorMessage,
		details: typeof payload === 'object' ? payload : undefined,
	}
}

export const swrJsonFetcher = async <T>(path: string) => {
	const res = await apiRequest<T>(path)
	if (res.ok) {
		return res.data
	}
	const message =
		typeof res.message === 'string' ? res.message : 'Failed to fetch data'
	throw new Error(message)
}
