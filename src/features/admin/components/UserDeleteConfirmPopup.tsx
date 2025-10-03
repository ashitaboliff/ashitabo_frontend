'use client'

import Popup from '@/components/ui/molecules/Popup'
import { UserDetail } from '@/features/user/types'
import { ErrorType } from '@/types/responseTypes'

interface UserDeleteConfirmPopupProps {
	open: boolean
	onClose: () => void
	selectedUser: UserDetail | null
	actionLoading: boolean
	onDelete: (id: string) => void
	actionError: ErrorType | null
	setActionError: (error: ErrorType | null) => void
}

const UserDeleteConfirmPopup = ({
	open,
	onClose,
	selectedUser,
	actionLoading,
	onDelete,
	actionError,
	setActionError,
}: UserDeleteConfirmPopupProps) => {
	return (
		<Popup
			id={`delete-user-popup-${selectedUser?.id}`}
			title="削除確認"
			open={open}
			onClose={() => {
				onClose()
				setActionError(null)
			}}
		>
			<div className="flex flex-col space-y-2 text-sm items-center">
				<div className="text-error font-bold">本当に削除しますか?</div>
				<div>この操作は取り消せません</div>
				<div className="flex flex-row justify-center gap-x-2">
					<button
						className="btn btn-error"
						disabled={actionLoading}
						onClick={() => {
							if (selectedUser) {
								onDelete(selectedUser.id)
							}
						}}
					>
						{actionLoading ? '削除中...' : 'はい'}
					</button>
					<button className="btn btn-outline" onClick={onClose}>
						いいえ
					</button>
				</div>
				{actionError && (
					<p className="text-error text-center">
						エラーコード{actionError.status}:{actionError.response}
					</p>
				)}
			</div>
		</Popup>
	)
}

export default UserDeleteConfirmPopup
