'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
	authBookingAction,
	type BookingAccessGrant,
} from '@/domains/booking/api/bookingActions'
import {
	type BookingAuthFormValues,
	bookingAuthSchema,
} from '@/domains/booking/model/bookingSchema'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import BookingDetailBox from '@/domains/booking/ui/BookingDetailBox'
import BookingDetailNotFound from '@/domains/booking/ui/BookingDetailNotFound'
import { useFeedback } from '@/shared/hooks/useFeedback'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import PasswordInputField from '@/shared/ui/molecules/PasswordInputField'
import { logError } from '@/shared/utils/logger'
import type { Session } from '@/types/session'

interface Props {
	readonly session: Session
	readonly bookingDetail: Booking
	readonly onSuccess: (grant: BookingAccessGrant) => void
	readonly initialError?: string | null
}

const BookingEditAuthForm = ({
	session,
	bookingDetail,
	onSuccess,
	initialError,
}: Props) => {
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false)
	const feedback = useFeedback()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<BookingAuthFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingAuthSchema),
	})

	const { showError } = feedback

	useEffect(() => {
		if (initialError) {
			showError(initialError, { code: 403 })
		}
	}, [initialError, showError])

	if (!bookingDetail) {
		return <BookingDetailNotFound />
	}

	const togglePassword = () => setShowPassword((prev) => !prev)

	const onSubmit = async (data: BookingAuthFormValues) => {
		feedback.clearFeedback()
		try {
			const response = await authBookingAction({
				userId: session.user.id,
				bookingId: bookingDetail.id,
				password: data.password,
			})

			if (response.ok) {
				onSuccess(response.data)
			} else {
				feedback.showApiError(response)
			}
		} catch (error) {
			feedback.showError(
				'エラーが発生しました。このエラーが続く場合は管理者にお問い合わせください。',
				{
					details: error instanceof Error ? error.message : String(error),
					code: 500,
				},
			)
			logError('Error authenticating booking', error)
		}
	}

	return (
		<div className="flex flex-col">
			<div className="flex justify-center">
				<BookingDetailBox
					bookingDate={bookingDetail.bookingDate}
					bookingTime={bookingDetail.bookingTime}
					registName={bookingDetail.registName}
					name={bookingDetail.name}
				/>
			</div>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="mt-4 flex flex-col items-center space-y-4"
			>
				<div className="form-control w-full max-w-xs">
					<label className="label" htmlFor="password">
						<span className="label-text">パスワード</span>
					</label>
					<PasswordInputField
						register={register('password')}
						showPassword={showPassword}
						handleClickShowPassword={togglePassword}
						handleMouseDownPassword={(event) => event.preventDefault()}
						errorMessage={errors.password?.message}
					/>
				</div>
				<div className="flex gap-4">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={isSubmitting}
					>
						{isSubmitting ? '認証中...' : 'ログイン'}
					</button>
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => router.push(`/booking/${bookingDetail.id}`)}
					>
						予約詳細に戻る
					</button>
				</div>
			</form>
			<FeedbackMessage source={feedback.feedback} className="mt-4" />
		</div>
	)
}

export default BookingEditAuthForm
