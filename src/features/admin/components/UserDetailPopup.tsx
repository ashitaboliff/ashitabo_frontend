'use client'

import { useRef } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Popup from '@/components/ui/molecules/Popup'
import {
	UserDetail,
	RoleMap,
	PartMap,
	AccountRoleMap,
	AccountRole,
} from '@/features/user/types'
import { useSession } from 'next-auth/react'
import { ErrorType } from '@/types/responseTypes'

interface UserDetailPopupProps {
	open: boolean
	onClose: () => void
	selectedUser: UserDetail | null
	actionLoading: boolean
	onRoleChange: (id: string, role: AccountRole) => void
	setIsDeletePopupOpen: (isOpen: boolean) => void
	actionError: ErrorType | null
	setActionError: (error: ErrorType | null) => void
}

const UserDetailPopup = ({
	open,
	onClose,
	selectedUser,
	actionLoading,
	onRoleChange,
	setIsDeletePopupOpen,
	actionError,
	setActionError,
}: UserDetailPopupProps) => {
	const { data: session } = useSession()

	return (
		<Popup
			id={`user-detail-popup-${selectedUser?.id}`}
			title="ユーザ詳細"
			open={open}
			onClose={() => {
				onClose()
				setActionError(null)
			}}
		>
			{selectedUser && (
				<div className="flex flex-col space-y-2 text-sm">
					<div className="grid grid-cols-2 gap-2">
						<div className="font-bold">LINE登録名</div>
						<div>{selectedUser.name}</div>
						<div className="font-bold">本名:</div>
						<div>{selectedUser.fullName}</div>
						<div className="font-bold">学籍番号:</div>
						<div>{selectedUser.studentId}</div>
						<div className="font-bold">学籍状況:</div>
						<div>
							{selectedUser.role !== undefined
								? RoleMap[selectedUser.role]
								: '不明'}
						</div>
						<div className="font-bold">役割:</div>
						<div>
							{selectedUser.AccountRole != null
								? AccountRoleMap[selectedUser.AccountRole]
								: '不明'}
						</div>
						<div className="font-bold">使用楽器:</div>
						<div>
							{selectedUser.part?.map((part) => (
								<div key={part}>{PartMap[part]}</div>
							))}
						</div>
						<div className="font-bold">卒業予定:</div>
						<div>{selectedUser.expected}年度</div>
						<div className="font-bold">作成日:</div>
						<div>
							{selectedUser.createAt
								? format(selectedUser.createAt, 'yyyy年MM月dd日HH時mm分ss秒', {
										locale: ja,
									})
								: ''}
						</div>
						<div className="font-bold">更新日:</div>
						<div>
							{selectedUser.updateAt
								? format(selectedUser.updateAt, 'yyyy年MM月dd日HH時mm分ss秒', {
										locale: ja,
									})
								: ''}
						</div>
					</div>
					<div className="flex flex-row justify-center gap-x-2">
						<button
							className="btn btn-primary"
							disabled={
								actionLoading ||
								selectedUser.AccountRole === 'ADMIN' ||
								selectedUser.AccountRole === 'TOPADMIN'
							}
							onClick={() => onRoleChange(selectedUser.id, 'ADMIN')}
						>
							{actionLoading ? '処理中...' : '三役に任命'}
						</button>
						<button
							className="btn btn-error"
							disabled={actionLoading || session?.user.id === selectedUser.id}
							onClick={() => {
								setIsDeletePopupOpen(true)
								setActionError(null)
							}}
						>
							削除
						</button>
						<button className="btn btn-outline" onClick={onClose}>
							閉じる
						</button>
					</div>
					{actionError && (
						<p className="text-error text-center">
							エラーコード{actionError.status}:{actionError.response}
						</p>
					)}
				</div>
			)}
		</Popup>
	)
}

export default UserDetailPopup
