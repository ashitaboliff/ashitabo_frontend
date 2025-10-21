import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getAuthDetails } from '@/domains/auth/api/authActions'
import type { AuthDetails } from '@/domains/auth/model/authTypes'
import type { AccountRole } from '@/domains/user/model/userTypes'

interface AuthPageProps {
	children: (authResult: AuthDetails) => ReactNode
	requireProfile?: boolean
	allowUnauthenticated?: boolean
	redirectIfAuthenticated?: boolean
	requireRole?: AccountRole
}

/**
 * 統一されたページレベル認証コンポーネント
 * セッション情報を子コンポーネントに渡すことで重複取得を避ける
 * @param children 認証情報を受け取る子コンポーネント
 * @param requireProfile プロフィール情報が必要かどうか（デフォルト: true）
 * @param allowUnauthenticated 未認証ユーザーを許可するかどうか（デフォルト: false）
 * @param redirectIfAuthenticated 認証済みユーザーをリダイレクトするかどうか（デフォルト: false）
 * @param requireRole 必要なアカウントロール（デフォルト: 'USER'）
 */
export async function AuthPage({
	children,
	requireProfile = true,
	allowUnauthenticated = false,
	redirectIfAuthenticated = false,
	requireRole = 'USER',
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

	if (requireProfile && !authResult.hasProfile) {
		redirect('/auth/signin/setting')
	}

	if (!allowUnauthenticated && authResult.session === null) {
		redirect('/auth/signin')
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
