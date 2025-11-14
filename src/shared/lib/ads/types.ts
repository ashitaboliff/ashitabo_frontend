/**
 * Google AdSenseの広告フォーマット
 */
export type AdFormat =
	| 'auto'
	| 'rectangle'
	| 'vertical'
	| 'horizontal'
	| 'fluid'
	| 'autorelaxed'

/**
 * Google AdSenseの広告レイアウト
 */
export type AdLayout = 'in-article' | undefined

/**
 * 広告設定
 */
export interface AdConfig {
	/** 広告スロットID */
	slot: string
	/** 広告フォーマット */
	format: AdFormat
	/** 広告レイアウト（オプション） */
	layout?: AdLayout
}

/**
 * 広告配置の設定マップ
 */
export interface AdConfigMap {
	[placement: string]: AdConfig
}

/**
 * 広告表示イベントの詳細
 */
export interface AdDisplayEventDetail {
	/** 広告スロットID */
	slot: string
	/** 配置名 */
	placement?: string
}

/**
 * 広告クリック可能性イベントの詳細
 */
export interface AdPossibleClickEventDetail {
	/** 広告スロットID */
	slot: string
	/** 配置名 */
	placement?: string
	/** 離脱時間（ミリ秒） */
	awayDuration: number
}
