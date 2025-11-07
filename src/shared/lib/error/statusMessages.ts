import { StatusCode } from '@/types/response'

/**
 * HTTPステータスコードに基づく汎用的なエラーメッセージ
 * ドメイン固有のメッセージは各domain/api/*Actions.tsで定義すること
 */
export const getGenericStatusMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return '入力内容に問題があります。入力内容を確認してください。'
		case StatusCode.UNAUTHORIZED:
			return '認証が必要です。ログインしてから再度お試しください。'
		case StatusCode.FORBIDDEN:
			return 'この操作を行う権限がありません。'
		case StatusCode.NOT_FOUND:
			return '指定されたデータが見つかりませんでした。'
		case StatusCode.CONFLICT:
			return 'データの競合が発生しました。ページを再読み込みしてから再度お試しください。'
		case StatusCode.INTERNAL_SERVER_ERROR:
		case StatusCode.BAD_GATEWAY:
		case StatusCode.SERVICE_UNAVAILABLE:
			return 'サーバーエラーが発生しました。時間をおいて再度お試しください。'
		default:
			return '予期しないエラーが発生しました。'
	}
}
