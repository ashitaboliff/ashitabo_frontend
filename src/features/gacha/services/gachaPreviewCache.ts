import type { GachaData } from '@/features/gacha/types'

export const PREVIEW_CACHE_TTL_MS = 60 * 60 * 1000

export type PreviewCachePayload = {
	gacha: GachaData | null
	totalCount: number
} | null

export interface GachaPreviewCacheEntry {
	data: PreviewCachePayload
	expiresAt: number
	updatedAt: number
}

const previewCache = new Map<string, GachaPreviewCacheEntry>()

const createEntry = (data: PreviewCachePayload, ttlMs: number, now: number) => {
	return {
		data,
		expiresAt: now + ttlMs,
		updatedAt: now,
	}
}

/**
 * ガチャソースをキーにプレビューキャッシュのエントリを取得する。
 */
export const getPreviewCacheEntry = (gachaSrc: string) => {
	return previewCache.get(gachaSrc)
}

/**
 * プレビューキャッシュに新しいデータを保存し、TTL付きのエントリを返す。
 */
export const setPreviewCacheEntry = (
	gachaSrc: string,
	data: PreviewCachePayload,
	ttlMs = PREVIEW_CACHE_TTL_MS,
) => {
	const now = Date.now()
	const entry = createEntry(data, ttlMs, now)
	previewCache.set(gachaSrc, entry)
	return entry
}

/**
 * 指定したガチャソースに紐づくプレビューキャッシュを完全に削除する。
 */
export const clearPreviewCacheEntry = (gachaSrc: string) => {
	previewCache.delete(gachaSrc)
}

/**
 * キャッシュの有効期限を過去時刻に変更し、次回アクセス時に再取得させる。
 */
export const markPreviewCacheEntryStale = (gachaSrc: string) => {
	const entry = previewCache.get(gachaSrc)
	if (!entry) {
		return
	}
	previewCache.set(gachaSrc, {
		...entry,
		expiresAt: Date.now() - 1,
	})
}

/**
 * キャッシュエントリの有効期限を判定し、利用可能かどうかを真偽値で返す。
 */
export const isPreviewEntryValid = (
	entry: GachaPreviewCacheEntry | undefined,
	now = Date.now(),
): entry is GachaPreviewCacheEntry => {
	if (!entry) {
		return false
	}
	return entry.expiresAt > now
}
