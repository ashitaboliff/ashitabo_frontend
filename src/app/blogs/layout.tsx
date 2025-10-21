import type { ReactNode } from 'react'
import HomePageHeader from '@/shared/ui/molecules/HomePageHeader'

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
