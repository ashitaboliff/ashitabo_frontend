import { createMetaData } from '@/hooks/useMetaData'

export async function generateMetadata() {
	return createMetaData({
		title: '403 Forbidden | あしたぼホームページ',
		description: '権限エラーが発生しました。',
		url: '/auth/unauthorized',
	})
}

export default function UnauthorizedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
				<h1 className="text-6xl font-bold text-alert mb-4">403</h1>
				<h2 className="text-2xl font-semibold text-base-content mb-4">
					アクセス拒否
				</h2>
				<p className="text-base-content mb-6">
					申し訳ございませんが、このページにアクセスする権限がありません。
				</p>
				<a href="/" className="btn btn-primary btn-lg">
					ホームに戻る
				</a>
			</div>
		</div>
	)
}
