'use client'

import { useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { deleteBookingAction } from './actions'
import {
	BookingDetailProps,
	BookingResponse,
	BookingTime,
} from '@/features/booking/types'
import type { Session } from '@/types/session'
import { ApiError } from '@/types/responseTypes'
import BookingDetailBox from '@/features/booking/components/BookingDetailBox'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import Popup from '@/components/ui/molecules/Popup'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import BookingEditForm from '@/features/booking/components/BookingEditForm'

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
	const [deletePopupOpen, setDeletePopupOpen] = useState(false)
	const [deleteSuccessPopupOpen, setDeleteSuccessPopupOpen] = useState(false)
	const [deleteError, setDeleteError] = useState<ApiError>()

	if (!bookingDetail) {
		return <DetailNotFoundPage />
	}

	const handleDeleteBooking = async () => {
		try {
			const response = await deleteBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
			})

			if (response.ok) {
				setDeleteSuccessPopupOpen(true)
				setDeletePopupOpen(false)
			} else {
				setDeleteError(response)
			}
		} catch (error) {
			setDeleteError({
				ok: false,
				status: 500,
				message: 'このエラーが出た際はわたべに問い合わせてください。',
				details: error instanceof Error ? error.message : String(error),
			})
			console.error('Error deleting booking:', error)
		}
	}

	return (
		<>
			{editState === 'select' && (
				<div className="flex flex-col items-center justify-center">
					<BookingDetailBox
						props={{
							bookingDate: bookingDetail.bookingDate,
							bookingTime: bookingDetail.bookingTime,
							registName: bookingDetail.registName,
							name: bookingDetail.name,
						}}
					/>
					<div className="flex flex-col sm:flex-row justify-center gap-2 w-full max-w-md">
						<button
							className="btn btn-primary w-full sm:w-1/2"
							onClick={() => setEditState('edit')}
						>
							予約を編集
						</button>
						<button
							className="btn btn-secondary btn-outline w-full sm:w-1/2"
							onClick={() => setDeletePopupOpen(true)}
						>
							予約を削除
						</button>
					</div>
					<div className="mt-4 flex justify-center w-full max-w-md">
						<button
							className="btn btn-ghost w-full sm:w-auto"
							onClick={() => router.back()}
						>
							戻る
						</button>
					</div>
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
				open={deletePopupOpen}
				onClose={() => setDeletePopupOpen(false)}
			>
				<div className="p-4">
					<p className="text-center">予約を削除しますか？</p>
					<div className="flex justify-center gap-4 mt-4">
						<button className="btn btn-secondary" onClick={handleDeleteBooking}>
							削除
						</button>
						<button
							className="btn btn-outline"
							onClick={() => setDeletePopupOpen(false)}
						>
							キャンセル
						</button>
					</div>
					<ErrorMessage error={deleteError} />
				</div>
			</Popup>

			<Popup
				id="booking-delete-success-popup"
				title="予約削除"
				maxWidth="sm"
				open={deleteSuccessPopupOpen}
				onClose={() => setDeleteSuccessPopupOpen(false)}
			>
				<div className="p-4 text-center">
					<p className="font-bold text-primary">予約の削除に成功しました。</p>
					<div className="flex justify-center gap-4 mt-4">
						<button
							className="btn btn-outline"
							onClick={() => {
								router.push('/booking')
								setDeleteSuccessPopupOpen(false)
							}}
						>
							ホームに戻る
						</button>
					</div>
				</div>
			</Popup>
		</>
	)
}

export default EditFormPage
