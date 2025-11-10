import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * 日程調整作成のエラーメッセージを生成
 */
export const getCreateScheduleErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '日程調整情報に不備があります。入力内容を確認してください。'
		case StatusCode.CONFLICT:
			return '同じIDの日程調整が既に存在します。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * 日程調整取得のエラーメッセージを生成
 */
export const getScheduleErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return '日程調整が見つかりませんでした。既に削除されている可能性があります。'
		default:
			return getGenericStatusMessage(status)
	}
}
