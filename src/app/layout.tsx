import { Inter } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import PublicEnv from '@/shared/lib/env/public'
import { nicomoji } from '@/shared/lib/fonts'
import './globals.css'
import Footer from '@/components/home/Footer'
import Header from '@/components/home/Header'
import ProgressBarProvider from '@/shared/ui/atoms/ProgressBarProvider'
import { createMetaData } from '@/shared/hooks/useMetaData'

const inter = Inter({ subsets: ['latin'] })

export const metadata = createMetaData({
	title: 'あしたぼホームページ',
	url: '/',
})

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="ja">
			<body className={inter.className}>
				<Script strategy="afterInteractive">
					{`console.log('%c拙い知識で作ったやつなので、可読性めっちゃ低くて申し訳ないけど頑張ってね！！！ watabegg', 'color: #000000; font-size: 20px; padding: 10px; font-weight: bold;');
console.log('%cRespect for 変態糞学生', 'color: #ff0000; font-size: 20px; padding: 5px; font-weight: bold; font-style: italic;');
console.log('%chttps://www.github.com/ashitaboliff/', 'color: #000000; font-size: 14px; padding: 5px; text-decoration: underline;');`}
				</Script>
				<ProgressBarProvider>
					<Header className={nicomoji.className} />
					<Link
						href="/blogs/20250724"
						className="link link-info text-center text-lg font-bold mb-4 block"
					>
						✨7月24日 - 画像が見れない件について✨
					</Link>
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
