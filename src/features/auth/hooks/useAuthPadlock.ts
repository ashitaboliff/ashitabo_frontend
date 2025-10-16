'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { padLockAction } from '@/features/auth/actions'
import { logError } from '@/utils/logger'
import { useCsrfToken } from '@/features/auth/hooks/useCsrfToken'
import { usePasswordForm } from '@/features/auth/hooks/usePasswordForm'
import { useFeedback } from '@/hooks/useFeedback'

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

	const handleSignIn = useCallback(async () => {
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
		const form = formRef.current
		if (!form) {
			feedback.showError('サインイン用フォームを初期化できませんでした。', {
				code: 500,
			})
			setIsLoading(false)
			return
		}
		form.requestSubmit()
	}, [
		csrfToken,
		effectiveCallbackUrl,
		feedback,
		refreshCsrf,
		setHiddenInputValue,
	])

	const onSubmit = passwordForm.handleSubmit(async (values) => {
		setLoadingMessage('パスワードを確認しています...')
		setIsLoading(true)
		feedback.clearFeedback()
		const password = passwordForm.extractPassword(values)
		try {
			const res = await padLockAction(password)
			if (res.ok) {
				await handleSignIn()
				return
			}
			feedback.showApiError(res)
		} catch (err) {
			logError('Error during padlock authentication', err)
			feedback.showError('パスワードの確認中にエラーが発生しました。', {
				details: err instanceof Error ? err.message : String(err),
				code: 500,
			})
		} finally {
			setIsLoading(false)
		}
	})

	const handleClear = useCallback(() => {
		passwordForm.reset()
		feedback.clearFeedback()
	}, [feedback, passwordForm])

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
