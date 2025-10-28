import type { Metadata } from 'next'
import Link from 'next/link'
import { getImageUrl } from '@/shared/lib/r2'

export const metadata: Metadata = {
	title: '404',
}

const NotFoundImages: { id: number; src: string; score: number }[] = [
	{ id: 1, src: '/error/404/01.webp', score: 150 },
	{ id: 2, src: '/error/404/02.webp', score: 200 },
	{ id: 3, src: '/error/404/03.webp', score: 100 },
	{ id: 4, src: '/error/404/04.webp', score: 150 },
	{ id: 5, src: '/error/404/05.webp', score: 10 },
	{ id: 6, src: '/error/404/06.webp', score: 100 },
	{ id: 7, src: '/error/404/07.webp', score: 30 },
	{ id: 8, src: '/error/404/08.webp', score: 120 },
	{ id: 9, src: '/error/404/09.webp', score: 5 },
	{ id: 10, src: '/error/404/10.webp', score: 135 },
]

export default async function NotFound() {
	const selectImage = async () => {
		const random = Math.floor(Math.random() * 1000)
		let cumulativeScore = 0

		for (const image of NotFoundImages) {
			cumulativeScore += image.score
			if (random < cumulativeScore) {
				return image.src
			}
		}
		return NotFoundImages[0].src
	}

	const selectedImage = await selectImage()

	return (
		<div className="flex flex-col items-center justify-center text-center">
			<div className="mb-8">
				<img
					src={getImageUrl(selectedImage)}
					alt="404 Not Found"
					width={400}
					height={225}
				/>
			</div>
			<h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
			<p className="text-lg mb-2">お探しのページは見つかりませんでした。</p>
			<p className="text-xxs mb-6">
				※画像はランダムですがサーバ負荷の原因なのでリロードしないでください
				<br />
				リロードしまくった人間はIPアドレスから特定してサーバ代を請求します。
			</p>
			<Link href="/home" className="underline">
				ホームに戻る
			</Link>
		</div>
	)
}
