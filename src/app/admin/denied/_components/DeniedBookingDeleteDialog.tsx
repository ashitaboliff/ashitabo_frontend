'use client'

import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import FeedbackMessage, {
	type MessageSource,
} from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'

interface DeniedBookingDeleteDialogProps {
	readonly open: boolean
	readonly onClose: () => void
	readonly deniedBooking: DeniedBooking | null
	readonly actionLoading: boolean
	readonly onConfirm: () => void
	readonly feedbackSource?: MessageSource
	readonly onClearFeedback: () => void
}

const DeniedBookingDeleteDialog = ({
	open,
	onClose,
	deniedBooking,
	actionLoading,
	onConfirm,
	feedbackSource,
	onClearFeedback,
}: DeniedBookingDeleteDialogProps) => {
	return (
		<Popup
			id={
				deniedBooking
					? `delete-denied-booking-${deniedBooking.id}`
					: 'delete-denied-booking'
			}
			title="予約禁止日削除"
			open={open}
			onClose={() => {
				onClose()
				onClearFeedback()
			}}
		>
			<div className="flex flex-col items-center space-y-2 text-sm">
				<p className="text-center">本当に削除しますか？</p>
				<div className="flex flex-row gap-x-2">
					<button
						type="button"
						className="btn btn-error"
						onClick={() => {
							onClearFeedback()
							onConfirm()
						}}
						disabled={actionLoading}
					>
						{actionLoading ? '削除中...' : 'はい'}
					</button>
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => {
							onClearFeedback()
							onClose()
						}}
						disabled={actionLoading}
					>
						閉じる
					</button>
				</div>
				<FeedbackMessage source={feedbackSource} defaultVariant="error" />
			</div>
		</Popup>
	)
}

export default DeniedBookingDeleteDialog
