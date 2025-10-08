import { gkktt } from '@/lib/fonts'
import HomePageHeader from '@/components/shared/HomePageHeader'
import { createMetaData } from '@/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'ホーム',
	url: '/home',
})

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className={gkktt.className}>
			<HomePageHeader />
			{children}
		</div>
	)
}
