import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import HomePageHeader from '@/shared/ui/molecules/HomePageHeader'

export const metadata = createMetaData({
	title: '日程調整',
	description: 'バンド内での日程調整ページです',
	url: '/schedule',
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
