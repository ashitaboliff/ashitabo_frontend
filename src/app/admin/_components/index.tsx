import Link from 'next/link'
import {
	FaRegUserCircle,
	FaYoutube,
	LuLockKeyhole,
	RiQuestionLine,
	RxCrossCircled,
} from '@/shared/ui/icons'

const iconSize = 25
const adminLinks = [
	{
		href: '/admin/usage',
		label: '使い方',
		icon: <RiQuestionLine size={iconSize} />,
	},
	{
		href: '/admin/user',
		label: 'ユーザ管理',
		icon: <FaRegUserCircle size={iconSize} />,
	},
	{
		href: '/admin/padlock',
		label: '利用登録パスワード管理',
		icon: <LuLockKeyhole size={iconSize} />,
	},
	{
		href: '/admin/denied',
		label: 'コマ表予約禁止日設定',
		icon: <RxCrossCircled size={iconSize} />,
	},
	{
		href: '/admin/youtube',
		label: 'YouTube管理',
		icon: <FaYoutube size={iconSize} />,
	},
] as const

const AdminMain = () => {
	return (
		<div className="flex flex-col items-center justify-center p-4">
			<div className="text-2xl font-bold">三役用管理ページ</div>
			<div className="overflow-x-auto">
				<table className="table table-lg">
					<tbody>
						{adminLinks.map((link) => (
							<tr key={link.href} className="hover:bg-base-200">
								<td className="w-12">{link.icon}</td>
								<td>
									<Link href={link.href} className="text-lg font-medium">
										{link.label}
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default AdminMain
