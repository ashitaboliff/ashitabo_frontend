'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from '@/domains/auth/hooks/useSession'
import AuthIssueLayout from '@/domains/auth/ui/AuthIssueLayout'
import { signOutUser } from '@/domains/user/hooks/useSignOut'
import { LuClockAlert } from '@/shared/ui/icons'
import { logError } from '@/shared/utils/logger'

const SessionExpiredClient = () => {
	const router = useRouter()
	const { status, update } = useSession()
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
		<AuthIssueLayout
			title="セッションが無効になりました"
			message={
				'セッションが無効または期限切れです。お手数ですが再度ログインしてください。'
			}
			actions={
				<>
					<button
						type="button"
						onClick={handleLogout}
						className={`btn btn-outline btn-error w-full sm:w-auto ${
							isLoading ? 'loading' : ''
						}`.trim()}
						disabled={isLoading}
					>
						{isLoading ? '' : 'ログアウト'}
					</button>
					<button
						type="button"
						onClick={handleReLogin}
						className={`btn btn-primary w-full sm:w-auto ${
							isLoading ? 'loading' : ''
						}`.trim()}
						disabled={isLoading}
					>
						{isLoading ? '' : '再ログイン'}
					</button>
				</>
			}
			icon={<LuClockAlert />}
		>
			{status === 'loading' ? (
				<div className="flex items-center justify-center gap-2 text-sm text-base-content/70">
					<span className="loading loading-spinner loading-sm"></span>
					<span>セッション状態を確認中...</span>
				</div>
			) : null}
		</AuthIssueLayout>
	)
}

export default SessionExpiredClient
