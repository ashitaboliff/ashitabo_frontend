'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useState } from 'react'
import { signOutUser as signOutAction } from '@/domains/user/hooks/useSignOut'
import { useFeedback } from '@/shared/hooks/useFeedback'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import type { Session } from '@/types/session'

interface Props {
	readonly session: Session
	readonly children: ReactNode
}

const UserPageControls = ({ session, children }: Props) => {
	const router = useRouter()
	const signOutFeedback = useFeedback()
	const [isSigningOut, setIsSigningOut] = useState(false)
	const signOutMessage = signOutFeedback.feedback

	const handleEditProfile = useCallback(() => {
		router.push('/user/edit')
	}, [router])

	const handleNavigateAdmin = useCallback(() => {
		router.push('/admin')
	}, [router])

	const handleNavigateTopAdmin = useCallback(() => {
		router.push('/admin/topadmin')
	}, [router])

	const handleSignOut = useCallback(async () => {
		signOutFeedback.clearFeedback()
		setIsSigningOut(true)
		try {
			const result = await signOutAction()
			if (result.ok) {
				router.push('/home')
				return
			}
			signOutFeedback.showApiError(result)
		} catch (error) {
			signOutFeedback.showError('サインアウトに失敗しました。', {
				details: error instanceof Error ? error.message : String(error),
				code: 500,
			})
		} finally {
			setIsSigningOut(false)
		}
	}, [router, signOutFeedback])

	const role = session.user.role ?? 'USER'

	return (
		<>
			<div className="mb-6 flex w-full flex-col gap-3 md:w-1/2 lg:w-1/3">
				<button
					type="button"
					className="btn btn-outline btn-primary"
					onClick={handleEditProfile}
				>
					プロフィールを編集
				</button>
				{role === 'ADMIN' && (
					<button
						type="button"
						className="btn btn-secondary btn-outline"
						onClick={handleNavigateAdmin}
					>
						管理者ページへ
					</button>
				)}
				{role === 'TOPADMIN' && (
					<div className="flex flex-col gap-2">
						<button
							type="button"
							className="btn btn-accent btn-outline"
							onClick={handleNavigateAdmin}
						>
							管理者ページ
						</button>
						<button
							type="button"
							className="btn btn-accent btn-outline"
							onClick={handleNavigateTopAdmin}
						>
							トップ管理者ページ
						</button>
					</div>
				)}
			</div>

			<div className="w-full">{children}</div>

			<div className="mt-4 w-full md:w-1/2 lg:w-1/3">
				<FeedbackMessage source={signOutMessage} />
			</div>

			<div className="mt-6 flex w-full flex-col justify-center gap-4 sm:flex-row md:w-1/2 lg:w-1/3">
				<button
					type="button"
					className="btn btn-error btn-outline w-full sm:w-1/2"
					onClick={handleSignOut}
					disabled={isSigningOut}
				>
					{isSigningOut ? 'ログアウト中...' : 'ログアウト'}
				</button>
				<button
					type="button"
					className="btn btn-disabled w-full sm:w-1/2"
					disabled
				>
					アカウントを削除
				</button>
			</div>
		</>
	)
}

export default UserPageControls
