import HomePageHeader from '@/components/shared/HomePageHeader'

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="flex flex-col">
			<HomePageHeader />
			{children}
		</div>
	)
}
;<HomePageHeader />
