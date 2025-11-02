import BandAddForm from '@/app/band/add/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (_authResult) => {
				return (
					<div className="flex min-h-screen flex-col items-center p-4">
						<div className="flex w-full flex-col items-center justify-center rounded-lg bg-white p-6 shadow-lg">
							<h1 className="mb-4 font-bold text-4xl lg:text-6xl">
								バンド組もうぜ!!
							</h1>
							<p className="mb-6 text-sm lg:text-md">
								バンドメンバーを募集するためのフォームです。
								<br />
								募集パートを登録することでその楽器を登録した人に通知を送ることができます。
							</p>
							<p className="mb-6 text-lg text-secondary lg:text-xl">
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
