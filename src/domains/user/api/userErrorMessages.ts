import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * ユーザー情報取得のエラーメッセージを生成
 */
export const getUserErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return 'ユーザーが見つかりませんでした。'
		case StatusCode.FORBIDDEN:
			return 'ユーザー情報を取得する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}
