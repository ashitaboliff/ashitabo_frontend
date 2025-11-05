import type { AdDisplayEventDetail, AdPossibleClickEventDetail } from './types'

/**
 * 広告表示イベント名
 */
export const AD_DISPLAYED_EVENT = 'adDisplayed'

/**
 * 広告クリック可能性イベント名
 */
export const AD_POSSIBLE_CLICK_EVENT = 'possibleAdClick'

/**
 * 広告表示イベントを発火する
 * @param detail - イベント詳細
 */
export const dispatchAdDisplayedEvent = (
	detail: AdDisplayEventDetail,
): void => {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent(AD_DISPLAYED_EVENT, {
				detail,
			}),
		)
	}
}

/**
 * 広告クリック可能性イベントを発火する
 * @param detail - イベント詳細
 */
export const dispatchAdPossibleClickEvent = (
	detail: AdPossibleClickEventDetail,
): void => {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent(AD_POSSIBLE_CLICK_EVENT, {
				detail,
			}),
		)
	}
}

/**
 * 広告表示イベントリスナーを追加する
 * @param callback - コールバック関数
 * @returns クリーンアップ関数
 */
export const addAdDisplayedListener = (
	callback: (event: CustomEvent<AdDisplayEventDetail>) => void,
): (() => void) => {
	if (typeof window === 'undefined') {
		return () => {}
	}

	const handler = (event: Event) => {
		callback(event as CustomEvent<AdDisplayEventDetail>)
	}

	window.addEventListener(AD_DISPLAYED_EVENT, handler)

	return () => {
		window.removeEventListener(AD_DISPLAYED_EVENT, handler)
	}
}

/**
 * 広告クリック可能性イベントリスナーを追加する
 * @param callback - コールバック関数
 * @returns クリーンアップ関数
 */
export const addAdPossibleClickListener = (
	callback: (event: CustomEvent<AdPossibleClickEventDetail>) => void,
): (() => void) => {
	if (typeof window === 'undefined') {
		return () => {}
	}

	const handler = (event: Event) => {
		callback(event as CustomEvent<AdPossibleClickEventDetail>)
	}

	window.addEventListener(AD_POSSIBLE_CLICK_EVENT, handler)

	return () => {
		window.removeEventListener(AD_POSSIBLE_CLICK_EVENT, handler)
	}
}
