import { useEffect, useRef } from 'react'
import {
	dispatchAdDisplayedEvent,
	dispatchAdPossibleClickEvent,
} from './events'

/**
 * 広告初期化のカスタムフック
 * @param slot - 広告スロットID
 * @param placement - 配置名（オプション）
 */
export const useAdInitialization = (slot: string, placement?: string): void => {
	useEffect(() => {
		try {
			// adsbygoogle is defined by Google's script
			// biome-ignore lint/suspicious/noExplicitAny: Google AdSense API requires window.adsbygoogle
			const windowAny = window as any
			if (!windowAny.adsbygoogle) {
				windowAny.adsbygoogle = []
			}
			windowAny.adsbygoogle.push({})

			// 広告表示イベントを発火
			dispatchAdDisplayedEvent({ slot, placement })
		} catch (e) {
			console.error('AdSense initialization error:', e)
		}
	}, [slot, placement])
}

/**
 * 広告クリック検知のカスタムフック（間接的な検知）
 * フォーカス復帰ベースでクリックの可能性を検出する
 * @param enabled - クリック検知を有効化するかどうか
 * @param slot - 広告スロットID
 * @param placement - 配置名（オプション）
 * @param threshold - クリック判定の閾値（ミリ秒、デフォルト: 3000）
 */
export const useAdClickDetection = (
	enabled: boolean,
	slot: string,
	placement?: string,
	threshold = 3000,
): void => {
	const leftAtRef = useRef<number>(0)

	useEffect(() => {
		if (!enabled) {
			return
		}

		const handleBlur = () => {
			leftAtRef.current = Date.now()
		}

		const handleFocus = () => {
			const awayDuration = Date.now() - leftAtRef.current

			if (awayDuration > threshold) {
				dispatchAdPossibleClickEvent({
					slot,
					placement,
					awayDuration,
				})
			}
		}

		window.addEventListener('blur', handleBlur)
		window.addEventListener('focus', handleFocus)

		return () => {
			window.removeEventListener('blur', handleBlur)
			window.removeEventListener('focus', handleFocus)
		}
	}, [enabled, slot, placement, threshold])
}
