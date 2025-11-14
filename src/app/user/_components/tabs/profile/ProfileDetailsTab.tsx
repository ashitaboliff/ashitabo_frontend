import type { AccountRole, Profile } from '@/domains/user/model/userTypes'
import {
	AccountRoleMap,
	PartMap,
	RoleMap,
} from '@/domains/user/model/userTypes'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import { formatDateJa } from '@/shared/utils/dateFormat'

interface Props {
	readonly profile: Profile | null
	readonly userInfo?: {
		name?: string | null
		role?: AccountRole | null
	}
}

const displayValue = (value?: string | null) => {
	if (!value) {
		return '未設定'
	}
	return value
}

const ProfileDetailsTab = ({ profile, userInfo }: Props) => {
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

	const detailRows = [
		{ label: '本名', value: displayValue(profile.name) },
		{ label: 'ユーザー名', value: displayValue(userInfo?.name) },
		{
			label: 'アカウント権限',
			value: userInfo?.role ? AccountRoleMap[userInfo.role] : '未設定',
		},
		{ label: '所属区分', value: RoleMap[profile.role] },
		{
			label: '担当パート',
			value: partLabel,
		},
		{ label: '学籍番号', value: displayValue(profile.studentId) },
		{
			label: 'プロフィール更新',
			value: profile.updatedAt ? formatDateJa(profile.updatedAt) : '未設定',
		},
	]

	return (
		<div className="space-y-6">
			<div className="grid gap-4 rounded-2xl p-6 text-sm shadow-lg sm:grid-cols-2">
				{detailRows.map((row) => (
					<div key={row.label}>
						<p className="font-semibold text-base-content/60 text-xs uppercase tracking-wider">
							{row.label}
						</p>
						<p className="mt-1 font-semibold text-base">{row.value}</p>
					</div>
				))}
			</div>
			<p className="text-base-content/70 text-sm">
				※ 表示内容はプロフィール編集画面から変更できます。
			</p>
		</div>
	)
}

export default ProfileDetailsTab
