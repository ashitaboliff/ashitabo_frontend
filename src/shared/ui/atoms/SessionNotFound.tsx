import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/shared/lib/r2'

export default async function SessionForbidden() {
	return (
		<div className="flex flex-col items-center justify-center text-center">
			<div className="mb-8">
				<Image
					src={getImageUrl('/error/403.webp')}
					alt="403 Forbidden"
					width={400}
					height={225}
					priority
					unoptimized
				/>
			</div>
			<h1 className="mb-4 font-bold text-4xl">403 Forbidden Page</h1>
			<p className="mb-2 text-lg">
				認証の必要なページです。以下よりログイン、もしくは利用登録を行ってください。
			</p>
			<div className="flex flex-row gap-x-2">
				<Link href="/home" className="underline">
					ホームに戻る
				</Link>
				<Link href="/auth/signin" className="underline">
					ログイン
				</Link>
			</div>
		</div>
	)
}
