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
	private isMaintenanceMode: boolean = process.env.MAINTENANCE_MODE

	constructor(request: NextRequest) {
		this.request = request
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

	private hasAuthCookie(): boolean {
		const c1 = this.request.cookies.get('authjs.session-token')?.value
		const c2 = this.request.cookies.get('__Secure-authjs.session-token')?.value
		return Boolean(c1 || c2)
	}

	public async run() {
		const { pathname } = this.request.nextUrl

		// メンテナンスモードの処理
		if (this.isMaintenanceMode) {
			// メンテナンスモード中のリクエスト処理
			if (pathname !== '/maintenance' && !pathname.startsWith('/_next')) {
				// ホワイトリストにIPアドレスが含まれていない場合、メンテナンスページへリダイレクト
				const whitelistIPs = process.env.MAINTENANCE_WHITELIST?.split(',') ?? []
				if (!whitelistIPs.includes(this.getSimpleIpAddress())) {
					return this.redirect('/maintenance')
				}
			} else {
				// Next.jsの内部リクエストとメンテナンスはそのまま通す
				return NextResponse.next()
			}
		} else {
			if (pathname === '/maintenance') {
				return this.redirect('/home')
			}
		}

		if (pathname === '/') {
			return this.redirect('/home', 301)
		}

		if (pathname === '/auth') {
			return this.redirect('/auth/padlock', 302)
		}

		if (this.matchesRoute(pathname, AUTH_FLOW_ROUTES)) {
			if (!this.hasAuthCookie()) {
				return this.redirect('/auth/signin')
			}
			return this.redirect('/user')
		}

		if (this.matchesRoute(pathname, PROFILE_REQUIRED_ROUTES)) {
			if (!this.hasAuthCookie()) {
				return this.redirect('/auth/signin')
			}
			return NextResponse.next()
		}

		if (this.matchesRoute(pathname, SESSION_REQUIRED_ROUTES)) {
			if (!this.hasAuthCookie()) {
				return this.redirect('/auth/signin')
			}
			return NextResponse.next()
		}

		if (this.matchesRoute(pathname, PUBLIC_ROUTES)) {
			return NextResponse.next()
		}

		return NextResponse.next()
	}
}

export default function middleware(request: NextRequest) {
	const app = new MiddlewareApp(request)
	return app.run()
}
