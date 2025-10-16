'use client'

import { useReducer, useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { useSWRConfig } from 'swr'
import { deleteBookingAction } from '../../actions'
import { Booking, BookingResponse } from '@/features/booking/types'
import type { Session } from '@/types/session'
import BookingDetailBox from '@/features/booking/components/BookingDetailBox'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import Popup from '@/components/ui/molecules/Popup'
import BookingEditForm from '@/features/booking/components/edit/BookingEditForm'
import BookingEditAuthForm from '@/features/booking/components/edit/BookingEditAuth'
import {
	BookingErrorMessage,
	BookingSuccessMessage,
} from '@/features/booking/components/BookingActionFeedback'
import { useFeedback } from '@/hooks/useFeedback'
import { logError } from '@/utils/logger'
import { mutateBookingCalendarsForDate } from '@/utils/calendarCache'
import { toDateKey } from '@/utils'

type ViewMode = 'auth' | 'summary' | 'editing' | 'editSuccess'

type State = {
	mode: ViewMode
	booking: Booking
}

type Action =
	| { type: 'AUTH_SUCCESS' }
	| { type: 'START_EDIT' }
	| { type: 'CANCEL_EDIT' }
	| { type: 'EDIT_SUCCESS'; payload: Booking }
	| { type: 'DELETE_SUCCESS' }

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'AUTH_SUCCESS':
			return { ...state, mode: 'summary' }
		case 'START_EDIT':
			return { ...state, mode: 'editing' }
		case 'CANCEL_EDIT':
			return { ...state, mode: 'summary' }
		case 'EDIT_SUCCESS':
			return { mode: 'editSuccess', booking: action.payload }
		default:
			return state
	}
}

interface Props {
	bookingDetail: Booking
	session: Session
	initialBookingResponse: BookingResponse | null
	initialViewDay: Date
}

const BookingEdit = ({
	bookingDetail,
	session,
	initialBookingResponse,
	initialViewDay,
}: Props) => {
	const router = useRouter()
	const { mutate } = useSWRConfig()
	const deleteFeedback = useFeedback()
	const [flashMessage, setFlashMessage] = useState<string | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const isOwner = bookingDetail.userId === session.user.id
	const mode = isOwner ? 'summary' : 'auth'
	const [state, dispatch] = useReducer(reducer, {
		mode,
		booking: bookingDetail,
	})

	const handleAuthSuccess = () => {
		dispatch({ type: 'AUTH_SUCCESS' })
	}

	const handleEditSuccess = (updatedBooking: Booking) => {
		dispatch({ type: 'EDIT_SUCCESS', payload: updatedBooking })
		setFlashMessage('予約を更新しました。')
	}

	const handleDelete = async () => {
		deleteFeedback.clearFeedback()
		setIsDeleting(true)
		try {
			const response = await deleteBookingAction({
				bookingId: state.booking.id,
				bookingDate: state.booking.bookingDate,
				userId: session.user.id,
			})

			if (response.ok) {
				await mutateBookingCalendarsForDate(
					mutate,
					toDateKey(state.booking.bookingDate),
				)
				router.push('/booking')
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
			logError('Error deleting booking', error)
		} finally {
			setIsDeleting(false)
			setDeleteDialogOpen(false)
		}
	}

	const summaryView = (
		<div className="flex flex-col items-center justify-center w-full">
			<BookingDetailBox
				bookingDate={state.booking.bookingDate}
				bookingTime={state.booking.bookingTime}
				registName={state.booking.registName}
				name={state.booking.name}
			/>
			{flashMessage && (
				<BookingSuccessMessage
					feedback={{ kind: 'success', message: flashMessage }}
					className="w-full space-y-4 text-center"
				/>
			)}
			<div className="flex flex-col sm:flex-row justify-center gap-2 w-full max-w-md">
				<button
					className="btn btn-primary w-full sm:w-1/2"
					onClick={() => {
						setFlashMessage(null)
						dispatch({ type: 'START_EDIT' })
					}}
				>
					予約を編集
				</button>
				<button
					className="btn btn-secondary btn-outline w-full sm:w-1/2"
					onClick={() => {
						deleteFeedback.clearFeedback()
						setDeleteDialogOpen(true)
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
		</div>
	)

	const editSuccessView = (
		<div className="flex flex-col items-center justify-center w-full space-y-4">
			<BookingSuccessMessage
				feedback={{
					kind: 'success',
					message: flashMessage ?? '予約を編集しました。',
				}}
				onBack={() => router.push('/booking')}
				backButtonLabel="コマ表に戻る"
				backButtonClassName="btn btn-outline w-full max-w-md"
			>
				<BookingDetailBox
					bookingDate={state.booking.bookingDate}
					bookingTime={state.booking.bookingTime}
					registName={state.booking.registName}
					name={state.booking.name}
				/>
			</BookingSuccessMessage>
		</div>
	)

	return (
		<>
			{state.mode === 'auth' && (
				<BookingEditAuthForm
					session={session}
					bookingDetail={state.booking}
					onSuccess={handleAuthSuccess}
				/>
			)}

			{state.mode === 'summary' && summaryView}

			{state.mode === 'editing' && (
				<BookingEditForm
					bookingDetail={state.booking}
					session={session}
					onCancel={() => dispatch({ type: 'CANCEL_EDIT' })}
					onSuccess={handleEditSuccess}
					initialBookingResponse={initialBookingResponse}
					initialViewDay={initialViewDay}
				/>
			)}

			{state.mode === 'editSuccess' && editSuccessView}

			<Popup
				id="booking-delete-popup"
				title="予約削除"
				maxWidth="sm"
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false)
					deleteFeedback.clearFeedback()
				}}
			>
				<div className="p-4">
					<p className="text-center">予約を削除しますか？</p>
					<div className="flex justify-center gap-4 my-4">
						<button
							className="btn btn-secondary"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? '削除中…' : '削除'}
						</button>
						<button
							className="btn btn-outline"
							onClick={() => {
								setDeleteDialogOpen(false)
								deleteFeedback.clearFeedback()
							}}
						>
							キャンセル
						</button>
					</div>
					<BookingErrorMessage feedback={deleteFeedback.feedback} />
				</div>
			</Popup>
		</>
	)
}

export default BookingEdit
