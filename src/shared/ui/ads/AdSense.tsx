'use client'

import type { CSSProperties } from 'react'
import type { AdFormat, AdLayout } from '@/shared/lib/ads'
import { useAdClickDetection, useAdInitialization } from '@/shared/lib/ads'
import { useAdSenseContext } from './AdSenseProvider'
import MockAdSense from './MockAdSense'

/**
 * AdSenseコンポーネントのプロパティ
 */
interface AdSenseProps {
	/** AdSenseクライアントID（例: ca-pub-XXXXXXXXXXXXXXXX） - 省略時はAdSenseProviderから取得 */
	clientId?: string
	/** 広告スロットID */
	adSlot: string
	/** 広告フォーマット（デフォルト: auto） */
	adFormat?: AdFormat
	/** 広告レイアウト */
	adLayout?: AdLayout
	/** 広告レイアウトキー */
	adLayoutKey?: string
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
 * // AdSenseProviderでラップされている場合（推奨）
 * <AdSense
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   placement="article-top"
 * />
 *
 * // clientIdを直接指定する場合
 * <AdSense
 *   clientId={process.env.NEXT_PUBLIC_ADS_ID!}
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   placement="article-top"
 * />
 * ```
 */
/**
 * clientIdを取得するヘルパー関数
 * AdSenseProviderから取得するか、直接指定された値を使用する
 */
const useClientId = (clientId?: string): string => {
	// 常にhookを呼び出す（Reactのルールに従う）
	const context = useAdSenseContext()
	const contextClientId = context?.clientId

	const effectiveClientId = clientId || contextClientId

	if (!effectiveClientId) {
		throw new Error(
			'AdSense requires clientId prop or AdSenseProvider in component tree',
		)
	}

	return effectiveClientId
}

/**
 * 本番環境用の実際のAdSenseコンポーネント
 */
const RealAdSense = ({
	clientId,
	adSlot,
	adFormat = 'auto',
	adLayout,
	adLayoutKey,
	adStyle,
	placement,
	enableClickDetection = false,
	clickThreshold = 3000,
}: AdSenseProps) => {
	// clientIdを取得
	const effectiveClientId = useClientId(clientId)

	// 広告初期化
	useAdInitialization(adSlot, placement)

	// クリック検知（オプション）
	useAdClickDetection(enableClickDetection, adSlot, placement, clickThreshold)

	return (
		<ins
			className="adsbygoogle"
			style={{ display: 'block', textAlign: 'center', ...adStyle }}
			data-ad-client={effectiveClientId}
			data-ad-slot={adSlot}
			data-ad-format={adFormat}
			data-ad-layout={adLayout}
			data-ad-layout-key={adLayoutKey ?? undefined}
		/>
	)
}

const AdSense = ({
	clientId,
	adSlot,
	adFormat = 'auto',
	adLayout,
	adLayoutKey,
	adStyle,
	placement,
	enableClickDetection = false,
	clickThreshold = 3000,
}: AdSenseProps) => {
	// 開発環境ではモック広告を表示
	const isDevelopment = process.env.NODE_ENV === 'development'

	if (isDevelopment) {
		return (
			<MockAdSense
				adSlot={adSlot}
				adFormat={adFormat}
				adLayout={adLayout}
				adLayoutKey={adLayoutKey}
				adStyle={adStyle}
				placement={placement}
			/>
		)
	}

	return (
		<RealAdSense
			clientId={clientId}
			adSlot={adSlot}
			adFormat={adFormat}
			adLayout={adLayout}
			adLayoutKey={adLayoutKey}
			adStyle={adStyle}
			placement={placement}
			enableClickDetection={enableClickDetection}
			clickThreshold={clickThreshold}
		/>
	)
}

export default AdSense
