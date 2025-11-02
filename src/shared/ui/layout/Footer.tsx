import Link from 'next/link'
import HomePageBar from '@/shared/ui/atoms/HomePageBar'

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
		<footer className="footer mt-8 flex flex-col items-center bg-white">
			<nav className="relative mx-auto w-full max-w-screen-lg justify-center px-4 py-8 pb-0 md:p-8">
				<div className="absolute mt-36 flex w-full justify-center md:mt-8">
					<HomePageBar />
				</div>
				<ul className="z-10 grid grid-cols-2 gap-4 bg-white/80 p-4 md:grid-cols-4">
					{list.map(({ title, list }) => (
						<li key={title} className="text-center">
							<h2 className="border-tetiary-light border-l-4 pl-2 font-bold text-base text-neutral-content">
								{title}
							</h2>
							{list.map(({ url, title }) =>
								url.startsWith('http') ? (
									<a
										key={title}
										href={url}
										className="link link-hover mt-2 block text-sm"
										target="_blank"
										rel="noopener noreferrer"
									>
										{title}
									</a>
								) : (
									<Link
										key={title}
										href={url}
										className="link link-hover mt-2 block text-sm"
									>
										{title}
									</Link>
								),
							)}
						</li>
					))}
				</ul>
			</nav>

			<span className="block py-6 text-center text-xs-custom">
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
