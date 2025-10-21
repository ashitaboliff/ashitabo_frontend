'use client'

import type { UserDetail } from '@/domains/user/model/userTypes'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import type { ApiError } from '@/types/responseTypes'

interface Props {
	readonly open: boolean
	readonly onClose: () => void
	readonly selectedUser: UserDetail | null
	readonly actionLoading: boolean
	readonly onDelete: (id: string) => void
	readonly actionError: ApiError | null
	readonly setActionError: (error: ApiError | null) => void
}

const UserDeleteConfirmPopup = ({
	open,
	onClose,
	selectedUser,
	actionLoading,
	onDelete,
	actionError,
	setActionError,
}: Props) => {
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
				<FeedbackMessage source={actionError} defaultVariant="error" />
			</div>
		</Popup>
	)
}

export default UserDeleteConfirmPopup
