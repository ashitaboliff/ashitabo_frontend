/**
 * Google AdSense APIの型定義
 */

/**
 * AdSenseの広告プッシュオブジェクト
 */
type AdsByGooglePush = Record<string, never>

/**
 * AdSenseのグローバルオブジェクト
 */
interface AdsByGoogle extends Array<AdsByGooglePush> {
	loaded?: boolean
	push(args: AdsByGooglePush): number
}

/**
 * Windowインターフェースを拡張してadsbygoogleを追加
 */
declare global {
	interface Window {
		adsbygoogle?: AdsByGoogle
	}
}

export {}
