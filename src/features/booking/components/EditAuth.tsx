'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next-nprogress-bar'
import { Booking } from '@/features/booking/types'
import { authBookingAction } from '../actions'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import BookingDetailBox from '@/features/booking/components/BookingDetailBox'
import PasswordInputField from '@/components/ui/molecules/PasswordInputField'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import type { Session } from '@/types/session'
import { useFeedback } from '@/hooks/useFeedback'
import { logError } from '@/utils/logger'
import {
	bookingAuthSchema,
	BookingAuthFormValues,
} from '@/features/booking/schemas/bookingAuthSchema'

interface EditAuthPageProps {
	session: Session
	handleSetAuth: (isAuth: boolean) => void
	bookingDetail: Booking
}

const EditAuthPage = ({
	session,
	handleSetAuth,
	bookingDetail,
}: EditAuthPageProps) => {
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

	useEffect(() => {
		handleSetAuth(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
				handleSetAuth(true)
				router.push(`/booking/${bookingDetail.id}/edit`)
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
					props={{
						bookingDate: bookingDetail.bookingDate,
						bookingTime: bookingDetail.bookingTime,
						registName: bookingDetail.registName,
						name: bookingDetail.name,
					}}
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
			<ErrorMessage message={feedback.feedback} className="mt-4" />
		</div>
	)
}

export default EditAuthPage
