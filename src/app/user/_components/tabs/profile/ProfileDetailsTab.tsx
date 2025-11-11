'use client'

import type { Profile } from '@/domains/user/model/userTypes'
import { PartMap, RoleMap } from '@/domains/user/model/userTypes'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'

interface Props {
	readonly profile: Profile | null
}

const displayValue = (value?: string | null) => {
	if (!value) {
		return '未設定'
	}
	return value
}

const ProfileDetailsTab = ({ profile }: Props) => {
	if (!profile) {
		return (
			<FeedbackMessage
				source={{
					kind: 'info',
					title: 'プロフィール未登録',
					message:
						'プロフィール詳細はまだ登録されていません。プロフィール編集から登録してください。',
				}}
			/>
		)
	}

	const partLabel = profile.part?.length
		? profile.part.map((part) => PartMap[part]).join(' / ')
		: '未設定'

	return (
		<div className="space-y-6">
			<div className="grid gap-4 rounded-2xl bg-base-200/60 p-6 text-sm sm:grid-cols-2">
				<div>
					<p className="font-semibold text-base-content/60 text-xs uppercase tracking-wider">
						所属区分
					</p>
					<p className="mt-1 font-bold text-base">{RoleMap[profile.role]}</p>
				</div>
				<div>
					<p className="font-semibold text-base-content/60 text-xs uppercase tracking-wider">
						担当パート
					</p>
					<p className="mt-1 font-semibold text-base">{partLabel}</p>
				</div>
				<div>
					<p className="font-semibold text-base-content/60 text-xs uppercase tracking-wider">
						学籍番号
					</p>
					<p className="mt-1 text-base">{displayValue(profile.studentId)}</p>
				</div>
				<div>
					<p className="font-semibold text-base-content/60 text-xs uppercase tracking-wider">
						卒業予定年
					</p>
					<p className="mt-1 text-base">{displayValue(profile.expected)}</p>
				</div>
			</div>
			<p className="text-base-content/70 text-sm">
				※ 表示内容はプロフィール編集画面から変更できます。
			</p>
		</div>
	)
}

export default ProfileDetailsTab
