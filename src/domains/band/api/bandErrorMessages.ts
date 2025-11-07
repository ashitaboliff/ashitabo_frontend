import { getGenericStatusMessage } from '@/shared/lib/error'
import { StatusCode } from '@/types/response'

/**
 * バンド作成のエラーメッセージを生成
 */
export const getCreateBandErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'バンド名を入力してください。'
		case StatusCode.CONFLICT:
			return '同じ名前のバンドが既に存在します。別の名前を使用してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * バンド更新のエラーメッセージを生成
 */
export const getUpdateBandErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'バンド名を入力してください。'
		case StatusCode.NOT_FOUND:
			return 'バンドが見つかりませんでした。既に削除されている可能性があります。'
		case StatusCode.FORBIDDEN:
			return 'このバンドを編集する権限がありません。'
		case StatusCode.CONFLICT:
			return '同じ名前のバンドが既に存在します。別の名前を使用してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * バンド削除のエラーメッセージを生成
 */
export const getDeleteBandErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return 'バンドが見つかりませんでした。既に削除されている可能性があります。'
		case StatusCode.FORBIDDEN:
			return 'このバンドを削除する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * メンバー追加のエラーメッセージを生成
 */
export const getAddMemberErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'ユーザーとパートを選択してください。'
		case StatusCode.NOT_FOUND:
			return 'バンドまたはユーザーが見つかりませんでした。'
		case StatusCode.CONFLICT:
			return 'このユーザーは既にメンバーです。'
		case StatusCode.FORBIDDEN:
			return 'メンバーを追加する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * メンバー削除のエラーメッセージを生成
 */
export const getRemoveMemberErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return 'メンバーが見つかりませんでした。'
		case StatusCode.FORBIDDEN:
			return 'メンバーを削除する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}
