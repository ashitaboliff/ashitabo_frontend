import { type NextRequest, NextResponse } from 'next/server'
import { verifyImageProxyToken } from '@/features/gacha/services/gachaImageProxy'
import { getSignedUrlForR2 } from '@/lib/r2'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const keyParam = searchParams.get('key')
	const key = keyParam ? decodeURIComponent(keyParam) : ''
	if (!key) {
		return new NextResponse('Missing key', { status: 400 })
	}
	if (
		!(await verifyImageProxyToken(
			key,
			searchParams.get('expires'),
			searchParams.get('token'),
		))
	) {
		return new NextResponse('Unauthorized', { status: 403 })
	}
	try {
		const signedUrl = await getSignedUrlForR2(key)
		const upstreamResponse = await fetch(signedUrl)
		if (!upstreamResponse.ok || !upstreamResponse.body) {
			return new NextResponse('Failed to fetch from R2', {
				status: upstreamResponse.status === 404 ? 404 : 502,
			})
		}
		const headers = new Headers()
		headers.set(
			'Content-Type',
			upstreamResponse.headers.get('Content-Type') ??
				'application/octet-stream',
		)
		headers.set('Cache-Control', 'public, max-age=300')
		return new NextResponse(upstreamResponse.body, {
			headers,
			status: 200,
		})
	} catch (error) {
		console.error('Failed to proxy R2 image', { key, error })
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
