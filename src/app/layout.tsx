import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import PublicEnv from '@/shared/lib/env/public'
import './globals.css'
import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { AdSenseProvider, AdSenseScript, Ads } from '@/shared/ui/ads'
import Footer from '@/shared/ui/layout/Footer'
import Header from '@/shared/ui/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = createMetaData({
	title: 'あしたぼホームページ',
	url: '/',
})

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	const headersList = await headers()
	const proto = headersList.get('x-forwarded-proto') ?? 'https'
	const host =
		headersList.get('x-forwarded-host') ??
		headersList.get('host') ??
		'localhost'
	const path = headersList.get('x-invoke-path') ?? '/'
	const pathname = new URL(path, `${proto}://${host}`).pathname
	return (
		<html lang="ja">
			<body className={inter.className}>
				<Script strategy="afterInteractive">
					{`console.log('%c拙い知識で作ったやつなので、可読性めっちゃ低くて申し訳ないけど頑張ってね！！！ watabegg', 'color: #000000; font-size: 20px; padding: 10px; font-weight: bold;');
console.log('%cRespect for 変態糞学生', 'color: #ff0000; font-size: 20px; padding: 5px; font-weight: bold; font-style: italic;');
console.log('%chttps://www.github.com/ashitaboliff/', 'color: #000000; font-size: 14px; padding: 5px; text-decoration: underline;');`}
				</Script>
				<Analytics />
				<SpeedInsights />
				<AdSenseScript adsId={PublicEnv.NEXT_PUBLIC_ADS_ID || ''} />
				<AdSenseProvider clientId={PublicEnv.NEXT_PUBLIC_ADS_ID || ''}>
					<Header />
					<main className="container mx-auto mt-24 h-full max-w-screen-lg px-2">
						{children}
					</main>
					<Ads placement="Field" key={pathname} />
					<Footer />
				</AdSenseProvider>
				<Script
					src={`https://www.googletagmanager.com/gtag/js?id=${PublicEnv.NEXT_PUBLIC_GA_ID}`}
					strategy="afterInteractive"
				/>
			</body>
		</html>
	)
}
