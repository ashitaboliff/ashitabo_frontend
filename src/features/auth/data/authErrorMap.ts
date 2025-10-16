export type AuthErrorCode =
	| 'AccessDenied'
	| 'Callback'
	| 'Configuration'
	| 'InvalidCheck'
	| 'MissingCSRF'
	| 'OAuthAccountNotLinked'
	| 'OAuthCallbackError'
	| 'OAuthSignin'
	| 'SessionRequired'
	| 'UnknownAction'
	| 'Verification'
	| (string & {})

type AuthErrorDetail = {
	message: string
	reason: string
}

const DEFAULT_ERROR_DETAIL: AuthErrorDetail = {
	message: '認証処理中にエラーが発生しました。再度お試しください。',
	reason: 'auth-error',
}

const AUTH_ERROR_DETAILS: Record<string, AuthErrorDetail> = {
	AccessDenied: {
		message: 'アクセスが拒否されました。別のアカウントでお試しください。',
		reason: 'access-denied',
	},
	Callback: {
		message:
			'認証プロバイダからの応答を処理できませんでした。もう一度お試しください。',
		reason: 'callback-error',
	},
	Configuration: {
		message: '認証設定に問題があるようです。管理者にお問い合わせください。',
		reason: 'configuration-error',
	},
	InvalidCheck: {
		message:
			'認証の検証に失敗しました。ブラウザを更新してもう一度サインインしてください。',
		reason: 'state-mismatch',
	},
	MissingCSRF: {
		message:
			'CSRFトークンを確認できませんでした。ページを再読み込みしてやり直してください。',
		reason: 'missing-csrf',
	},
	OAuthAccountNotLinked: {
		message:
			'別のログイン方法で登録済みの可能性があります。サポートに連絡してください。',
		reason: 'account-not-linked',
	},
	OAuthCallbackError: {
		message: 'プロバイダからの応答に問題が発生しました。再度お試しください。',
		reason: 'oauth-callback-error',
	},
	OAuthSignin: {
		message:
			'サインイン要求を完了できませんでした。しばらく時間を空けてお試しください。',
		reason: 'oauth-signin-error',
	},
	SessionRequired: {
		message: 'セッションが期限切れです。再度サインインしてください。',
		reason: 'session-required',
	},
	UnknownAction: {
		message:
			'予期しないリクエストが検出されました。もう一度サインインしてください。',
		reason: 'unknown-action',
	},
	Verification: {
		message: 'メール認証に失敗しました。再度お試しください。',
		reason: 'verification-error',
	},
}

export const resolveAuthErrorDetail = (code?: string | null) => {
	if (!code) return DEFAULT_ERROR_DETAIL
	return AUTH_ERROR_DETAILS[code] ?? DEFAULT_ERROR_DETAIL
}

export const AUTH_ERROR_DEFAULT = DEFAULT_ERROR_DETAIL
