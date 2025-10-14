'use client'

import { type ReactNode, useCallback } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { signOutUser as signOutAction } from '@/features/user/actions'
import ProfileDisplay from './ProfileDisplay'
import type { Session } from '@/types/session'
import type { Profile } from '@/features/user/types'

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
		await signOutAction()
		router.push('/home')
	}, [router])

	return (
		<div className="container mx-auto p-4 flex flex-col items-center">
			<ProfileDisplay session={session} profile={profile} />
			<div className="flex flex-col gap-3 w-full md:w-1/2 lg:w-1/3 mb-6">
				<button
					className="btn btn-outline btn-primary"
					onClick={handleEditProfile}
				>
					プロフィールを編集
				</button>
				{(session.user.role ?? 'USER') === 'ADMIN' && (
					<button
						className="btn btn-secondary btn-outline"
						onClick={handleNavigateAdmin}
					>
						管理者ページへ
					</button>
				)}
				{(session.user.role ?? 'USER') === 'TOPADMIN' && (
					<div className="flex flex-col gap-2">
						<button
							className="btn btn-accent btn-outline"
							onClick={handleNavigateAdmin}
						>
							管理者ページ
						</button>
						<button
							className="btn btn-accent btn-outline"
							onClick={handleNavigateTopAdmin}
						>
							トップ管理者ページ
						</button>
					</div>
				)}
			</div>

			<div className="w-full">{children}</div>

			<div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 w-full md:w-1/2 lg:w-1/3">
				<button
					className="btn btn-error btn-outline w-full sm:w-1/2"
					onClick={handleSignOut}
				>
					ログアウト
				</button>
				<button className="btn btn-disabled w-full sm:w-1/2" disabled>
					アカウントを削除
				</button>
			</div>
		</div>
	)
}

export default UserPageLayout
