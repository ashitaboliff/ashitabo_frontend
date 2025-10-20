'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next-nprogress-bar'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FeedbackMessage as FeedbackMessageView } from '@/components/ui/atoms/Message'
import PasswordInputField from '@/components/ui/molecules/PasswordInputField'
import BookingDetailBox from '@/features/booking/components/BookingDetailBox'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import {
	type BookingAuthFormValues,
	bookingAuthSchema,
} from '@/features/booking/schema'
import type { Booking } from '@/features/booking/types'
import { useFeedback } from '@/hooks/useFeedback'
import type { Session } from '@/types/session'
import { logError } from '@/utils/logger'
import { authBookingAction } from '../../actions'

interface Props {
	session: Session
	bookingDetail: Booking
	onSuccess: () => void
}

const BookingEditAuthForm = ({ session, bookingDetail, onSuccess }: Props) => {
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

	if (!bookingDetail) {
		return <DetailNotFoundPage />
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
				onSuccess()
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
			<FeedbackMessageView source={feedback.feedback} className="mt-4" />
		</div>
	)
}

export default BookingEditAuthForm
