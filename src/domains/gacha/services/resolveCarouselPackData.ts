import { gachaConfigs } from '@/domains/gacha/config/gachaConfig'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import { ensureSignedResourceUrls } from '@/domains/gacha/services/signedGachaResourceCache'
import { logError } from '@/shared/utils/logger'

/**
 * gachaConfigs に基づきカルーセル用のパックデータを解決する。
 * 署名URL取得が失敗した場合は空文字列をセットして継続する。
 */
export const resolveCarouselPackData = async (): Promise<
	CarouselPackDataItem[]
> => {
	const entries = Object.entries(gachaConfigs).filter(([, config]) =>
		Boolean(config.packKey),
	)

	if (entries.length === 0) {
		return []
	}

	const packKeys = entries
		.map(([, config]) => config.packKey)
		.filter((key): key is string => Boolean(key))

	try {
		const signedUrls = await ensureSignedResourceUrls(packKeys)
		return entries
			.map(([version, config]) => ({
				version,
				r2Key: config.packKey,
				signedPackImageUrl: signedUrls[config.packKey] ?? '',
			}))
			.sort((a, b) => a.version.localeCompare(b.version))
	} catch (error) {
		logError('Failed to resolve signed URLs for gacha pack images', error)
		return entries
			.map(([version, config]) => ({
				version,
				r2Key: config.packKey,
				signedPackImageUrl: '',
			}))
			.sort((a, b) => a.version.localeCompare(b.version))
	}
}
