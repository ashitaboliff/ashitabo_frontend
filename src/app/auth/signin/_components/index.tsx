'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import PublicEnv from '@/shared/lib/env/public'
import { nicomoji } from '@/shared/lib/fonts'
import { getImageUrl } from '@/shared/lib/r2'

const SigninPage = () => {
	const router = useRouter()

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="card my-6 flex h-96 w-72 flex-col items-center justify-center bg-white shadow-lg">
				<figure>
					<Image
						src={getImageUrl('/utils/login.webp')}
						alt="login"
						width={300}
						height={250}
						unoptimized
					/>
				</figure>
				<div className="flex flex-col items-center justify-center gap-y-2 p-4">
					<div className={`text-3xl ${nicomoji.className}`}>利用登録</div>
					<div className="text-sm">
						あしたぼの部員、およびOB,OGはこちらから利用登録、もしくはログインを行ってください。
					</div>
					<button
						type="button"
						className="btn btn-primary"
						onClick={async () => router.push('/auth/padlock')}
					>
						LINEで登録
					</button>
				</div>
			</div>
			<div className="text-center text-error">
				<p>※ 利用登録にはあしたぼの部室パスワードが必要です</p>
			</div>
			<div className="mt-4 text-base-content text-sm">
				登録した場合は、{' '}
				<a
					href={`${PublicEnv.NEXT_PUBLIC_APP_URL}/terms`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-info hover:underline"
				>
					利用規約
				</a>{' '}
				と{' '}
				<a
					href={`${PublicEnv.NEXT_PUBLIC_APP_URL}/privacy`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-info hover:underline"
				>
					プライバシーポリシー
				</a>{' '}
				に同意したものとみなされます。
			</div>
		</div>
	)
}

export default SigninPage
