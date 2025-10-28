import { Inter } from 'next/font/google'
import Script from 'next/script'
import PublicEnv from '@/shared/lib/env/public'
import { nicomoji } from '@/shared/lib/fonts'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'
import type { ReactNode } from 'react'
import { createMetaData } from '@/shared/hooks/useMetaData'
import ProgressBarProvider from '@/shared/ui/atoms/ProgressBarProvider'
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
				<ProgressBarProvider>
					<Header className={nicomoji.className} />
					{children}
					<Footer />
				</ProgressBarProvider>
				<Script
					src={`https://www.googletagmanager.com/gtag/js?id=${PublicEnv.NEXT_PUBLIC_GA_ID}`}
					strategy="afterInteractive"
				/>
				<Script
					async
					src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PublicEnv.NEXT_PUBLIC_ADS_ID}`}
					crossOrigin="anonymous"
					strategy="lazyOnload"
				/>
			</body>
		</html>
	)
}
