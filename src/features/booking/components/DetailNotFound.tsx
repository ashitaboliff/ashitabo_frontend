'use client'

import { useRouter } from 'next-nprogress-bar'
import Message from '@/components/ui/atoms/Message'

/**
 * 予約情報が見つからなかった場合のコンポーネント、静的
 */
const DetailNotFoundPage = () => {
	const router = useRouter()

	return (
		<div className="p-4 flex flex-col items-center justify-center">
			<div className="p-4 flex flex-col justify-center gap-2">
				<Message variant="error">
					<p>
						予約情報が見つかりませんでした。
						<br />
						ホームに戻ってもう一度試してください。
					</p>
				</Message>
				<button
					type="button"
					className="btn btn-outline"
					onClick={() => router.push('/booking')}
				>
					ホームに戻る
				</button>
			</div>
		</div>
	)
}

export default DetailNotFoundPage
