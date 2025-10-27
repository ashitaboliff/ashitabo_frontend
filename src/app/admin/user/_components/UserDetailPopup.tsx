'use client'

import { useSession } from '@/domains/auth/hooks/useSession'
import {
	type AccountRole,
	AccountRoleMap,
	PartMap,
	RoleMap,
	type UserDetail,
} from '@/domains/user/model/userTypes'
import FeedbackMessage, {
	type MessageSource,
} from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateTimeJaWithUnits } from '@/shared/utils/dateFormat'

interface Props {
	readonly open: boolean
	readonly onClose: () => void
	readonly selectedUser: UserDetail | null
	readonly actionLoading: boolean
	readonly onRoleChange: (id: string, role: AccountRole) => void
	readonly onRequestDelete: () => void
	readonly feedbackSource?: MessageSource
	readonly onClearFeedback: () => void
}

const UserDetailPopup = ({
	open,
	onClose,
	selectedUser,
	actionLoading,
	onRoleChange,
	onRequestDelete,
	feedbackSource,
	onClearFeedback,
}: Props) => {
	const { data: session } = useSession()

	return (
		<Popup
			id={`user-detail-popup-${selectedUser?.id}`}
			title="ユーザ詳細"
			open={open}
			onClose={() => {
				onClose()
				onClearFeedback()
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
							{selectedUser.accountRole != null
								? AccountRoleMap[selectedUser.accountRole]
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
								? formatDateTimeJaWithUnits(selectedUser.createAt)
								: ''}
						</div>
						<div className="font-bold">更新日:</div>
						<div>
							{selectedUser.updateAt
								? formatDateTimeJaWithUnits(selectedUser.updateAt)
								: ''}
						</div>
					</div>
					<div className="flex flex-row justify-center gap-x-2">
						<button
							type="button"
							className="btn btn-primary"
							disabled={
								actionLoading ||
								session?.user.id === selectedUser.id ||
								selectedUser.accountRole === 'ADMIN' ||
								selectedUser.accountRole === 'TOPADMIN'
							}
							onClick={() => onRoleChange(selectedUser.id, 'ADMIN')}
						>
							{actionLoading ? '処理中...' : '三役に任命'}
						</button>
						<button
							type="button"
							className="btn btn-error"
							disabled={actionLoading || session?.user.id === selectedUser.id}
							onClick={() => {
								onClearFeedback()
								onRequestDelete()
							}}
						>
							削除
						</button>
						<button type="button" className="btn btn-outline" onClick={onClose}>
							閉じる
						</button>
					</div>
					<FeedbackMessage source={feedbackSource} defaultVariant="error" />
				</div>
			)}
		</Popup>
	)
}

export default UserDetailPopup
