import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import HomePageHeader from '@/shared/ui/molecules/HomePageHeader'

const _inter = Inter({ subsets: ['latin'] })

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
