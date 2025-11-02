'use client'

import type { AdConfigMap } from '@/shared/lib/ads'
import AdSense from './AdSense'

/**
 * AdSenseManagerコンポーネントのプロパティ
 */
interface AdSenseManagerProps {
	/** AdSenseクライアントID */
	clientId: string
	/** 配置名 */
	placement: string
	/** 広告配置の設定マップ */
	adConfig: AdConfigMap
	/** クリック検知を有効化（デフォルト: false） */
	enableClickDetection?: boolean
	/** クリック判定の閾値（ミリ秒、デフォルト: 3000） */
	clickThreshold?: number
}

/**
 * 広告配置を一元管理するコンポーネント
 *
 * 使用例:
 * ```tsx
 * const adConfig = {
 *   articleTop: { slot: "1111111111", format: "auto" },
 *   sidebar: { slot: "2222222222", format: "rectangle" },
 *   inFeed: { slot: "3333333333", format: "fluid", layout: "in-article" },
 * }
 *
 * <AdSenseManager
 *   clientId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID!}
 *   placement="articleTop"
 *   adConfig={adConfig}
 * />
 * ```
 */
const AdSenseManager = ({
	clientId,
	placement,
	adConfig,
	enableClickDetection = false,
	clickThreshold = 3000,
}: AdSenseManagerProps) => {
	const config = adConfig[placement]

	if (!config) {
		console.warn(`AdSenseManager: 配置名 "${placement}" の設定が見つかりません`)
		return null
	}

	return (
		<AdSense
			clientId={clientId}
			adSlot={config.slot}
			adFormat={config.format}
			adLayout={config.layout}
			placement={placement}
			enableClickDetection={enableClickDetection}
			clickThreshold={clickThreshold}
		/>
	)
}

export default AdSenseManager
