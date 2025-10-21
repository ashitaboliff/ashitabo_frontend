'use client'

import { useRouter } from 'next-nprogress-bar'
import { useState } from 'react'
import {
	adminRevalidateTagAction,
	deleteUserAction,
	updateUserRoleAction,
} from '@/domains/admin/api/adminActions'
import type { AccountRole, UserDetail } from '@/domains/user/model/userTypes'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/responseTypes'
import UserDeleteConfirmPopup from './UserDeleteConfirmPopup'
import UserDetailPopup from './UserDetailPopup'
import UserManageList from './UserManageList'

const AdminUserPage = () => {
	const router = useRouter()
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [usersPerPage, setUsersPerPage] = useState(10)
	const [sort, setSort] = useState<'new' | 'old'>('new')
	const [actionLoading, setActionLoading] = useState<boolean>(false)
	const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const [totalCount, setTotalCount] = useState<number>(0)
	const [isDeletePopupOpen, setIsDeletePopupOpen] = useState<boolean>(false)
	const [actionError, setActionError] = useState<ApiError | null>(null)

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	const handleSortChange = (newSort: 'new' | 'old') => {
		setSort(newSort)
		setCurrentPage(1)
	}

	const handleDataLoaded = (count: number) => {
		setTotalCount(count)
	}

	const handleUserClick = (user: UserDetail) => {
		setSelectedUser(user)
		setIsPopupOpen(true)
		setActionError(null)
	}

	const onDelete = async (id: string) => {
		setActionLoading(true)
		try {
			const res = await deleteUserAction({ id })
			if (res.ok) {
				setIsPopupOpen(false)
				setIsDeletePopupOpen(false)
				await adminRevalidateTagAction('users')
			} else {
				setActionError(res)
			}
		} catch (error) {
			setActionError({
				ok: false,
				status: 500,
				message: 'ユーザー削除中に予期せぬエラーが発生しました。',
				details: error instanceof Error ? error.message : String(error),
			})
			logError('deleteUserAction failed', error)
		} finally {
			setActionLoading(false)
		}
	}

	const onRoleChange = async (id: string, role: AccountRole) => {
		setActionLoading(true)
		try {
			const res = await updateUserRoleAction({
				id,
				role,
			})
			if (res.ok) {
				await adminRevalidateTagAction('users')
				setIsPopupOpen(false)
			} else {
				setActionError(res)
			}
		} catch (error) {
			setActionError({
				ok: false,
				status: 500,
				message: 'ユーザー権限変更中に予期せぬエラーが発生しました。',
				details: error instanceof Error ? error.message : String(error),
			})
			logError('updateUserRoleAction failed', error)
		} finally {
			setActionLoading(false)
		}
	}

	const handleRefresh = async () => {
		await adminRevalidateTagAction('users')
	}

	const pageMax = Math.ceil(totalCount / usersPerPage) || 1

	return (
		<>
			<div className="flex flex-col items-center justify-center gap-y-2">
				<h1 className="text-2xl font-bold">ユーザ管理</h1>
				<p className="text-sm text-center">
					このページでは登録ユーザの確認、削除、三役権限の追加が可能です。
					<br />
					見知らぬユーザやサイト上での不審な動きのあるユーザを削除可能ですが、基本的にそんなことしないでください。
					<br />
					また、三役権限の追加もむやみに行わないでください。大いなる責任が伴います。お前らを信用しています。
				</p>
				<button
					type="button"
					className="btn btn-primary btn-md"
					onClick={handleRefresh}
				>
					ユーザ情報を更新
				</button>
				<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
					<div className="flex flex-row items-center ml-auto space-x-2 w-1/2">
						<p className="text-sm whitespace-nowrap">表示件数:</p>
						<SelectField
							value={usersPerPage}
							onChange={(e) => {
								setUsersPerPage(Number(e.target.value))
								setCurrentPage(1)
							}}
							options={{ '10件': 10, '20件': 20, '30件': 30 }}
							name="usersPerPage"
						/>
					</div>
					<div className="flex flex-row gap-x-2">
						<RadioSortGroup
							name="user_sort_options"
							options={[
								{ value: 'new', label: '新しい順' },
								{ value: 'old', label: '古い順' },
							]}
							currentSort={sort}
							onSortChange={handleSortChange}
							buttonClassName="btn-outline"
						/>
					</div>
					<table className="table table-zebra table-sm w-full justify-center">
						<thead>
							<tr>
								<th>LINE登録名</th>
								<th>本名</th>
								<th>学籍番号</th>
								<th>学籍状況</th>
								<th>役割</th>
							</tr>
						</thead>
						<tbody>
							<UserManageList
								currentPage={currentPage}
								usersPerPage={usersPerPage}
								sort={sort}
								onUserItemClick={handleUserClick}
								onDataLoaded={handleDataLoaded}
							/>
						</tbody>
					</table>
				</div>

				<Pagination
					currentPage={currentPage}
					totalPages={pageMax}
					onPageChange={handlePageChange}
				/>

				<div className="flex flex-row justify-center mt-2">
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => router.push('/admin')}
					>
						戻る
					</button>
				</div>
			</div>

			<UserDetailPopup
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
				selectedUser={selectedUser}
				actionLoading={actionLoading}
				onRoleChange={onRoleChange}
				setIsDeletePopupOpen={setIsDeletePopupOpen}
				actionError={actionError}
				setActionError={setActionError}
			/>

			<UserDeleteConfirmPopup
				open={isDeletePopupOpen}
				onClose={() => setIsDeletePopupOpen(false)}
				selectedUser={selectedUser}
				actionLoading={actionLoading}
				onDelete={onDelete}
				actionError={actionError}
				setActionError={setActionError}
			/>
		</>
	)
}

export default AdminUserPage
