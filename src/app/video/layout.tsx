import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { FieldAds } from '@/shared/ui/ads'
import HomePageHeader from '@/shared/ui/molecules/HomePageHeader'

export const metadata = createMetaData({
	title: 'ライブ映像ページ',
	description: 'あしたぼの過去のライブ映像はこちらから',
	url: '/video',
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
			<FieldAds />
		</>
	)
}
