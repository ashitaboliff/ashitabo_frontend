import MemberRecruitmentForm from '@/app/band/_components/MemberRecruitmentForm'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { gkktt } from '@/shared/lib/fonts'
import LinkWithArrow from '@/shared/ui/atoms/LinkWithArrow'

const Page = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (_authResult) => {
				return (
					<div className="flex flex-col items-center min-h-screen p-4">
						<div className="flex flex-col items-center justify-center bg-white shadow-lg p-6 rounded-lg w-full">
							<h1
								className={`text-4xl lg:text-6xl font-bold mb-4 ${gkktt.className}`}
							>
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
							<MemberRecruitmentForm />
						</div>
						<LinkWithArrow
							href="/band"
							className="btn btn-outline btn-secondary disabled mt-4"
						>
							募集中のバンドを見る
						</LinkWithArrow>
						<LinkWithArrow
							href="/band/add"
							className="btn btn-outline btn-accent mt-4"
						>
							既存のバンドを登録する
						</LinkWithArrow>
						<LinkWithArrow href="/band/list" className="btn btn-ghost mt-4">
							既存のバンドを見に行く
						</LinkWithArrow>
					</div>
				)
			}}
		</AuthPage>
	)
}

export default Page
