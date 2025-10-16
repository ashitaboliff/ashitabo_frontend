import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import BandAddForm from '@/features/band/components/BandAddForm'

const Page = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (_authResult) => {
				return (
					<div className="flex flex-col items-center min-h-screen p-4">
						<div className="flex flex-col items-center justify-center bg-white shadow-lg p-6 rounded-lg w-full">
							<h1 className="text-4xl lg:text-6xl font-bold mb-4">
								バンド組もうぜ!!
							</h1>
							<p className="text-sm lg:text-md mb-6">
								バンドメンバーを募集するためのフォームです。
								<br />
								募集パートを登録することでその楽器を登録した人に通知を送ることができます。
							</p>
							<p className="text-lg lg:text-xl mb-6 text-secondary">
								※ごめんまだ出来てない！
							</p>
						</div>
						<BandAddForm />
					</div>
				)
			}}
		</AuthPage>
	)
}

export default Page
