'use server'

import { createHmac } from 'crypto'
import env from '@/lib/env'

const SIGNATURE_ALGORITHM = 'sha256'
const TOKEN_TTL_MS = 60 * 60 * 1000

const signPayload = (payload: string) =>
	createHmac(SIGNATURE_ALGORITHM, env.R2_IMAGE_PROXY_SECRET)
		.update(payload)
		.digest('hex')

export const buildImageProxyUrl = async (r2Key: string) => {
	const expires = Date.now() + TOKEN_TTL_MS
	const payload = `${r2Key}:${expires}`
	const token = signPayload(payload)
	const searchParams = new URLSearchParams({
		key: r2Key,
		expires: String(expires),
		token,
	})
	return `/api/image?${searchParams.toString()}`
}

export const verifyImageProxyToken = async (
	r2Key: string,
	expiresParam: string | null,
	token: string | null,
) => {
	if (!expiresParam || !token) {
		return false
	}
	const expires = Number.parseInt(expiresParam, 10)
	if (!Number.isFinite(expires) || expires < Date.now()) {
		return false
	}
	const payload = `${r2Key}:${expires}`
	const expectedToken = signPayload(payload)
	return expectedToken === token
}
