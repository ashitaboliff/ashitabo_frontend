import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * 動画検索のエラーメッセージを生成
 */
export const getSearchVideoErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '検索条件に不備があります。入力内容を確認してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 動画取得のエラーメッセージを生成
 */
export const getVideoErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return '動画が見つかりませんでした。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * プレイリスト同期のエラーメッセージを生成
 */
export const getSyncPlaylistErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'プレイリスト情報に不備があります。'
		case StatusCode.FORBIDDEN:
			return 'プレイリストを同期する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}
