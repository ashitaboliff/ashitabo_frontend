'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	padLockAction,
	revalidateUserAction,
} from '@/domains/auth/api/authActions'
import { useCsrfToken } from '@/domains/auth/hooks/useCsrfToken'
import { usePasswordForm } from '@/domains/auth/hooks/usePasswordForm'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { logError } from '@/shared/utils/logger'

const DEFAULT_CALLBACK_URL = '/user'

type UseAuthPadlockOptions = {
	initialCsrfToken?: string | null
	callbackUrl?: string | null
}

export const useAuthPadlock = ({
	initialCsrfToken,
	callbackUrl,
}: UseAuthPadlockOptions) => {
	const formRef = useRef<HTMLFormElement>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [loadingMessage, setLoadingMessage] = useState('処理中です...')
	const [padlockToken, setPadlockToken] = useState<string | null>(null)

	const { csrfToken, refreshCsrf } = useCsrfToken(initialCsrfToken)
	const passwordForm = usePasswordForm()
	const feedback = useFeedback()

	const effectiveCallbackUrl = useMemo(() => {
		if (callbackUrl && callbackUrl !== 'undefined') {
			return callbackUrl
		}
		return DEFAULT_CALLBACK_URL
	}, [callbackUrl])

	const setHiddenInputValue = useCallback((name: string, value: string) => {
		const form = formRef.current
		if (!form) return
		const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`)
		if (input) {
			input.value = value
		}
	}, [])

	useEffect(() => {
		if (csrfToken) {
			setHiddenInputValue('csrfToken', csrfToken)
		}
	}, [csrfToken, setHiddenInputValue])

	useEffect(() => {
		setHiddenInputValue('callbackUrl', effectiveCallbackUrl)
	}, [effectiveCallbackUrl, setHiddenInputValue])

	const handleSignIn = useCallback(
		async (options?: { padlockToken?: string | null }) => {
			setLoadingMessage('LINEログインにリダイレクトします...')
			setIsLoading(true)
			let token: string | null = null
			try {
				token = await refreshCsrf()
			} catch (error) {
				logError('Failed to refresh CSRF token before sign-in', error)
			}
			if (!token) {
				token = csrfToken
			}
			if (!token) {
				feedback.showError(
					'CSRFトークンが取得できませんでした。ページを再読み込みしてからもう一度お試しください。',
					{ code: 500 },
				)
				setIsLoading(false)
				return
			}
			setHiddenInputValue('csrfToken', token)
			setHiddenInputValue('callbackUrl', effectiveCallbackUrl)
			const resolvedPadlockToken = options?.padlockToken ?? padlockToken ?? ''
			setHiddenInputValue('padlockToken', resolvedPadlockToken)
			const form = formRef.current
			if (!form) {
				feedback.showError('サインイン用フォームを初期化できませんでした。', {
					code: 500,
				})
				setIsLoading(false)
				return
			}
			form.requestSubmit()
			revalidateUserAction()
		},
		[
			csrfToken,
			effectiveCallbackUrl,
			feedback,
			padlockToken,
			refreshCsrf,
			setHiddenInputValue,
		],
	)

	const onSubmit = passwordForm.handleSubmit(async (values) => {
		setLoadingMessage('パスワードを確認しています...')
		setIsLoading(true)
		feedback.clearFeedback()
		const password = passwordForm.extractPassword(values)
		try {
			const res = await padLockAction(password)
			if (res.ok) {
				const token = res.data.token ?? null
				if (!token) {
					feedback.showError(
						'部室鍵認証トークンが取得できませんでした。もう一度お試しください。',
						{
							code: 500,
						},
					)
					setPadlockToken(null)
					setIsLoading(false)
					return
				}
				setPadlockToken(token)
				setHiddenInputValue('padlockToken', token)
				await handleSignIn({ padlockToken: token })
				return
			}
			setPadlockToken(null)
			setHiddenInputValue('padlockToken', '')
			feedback.showApiError(res)
		} catch (err) {
			logError('Error during padlock authentication', err)
			feedback.showError('パスワードの確認中にエラーが発生しました。', {
				details: err instanceof Error ? err.message : String(err),
				code: 500,
			})
			setPadlockToken(null)
			setHiddenInputValue('padlockToken', '')
		} finally {
			setIsLoading(false)
		}
	})

	const handleClear = useCallback(() => {
		passwordForm.reset()
		feedback.clearFeedback()
		setPadlockToken(null)
		setHiddenInputValue('padlockToken', '')
	}, [feedback, passwordForm, setHiddenInputValue])

	const digitError =
		passwordForm.errors.digit1?.message ??
		passwordForm.errors.digit2?.message ??
		passwordForm.errors.digit3?.message ??
		passwordForm.errors.digit4?.message ??
		undefined

	const disableSubmit = [401, 403].includes(feedback.feedback?.code ?? 0)

	return {
		formRef,
		isLoading,
		loadingMessage,
		feedbackMessage: feedback.feedback,
		digitError,
		effectiveCallbackUrl,
		onSubmit,
		handleClear,
		handleDigitChange: passwordForm.handleDigitChange,
		handleDigitKeyDown: passwordForm.handleDigitKeyDown,
		register: passwordForm.register,
		errors: passwordForm.errors,
		disableSubmit,
	}
}
