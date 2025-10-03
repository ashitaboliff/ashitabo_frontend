import { createMetaData } from '@/utils/metaData'
import HomePageHeader from '@/components/shared/HomePageHeader'

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
	children: React.ReactNode
}>) {
	return (
		<>
			<HomePageHeader />
			{children}
		</>
	)
}
