'use server'

import Link from 'next/link'
import HomePageBar from '@/components/shared/HomePageBar'

const list = [
	{
		title: 'サイトマップ',
		list: [
			{
				url: '/home',
				title: 'ホームページ',
			},
			{
				url: '/booking',
				title: 'コマ表',
			},
			{
				url: '/video',
				title: '過去動画',
			},
			{
				url: '/blogs',
				title: 'お知らせ',
			},
		],
	},
	{
		title: 'SNS',
		list: [
			{
				url: 'https://twitter.com/ashitabo_dongri',
				title: 'Twitter',
			},
			{
				url: 'https://www.instagram.com/ashitabo2023',
				title: 'Instagram',
			},
		],
	},
	{
		title: 'お問合せ',
		list: [
			{
				url: 'https://docs.google.com/forms/d/e/1FAIpQLSfjiJi5HDgaEhsUC5fk79ovoauTthCLIY5mtEuOrzdV6UWZeQ/viewform?usp=header',
				title: 'お問い合わせ口',
			},
			{
				url: 'https://docs.google.com/forms/d/e/1FAIpQLSfGTf-FXq9pihaIQb1fEjUuYsnhSg1rEbAVyapLJi7CiwkilQ/viewform?usp=header',
				title: '改善要望・ご意見窓口',
			},
		],
	},
	{
		title: '規約・ポリシー',
		list: [
			{
				url: '/terms',
				title: '利用規約',
			},
			{
				url: '/privacy',
				title: 'プライバシーポリシー',
			},
		],
	},
]

const Footer = () => {
	return (
		<footer className="footer bg-white mt-8 flex flex-col items-center">
			<nav className="py-8 px-4 md:p-8 pb-0 w-full max-w-screen-lg mx-auto justify-center relative">
				<div className="absolute w-full flex justify-center mt-36 md:mt-8">
					<HomePageBar />
				</div>
				<ul className="grid gap-4 p-4 bg-white/80 z-10 grid-cols-2 md:grid-cols-4">
					{list.map(({ title, list }) => (
						<li key={title} className="text-center">
							<h2 className="font-bold text-base text-neutral-content border-l-4 border-tetiary-light pl-2">
								{title}
							</h2>
							{list.map(({ url, title }) =>
								url.startsWith('http') ? (
									<a
										key={title}
										href={url}
										className="block mt-2 text-sm link link-hover"
										target="_blank"
										rel="noopener noreferrer"
									>
										{title}
									</a>
								) : (
									<Link
										key={title}
										href={url}
										className="block mt-2 text-sm link link-hover"
									>
										{title}
									</Link>
								),
							)}
						</li>
					))}
				</ul>
			</nav>

			<span className="py-6 block text-center text-xs-custom">
				Copyright © {new Date().getFullYear()}{' '}
				<a href="/" className="hover:underline">
					あしたぼ
				</a>{' '}
				All Rights Reserved.
			</span>
		</footer>
	)
}

export default Footer
