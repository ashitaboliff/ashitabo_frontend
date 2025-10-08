import type { Session } from '@/types/session'
import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL, API_KEY } from '@/lib/env'
import {
	cleanSession,
	makeAuthDetails,
} from '@/features/auth/utils/sessionInfo'
import type { AuthStatus } from '@/features/auth/types'

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|api/auth|favicon.ico|login.jpg|fonts|meta|robots.txt|sitemap.xml|_next|api/youtube|api/generate-ics).*)',
	],
}

// 認証が必要なルート（プロフィール設定完了が必要）
const PROFILE_REQUIRED_ROUTES = [
	'/user',
	'/admin',
	'/booking/new',
	'/booking/[^/]+/edit',
	'/schedule/new',
	'/schedule/[^/]+/edit',
]

// セッションが必要だがプロフィール未設定でもアクセス可能なルート
const SESSION_REQUIRED_ROUTES = ['/auth/signin/setting']

// 完全に公開されているルート
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

// 認証フローのルート（ログイン済みの場合は適切な場所にリダイレクト）
const AUTH_FLOW_ROUTES = ['/auth/padlock', '/auth/signin']

class MiddlewareApp {
	private static readonly SESSION_CACHE_TTL = Number(
		process.env.MIDDLEWARE_SESSION_CACHE_MS ?? 5000,
	)
	private static sessionCache = new Map<
		string,
		{ value: Session | null; expires: number }
	>()

	private request: NextRequest
	private isMaintenanceMode: boolean = process.env.MAINTENANCE_MODE === 'true'
	private session: Session | null
	private sessionPromise: Promise<Session | null> | null = null
	private sessionState: AuthStatus | null = null

	constructor(request: NextRequest) {
		this.request = request
		this.session = ((request as any)?.auth as Session | null) ?? null
	}

	private static readCachedSession(token: string) {
		const cached = this.sessionCache.get(token)
		if (!cached) return undefined
		if (cached.expires < Date.now()) {
			this.sessionCache.delete(token)
			return undefined
		}
		return cached.value
	}

	private static writeCachedSession(token: string, session: Session | null) {
		const ttl = Math.max(0, this.SESSION_CACHE_TTL)
		this.sessionCache.set(token, {
			value: session,
			expires: Date.now() + ttl,
		})
	}

	private matchesRoute(path: string, routePatterns: string[]): boolean {
		return routePatterns.some((pattern) => {
			const regex = new RegExp(`^${pattern}$`)
			return regex.test(path)
		})
	}

	private redirect(path: string, status = 302) {
		return NextResponse.redirect(new URL(path, this.request.url), { status })
	}

	private getIpAddress() {
		const xff = this.request.headers.get('x-forwarded-for')
		return xff ? (Array.isArray(xff) ? xff[0] : xff.split(',')[0]) : '127.0.0.1'
	}

	private getSimpleIpAddress() {
		const ip = this.getIpAddress()
		const index = ip.search(/[0-9]/)
		return index === -1 ? ip : ip.slice(index)
	}

	private async fetchSession(): Promise<Session | null> {
		if (this.session) {
			return this.session
		}

		if (this.sessionPromise) {
			return this.sessionPromise
		}

		this.sessionPromise = (async () => {
			try {
				const authCookie =
					this.request.cookies.get('authjs.session-token') ??
					this.request.cookies.get('__Secure-authjs.session-token')
				const sessionToken = authCookie?.value

				if (!sessionToken) {
					this.session = null
					return null
				}

				const cachedSession = MiddlewareApp.readCachedSession(sessionToken)
				if (cachedSession !== undefined) {
					this.session = cachedSession
					return cachedSession
				}

				const cookieName = authCookie?.name ?? 'authjs.session-token'
				const response = await fetch(`${API_BASE_URL}/auth/session`, {
					headers: {
						Cookie: `${cookieName}=${sessionToken}`,
						'X-API-Key': API_KEY,
					},
					cache: 'no-store',
				})

				if (!response.ok) {
					this.session = null
					MiddlewareApp.writeCachedSession(sessionToken, null)
					return null
				}

				const rawSession = (await response.json()) as Session
				const normalizedSession = cleanSession(rawSession)
				this.session = normalizedSession
				MiddlewareApp.writeCachedSession(sessionToken, normalizedSession)
				return normalizedSession
			} catch (error) {
				console.error('Failed to get session state:', error)
				this.session = null
				return null
			} finally {
				this.sessionPromise = null
			}
		})()

		return this.sessionPromise
	}

