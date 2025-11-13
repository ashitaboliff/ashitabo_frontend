'use client'

import { toSignedImageKey } from '@/domains/gacha/api/dto'
import {
	createUserGachaResultAction,
	getSignedUrlForGachaImageAction,
} from '@/domains/gacha/api/gachaActions'
import { invalidateGachaPreviewCache } from '@/domains/gacha/hooks/useGachaPreview'
import type { RarityType } from '@/domains/gacha/model/gachaTypes'
import Gacha, { type GachaItem } from '@/domains/gacha/services/gacha'

export type ExecuteGachaPlayErrorType =
	| 'missing-src'
	| 'missing-r2-key'
	| 'create-user'
	| 'signed-url'
	| 'internal'

export interface ExecuteGachaPlayParams {
	version: string
	userId: string
	currentPlayCount: number
	ignorePlayCountLimit?: boolean
	skipCacheInvalidation?: boolean
}

export interface ExecuteGachaPlaySuccess {
	ok: true
	rarity: RarityType
	gachaItem: GachaItem
	gachaSrc: string
	signedUrl: string
}

export interface ExecuteGachaPlayError {
	ok: false
	message: string
	errorType: ExecuteGachaPlayErrorType
}

export type ExecuteGachaPlayResult =
	| ExecuteGachaPlaySuccess
	| ExecuteGachaPlayError

const EXECUTION_FALLBACK_MESSAGE = 'ガチャの実行に失敗しました。'

const mapUnhandledError = (message?: string): ExecuteGachaPlayError => ({
	ok: false,
	errorType: 'internal',
	message: message ?? EXECUTION_FALLBACK_MESSAGE,
})

export const executeGachaPlay = async ({
	version,
	userId,
	currentPlayCount,
	ignorePlayCountLimit,
	skipCacheInvalidation,
}: ExecuteGachaPlayParams): Promise<ExecuteGachaPlayResult> => {
	const gacha = new Gacha(version)
	const { data, name } = gacha.pickRandomImage()

	if (!data?.src) {
		return {
			ok: false,
			errorType: 'missing-src',
			message: 'ガチャ画像の取得に失敗しました。',
		}
	}

	const r2Key = toSignedImageKey(data.src)
	if (!r2Key) {
		return {
			ok: false,
			errorType: 'missing-r2-key',
			message: 'ガチャ画像キーの生成に失敗しました。',
		}
	}

	try {
		const [createRes, signedUrlRes] = await Promise.all([
			createUserGachaResultAction({
				userId,
				gachaVersion: version,
				gachaRarity: name,
				gachaSrc: data.src,
				currentPlayCount,
				ignorePlayCountLimit,
			}),
			getSignedUrlForGachaImageAction({ r2Key }),
		])

		if (!createRes.ok) {
			return {
				ok: false,
				errorType: 'create-user',
				message: createRes.message ?? EXECUTION_FALLBACK_MESSAGE,
			}
		}

		if (!signedUrlRes.ok) {
			return {
				ok: false,
				errorType: 'signed-url',
				message: signedUrlRes.message ?? EXECUTION_FALLBACK_MESSAGE,
			}
		}

		if (!signedUrlRes.data) {
			return {
				ok: false,
				errorType: 'signed-url',
				message: '画像URLが取得できませんでした。',
			}
		}

		if (!skipCacheInvalidation) {
			invalidateGachaPreviewCache(userId, data.src)
		}

		return {
			ok: true,
			rarity: name,
			gachaItem: data,
			gachaSrc: data.src,
			signedUrl: signedUrlRes.data,
		}
	} catch (error) {
		if (error instanceof Error) {
			return mapUnhandledError(error.message)
		}
		return mapUnhandledError()
	}
}
