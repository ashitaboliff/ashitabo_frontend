import { Inter } from 'next/font/google'
import HomePageHeader from '@/components/shared/HomePageHeader'
import { createMetaData } from '@/shared/hooks/useMetaData'

const _inter = Inter({ subsets: ['latin'] })

export const metadata = createMetaData({
	title: 'コマ表 | あしたぼホームページ',
	description: 'こちらからあしたぼ内でのサークル棟音楽室の予約が可能です。',
	url: '/booking',
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
