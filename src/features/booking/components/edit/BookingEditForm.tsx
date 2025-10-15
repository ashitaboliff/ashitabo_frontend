'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateBookingAction } from '../../actions'
import { Booking, BookingResponse } from '@/features/booking/types'
import type { Session } from '@/types/session'
import { toDateKey, getCurrentJSTDateString } from '@/utils'
import { useFeedback } from '@/hooks/useFeedback'
import { logError } from '@/utils/logger'
import BookingEditCalendarPopup from '@/features/booking/components/edit/BookingEditCalendarPopup'
import BookingEditFormFields from '@/features/booking/components/edit/BookingEditFormFields'
import {
	bookingEditSchema,
	BookingEditFormValues,
} from '@/features/booking/schema'
import { mutateBookingCalendarsForDate } from '@/utils/calendarCache'

interface Props {
	bookingDetail: Booking
	session: Session
	onCancel: () => void
	onSuccess: (updatedBooking: Booking) => void
	initialBookingResponse: BookingResponse | null
	initialViewDay: Date
}

const today = getCurrentJSTDateString({})

const BookingEditForm = ({
	bookingDetail,
	session,
	onCancel,
	onSuccess,
	initialBookingResponse,
	initialViewDay,
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
			}

			submissionFeedback.showApiError(response)
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
