'use client'

import Script from 'next/script'
import type { CSSProperties } from 'react'
import type { AdFormat, AdLayout } from '@/shared/lib/ads'
import { useAdClickDetection, useAdInitialization } from '@/shared/lib/ads'

/**
 * AdSenseコンポーネントのプロパティ
 */
interface AdSenseProps {
	/** AdSenseクライアントID（例: ca-pub-XXXXXXXXXXXXXXXX） */
	clientId: string
	/** 広告スロットID */
	adSlot: string
	/** 広告フォーマット（デフォルト: auto） */
	adFormat?: AdFormat
	/** 広告レイアウト */
	adLayout?: AdLayout
	/** カスタムスタイル */
	adStyle?: CSSProperties
	/** 配置名（イベント識別用） */
	placement?: string
	/** クリック検知を有効化（デフォルト: false） */
	enableClickDetection?: boolean
	/** クリック判定の閾値（ミリ秒、デフォルト: 3000） */
	clickThreshold?: number
}

/**
 * Google AdSense広告を表示するコンポーネント
 *
 * @example
 * ```tsx
 * <AdSense
 *   clientId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID!}
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   placement="article-top"
 * />
 * ```
 */
const AdSense = ({
	clientId,
	adSlot,
	adFormat = 'auto',
	adLayout,
	adStyle,
	placement,
	enableClickDetection = false,
	clickThreshold = 3000,
}: AdSenseProps) => {
	// 広告初期化
	useAdInitialization(adSlot, placement)

	// クリック検知（オプション）
	useAdClickDetection(enableClickDetection, adSlot, placement, clickThreshold)

	return (
		<>
			<Script
				id="adsbygoogle-init"
				strategy="afterInteractive"
				async
				src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
				crossOrigin="anonymous"
			/>
			<ins
				className="adsbygoogle"
				style={{ display: 'block', textAlign: 'center', ...adStyle }}
				data-ad-client={clientId}
				data-ad-slot={adSlot}
				data-ad-format={adFormat}
				data-ad-layout={adLayout}
			/>
		</>
	)
}

export default AdSense
