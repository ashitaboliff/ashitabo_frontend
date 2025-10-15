'use client'

import { useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateBookingAction } from '../actions'
import {
	Booking,
	BookingDetailProps,
	BookingResponse,
} from '@/features/booking/types'
import type { Session } from '@/types/session'
import BookingDetailBox from '@/features/booking/components/BookingDetailBox'
import { BookingSuccessMessage } from '@/features/booking/components/BookingActionFeedback'
import { toDateKey } from '@/utils'
import { useFeedback } from '@/hooks/useFeedback'
import { logError } from '@/utils/logger'
import BookingEditCalendarPopup from '@/features/booking/components/BookingEditCalendarPopup'
import BookingEditFormFields from '@/features/booking/components/BookingEditFormFields'
import {
	bookingEditSchema,
	BookingEditFormValues,
} from '@/features/booking/schemas/bookingEditSchema'

interface BookingEditFormProps {
	bookingDetail: BookingDetailProps
	session: Session
	timeList: string[]
	onCancel: () => void
	initialBookingResponse: BookingResponse | null
	initialViewDay: Date
}

const BookingEditForm = ({
	bookingDetail,
	session,
	timeList,
	onCancel,
	initialBookingResponse,
	initialViewDay,
}: BookingEditFormProps) => {
	const router = useRouter()

	const [bookingDate, setBookingDate] = useState(
		toDateKey(bookingDetail.bookingDate),
	)
	const [bookingTime, setBookingTime] = useState(bookingDetail.bookingTime)
	const [calendarOpen, setCalendarOpen] = useState(false)
	const [submitStatus, setSubmitStatus] = useState<
		'idle' | 'loading' | 'success'
	>('idle')
	const [resultBooking, setResultBooking] = useState<Booking | null>(null)

	const submissionFeedback = useFeedback()
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<BookingEditFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingEditSchema),
		defaultValues: {
			bookingDate,
			bookingTime: timeList[bookingTime],
			registName: bookingDetail.registName,
			name: bookingDetail.name,
		},
	})

	const onSubmit = async (data: BookingEditFormValues) => {
		setSubmitStatus('loading')
		setResultBooking(null)
		submissionFeedback.clearFeedback()

		try {
			const response = await updateBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
				booking: {
					bookingDate: toDateKey(data.bookingDate),
					bookingTime,
					registName: data.registName,
					name: data.name,
					isDeleted: false,
				},
			})

			if (response.ok) {
				const nextBooking = response.data
				setResultBooking(nextBooking)
				setBookingDate(nextBooking.bookingDate)
				setBookingTime(nextBooking.bookingTime)
				setValue('bookingDate', nextBooking.bookingDate)
				setValue('bookingTime', timeList[nextBooking.bookingTime])
				setCalendarOpen(false)
				submissionFeedback.showSuccess('予約を更新しました。')
				setSubmitStatus('success')
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

	const isSuccess = submitStatus === 'success'
	const errorFeedback =
		!isSuccess && submissionFeedback.feedback?.kind === 'error'
			? submissionFeedback.feedback
			: null
	const successFeedback =
		isSuccess && submissionFeedback.feedback?.kind === 'success'
			? submissionFeedback.feedback
			: null

	return (
		<div className="space-y-6 pt-4">
			<div className="text-center">
				<h2 className="text-2xl font-bold">予約編集</h2>
			</div>

			<div className="max-w-md mx-auto space-y-4">
				{!isSuccess && (
					<BookingEditFormFields
						register={register}
						errors={errors}
						isSubmitting={isSubmitting}
						isLoading={submitStatus === 'loading'}
						onCancel={onCancel}
						onOpenCalendar={() => setCalendarOpen(true)}
						onSubmit={handleSubmit(onSubmit)}
						errorFeedback={errorFeedback}
					/>
				)}

				{isSuccess && resultBooking && (
					<BookingSuccessMessage
						feedback={successFeedback}
						onBack={() => router.push('/booking')}
						backButtonClassName="btn btn-outline w-full"
					>
						<BookingDetailBox
							bookingDate={resultBooking.bookingDate}
							bookingTime={resultBooking.bookingTime}
							registName={resultBooking.registName}
							name={resultBooking.name}
						/>
					</BookingSuccessMessage>
				)}
			</div>

			<BookingEditCalendarPopup
				open={calendarOpen}
				onClose={() => setCalendarOpen(false)}
				timeList={timeList}
				initialViewDay={initialViewDay}
				initialBookingResponse={initialBookingResponse}
				actualBookingDate={toDateKey(bookingDetail.bookingDate)}
				actualBookingTime={bookingDetail.bookingTime}
				bookingDate={bookingDate}
				setBookingDate={setBookingDate}
				bookingTime={bookingTime}
				setBookingTime={setBookingTime}
				setValue={setValue}
			/>
		</div>
	)
}

export default BookingEditForm
