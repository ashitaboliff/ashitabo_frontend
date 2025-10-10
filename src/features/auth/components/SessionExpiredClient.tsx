'use client'

import { useRouter } from 'next-nprogress-bar'
import { useState } from 'react'
import { useSession } from '@/features/auth/hooks/useSession'
import { signOutUser } from '@/features/user/actions'
import { logError } from '@/utils/logger'

const SessionExpiredClient = () => {
	const router = useRouter()
	const { data: session, status, update } = useSession()
	const [isLoading, setIsLoading] = useState(false)

	const handleLogout = async () => {
		setIsLoading(true)
		try {
			await signOutUser()
			await update()
			router.push('/home')
		} catch (error) {
			logError('ログアウト中にエラーが発生しました', error)
			// エラーが発生してもホームページへリダイレクト
			router.push('/home')
		} finally {
			setIsLoading(false)
		}
	}

	const handleReLogin = async () => {
		setIsLoading(true)
		try {
			await signOutUser()
			await update()
			router.push('/auth/padlock')
		} catch (error) {
			logError('再ログイン処理中にエラーが発生しました', error)
			router.push('/auth/padlock')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center p-4">
			<div className="card w-full max-w-md bg-base-100 shadow-xl">
				<div className="card-body items-center text-center">
					<h1 className="card-title text-2xl mb-4 text-error">
						セッションエラー
					</h1>
					<div className="alert alert-warning mb-6">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
						<div>
							<h3 className="font-bold">セッションが無効または期限切れです</h3>
							<div className="text-xs">
								お手数ですが、再度ログインしてください。
							</div>
						</div>
					</div>
					<div className="card-actions justify-center space-x-4 w-full">
						<button
							onClick={handleLogout}
							className={`btn btn-outline btn-error flex-1 ${isLoading ? 'loading' : ''}`}
							disabled={isLoading}
						>
							{isLoading ? '' : 'ログアウト'}
						</button>
						<button
							onClick={handleReLogin}
							className={`btn btn-primary flex-1 ${isLoading ? 'loading' : ''}`}
							disabled={isLoading}
						>
							{isLoading ? '' : '再ログイン'}
						</button>
					</div>
					{status === 'loading' && (
						<div className="mt-4">
							<span className="loading loading-spinner loading-sm"></span>
							<span className="ml-2 text-sm">セッション状態を確認中...</span>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default SessionExpiredClient
