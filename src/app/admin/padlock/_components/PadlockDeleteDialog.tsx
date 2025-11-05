'use client'

import Popup from '@/shared/ui/molecules/Popup'

interface PadlockDeleteDialogProps {
	readonly open: boolean
	onClose: () => void
	onConfirm: () => void
	isDeleting: boolean
}

const PadlockDeleteDialog = ({
	open,
	onClose,
	onConfirm,
	isDeleting,
}: PadlockDeleteDialogProps) => (
	<Popup
		id="padlock-delete"
		title="パスワード削除"
		open={open}
		onClose={onClose}
	>
		<div className="space-y-4">
			<p>本当に削除しますか？この操作は取り消せません。</p>
			<div className="flex justify-center gap-2">
				<button
					type="button"
					className="btn btn-error"
					onClick={onConfirm}
					disabled={isDeleting}
				>
					{isDeleting ? '削除中…' : '削除'}
				</button>
				<button
					type="button"
					className="btn btn-outline"
					onClick={onClose}
					disabled={isDeleting}
				>
					キャンセル
				</button>
			</div>
		</div>
	</Popup>
)

export default PadlockDeleteDialog
