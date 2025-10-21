'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
	AUTH_ERROR_DEFAULT,
	resolveAuthErrorDetail,
} from '@/domains/auth/data/authErrorMap'
import AuthIssueLayout from '@/domains/auth/ui/AuthIssueLayout'
import { LuTriangleAlert } from '@/shared/ui/icons'

interface Props {
	readonly initialError?: string | null
}

const buildActions = () => (
	<>
		<Link href="/auth/signin" className="btn btn-primary w-full sm:w-auto">
			サインインページに戻る
		</Link>
		<Link href="/home" className="btn btn-outline w-full sm:w-auto">
			ホームに戻る
		</Link>
	</>
)

export default function AuthErrorClient({ initialError }: Props) {
	const searchParams = useSearchParams()
	const error = searchParams.get('error') || initialError
	const messageFromQuery = searchParams.get('message')
	const reasonFromQuery = searchParams.get('reason')

	const detail = resolveAuthErrorDetail(error ?? undefined)
	const fallbackMessage =
		messageFromQuery ?? detail.message ?? AUTH_ERROR_DEFAULT.message
	const reason = reasonFromQuery ?? detail.reason

	return (
		<AuthIssueLayout
			title="認証エラーが発生しました"
			message={fallbackMessage}
			details={reason ? `理由: ${reason}` : undefined}
			code={error ?? null}
			actions={buildActions()}
			icon={<LuTriangleAlert />}
		/>
	)
}
