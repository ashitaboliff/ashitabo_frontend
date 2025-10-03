import { NextRequest, NextResponse } from 'next/server'

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
	private request: NextRequest
	private isMaintenanceMode: boolean = process.env.MAINTENANCE_MODE === 'true'
	private session: Session

	constructor(request: NextRequest) {
		this.request = request
		this.session = (request as any).auth
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

	private getSessionState() {
		return null
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
			const sessionState = this.getSessionState()
			if (sessionState === 'profile') {
				// プロフィール設定済みの場合は /user にリダイレクト
				return this.redirect('/user')
			}
			if (sessionState === 'session') {
				// セッションあり、プロフィール未設定の場合は /auth/signin/setting にリダイレクト
				return this.redirect('/auth/signin/setting')
			}
			// no-session または invalid-session の場合はそのまま通す
			return NextResponse.next()
		}

		// プロフィール設定ページの処理
		if (pathname === '/auth/signin/setting') {
			const sessionState = this.getSessionState()
			if (sessionState === 'no-session' || sessionState === 'invalid-session') {
				return this.redirect('/auth/signin')
			}
			if (sessionState === 'profile') {
				// 既にプロフィール設定済みの場合は /user にリダイレクト
				return this.redirect('/user')
			}
			// session 状態の場合はアクセス許可
			return NextResponse.next()
		}

		// プロフィール必須ルートの処理
		if (this.matchesRoute(pathname, PROFILE_REQUIRED_ROUTES)) {
			const sessionState = this.getSessionState()
			if (sessionState === 'no-session') {
				return this.redirect('/auth/signin')
			}
			if (sessionState === 'invalid-session') {
				// ログを出力してからリダイレクト
				console.warn('Redirecting to session-expired from middleware:', {
					pathname,
					sessionError: this.session?.error,
					userId: this.session?.user?.id,
					sessionState: sessionState,
				})
				return this.redirect('/auth/session-expired')
			}
			if (sessionState === 'session') {
				// プロフィール未設定の場合は設定ページにリダイレクト
				return this.redirect('/auth/signin/setting')
			}
			// profile 状態の場合はアクセス許可
			return NextResponse.next()
		}

		// セッション必須ルートの処理
		if (this.matchesRoute(pathname, SESSION_REQUIRED_ROUTES)) {
			const sessionState = this.getSessionState()
			if (sessionState === 'no-session') {
				return this.redirect('/auth/signin')
			}
			if (sessionState === 'invalid-session') {
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
