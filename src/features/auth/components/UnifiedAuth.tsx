import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { AccountRole } from '@/features/user/types'
import { getUnifiedAuthState } from '@/features/auth/components/actions'
import type { UnifiedAuthResult } from '@/features/auth/types'

interface AuthPageProps {
	children: (authResult: UnifiedAuthResult) => ReactNode
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
	const authResult = await getUnifiedAuthState(true)
	const { authState } = authResult

	// 認証済みユーザーをリダイレクトする場合（サインインページなど）
	if (redirectIfAuthenticated && authResult.isAuthenticated) {
		if (authResult.hasProfile) {
			redirect('/user')
		} else if (authResult.needsProfile) {
			redirect('/auth/signin/setting')
		}
	}

	// 認証状態に基づくリダイレクト処理
	switch (authState) {
		case 'no-session':
			if (!allowUnauthenticated) {
				redirect('/auth/signin')
			}
			break

		case 'invalid-session':
			if (!allowUnauthenticated) {
				redirect('/auth/session-expired')
			}
			break

		case 'session':
			if (requireProfile) {
				redirect('/auth/signin/setting')
			}
			break

		case 'profile':
			// アクセス許可
			break
	}

	// ユーザーのロールチェック
	if (authResult.isAuthenticated && requireRole) {
		switch (requireRole) {
			case 'TOPADMIN':
				if (authResult.session?.user?.role !== 'TOPADMIN') {
					redirect('/auth/unauthorized')
				}
				break
			case 'ADMIN':
				if (authResult.session?.user?.role === 'USER') {
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
