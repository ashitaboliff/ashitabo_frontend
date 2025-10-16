import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { AccountRole } from '@/features/user/types'
import { getAuthDetails } from '@/features/auth/actions'
import type { AuthDetails } from '@/features/auth/types'

interface AuthPageProps {
	children: (authResult: AuthDetails) => ReactNode
	requireProfile?: boolean
	allowUnauthenticated?: boolean
	redirectIfAuthenticated?: boolean
	requireRole?: AccountRole
	fallback?: ReactNode
}

/**
 * 統一されたページレベル認証コンポーネント
 * セッション情報を子コンポーネントに渡すことで重複取得を避ける
 */
export async function AuthPage({
	children,
	requireProfile = true,
	allowUnauthenticated = false,
	redirectIfAuthenticated = false,
	requireRole = 'USER',
	fallback,
}: AuthPageProps) {
	const authResult = await getAuthDetails(true)
	const { status, issue } = authResult

	// 認証済みユーザーをリダイレクトする場合（サインインページなど）
	if (redirectIfAuthenticated) {
		if (status === 'signed-in') {
			redirect('/user')
		} else if (status === 'needs-profile') {
			redirect('/auth/signin/setting')
		}
	}

	// 認証状態に基づくリダイレクト処理
	if (status === 'guest' && !allowUnauthenticated) {
		redirect('/auth/signin')
	}
	if (issue === 'session-expired' && !allowUnauthenticated) {
		redirect('/auth/session-expired')
	}
	if (issue === 'profile-required' && requireProfile) {
		redirect('/auth/signin/setting')
	}

	// ユーザーのロールチェック
	if (status === 'signed-in' && requireRole) {
		switch (requireRole) {
			case 'TOPADMIN':
				if (authResult.role !== 'TOPADMIN') {
					redirect('/auth/unauthorized')
				}
				break
			case 'ADMIN':
				if (authResult.role === 'USER') {
					redirect('/auth/unauthorized')
				}
				break
			case 'USER':
				break
		}
	}

	// セッション情報を子コンポーネントに渡す
	return <>{children(authResult)}</>
}
