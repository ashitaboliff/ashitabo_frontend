import { StatusCode } from '@/types/response'

/**
 * ユーザーが取るべき行動を含むエラーメッセージ
 */
export interface FormattedErrorMessage {
	/** エラーメッセージのタイトル */
	title: string
	/** 具体的なエラー内容 */
	message: string
	/** ユーザーが取るべき行動（オプション） */
	action?: string
	/** 詳細情報（オプション） */
	details?: string
}

/**
 * HTTPステータスコードに基づいてユーザー向けエラーメッセージを生成
 */
const getStatusCodeMessage = (
	status: number,
): Omit<FormattedErrorMessage, 'details'> => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return {
				title: '入力内容に問題があります',
				message: '入力された情報に誤りがあります。',
				action: '入力内容を確認して、もう一度お試しください。',
			}
		case StatusCode.UNAUTHORIZED:
			return {
				title: '認証が必要です',
				message: 'この操作を行うにはログインが必要です。',
				action: 'ログインしてから再度お試しください。',
			}
		case StatusCode.FORBIDDEN:
			return {
				title: 'アクセスが拒否されました',
				message: 'この操作を行う権限がありません。',
				action:
					'必要な権限があるか確認してください。問題が続く場合は管理者にお問い合わせください。',
			}
		case StatusCode.NOT_FOUND:
			return {
				title: 'データが見つかりません',
				message: '指定されたデータが見つかりませんでした。',
				action:
					'URLやIDが正しいか確認してください。削除された可能性もあります。',
			}
		case StatusCode.CONFLICT:
			return {
				title: 'データの競合が発生しました',
				message:
					'既に同じデータが存在するか、他のユーザーが更新している可能性があります。',
				action: 'ページを再読み込みしてから再度お試しください。',
			}
		case StatusCode.INTERNAL_SERVER_ERROR:
		case StatusCode.BAD_GATEWAY:
		case StatusCode.SERVICE_UNAVAILABLE:
			return {
				title: 'サーバーエラーが発生しました',
				message: 'サーバー側で問題が発生しています。',
				action:
					'時間をおいて再度お試しください。問題が続く場合は管理者にお問い合わせください。',
			}
		default:
			return {
				title: 'エラーが発生しました',
				message: '予期しないエラーが発生しました。',
				action: '時間をおいて再度お試しください。',
			}
	}
}

/**
 * エラーの詳細情報からコンテキストを抽出
 */
const extractErrorContext = (details: unknown): string | undefined => {
	if (typeof details === 'string') {
		return details
	}

	if (details && typeof details === 'object') {
		// バックエンドから返される可能性のあるエラー詳細フォーマット
		const obj = details as Record<string, unknown>

		// バリデーションエラーの場合
		if (obj.errors && typeof obj.errors === 'object') {
			const errors = obj.errors as Record<string, unknown>
			const messages = Object.entries(errors)
				.map(([field, error]) => {
					const errorMsg =
						typeof error === 'string' ? error : JSON.stringify(error)
					return `${field}: ${errorMsg}`
				})
				.join(', ')
			return messages
		}

		// その他の詳細情報
		if (obj.detail && typeof obj.detail === 'string') {
			return obj.detail
		}
	}

	return undefined
}

/**
 * 操作コンテキストに基づいてエラーメッセージをカスタマイズ
 */
const customizeMessageByContext = (
	baseMessage: FormattedErrorMessage,
	originalMessage: string,
	status: number,
): FormattedErrorMessage => {
	// オリジナルメッセージの内容に基づいてカスタマイズ
	const lowerMessage = originalMessage.toLowerCase()

	// 認証関連のエラー
	if (
		lowerMessage.includes('password') ||
		lowerMessage.includes('パスワード')
	) {
		if (status === StatusCode.UNAUTHORIZED || status === StatusCode.FORBIDDEN) {
			return {
				...baseMessage,
				message: 'パスワードが正しくありません。',
				action: '正しいパスワードを入力してください。',
			}
		}
	}

	// 予約関連のエラー
	if (lowerMessage.includes('booking') || lowerMessage.includes('予約')) {
		if (status === StatusCode.CONFLICT) {
			return {
				...baseMessage,
				message: 'この時間帯は既に予約されています。',
				action: '別の時間帯を選択してください。',
			}
		}
		if (status === StatusCode.BAD_REQUEST) {
			return {
				...baseMessage,
				message: '予約情報に不備があります。',
				action: '日時、バンド名などの入力内容を確認してください。',
			}
		}
	}

	// バンド関連のエラー
	if (lowerMessage.includes('band') || lowerMessage.includes('バンド')) {
		if (status === StatusCode.CONFLICT) {
			return {
				...baseMessage,
				message: '同じ名前のバンドが既に存在します。',
				action: '別の名前を使用してください。',
			}
		}
	}

	// ユーザー関連のエラー
	if (lowerMessage.includes('user') || lowerMessage.includes('ユーザー')) {
		if (status === StatusCode.NOT_FOUND) {
			return {
				...baseMessage,
				message: 'ユーザーが見つかりません。',
				action: 'ログインし直すか、管理者にお問い合わせください。',
			}
		}
	}

	// メディア/ファイル関連のエラー
	if (
		lowerMessage.includes('file') ||
		lowerMessage.includes('image') ||
		lowerMessage.includes('video') ||
		lowerMessage.includes('ファイル') ||
		lowerMessage.includes('画像') ||
		lowerMessage.includes('動画')
	) {
		if (status === StatusCode.BAD_REQUEST) {
			return {
				...baseMessage,
				message: 'ファイル形式またはサイズに問題があります。',
				action: '対応している形式とサイズ制限を確認してください。',
			}
		}
	}

	// レート制限
	if (
		lowerMessage.includes('rate limit') ||
		lowerMessage.includes('too many')
	) {
		return {
			...baseMessage,
			title: 'リクエスト制限に達しました',
			message: '短時間に多くのリクエストが送信されました。',
			action: 'しばらく時間をおいてから再度お試しください。',
		}
	}

	return baseMessage
}

/**
 * APIエラーを整形してユーザーフレンドリーなメッセージを生成
 *
 * @param status - HTTPステータスコード
 * @param message - バックエンドからのエラーメッセージ
 * @param details - エラーの詳細情報
 * @returns フォーマットされたエラーメッセージ
 */
export const formatErrorMessage = (
	status: number,
	message: string,
	details?: unknown,
): FormattedErrorMessage => {
	// ステータスコードベースの基本メッセージを取得
	const baseMessage = getStatusCodeMessage(status)

	// コンテキストに基づいてメッセージをカスタマイズ
	const customizedMessage = customizeMessageByContext(
		baseMessage,
		message,
		status,
	)

	// 詳細情報を抽出
	const extractedDetails = extractErrorContext(details)

	return {
		...customizedMessage,
		details: extractedDetails,
	}
}

/**
 * エラーメッセージを完全な文字列に変換
 */
export const formatErrorAsString = (
	formatted: FormattedErrorMessage,
): string => {
	let result = formatted.message

	if (formatted.action) {
		result += ` ${formatted.action}`
	}

	if (formatted.details) {
		result += ` (詳細: ${formatted.details})`
	}

	return result
}
