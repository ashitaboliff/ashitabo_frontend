'use client'

import {
	AccountRoleMap,
	RoleMap,
	type UserDetail,
} from '@/domains/user/model/userTypes'

interface Props {
	readonly users: UserDetail[]
	readonly onUserItemClick: (user: UserDetail) => void
}

const UserManageList = ({ users, onUserItemClick }: Props) => {
	if (users.length === 0) {
		return (
			<tr>
				<td colSpan={5} className="py-6 text-center text-sm">
					ユーザー情報はありません。
				</td>
			</tr>
		)
	}

	return (
		<>
			{users.map((user) => (
				<tr
					key={user.id}
					onClick={() => onUserItemClick(user)}
					className="cursor-pointer"
				>
					<td>{user.name}</td>
					<td>{user.fullName}</td>
					<td>{user.studentId}</td>
					<td>{user.role !== undefined ? RoleMap[user.role] : '不明'}</td>
					<td>
						{user.accountRole != null
							? AccountRoleMap[user.accountRole]
							: '不明'}
					</td>
				</tr>
			))}
		</>
	)
}

export default UserManageList
