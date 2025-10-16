'use client'

import { useRouter } from 'next-nprogress-bar'
import { type ReactNode, useCallback, useState } from 'react'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import { signOutUser as signOutAction } from '@/features/user/hooks/signOut'
import type { Profile } from '@/features/user/types'
import { useFeedback } from '@/hooks/useFeedback'
import type { Session } from '@/types/session'
import ProfileDisplay from './ProfileDisplay'

interface UserPageLayoutProps {
	session: Session
	profile: Profile | null
	children: ReactNode
}

const UserPageLayout = ({
	session,
	profile,
	children,
}: UserPageLayoutProps) => {
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

	return (
		<div className="container mx-auto p-4 flex flex-col items-center">
			<ProfileDisplay session={session} profile={profile} />
			<div className="flex flex-col gap-3 w-full md:w-1/2 lg:w-1/3 mb-6">
				<button
					type="button"
					className="btn btn-outline btn-primary"
					onClick={handleEditProfile}
				>
					プロフィールを編集
				</button>
				{(session.user.role ?? 'USER') === 'ADMIN' && (
					<button
						type="button"
						className="btn btn-secondary btn-outline"
						onClick={handleNavigateAdmin}
					>
						管理者ページへ
					</button>
				)}
				{(session.user.role ?? 'USER') === 'TOPADMIN' && (
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

			<div className="w-full md:w-1/2 lg:w-1/3 mt-4">
				<ErrorMessage message={signOutMessage} />
			</div>

			<div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 w-full md:w-1/2 lg:w-1/3">
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
		</div>
	)
}

export default UserPageLayout
