import MemberRecruitmentForm from '@/app/band/_components/MemberRecruitmentForm'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { gkktt } from '@/shared/lib/fonts'
import LinkWithArrow from '@/shared/ui/atoms/LinkWithArrow'

const Page = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (_authResult) => {
				return (
					<div className="flex min-h-screen flex-col items-center p-4">
						<div className="flex w-full flex-col items-center justify-center rounded-lg bg-white p-6 shadow-lg">
							<h1
								className={`mb-4 font-bold text-4xl lg:text-6xl ${gkktt.className}`}
							>
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
