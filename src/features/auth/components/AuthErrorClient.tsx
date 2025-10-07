'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// エラーマッピング
const errorMap = {
	Configuration: '設定に問題があります。管理者にお問い合わせください。',
	AccessDenied: 'アクセスが拒否されました。権限をご確認ください。',
	Verification: 'メール認証に失敗しました。再度お試しください。',
	Default: '認証中にエラーが発生しました。再度お試しください。',
} as const

interface AuthErrorClientProps {
	initialError?: string | null
}

export default function AuthErrorClient({
	initialError,
}: AuthErrorClientProps) {
	const searchParams = useSearchParams()
	const error = searchParams.get('error') || initialError
	const messageFromQuery = searchParams.get('message')
	const reasonFromQuery = searchParams.get('reason')

	const fallbackMessage =
		errorMap[error as keyof typeof errorMap] || errorMap.Default
	const errorMessage = messageFromQuery ?? fallbackMessage

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						認証エラー
					</h2>
					<p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
					{error && (
						<p className="mt-2 text-xs text-gray-500">
							エラーコード: {error}
							{reasonFromQuery ? ` (${reasonFromQuery})` : null}
						</p>
					)}
				</div>
				<div className="mt-8 space-y-4">
					<Link
						href="/auth/signin"
						className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						サインインページに戻る
					</Link>
					<Link
						href="/home"
						className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						ホームに戻る
					</Link>
				</div>
			</div>
		</div>
	)
}
