'use client'

import { useRouter } from 'next/navigation'
import { useId, useReducer, useState } from 'react'
import { useSWRConfig } from 'swr'
import {
	type BookingAccessGrant,
	deleteBookingAction,
} from '@/domains/booking/api/bookingActions'
import type {
	Booking,
	BookingResponse,
} from '@/domains/booking/model/bookingTypes'
import {
	BookingErrorMessage,
	BookingSuccessMessage,
} from '@/domains/booking/ui/BookingActionFeedback'
import BookingDetailBox from '@/domains/booking/ui/BookingDetailBox'
import { mutateBookingCalendarsForDate } from '@/domains/booking/utils/calendarCache'
import { useFeedback } from '@/shared/hooks/useFeedback'
import Popup from '@/shared/ui/molecules/Popup'
import { toDateKey } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import { StatusCode } from '@/types/response'
import type { Session } from '@/types/session'
import BookingEditAuthForm from './BookingEditAuth'
import BookingEditForm from './BookingEditForm'

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
	| { type: 'REQUIRE_AUTH' }

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
		case 'REQUIRE_AUTH':
			return { ...state, mode: 'auth' }
		default:
			return state
	}
}

interface Props {
	readonly bookingDetail: Booking
	readonly session: Session
	readonly initialBookingResponse: BookingResponse | null
	readonly initialViewDay: Date
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
	const [bookingAccess, setBookingAccess] = useState<BookingAccessGrant | null>(
		null,
	)
	const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(
		null,
	)
	const deletePopupId = useId()

	const isOwner = bookingDetail.userId === session.user.id
	const mode = isOwner ? 'summary' : 'auth'
	const [state, dispatch] = useReducer(reducer, {
		mode,
		booking: bookingDetail,
	})

	const handleAuthSuccess = (grant: BookingAccessGrant) => {
		setBookingAccess(grant)
		setAuthPromptMessage(null)
		dispatch({ type: 'AUTH_SUCCESS' })
	}

	const isTokenExpired = (grant: BookingAccessGrant | null) => {
		if (!grant) return true
		const expiresAt = new Date(grant.expiresAt).getTime()
		return Number.isNaN(expiresAt) || expiresAt <= Date.now()
	}

	const requireAuth = (message: string) => {
		setBookingAccess(null)
		setAuthPromptMessage(message)
		dispatch({ type: 'REQUIRE_AUTH' })
	}

	const ensureAccessToken = (operationLabel: string): string | null => {
		if (isOwner) {
			return null
		}
		if (!bookingAccess) {
			const message = `${operationLabel}には再度パスワード認証が必要です。`
			requireAuth(message)
			return null
		}
		if (isTokenExpired(bookingAccess)) {
			const message = `${operationLabel}の前に行った認証の有効期限が切れています。もう一度認証してください。`
			requireAuth(message)
			return null
		}
		return bookingAccess.token
	}

	const handleEditSuccess = (updatedBooking: Booking) => {
		dispatch({ type: 'EDIT_SUCCESS', payload: updatedBooking })
		setFlashMessage('予約を更新しました。')
	}

	const handleDelete = async () => {
		deleteFeedback.clearFeedback()
		setIsDeleting(true)
		try {
			const token = ensureAccessToken('予約を削除する')
			if (!isOwner && !token) {
				return
			}
			const response = await deleteBookingAction({
				bookingId: state.booking.id,
				bookingDate: state.booking.bookingDate,
				userId: session.user.id,
				authToken: token ?? undefined,
			})

			if (response.ok) {
				await mutateBookingCalendarsForDate(
					mutate,
					toDateKey(state.booking.bookingDate),
				)
				router.push('/booking')
			} else {
				if (response.status === StatusCode.FORBIDDEN) {
					requireAuth(
						'予約の操作トークンが無効になりました。再度認証してください。',
					)
				}
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
					type="button"
					className="btn btn-primary w-full sm:w-1/2"
					onClick={() => {
						setFlashMessage(null)
						dispatch({ type: 'START_EDIT' })
					}}
				>
					予約を編集
				</button>
				<button
					type="button"
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
					type="button"
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
					initialError={authPromptMessage}
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
					bookingAccess={bookingAccess}
					requiresAuthToken={!isOwner}
					onRequireAuth={(message) => requireAuth(message)}
				/>
			)}

			{state.mode === 'editSuccess' && editSuccessView}

			<Popup
				id={deletePopupId}
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
							type="button"
							className="btn btn-secondary"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? '削除中…' : '削除'}
						</button>
						<button
							type="button"
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
