'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import {
	type BookingAccessGrant,
	updateBookingAction,
} from '@/domains/booking/api/bookingActions'
import {
	type BookingEditFormValues,
	bookingEditSchema,
} from '@/domains/booking/model/bookingSchema'
import type {
	Booking,
	BookingResponse,
} from '@/domains/booking/model/bookingTypes'
import { mutateBookingCalendarsForDate } from '@/domains/booking/utils/calendarCache'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { getCurrentJSTDateString, toDateKey } from '@/shared/utils'
import { logError } from '@/shared/utils/logger'
import { StatusCode } from '@/types/responseTypes'
import type { Session } from '@/types/session'
import BookingEditCalendarPopup from './BookingEditCalendarPopup'
import BookingEditFormFields from './BookingEditFormFields'

interface Props {
	readonly bookingDetail: Booking
	readonly session: Session
	readonly onCancel: () => void
	readonly onSuccess: (updatedBooking: Booking) => void
	readonly initialBookingResponse: BookingResponse | null
	readonly initialViewDay: Date
	readonly bookingAccess: BookingAccessGrant | null
	readonly requiresAuthToken: boolean
	readonly onRequireAuth: (message: string) => void
}

const today = getCurrentJSTDateString({})

const BookingEditForm = ({
	bookingDetail,
	session,
	onCancel,
	onSuccess,
	initialBookingResponse,
	initialViewDay,
	bookingAccess,
	requiresAuthToken,
	onRequireAuth,
}: Props) => {
	const { mutate } = useSWRConfig()
	const [calendarOpen, setCalendarOpen] = useState(false)
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading'>('idle')

	const submissionFeedback = useFeedback()
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
		watch,
	} = useForm<BookingEditFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingEditSchema),
		defaultValues: {
			bookingDate: bookingDetail.bookingDate,
			bookingTime: bookingDetail.bookingTime,
			registName: bookingDetail.registName,
			name: bookingDetail.name,
		},
	})

	const bookingDate = watch('bookingDate')
	const watchedBookingTime = watch('bookingTime')
	const bookingTimeIndex =
		typeof watchedBookingTime === 'number'
			? watchedBookingTime
			: Number(watchedBookingTime ?? 0)

	const onSubmit = async (data: BookingEditFormValues) => {
		setSubmitStatus('loading')
		submissionFeedback.clearFeedback()
		const tokenExpiredMessage =
			'予約の操作トークンの有効期限が切れています。もう一度認証してください。'
		const tokenRequiredMessage =
			'予約を編集するには再度パスワード認証が必要です。'
		const tokenInvalidMessage =
			'予約の操作トークンが無効になりました。再度認証してください。'

		if (requiresAuthToken) {
			if (!bookingAccess) {
				submissionFeedback.showError(tokenRequiredMessage, {
					code: StatusCode.FORBIDDEN,
				})
				onRequireAuth(tokenRequiredMessage)
				setSubmitStatus('idle')
				return
			}
			const expiresAt = new Date(bookingAccess.expiresAt).getTime()
			if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
				submissionFeedback.showError(tokenExpiredMessage, {
					code: StatusCode.FORBIDDEN,
				})
				onRequireAuth(tokenExpiredMessage)
				setSubmitStatus('idle')
				return
			}
		}

		try {
			const response = await updateBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
				booking: {
					bookingDate: toDateKey(data.bookingDate),
					bookingTime: Number(data.bookingTime),
					registName: data.registName,
					name: data.name,
					isDeleted: false,
				},
				today,
				authToken: bookingAccess?.token,
			})

			if (response.ok) {
				await mutateBookingCalendarsForDate(mutate, data.bookingDate)
				setCalendarOpen(false)
				onSuccess({
					id: bookingDetail.id,
					userId: bookingDetail.userId,
					bookingDate: data.bookingDate,
					bookingTime: Number(data.bookingTime),
					registName: data.registName,
					name: data.name,
					createdAt: bookingDetail.createdAt,
					updatedAt: new Date(),
					isDeleted: false,
				})
				setSubmitStatus('idle')
				return
			} else if (
				response.status === StatusCode.FORBIDDEN &&
				requiresAuthToken
			) {
				onRequireAuth(tokenInvalidMessage)
				submissionFeedback.showError(tokenInvalidMessage, {
					code: StatusCode.FORBIDDEN,
				})
			} else {
				submissionFeedback.showApiError(response)
			}
			setSubmitStatus('idle')
		} catch (error) {
			submissionFeedback.showError(
				'エラーが発生しました。このエラーが続く場合は管理者にお問い合わせください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('Error updating booking', error)
			setSubmitStatus('idle')
		}
	}

	const errorFeedback =
		submissionFeedback.feedback?.kind === 'error'
			? submissionFeedback.feedback
			: null

	return (
		<div className="space-y-6 pt-4">
			<div className="text-center">
				<h2 className="text-2xl font-bold">予約編集</h2>
			</div>

			<div className="max-w-md mx-auto space-y-4">
				<BookingEditFormFields
					register={register}
					errors={errors}
					isSubmitting={isSubmitting}
					isLoading={submitStatus === 'loading'}
					onCancel={onCancel}
					onOpenCalendar={() => setCalendarOpen(true)}
					onSubmit={handleSubmit(onSubmit)}
					errorFeedback={errorFeedback}
					bookingTimeIndex={bookingTimeIndex}
				/>
			</div>

			<BookingEditCalendarPopup
				open={calendarOpen}
				onClose={() => setCalendarOpen(false)}
				initialViewDay={initialViewDay}
				initialBookingResponse={initialBookingResponse}
				actualBookingDate={toDateKey(bookingDetail.bookingDate)}
				actualBookingTime={bookingDetail.bookingTime}
				bookingDate={bookingDate}
				bookingTime={bookingTimeIndex}
				setValue={setValue}
			/>
		</div>
	)
}

export default BookingEditForm
