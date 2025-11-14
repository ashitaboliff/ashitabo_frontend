import PublicEnv from '@/shared/lib/env/public'

export const createMetaData = ({
	title,
	url: initialUrl,
	image = '/meta/logo.png',
	description = '信州大学工学部軽音サークルあしたぼの公式ホームページです。 サークルの紹介やイベント情報、部員向けの各種サービスを提供しています。部員向けの各種サービスを利用するにはログインが必要です。',
	keywords = [
		'信州大学',
		'工学部',
		'ホームページ',
		'サイト',
		'あしたぼ',
		'軽音',
		'バンド',
		'サークル',
		'長野県立大学',
		'どんぐり',
		'信大',
		'コマ表',
	],
	pathname, // Changed from params to pathname for clarity and flexibility
}: {
	title: string
	url?: string // Keep for static pages or as a base
	description?: string
	image?: string
	keywords?: string[]
	pathname?: string // To construct the full URL for dynamic pages
}) => {
	title = `${title} | あしたぼホームページ`
	// Construct URL: if pathname is provided, use it directly. Otherwise, use initialUrl.
	const finalPath = pathname || initialUrl || ''
	const url = `${PublicEnv.NEXT_PUBLIC_APP_URL}${finalPath.startsWith('/') ? '' : '/'}${finalPath}` // Ensure leading slash

	return {
		title,
		metadataBase: new URL(PublicEnv.NEXT_PUBLIC_APP_URL),
		generator: 'Next.js',
		description,
		keywords,
		openGraph: {
			title,
			description,
			url,
			siteName: 'あしたぼホームページ',
			images: [{ url: image }],
			locale: 'ja_JP',
			type: 'website',
		},
		icons: {
			icon: '/meta/logo.png',
			apple: '/meta/logo.png',
		},
		twitter: {
			card: 'summary_large_image',
			site: '@ashitabo_dongri',
			title,
			description,
			images: [{ url: image }],
		},
	}
}
