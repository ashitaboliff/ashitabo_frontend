'use client'

import { useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { deleteBookingAction } from '../actions'
import {
	BookingDetailProps,
	BookingResponse,
	BookingTime,
} from '@/features/booking/types'
import type { Session } from '@/types/session'
import BookingDetailBox from '@/features/booking/components/BookingDetailBox'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import Popup from '@/components/ui/molecules/Popup'
import BookingEditForm from '@/features/booking/components/BookingEditForm'
import { useFeedback } from '@/hooks/useFeedback'

interface EditFormPageProps {
	bookingDetail: BookingDetailProps
	session: Session
	initialBookingResponse: BookingResponse | null
	initialViewDay: Date
}

const EditFormPage = ({
	bookingDetail,
	session,
	initialBookingResponse,
	initialViewDay,
}: EditFormPageProps) => {
	const router = useRouter()
	const [editState, setEditState] = useState<'edit' | 'select'>('select')
	const [deleteStatus, setDeleteStatus] = useState<
		'idle' | 'confirming' | 'loading' | 'error' | 'success'
	>('idle')

	const deleteFeedback = useFeedback()

	if (!bookingDetail) {
		return <DetailNotFoundPage />
	}

	const handleDeleteBooking = async () => {
		deleteFeedback.clearFeedback()
		setDeleteStatus('loading')
		try {
			const response = await deleteBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
			})

			if (response.ok) {
				setDeleteStatus('success')
				deleteFeedback.showSuccess('予約を削除しました。')
			} else {
				deleteFeedback.showApiError(response)
			}
		} catch (error) {
			deleteFeedback.showError(
				'予約の削除に失敗しました。時間をおいて再度お試しください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			console.error('Error deleting booking:', error)
		} finally {
			setDeleteStatus((prevStatus) =>
				prevStatus === 'success' ? 'success' : 'error',
			)
		}
	}

	return (
		<>
			{editState === 'select' && (
				<div className="flex flex-col items-center justify-center w-full">
					<BookingDetailBox
						props={{
							bookingDate: bookingDetail.bookingDate,
							bookingTime: bookingDetail.bookingTime,
							registName: bookingDetail.registName,
							name: bookingDetail.name,
						}}
					/>
					{deleteStatus === 'success' ? (
						<div className="w-full space-y-4 text-center">
							{/* Error Messageコンポーネント使ってるけど成功用 */}
							<ErrorMessage message={deleteFeedback.feedback} />
							<button
								type="button"
								className="btn btn-outline w-full max-w-md"
								onClick={() => router.push('/booking')}
							>
								コマ表に戻る
							</button>
						</div>
					) : (
						<>
							<div className="flex flex-col sm:flex-row justify-center gap-2 w-full max-w-md">
								<button
									className="btn btn-primary w-full sm:w-1/2"
									onClick={() => setEditState('edit')}
								>
									予約を編集
								</button>
								<button
									className="btn btn-secondary btn-outline w-full sm:w-1/2"
									onClick={() => {
										deleteFeedback.clearFeedback()
										setDeleteStatus('confirming')
									}}
								>
									予約を削除
								</button>
							</div>
							<div className="mt-2 flex justify-center w-full max-w-md">
								<button
									className="btn btn-ghost w-full sm:w-auto"
									onClick={() => router.back()}
								>
									戻る
								</button>
							</div>
						</>
					)}
					{deleteStatus === 'error' && deleteFeedback.feedback && (
						<div className="w-full max-w-md">
							<ErrorMessage message={deleteFeedback.feedback} />
						</div>
					)}
				</div>
			)}

			{editState === 'edit' && (
				<BookingEditForm
					bookingDetail={bookingDetail}
					session={session}
					timeList={BookingTime}
					onCancel={() => setEditState('select')}
					initialBookingResponse={initialBookingResponse}
					initialViewDay={initialViewDay}
				/>
			)}

			<Popup
				id="booking-delete-popup"
				title="予約削除"
				maxWidth="sm"
				open={
					deleteStatus === 'confirming' ||
					deleteStatus === 'loading' ||
					deleteStatus === 'error'
				}
				onClose={() => setDeleteStatus('idle')}
			>
				<div className="p-4">
					<p className="text-center">予約を削除しますか？</p>
					<div className="flex justify-center gap-4 my-4">
						<button
							className="btn btn-secondary"
							onClick={handleDeleteBooking}
							disabled={deleteStatus === 'loading'}
						>
							{deleteStatus === 'loading' ? '削除中...' : '削除'}
						</button>
						<button
							className="btn btn-outline"
							onClick={() => setDeleteStatus('idle')}
						>
							キャンセル
						</button>
					</div>
					{deleteFeedback.feedback && (
						<ErrorMessage message={deleteFeedback.feedback} />
					)}
				</div>
			</Popup>
		</>
	)
}

export default EditFormPage
