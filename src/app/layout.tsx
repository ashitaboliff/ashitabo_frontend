import { Inter } from 'next/font/google'
import { nicomoji } from '@/lib/fonts'
import Script from 'next/script'
import Link from 'next/link'
import './globals.css'
import ProgressBarProvider from '@/components/ui/atoms/ProgressBarProvider'
import Header from '@/components/home/Header'
import Footer from '@/components/home/Footer'
import { createMetaData } from '@/hooks/useMetaData'
import { SessionProvider } from '@/features/auth/context/SessionContext'
import { getAuthDetails } from '@/features/auth/actions'

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
	const authDetails = await getAuthDetails(true)
	return (
		<html lang="ja">
			<body className={inter.className}>
				<SessionProvider value={authDetails}>
					<script
						dangerouslySetInnerHTML={{
							__html: `
						console.log('%c拙い知識で作ったやつなので、可読性めっちゃ低くて申し訳ないけど頑張ってね！！！ watabegg', 'color: #000000; font-size: 20px; padding: 10px; font-weight: bold;');
						console.log('%cRespect for 変態糞学生', 'color: #ff0000; font-size: 20px; padding: 5px; font-weight: bold; font-style: italic;');
						console.log('%chttps://www.github.com/ashitaboliff/', 'color: #000000; font-size: 14px; padding: 5px; text-decoration: underline;');
					`,
						}}
					/>
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
				</SessionProvider>
				<Script
					src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
					strategy="afterInteractive"
				/>
				<Script
					async
					src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADS_ID}`}
					crossOrigin="anonymous"
					strategy="lazyOnload"
				/>
			</body>
		</html>
	)
}
