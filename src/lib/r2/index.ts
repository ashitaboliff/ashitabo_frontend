const DEFAULT_R2_PROXY_BASE =
	process.env.NEXT_PUBLIC_R2_PROXY_BASE_URL ?? '/api/storage'

/**
 * Cloudflare R2 の署名付きURLをまだ提供していないため、
 * 現状はプレースホルダーのパスを返す。バックエンドが実装されたら
 * NEXT_PUBLIC_R2_PROXY_BASE_URL を設定して差し替える。
 */
export const getImageUrl = (objectKey: string) => {
	if (!objectKey) {
		return '/images/placeholder.png'
	}
	if (objectKey.startsWith('http')) {
		return objectKey
	}
	return `${DEFAULT_R2_PROXY_BASE}${objectKey.startsWith('/') ? objectKey : `/${objectKey}`}`
}
