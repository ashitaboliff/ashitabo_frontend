import { getSignedUrlsForGachaImagesAction } from '@/features/gacha/actions'
import { logError } from '@/utils/logger'

export const SIGNED_RESOURCE_TTL_MS = 60 * 60 * 1000
export const SIGNED_RESOURCE_REFRESH_THRESHOLD_MS = 5 * 60 * 1000
const NULL_ENTRY_TTL_MS = 5 * 60 * 1000
const ERROR_RETRY_TTL_MS = 30 * 1000

export interface SignedResourceEntry {
	url: string | null
	expiresAt: number | null
	updatedAt: number
}

const cache = new Map<string, SignedResourceEntry>()
const pendingFetches = new Map<string, Promise<void>>()

const createEntry = (
	url: string | null,
	ttlMs: number,
	now: number,
): SignedResourceEntry => ({
	url,
	expiresAt: ttlMs > 0 ? now + ttlMs : null,
	updatedAt: now,
})

const setCacheEntryInternal = (
	key: string,
	url: string | null,
	ttlMs: number,
	now: number,
) => {
	const entry = createEntry(url, ttlMs, now)
	cache.set(key, entry)
	return entry
}

/**
 * 署名付きリソースキャッシュから指定キーのエントリを取得する。
 */
export const getSignedResourceEntry = (
	key: string,
): SignedResourceEntry | undefined => {
	return cache.get(key)
}

/**
 * 署名付きリソースのキャッシュを更新し、TTLを含むエントリを保存する。
 */
export const setSignedResourceEntry = (
	key: string,
	url: string | null,
	ttlMs: number = url ? SIGNED_RESOURCE_TTL_MS : NULL_ENTRY_TTL_MS,
) => {
	const now = Date.now()
	return setCacheEntryInternal(key, url, ttlMs, now)
}

/**
 * 指定キーの署名URLを失効済みにし、次回アクセス時に再フェッチさせる。
 */
export const markSignedResourceStale = (key: string) => {
	const existing = cache.get(key)
	if (!existing) {
		return
	}
	cache.set(key, { ...existing, expiresAt: Date.now() - 1 })
}

/**
 * 署名付きリソースキャッシュのエントリを完全に削除する。
 */
export const clearSignedResourceEntry = (key: string) => {
	cache.delete(key)
}

/**
 * 有効期限を考慮しつつキャッシュ済みの署名URL文字列を返す。
 */
export const getSignedResourceUrl = (key: string, now = Date.now()) => {
	const entry = cache.get(key)
	if (!entry || !entry.url || entry.expiresAt === null) {
		return null
	}
	return entry.expiresAt > now ? entry.url : null
}

/**
 * エントリの有効期限をチェックし、バックグラウンド更新が必要かを判定する。
 */
export const shouldRefreshSignedResource = (
	entry: SignedResourceEntry | undefined,
	now = Date.now(),
) => {
	if (!entry) {
		return true
	}
	if (!entry.url) {
		if (entry.expiresAt === null) {
			return true
		}
		return entry.expiresAt <= now
	}
	if (entry.expiresAt === null) {
		return true
	}
	return entry.expiresAt - now <= SIGNED_RESOURCE_REFRESH_THRESHOLD_MS
}

/**
 * 即時再取得が必要かどうかを判定し、フェッチ隊列へ追加するかを決定する。
 */
export const needsSignedResourceFetch = (
	entry: SignedResourceEntry | undefined,
	now = Date.now(),
) => {
	if (!entry) {
		return true
	}
	if (!entry.url) {
		if (entry.expiresAt === null) {
			return true
		}
		return entry.expiresAt <= now
	}
	if (entry.expiresAt === null) {
		return true
	}
	if (entry.expiresAt <= now) {
		return true
	}
	return entry.expiresAt - now <= SIGNED_RESOURCE_REFRESH_THRESHOLD_MS
}

const recordFailedFetch = (keys: readonly string[]) => {
	const now = Date.now()
	for (const key of keys) {
		setCacheEntryInternal(key, null, ERROR_RETRY_TTL_MS, now)
	}
}

const fetchAndCacheSignedUrls = async (keys: readonly string[]) => {
	try {
		const response = await getSignedUrlsForGachaImagesAction({
			r2Keys: keys as string[],
		})
		if (!response.ok) {
			logError('Failed to fetch signed URLs for gacha resources', {
				error: response.message,
				keys,
			})
			recordFailedFetch(keys)
			return
		}
		const data = response.data ?? {}
		const now = Date.now()
		for (const key of keys) {
			const url = data[key] ?? null
			setCacheEntryInternal(
				key,
				url,
				url ? SIGNED_RESOURCE_TTL_MS : NULL_ENTRY_TTL_MS,
				now,
			)
		}
	} catch (error) {
		logError('Unexpected error while fetching signed URLs', { error, keys })
		recordFailedFetch(keys)
	} finally {
		for (const key of keys) {
			pendingFetches.delete(key)
		}
	}
}

/**
 * 指定キー群に対するキャッシュ状態をコピーし、不変なスナップショットとして返す。
 */
export const takeSignedResourceSnapshot = (keys: readonly string[]) => {
	const snapshot: Record<string, SignedResourceEntry> = {}
	for (const key of keys) {
		const entry = cache.get(key)
		if (entry) {
			snapshot[key] = entry
		}
	}
	return snapshot
}

/**
 * 必要な署名URLを可能な限りキャッシュから返し、不足分はまとめて取得する。
 */
export const ensureSignedResourceUrls = async (keys: readonly string[]) => {
	const uniqueKeys = Array.from(
		new Set(keys.filter((key): key is string => Boolean(key))),
	)
	if (uniqueKeys.length === 0) {
		return {}
	}
	const now = Date.now()
	const keysToFetch: string[] = []
	const pendingPromises: Promise<void>[] = []

	for (const key of uniqueKeys) {
		const pending = pendingFetches.get(key)
		if (pending) {
			pendingPromises.push(pending)
			continue
		}
		const entry = cache.get(key)
		if (needsSignedResourceFetch(entry, now)) {
			keysToFetch.push(key)
		}
	}

	if (keysToFetch.length > 0) {
		const fetchPromise = fetchAndCacheSignedUrls(keysToFetch)
		for (const key of keysToFetch) {
			pendingFetches.set(key, fetchPromise)
		}
		pendingPromises.push(fetchPromise)
	}

	if (pendingPromises.length > 0) {
		await Promise.allSettled(pendingPromises)
	}

	const result: Record<string, string | null> = {}
	const resolvedNow = Date.now()
	for (const key of uniqueKeys) {
		const entry = cache.get(key)
		if (
			entry?.url &&
			entry.expiresAt !== null &&
			entry.expiresAt > resolvedNow
		) {
			result[key] = entry.url
			continue
		}
		result[key] = entry?.url ?? null
	}
	return result
}
