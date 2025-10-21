import { Suspense } from 'react'
import AuthErrorClient from '@/app/auth/error/_components/AuthErrorClient'
import { createMetaData } from '@/shared/hooks/useMetaData'

export async function generateMetadata() {
	return createMetaData({
		title: '認証エラー | あしたぼホームページ',
		description: '認証エラーが発生しました。',
		url: '/auth/error',
	})
}

interface AuthErrorPageProps {
	searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({
	searchParams,
}: AuthErrorPageProps) {
	const { error } = await searchParams

	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-gray-50">
					<div className="text-center">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
						<p className="mt-4 text-gray-600">読み込み中...</p>
					</div>
				</div>
			}
		>
			<AuthErrorClient initialError={error} />
		</Suspense>
	)
}
