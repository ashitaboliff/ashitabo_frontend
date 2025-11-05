'use client'

import type { PadLock } from '@/domains/admin/model/adminTypes'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateTimeJaWithUnits } from '@/shared/utils/dateFormat'

interface PadlockDetailDialogProps {
	readonly padLock: PadLock | null
	readonly open: boolean
	onRequestDelete: () => void
	onClose: () => void
}

const PadlockDetailDialog = ({
	padLock,
	open,
	onRequestDelete,
	onClose,
}: PadlockDetailDialogProps) => {
	return (
		<Popup
			id="padlock-detail"
			title="パスワード詳細"
			open={open}
			onClose={onClose}
		>
			{padLock ? (
				<div className="flex flex-col items-center space-y-3 text-sm">
					{padLock.isDeleted ? (
						<div className="font-bold text-error">削除済み</div>
					) : null}
					<div className="grid w-full grid-cols-2 gap-2">
						<div className="font-bold">管理名:</div>
						<div>{padLock.name}</div>
						<div className="font-bold">作成日:</div>
						<div>
							{formatDateTimeJaWithUnits(padLock.createdAt, {
								hour12: true,
							})}
						</div>
						<div className="font-bold">更新日:</div>
						<div>
							{formatDateTimeJaWithUnits(padLock.updatedAt, {
								hour12: true,
							})}
						</div>
					</div>
					<div className="flex flex-row gap-2">
						<button
							type="button"
							className="btn btn-error"
							disabled={padLock.isDeleted}
							onClick={onRequestDelete}
						>
							削除
						</button>
						<button type="button" className="btn btn-outline" onClick={onClose}>
							閉じる
						</button>
					</div>
				</div>
			) : (
				<p className="text-sm">パスワード情報を取得できませんでした。</p>
			)}
		</Popup>
	)
}

export default PadlockDetailDialog
