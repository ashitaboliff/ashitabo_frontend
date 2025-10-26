import type { ReactNode } from 'react'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { createMetaData } from '@/shared/hooks/useMetaData'

export async function metadata() {
	return createMetaData({
		title: '管理者ページ',
		description: '管理者ページ',
		url: '/admin',
	})
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => children}
		</AuthPage>
	)
}