	private async getSessionState(): Promise<AuthStatus> {
		if (this.sessionState) {
			return this.sessionState
		}

		try {
			const session = await this.fetchSession()
			const details = makeAuthDetails(session)
			this.sessionState = details.status
			return this.sessionState
		} catch (error) {
			console.error('Failed to determine session state:', error)
			this.sessionState = 'guest'
			return this.sessionState
		}
	}

	public async run() {
		const { pathname } = this.request.nextUrl

		// メンテナンスモードの処理
		if (this.isMaintenanceMode) {
			if (pathname === '/maintenance' || pathname.startsWith('/_next')) {
				return NextResponse.next()
			}
			const whitelistIPs = process.env.MAINTENANCE_WHITELIST?.split(',') ?? []
			if (!whitelistIPs.includes(this.getSimpleIpAddress())) {
				return this.redirect('/maintenance')
			}
		} else {
			if (pathname === '/maintenance') {
				return this.redirect('/home')
			}
		}

		// ルートパスは /home にリダイレクト
		if (pathname === '/') {
			return this.redirect('/home', 301)
		}

		// /auth は /auth/padlock にリダイレクト
		if (pathname === '/auth') {
			return this.redirect('/auth/padlock')
		}

		// 認証フローのルートの処理
		if (this.matchesRoute(pathname, AUTH_FLOW_ROUTES)) {
			const sessionState = await this.getSessionState()
			if (sessionState === 'signed-in') {
				// プロフィール設定済みの場合は /user にリダイレクト
				return this.redirect('/user')
			}
			if (sessionState === 'needs-profile') {
				// セッションあり、プロフィール未設定の場合は /auth/signin/setting にリダイレクト
				return this.redirect('/auth/signin/setting')
			}
			// no-session または invalid-session の場合はそのまま通す
			return NextResponse.next()
		}

		// プロフィール設定ページの処理
		if (pathname === '/auth/signin/setting') {
			const sessionState = await this.getSessionState()
			if (sessionState === 'guest' || sessionState === 'invalid') {
				return this.redirect('/auth/signin')
			}
			if (sessionState === 'signed-in') {
				// 既にプロフィール設定済みの場合は /user にリダイレクト
				return this.redirect('/user')
			}
			// session 状態の場合はアクセス許可
			return NextResponse.next()
		}

		// プロフィール必須ルートの処理
		if (this.matchesRoute(pathname, PROFILE_REQUIRED_ROUTES)) {
			const sessionState = await this.getSessionState()
			if (sessionState === 'guest') {
				return this.redirect('/auth/signin')
			}
			if (sessionState === 'invalid') {
				// ログを出力してからリダイレクト
				console.warn('Redirecting to session-expired from middleware:', {
					pathname,
					sessionError: this.session?.error,
					userId: this.session?.user?.id,
					sessionState: sessionState,
				})
				return this.redirect('/auth/session-expired')
			}
			if (sessionState === 'needs-profile') {
				// プロフィール未設定の場合は設定ページにリダイレクト
				return this.redirect('/auth/signin/setting')
			}
			// profile 状態の場合はアクセス許可
			return NextResponse.next()
		}

		// セッション必須ルートの処理
		if (this.matchesRoute(pathname, SESSION_REQUIRED_ROUTES)) {
			const sessionState = await this.getSessionState()
			if (sessionState === 'guest') {
				return this.redirect('/auth/signin')
			}
			if (sessionState === 'invalid') {
				return this.redirect('/auth/session-expired')
			}
			// session または profile 状態の場合はアクセス許可
			return NextResponse.next()
		}

		// 公開ルートの場合はそのまま通す
		if (this.matchesRoute(pathname, PUBLIC_ROUTES)) {
			return NextResponse.next()
		}

		// その他のルートもそのまま通す（デフォルト）
		return NextResponse.next()
	}
}

export default function middleware(request: NextRequest) {
	const app = new MiddlewareApp(request)
	return app.run()
}
