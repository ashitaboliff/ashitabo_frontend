import Image from 'next/image'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { getImageUrl } from '@/shared/lib/r2'

export const metadata = createMetaData({
	title: 'メンテナンス中',
	description: 'ただいまメンテナンス中です。',
	url: '/maintenance',
})

export default function Maintenance() {
	return (
		<div className="flex flex-col items-center justify-center text-center">
			<div className="mb-8">
				<Image
					src={getImageUrl('/error/maintenance.webp')}
					alt="メンテナンス中"
					width={400}
					height={225}
					priority
					unoptimized
				/>
			</div>
			<h1 className="mb-4 font-bold text-4xl">メンテナンス中</h1>
			<p className="mb-2 text-lg">ただいまメンテナンス中です。</p>
			<p className="mb-6 text-xxs">しばらくお待ちください。</p>
		</div>
	)
}
