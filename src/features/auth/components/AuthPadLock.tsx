'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next-nprogress-bar'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { signIn } from 'next-auth/react'
import AuthLoadingIndicator from './AuthLoadingIndicator'
import { padLockAction } from './actions'
import { ErrorType } from '@/types/responseTypes'
import { getImageUrl } from '@/lib/r2'

const PasswordSchema = yup.object().shape({
	digit1: yup
		.string()
		.matches(/^\d$/, '0から9の数字を入力してください')
		.required(),
	digit2: yup
		.string()
		.matches(/^\d$/, '0から9の数字を入力してください')
		.required(),
	digit3: yup
		.string()
		.matches(/^\d$/, '0から9の数字を入力してください')
		.required(),
	digit4: yup
		.string()
		.matches(/^\d$/, '0から9の数字を入力してください')
		.required(),
})

type digit = 'digit1' | 'digit2' | 'digit3' | 'digit4'

const AuthPadLock = () => {
	const router = useRouter()
	const [error, setError] = useState<ErrorType>()
	const [isLoading, setIsLoading] = useState<boolean>(false) // loading -> isLoading に変更
	const [loadingMessage, setLoadingMessage] = useState<string>('処理中です...')

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
		resolver: yupResolver(PasswordSchema),
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
		try {
			await signIn('line', {
				maxAge: 6 * 30 * 24 * 60 * 60, // 6 months
				checks: ['state'],
				callbackUrl: '/user',
			})
		} catch (signInError) {
			setError({
				status: 500,
				response: `LINEログインに失敗しました: ${String(signInError)}`,
			})
			setIsLoading(false)
		}
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
			if (res.status !== 204) {
				setError(res)
				setIsLoading(false)
			} else {
				await handleSignIn()
			}
		} catch (submitError: any) {
			setError({
				status: 500,
				response: String(submitError),
			})
			setIsLoading(false)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center space-y-2 h-full">
			{isLoading && <AuthLoadingIndicator message={loadingMessage} />}
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
			{/* {loading && <Loading />} 古いローディングを削除 */}
			{error && (
				<p className="text-sm text-error text-center">
					エラーコード{error.status}:{error.response}
				</p>
			)}
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
