'use server'

import { cookies } from 'next/headers'
import env from '@/shared/lib/env'
import {
	type ApiResponse,
	type ErrorStatus,
	StatusCode,
	type SuccessStatus,
} from '@/types/responseTypes'

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

	const url = new URL(normalizedPath, env.NEXT_PUBLIC_APP_URL)
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

export interface ApiClientOptions
	extends Omit<RequestInit, 'body' | 'cache' | 'next'> {
	searchParams?: Record<string, QueryValue>
	body?: unknown
	cache?: RequestCache
	next?: RequestInit['next']
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
	const { searchParams, headers, body, cache, next, ...rest } = options ?? {}

	const url = buildUrl(path, searchParams)

	const shouldSkipContentType = body instanceof FormData

	let cookieHeader: string | undefined
	const cookieStore = await cookies()
	const sessionToken =
		cookieStore.get('authjs.session-token')?.value ??
		cookieStore.get('__Secure-authjs.session-token')?.value
	if (sessionToken) {
		const cookieName = cookieStore.get('authjs.session-token')
			? 'authjs.session-token'
			: '__Secure-authjs.session-token'
		cookieHeader = `${cookieName}=${sessionToken}`
	}

	const requestHeaders = normalizeHeaders(headers, shouldSkipContentType)
	if (cookieHeader) {
		requestHeaders.set('Cookie', cookieHeader)
	}

	const requestInit: RequestInit = {
		...rest,
		cache,
		next,
		credentials: 'include',
		headers: requestHeaders,
		body: resolveBody(body),
	}

	const response = await fetch(url, requestInit)
	const payload = await parseResponse(response)

	if (response.ok) {
		const successStatus = response.status as SuccessStatus

		return {
			ok: true,
			status: successStatus,
			data: payload,
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
