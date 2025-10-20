import Link from 'next/link'
import { LuShieldAlert } from '@/components/ui/icons'
import AuthIssueLayout from '@/features/auth/components/AuthIssueLayout'
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
		<AuthIssueLayout
			title="アクセスが拒否されました"
			message={'申し訳ございません。このページにアクセスする権限がありません。'}
			code="403"
			actions={
				<Link href="/" className="btn btn-primary w-full sm:w-auto">
					ホームに戻る
				</Link>
			}
			icon={<LuShieldAlert />}
		/>
	)
}
