import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * パドロック認証のエラーメッセージを生成
 */
export const getPadlockErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'パスワードを入力してください。'
		case StatusCode.UNAUTHORIZED:
		case StatusCode.FORBIDDEN:
			return 'パスワードが正しくありません。正しいパスワードを入力してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * プロフィール作成のエラーメッセージを生成
 */
export const getCreateProfileErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'プロフィール情報に不備があります。入力内容を確認してください。'
		case StatusCode.CONFLICT:
			return 'プロフィールは既に作成されています。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * プロフィール更新のエラーメッセージを生成
 */
export const getUpdateProfileErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'プロフィール情報に不備があります。入力内容を確認してください。'
		case StatusCode.NOT_FOUND:
			return 'プロフィールが見つかりませんでした。'
		default:
			return getGenericStatusMessage(status)
	}
}
