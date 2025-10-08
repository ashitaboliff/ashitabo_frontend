'use client'

import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next-nprogress-bar'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLoadingIndicator from './AuthLoadingIndicator'
import { padLockAction } from './actions'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import { ApiError } from '@/types/responseTypes'
import { getImageUrl } from '@/lib/r2'

const PasswordSchema = zod.object({
	digit1: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
	digit2: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
	digit3: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
	digit4: zod.string().regex(/^\d$/, '0から9の数字を入力してください'),
})

type digit = 'digit1' | 'digit2' | 'digit3' | 'digit4'

type AuthPadLockProps = {
	csrfToken?: string | null
	callbackUrl?: string | null
}

const DEFAULT_CALLBACK_URL = '/user'

const AuthPadLock = ({ csrfToken, callbackUrl }: AuthPadLockProps) => {
	const router = useRouter()
	const [error, setError] = useState<ApiError>()
	const [isLoading, setIsLoading] = useState<boolean>(false) // loading -> isLoading に変更
	const [loadingMessage, setLoadingMessage] = useState<string>('処理中です...')
	const formRef = useRef<HTMLFormElement>(null)
	const [activeCsrfToken, setActiveCsrfToken] = useState<string | null>(
		csrfToken ?? null,
	)

	const effectiveCallbackUrl = useMemo(() => {
		if (callbackUrl && callbackUrl !== 'undefined') {
			return callbackUrl
		}
		return DEFAULT_CALLBACK_URL
	}, [callbackUrl])

	const fetchCsrfToken = async (): Promise<string | null> => {
		try {
			const response = await fetch('/api/auth/csrf', {
				method: 'GET',
				credentials: 'include',
			})
			if (!response.ok) return null
			const data = (await response.json()) as { csrfToken?: string | null }
			const token =
				typeof data?.csrfToken === 'string' && data.csrfToken.length > 0
					? data.csrfToken
					: null
			if (token) {
				setActiveCsrfToken(token)
			}
			return token
		} catch (error) {
			console.error('Failed to fetch CSRF token', error)
			return null
		}
	}

	const {
		register,
		handleSubmit,
		setFocus,
		reset,
		formState: { errors },
	} = useForm<{
		digit1: string
		digit2: string
		digit3: string
		digit4: string
	}>({
		mode: 'onBlur',
		resolver: zodResolver(PasswordSchema),
	})

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		next: digit | null,
	) => {
		if (e.target.value.length === 1 && next) {
			setFocus(next)
		}
	}

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		prev: digit | null,
	) => {
		if (e.key === 'Backspace' && !e.currentTarget.value && prev) {
			setFocus(prev)
		}
	}

	const handleSignIn = async () => {
		setLoadingMessage('LINEログインにリダイレクトします...')
		setIsLoading(true)
		let token = activeCsrfToken
		if (!token) {
			token = await fetchCsrfToken()
		}
		if (!token) {
			setError({
				ok: false,
				status: 500,
				message:
					'CSRFトークンが取得できませんでした。ページを再読み込みしてからもう一度お試しください。',
			})
			setIsLoading(false)
			return
		}
		const form = formRef.current
		if (!form) {
			setError({
				ok: false,
				status: 500,
				message: 'サインイン用フォームを初期化できませんでした。',
			})
			setIsLoading(false)
			return
		}
		const csrfInput = form.querySelector<HTMLInputElement>(
			'input[name="csrfToken"]',
		)
		if (csrfInput) {
			csrfInput.value = token
		}
		form.requestSubmit()
	}

	const onSubmit: SubmitHandler<{
		digit1: string
		digit2: string
		digit3: string
		digit4: string
	}> = async (data) => {
		setLoadingMessage('パスワードを確認しています...')
		setIsLoading(true)
		setError(undefined) // 前のエラーをクリア
		const password = `${data.digit1}${data.digit2}${data.digit3}${data.digit4}`
		try {
			const res = await padLockAction(password)
			if (res.ok) {
				await handleSignIn()
				return
			}
			setError(res)
			setIsLoading(false)
		} catch (error) {
			setError({
				ok: false,
				status: 500,
				message: 'パスワードの確認中にエラーが発生しました。',
				details: error instanceof Error ? error.message : String(error),
			})
			console.error('Error during padlock authentication:', error)
			setIsLoading(false)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center space-y-2 h-full">
			{isLoading && <AuthLoadingIndicator message={loadingMessage} />}
			<form
				ref={formRef}
				action="/api/auth/signin/line"
				method="POST"
				className="hidden"
			>
				<input type="hidden" name="csrfToken" value={activeCsrfToken ?? ''} />
				<input type="hidden" name="callbackUrl" value={effectiveCallbackUrl} />
			</form>
			<div className="card bg-white shadow-lg w-96 h-[30rem] my-6">
				<figure>
					<Image
						src={getImageUrl('/home/activity/activity-2.jpg')}
						alt="padlock"
						width={384}
						height={250}
					/>
				</figure>
				<div className="flex flex-col items-center justify-center gap-y-2 p-4">
					<div className="text-base font-bold mx-2 text-center">
						部室のパスワードを入力してください
					</div>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col items-center gap-y-2"
					>
						<div className="flex flex-row justify-center">
							<input
								type="tel"
								{...register('digit1')}
								className="input input-bordered w-16 h-16 text-center text-2xl"
								maxLength={1}
								onChange={(e) => handleChange(e, 'digit2')}
							/>
							<input
								type="tel"
								{...register('digit2')}
								className="input input-bordered w-16 h-16 text-center text-2xl"
								maxLength={1}
								onChange={(e) => handleChange(e, 'digit3')}
								onKeyDown={(e) => handleKeyDown(e, 'digit1')}
							/>
							<input
								type="tel"
								{...register('digit3')}
								className="input input-bordered w-16 h-16 text-center text-2xl"
								maxLength={1}
								onChange={(e) => handleChange(e, 'digit4')}
								onKeyDown={(e) => handleKeyDown(e, 'digit2')}
							/>
							<input
								type="tel"
								{...register('digit4')}
								className="input input-bordered w-16 h-16 text-center text-2xl"
								maxLength={1}
								onKeyDown={(e) => handleKeyDown(e, 'digit3')}
							/>
						</div>
						<div className="flex flex-row justify-center space-x-2">
							<button
								type="submit"
								className="btn btn-primary"
								disabled={error?.status === 403 || error?.status === 401}
							>
								送信
							</button>
							<button
								type="button"
								className="btn btn-outline"
								onClick={() => reset()}
							>
								入力をクリア
							</button>
						</div>
					</form>
				</div>
			</div>
			<ErrorMessage error={error} />
			{errors.digit1 && (
				<p className="text-sm text-error text-center">
					{errors.digit1?.message ||
						errors.digit2?.message ||
						errors.digit3?.message ||
						errors.digit4?.message}
				</p>
			)}
		</div>
	)
}

export default AuthPadLock
