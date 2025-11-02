'use client'

import type { UserDetail } from '@/domains/user/model/userTypes'
import FeedbackMessage, {
	type MessageSource,
} from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'

interface Props {
	readonly open: boolean
	readonly onClose: () => void
	readonly selectedUser: UserDetail | null
	readonly actionLoading: boolean
	readonly onDelete: () => void
	readonly feedbackSource?: MessageSource
	readonly onClearFeedback: () => void
}

const UserDeleteConfirmPopup = ({
	open,
	onClose,
	selectedUser,
	actionLoading,
	onDelete,
	feedbackSource,
	onClearFeedback,
}: Props) => {
	return (
		<Popup
			id={`delete-user-popup-${selectedUser?.id}`}
			title="削除確認"
			open={open}
			onClose={() => {
				onClose()
				onClearFeedback()
			}}
		>
			<div className="flex flex-col items-center space-y-2 text-sm">
				<div className="font-bold text-error">本当に削除しますか?</div>
				<div>この操作は取り消せません。</div>
				<div className="flex flex-row justify-center gap-x-2">
					<button
						type="button"
						className="btn btn-error"
						disabled={actionLoading}
						onClick={() => {
							onClearFeedback()
							onDelete()
						}}
					>
						{actionLoading ? '削除中...' : 'はい'}
					</button>
					<button type="button" className="btn btn-outline" onClick={onClose}>
						いいえ
					</button>
				</div>
				<FeedbackMessage source={feedbackSource} defaultVariant="error" />
			</div>
		</Popup>
	)
}

export default UserDeleteConfirmPopup
