'use client'

import useSWR from 'swr'
import { UserDetail, RoleMap, AccountRoleMap } from '@/features/user/types'
import GenericTableBody from '@/components/ui/molecules/GenericTableBody'
import { getAllUserDetailsAction } from '../action'

interface UserManageListProps {
	currentPage: number
	usersPerPage: number
	sort: 'new' | 'old'
	onUserItemClick: (user: UserDetail) => void
	onDataLoaded: (totalCount: number) => void
}

const fetchUsers = async ([page, perPage, sort]: [
	number,
	number,
	'new' | 'old',
]) => {
	const res = await getAllUserDetailsAction({ page, perPage, sort })
	if (res.ok) {
		return res.data
	}
	throw res
}
const UserManageList = ({
	currentPage,
	usersPerPage,
	sort,
	onUserItemClick,
	onDataLoaded,
}: UserManageListProps) => {
	const { data, error, isLoading } = useSWR(
		[currentPage, usersPerPage, sort],
		fetchUsers,
		{
			revalidateOnFocus: false,
			onSuccess: (fetchedData) => {
				if (fetchedData) {
					onDataLoaded(fetchedData.totalCount)
				}
			},
		},
	)

	const users = data?.users

	const renderUserCells = (user: UserDetail) => (
		<>
			<td>{user.name}</td>
			<td>{user.fullName}</td>
			<td>{user.studentId}</td>
			<td>{user.role !== undefined ? RoleMap[user.role] : '不明'}</td>
			<td>
				{user.AccountRole !== undefined && user.AccountRole !== null
					? AccountRoleMap[user.AccountRole]
					: '不明'}
			</td>
		</>
	)

	return (
		<GenericTableBody
			isLoading={isLoading}
			error={error}
			data={users}
			renderCells={renderUserCells}
			onItemClick={onUserItemClick}
			colSpan={5}
			itemKeyExtractor={(user) => user.id}
			emptyDataMessage="ユーザー情報はありません。"
		/>
	)
}

export default UserManageList
