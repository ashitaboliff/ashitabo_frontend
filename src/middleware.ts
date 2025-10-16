import { type NextRequest, NextResponse } from 'next/server'

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|api/auth|favicon.ico|login.jpg|fonts|meta|robots.txt|sitemap.xml|_next|api/youtube|api/generate-ics).*)',
	],
}

const PROFILE_REQUIRED_ROUTES = [
	'/user',
	'/admin',
	'/booking/new',
	'/booking/[^/]+/edit',
	'/schedule/new',
	'/schedule/[^/]+/edit',
]

const PUBLIC_ROUTES = [
	'/',
	'/home',
	'/auth/padlock',
	'/auth/signin',
	'/auth/session-expired',
	'/auth/error',
	'/blogs',
	'/schedule',
	'/schedule/[^/]+(?!/edit)',
	'/video',
	'/booking',
	'/booking/[^/]+(?!/edit)',
	'/maintenance',
	'/not-found',
]

const _AUTH_FLOW_ROUTES = ['/auth/padlock', '/auth/signin']

const AUTH_COOKIE_NAMES = [
	'authjs.session-token',
	'__Secure-authjs.session-token',
]

export const matchesRoute = (pathname: string, patterns: string[]): boolean =>
	patterns.some((pattern) => new RegExp(`^${pattern}$`).test(pathname))

export const extractClientIp = (
	xForwardedFor: string | null,
	fallback: string,
): string => {
	if (!xForwardedFor) return fallback
	const [first] = xForwardedFor.split(',')
	return first?.trim() || fallback
}

export const simplifyIpAddress = (ip: string): string => {
	const index = ip.search(/[0-9]/)
	return index === -1 ? ip : ip.slice(index)
}

export const hasAuthCookie = (request: NextRequest): boolean =>
	AUTH_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value))

const redirect = (request: NextRequest, path: string, status = 302) =>
	NextResponse.redirect(new URL(path, request.url), { status })

const handleMaintenance = (
	request: NextRequest,
	options: { maintenanceMode: boolean; whitelist: string[] },
): NextResponse | null => {
	const { maintenanceMode, whitelist } = options
	const { pathname } = request.nextUrl

	if (!maintenanceMode) {
		if (pathname === '/maintenance') {
			return redirect(request, '/home')
		}
		return null
	}

	if (pathname === '/maintenance' || pathname.startsWith('/_next')) {
		return NextResponse.next()
	}

	const ip = extractClientIp(
		request.headers.get('x-forwarded-for'),
		'127.0.0.1',
	)
	const simplifiedIp = simplifyIpAddress(ip)

	if (!whitelist.includes(simplifiedIp)) {
		return redirect(request, '/maintenance')
	}

	return null
}

// ルートパスと認証フロー関連のパスをリダイレクト
const handleRootRedirects = (request: NextRequest): NextResponse | null => {
	const { pathname } = request.nextUrl

	if (pathname === '/') {
		return redirect(request, '/home', 301)
	}

	if (pathname === '/auth') {
		return redirect(request, '/auth/signin', 301)
	}

	return null
}

// プロフィールが必要なルートを保護
const handleProtectedRoutes = (request: NextRequest): NextResponse | null => {
	const { pathname } = request.nextUrl

	if (matchesRoute(pathname, PROFILE_REQUIRED_ROUTES)) {
		if (!hasAuthCookie(request)) {
			return redirect(request, '/auth/signin')
		}
		return NextResponse.next()
	}

	return null
}

const handlePublicRoutes = (pathname: string): NextResponse | null => {
	if (matchesRoute(pathname, PUBLIC_ROUTES)) {
		return NextResponse.next()
	}
	return null
}

export const handleRequest = (request: NextRequest): NextResponse => {
	const maintenanceResponse = handleMaintenance(request, {
		maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
		whitelist: process.env.MAINTENANCE_WHITELIST?.split(',') ?? [],
	})
	if (maintenanceResponse) return maintenanceResponse

	const rootRedirect = handleRootRedirects(request)
	if (rootRedirect) return rootRedirect

	const protectedRouteResponse = handleProtectedRoutes(request)
	if (protectedRouteResponse) return protectedRouteResponse

	const publicRouteResponse = handlePublicRoutes(request.nextUrl.pathname)
	if (publicRouteResponse) return publicRouteResponse

	return NextResponse.next()
}

export default function middleware(request: NextRequest) {
	return handleRequest(request)
}
