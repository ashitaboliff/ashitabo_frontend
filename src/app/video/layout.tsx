import HomePageHeader from '@/components/shared/HomePageHeader'
import { createMetaData } from '@/utils/metaData'

export const metadata = createMetaData({
	title: 'ライブ映像ページ',
	description: 'あしたぼの過去のライブ映像はこちらから',
	url: '/video',
})

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
