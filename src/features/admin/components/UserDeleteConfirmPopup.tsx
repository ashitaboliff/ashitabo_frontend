'use client'

import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import Popup from '@/components/ui/molecules/Popup'
import type { UserDetail } from '@/features/user/types'
import type { ApiError } from '@/types/responseTypes'

interface UserDeleteConfirmPopupProps {
	open: boolean
	onClose: () => void
	selectedUser: UserDetail | null
	actionLoading: boolean
	onDelete: (id: string) => void
	actionError: ApiError | null
	setActionError: (error: ApiError | null) => void
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
						type="button"
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
					<button type="button" className="btn btn-outline" onClick={onClose}>
						いいえ
					</button>
				</div>
				<ErrorMessage error={actionError} />
			</div>
		</Popup>
	)
}

export default UserDeleteConfirmPopup
