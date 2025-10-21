import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import HomePageHeader from '@/shared/ui/molecules/HomePageHeader'

export async function metadata() {
	return createMetaData({
		title: 'バンド組もうぜ!! | あしたぼホームページ',
		description: 'バンドを作成して、メンバーを募集しよう！',
		url: '/band',
	})
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<>
			<HomePageHeader />
			{children}
		</>
	)
}
