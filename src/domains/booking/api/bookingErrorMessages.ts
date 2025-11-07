import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * 予約作成のエラーメッセージを生成
 */
export const getCreateBookingErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '予約情報に不備があります。日時、バンド名などの入力内容を確認してください。'
		case StatusCode.CONFLICT:
			return 'この時間帯は既に予約されています。別の時間帯を選択してください。'
		case StatusCode.UNAUTHORIZED:
		case StatusCode.FORBIDDEN:
			return 'パスワードが正しくありません。正しいパスワードを入力してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 予約更新のエラーメッセージを生成
 */
export const getUpdateBookingErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '予約情報に不備があります。日時、バンド名などの入力内容を確認してください。'
		case StatusCode.NOT_FOUND:
			return '予約が見つかりませんでした。既に削除されている可能性があります。'
		case StatusCode.CONFLICT:
			return 'この時間帯は既に予約されています。別の時間帯を選択してください。'
		case StatusCode.UNAUTHORIZED:
		case StatusCode.FORBIDDEN:
			return 'この予約を編集する権限がありません。正しいパスワードを入力してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 予約削除のエラーメッセージを生成
 */
export const getDeleteBookingErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return '予約が見つかりませんでした。既に削除されている可能性があります。'
		case StatusCode.UNAUTHORIZED:
		case StatusCode.FORBIDDEN:
			return 'この予約を削除する権限がありません。正しいパスワードを入力してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 予約認証のエラーメッセージを生成
 */
export const getAuthBookingErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'パスワードを入力してください。'
		case StatusCode.NOT_FOUND:
			return '予約が見つかりませんでした。'
		case StatusCode.UNAUTHORIZED:
		case StatusCode.FORBIDDEN:
			return 'パスワードが正しくありません。正しいパスワードを入力してください。'
		default:
			return getGenericStatusMessage(status)
	}
}
