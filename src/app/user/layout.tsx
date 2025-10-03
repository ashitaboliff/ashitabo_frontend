import { Inter } from 'next/font/google'
import HomePageHeader from '@/components/shared/HomePageHeader'

const inter = Inter({ subsets: ['latin'] })

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
