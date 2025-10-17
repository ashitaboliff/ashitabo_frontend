import { type NextRequest, NextResponse } from 'next/server'
import env from '@/lib/env'

const DEFAULT_BACKEND_BASE_URL = 'http://localhost:8787'

const resolveBackendBaseUrl = () => {
	const envValue = env.API_URL?.trim()
	if (envValue && envValue.length > 0) {
		return envValue.endsWith('/') ? envValue.slice(0, -1) : envValue
	}
	return DEFAULT_BACKEND_BASE_URL
}

const appendSearchParams = (url: URL, req: NextRequest) => {
	req.nextUrl.searchParams.forEach((value, key) => {
		url.searchParams.append(key, value)
	})
}

const createProxyHeaders = (request: NextRequest) => {
	const headers = new Headers(request.headers)
	headers.delete('host')
	headers.delete('connection')
	headers.delete('accept-encoding')
	headers.delete('content-length')

	const apiKey = env.API_KEY?.trim()
	if (apiKey) {
		headers.set('X-API-Key', apiKey)
	}

	return headers
}

const buildTargetUrl = (params: string[] = [], request: NextRequest) => {
	const joinedPath = params.length > 0 ? `/${params.join('/')}` : ''
	const backendBase = resolveBackendBaseUrl()
	const target = new URL(`${backendBase}${joinedPath}`)
	appendSearchParams(target, request)
	return target
}

type BackendParams = { backend?: string[] }
type RouteContext = { params: Promise<BackendParams> }

const proxyRequest = async (request: NextRequest, context: RouteContext) => {
	const { backend } = await context.params
	const targetUrl = buildTargetUrl(backend ?? [], request)
	const outgoingHeaders = createProxyHeaders(request)
	const cookieHeader = request.headers.get('cookie')
	if (cookieHeader) {
		outgoingHeaders.set('cookie', cookieHeader)
	} else {
		outgoingHeaders.delete('cookie')
	}

	let body: ArrayBuffer | undefined
	if (!['GET', 'HEAD'].includes(request.method)) {
		body = await request.arrayBuffer()
	}

	const backendResponse = await fetch(targetUrl, {
		method: request.method,
		headers: outgoingHeaders,
		body,
		redirect: 'manual',
		credentials: 'include',
	})

	const responseHeaders = new Headers(backendResponse.headers)
	responseHeaders.delete('transfer-encoding')
	responseHeaders.delete('content-encoding')
	responseHeaders.delete('content-length')

	return new NextResponse(backendResponse.body, {
		status: backendResponse.status,
		headers: responseHeaders,
	})
}

const handleError = (error: unknown) => {
	const message =
		error instanceof Error ? error.message : 'Unexpected proxy error'
	return NextResponse.json({ error: 'ProxyError', message }, { status: 502 })
}

export async function GET(req: NextRequest, context: RouteContext) {
	try {
		return await proxyRequest(req, context)
	} catch (error) {
		return handleError(error)
	}
}

export async function POST(req: NextRequest, context: RouteContext) {
	try {
		return await proxyRequest(req, context)
	} catch (error) {
		return handleError(error)
	}
}

export async function PUT(req: NextRequest, context: RouteContext) {
	try {
		return await proxyRequest(req, context)
	} catch (error) {
		return handleError(error)
	}
}

export async function PATCH(req: NextRequest, context: RouteContext) {
	try {
		return await proxyRequest(req, context)
	} catch (error) {
		return handleError(error)
	}
}

export async function DELETE(req: NextRequest, context: RouteContext) {
	try {
		return await proxyRequest(req, context)
	} catch (error) {
		return handleError(error)
	}
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
	try {
		return await proxyRequest(req, context)
	} catch (error) {
		return handleError(error)
	}
}

export async function HEAD(req: NextRequest, context: RouteContext) {
	try {
		return await proxyRequest(req, context)
	} catch (error) {
		return handleError(error)
	}
}
