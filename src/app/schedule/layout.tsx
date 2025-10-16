import { Inter } from 'next/font/google'
import HomePageHeader from '@/components/shared/HomePageHeader'
import { createMetaData } from '@/hooks/useMetaData'

const _inter = Inter({ subsets: ['latin'] })

export const metadata = createMetaData({
	title: '日程調整',
	description: 'バンド内での日程調整ページです',
	url: '/schedule',
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
