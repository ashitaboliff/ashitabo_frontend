'use client'

import { useRouter } from 'next-nprogress-bar'
import { useCallback, useMemo, useState } from 'react'
import {
	deleteUserAction,
	updateUserRoleAction,
} from '@/domains/admin/api/adminActions'
import type { AdminUserQuery } from '@/domains/admin/query/adminUserQuery'
import { createAdminUserQueryOptions } from '@/domains/admin/query/adminUserQuery'
import type { AccountRole, UserDetail } from '@/domains/user/model/userTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { useQueryState } from '@/shared/hooks/useQueryState'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import { logError } from '@/shared/utils/logger'
import type { ApiError } from '@/types/response'
import UserDeleteConfirmPopup from './UserDeleteConfirmPopup'
import UserDetailPopup from './UserDetailPopup'
import UserManageList from './UserManageList'

const PER_PAGE_OPTIONS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

const SORT_OPTIONS: Array<{ value: AdminUserQuery['sort']; label: string }> = [
	{ value: 'new', label: '新しい順' },
	{ value: 'old', label: '古い順' },
]

type Props = {
	readonly users: UserDetail[]
	readonly totalCount: number
	readonly defaultQuery: AdminUserQuery
	readonly initialQuery: AdminUserQuery
	readonly extraSearchParams?: string
	readonly initialError?: ApiError
}

const AdminUserPage = ({
	users,
	totalCount,
	defaultQuery,
	initialQuery,
	extraSearchParams,
	initialError,
}: Props) => {
	const router = useRouter()
	const globalFeedback = useFeedback()
	const actionFeedback = useFeedback()
	const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isActionLoading, setIsActionLoading] = useState(false)

	const { query, updateQuery, isPending } = useQueryState<AdminUserQuery>({
		queryOptions: createAdminUserQueryOptions(defaultQuery),
		initialQuery,
		extraSearchParams,
	})

	const pageCount = useMemo(
		() => Math.max(1, Math.ceil(totalCount / query.perPage) || 1),
		[totalCount, query.perPage],
	)

	const handleSelectUser = useCallback(
		(user: UserDetail) => {
			actionFeedback.clearFeedback()
			setSelectedUser(user)
			setIsDetailOpen(true)
		},
		[actionFeedback],
	)

	const handleDelete = useCallback(async () => {
		if (!selectedUser) return

		setIsActionLoading(true)
		actionFeedback.clearFeedback()
		try {
			const res = await deleteUserAction({ id: selectedUser.id })
			if (res.ok) {
				actionFeedback.showSuccess('ユーザーを削除しました。')
				setIsDeleteOpen(false)
				setIsDetailOpen(false)
				router.refresh()
			} else {
				actionFeedback.showApiError(res)
			}
		} catch (error) {
			logError('deleteUserAction failed', error)
			actionFeedback.showError('ユーザー削除中に予期せぬエラーが発生しました。')
		} finally {
			setIsActionLoading(false)
		}
	}, [actionFeedback, router, selectedUser])

	const handleRoleChange = useCallback(
		async (userId: string, role: AccountRole) => {
			setIsActionLoading(true)
			actionFeedback.clearFeedback()
			try {
				const res = await updateUserRoleAction({ id: userId, role })
				if (res.ok) {
					actionFeedback.showSuccess('ユーザー権限を更新しました。')
					setIsDetailOpen(false)
					router.refresh()
				} else {
					actionFeedback.showApiError(res)
				}
			} catch (error) {
				logError('updateUserRoleAction failed', error)
				actionFeedback.showError(
					'ユーザー権限更新中に予期せぬエラーが発生しました。',
				)
			} finally {
				setIsActionLoading(false)
			}
		},
		[actionFeedback, router],
	)

	return (
		<>
			<div className="flex flex-col items-center justify-center gap-y-3">
				<h1 className="text-2xl font-bold">ユーザ管理</h1>
				<p className="text-sm">
					このページでは登録ユーザの確認、削除、三役権限の追加が可能です。
					<br />
					見知らぬユーザやサイト上での不審な動きのあるユーザを削除可能ですが、基本的にそんなことしないでください。
					<br />
					また、三役権限の追加もむやみに行わないでください。大いなる責任が伴います。お前らを信用しています。
				</p>
				<FeedbackMessage source={initialError ?? globalFeedback.feedback} />
				<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
					<div className="flex flex-row items-center ml-auto space-x-2 w-full max-w-xs">
						<p className="text-sm whitespace-nowrap">表示件数:</p>
						<SelectField
							value={query.perPage}
							onChange={(event) =>
								updateQuery({ perPage: Number(event.target.value), page: 1 })
							}
							options={PER_PAGE_OPTIONS}
							name="usersPerPage"
							disabled={isPending}
						/>
					</div>
					<div className="flex flex-row gap-x-2">
						<RadioSortGroup
							name="user_sort_options"
							options={SORT_OPTIONS}
							currentSort={query.sort}
							onSortChange={(sort) => updateQuery({ sort })}
						/>
					</div>
					<table className="table table-zebra table-sm w-full">
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
								users={users}
								onUserItemClick={handleSelectUser}
							/>
						</tbody>
					</table>
				</div>
				<Pagination
					currentPage={query.page}
					totalPages={pageCount}
					onPageChange={(page) => updateQuery({ page })}
				/>
				<button
					type="button"
					className="btn btn-outline"
					onClick={() => router.push('/admin')}
				>
					戻る
				</button>
			</div>

			<UserDetailPopup
				open={isDetailOpen}
				onClose={() => setIsDetailOpen(false)}
				selectedUser={selectedUser}
				actionLoading={isActionLoading}
				onRoleChange={handleRoleChange}
				onRequestDelete={() => setIsDeleteOpen(true)}
				feedbackSource={actionFeedback.feedback}
				onClearFeedback={actionFeedback.clearFeedback}
			/>

			<UserDeleteConfirmPopup
				open={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				selectedUser={selectedUser}
				actionLoading={isActionLoading}
				onDelete={handleDelete}
				feedbackSource={actionFeedback.feedback}
				onClearFeedback={actionFeedback.clearFeedback}
			/>
		</>
	)
}

export default AdminUserPage
