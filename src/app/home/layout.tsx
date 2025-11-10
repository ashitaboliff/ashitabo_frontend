import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { FieldAds } from '@/shared/ui/ads'
import HomePageHeader from '@/shared/ui/molecules/HomePageHeader'

export const metadata = createMetaData({
	title: 'ホーム',
	url: '/home',
})

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<div>
			<HomePageHeader />
			{children}
			<FieldAds />
		</div>
	)
}
