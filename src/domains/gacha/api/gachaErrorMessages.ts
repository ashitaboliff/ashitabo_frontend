import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * ガチャ記録作成のエラーメッセージを生成
 */
export const getCreateGachaErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'ガチャ情報に不備があります。入力内容を確認してください。'
		case StatusCode.CONFLICT:
			return '本日のガチャ回数制限に達しています。'
		case StatusCode.FORBIDDEN:
			return 'ガチャを記録する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 画像URL生成のエラーメッセージを生成
 */
export const getGachaImageErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '画像キーが不正です。'
		case StatusCode.NOT_FOUND:
			return '画像が見つかりませんでした。'
		default:
			return getGenericStatusMessage(status)
	}
}
