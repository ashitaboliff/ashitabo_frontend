import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * ユーザー削除のエラーメッセージを生成
 */
export const getDeleteUserErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return 'ユーザーが見つかりませんでした。'
		case StatusCode.FORBIDDEN:
			return 'ユーザーを削除する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * ユーザー権限更新のエラーメッセージを生成
 */
export const getUpdateUserRoleErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '権限の値が不正です。'
		case StatusCode.NOT_FOUND:
			return 'ユーザーが見つかりませんでした。'
		case StatusCode.FORBIDDEN:
			return 'ユーザー権限を更新する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 部室パスワード作成のエラーメッセージを生成
 */
export const getCreatePadlockErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '名前とパスワードを入力してください。'
		case StatusCode.CONFLICT:
			return '同じ名前の部室パスワードが既に存在します。'
		case StatusCode.FORBIDDEN:
			return '部室パスワードを作成する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 部室パスワード削除のエラーメッセージを生成
 */
export const getDeletePadlockErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return '部室パスワードが見つかりませんでした。'
		case StatusCode.FORBIDDEN:
			return '部室パスワードを削除する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 予約禁止日作成のエラーメッセージを生成
 */
export const getCreateDeniedBookingErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '予約禁止日情報に不備があります。入力内容を確認してください。'
		case StatusCode.CONFLICT:
			return 'この日時には既に予約禁止日が設定されています。'
		case StatusCode.FORBIDDEN:
			return '予約禁止日を作成する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 予約禁止日削除のエラーメッセージを生成
 */
export const getDeleteDeniedBookingErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return '予約禁止日が見つかりませんでした。'
		case StatusCode.FORBIDDEN:
			return '予約禁止日を削除する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}
