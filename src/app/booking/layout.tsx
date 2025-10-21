import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import HomePageHeader from '@/shared/ui/molecules/HomePageHeader'

const _inter = Inter({ subsets: ['latin'] })

export const metadata = createMetaData({
	title: 'コマ表 | あしたぼホームページ',
	description: 'こちらからあしたぼ内でのサークル棟音楽室の予約が可能です。',
	url: '/booking',
})

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
