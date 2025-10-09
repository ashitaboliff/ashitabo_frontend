'use client'

import { useMemo, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next-nprogress-bar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { DateToDayISOstring, getCurrentJSTDateString } from '@/utils'
import { createBookingAction } from '../actions'
import ShareButton from '@/components/ui/atoms/ShareButton'
import TextInputField from '@/components/ui/atoms/TextInputField'
import Popup from '@/components/ui/molecules/Popup'
import AddCalendarPopup from '@/components/ui/molecules/AddCalendarPopup'
import PasswordInputField from '@/components/ui/molecules/PasswordInputField'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import { BookingTime } from '@/features/booking/types'
import { useGachaPlayManager } from '@/features/gacha/hooks/useGachaPlayManager'
import GachaResult from '@/features/gacha/components/GachaResult'
import type { Session } from '@/types/session'
import { useFeedback } from '@/hooks/useFeedback'
import {
	bookingCreateSchema,
	BookingCreateFormInput,
	BookingCreateFormValues,
} from '@/features/booking/schemas/bookingCreateSchema'

const today = getCurrentJSTDateString({})

interface CreatePageProps {
	session: Session
	initialDateParam?: string
	initialTimeParam?: string
}

interface CreatedBookingSummary {
	id: string
	bookingDate: Date
	bookingTimeIndex: number
	registName: string
	name: string
}

const CreatePage = ({
	session,
	initialDateParam,
	initialTimeParam,
}: CreatePageProps) => {
	const router = useRouter()
	const messageFeedback = useFeedback()
	const [calendarPopupOpen, setCalendarPopupOpen] = useState(false)
	const [popupOpen, setPopupOpen] = useState(false)
	const [createdBooking, setCreatedBooking] =
		useState<CreatedBookingSummary | null>(null)
	const [showPassword, setShowPassword] = useState(false)

	const defaultBookingDate = useMemo(
		() => (initialDateParam ? new Date(initialDateParam) : new Date()),
		[initialDateParam],
	)
	const defaultBookingTimeIndex = useMemo(() => {
		const parsed = Number(initialTimeParam ?? '0')
		if (
			!Number.isFinite(parsed) ||
			parsed < 0 ||
			parsed >= BookingTime.length
		) {
			return 0
		}
		return parsed
	}, [initialTimeParam])

	const defaultValues: Partial<BookingCreateFormInput> = useMemo(
		() => ({
			bookingDate: defaultBookingDate.toISOString().split('T')[0],
			bookingTime: BookingTime[defaultBookingTimeIndex] ?? BookingTime[0],
			registName: '',
			name: '',
			password: '',
		}),
		[defaultBookingDate, defaultBookingTimeIndex],
	)

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<BookingCreateFormInput, unknown, BookingCreateFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(bookingCreateSchema),
		defaultValues,
	})

	const { onGachaPlayedSuccessfully, gachaPlayCountToday } =
		useGachaPlayManager()

	const shareUrl = useMemo(() => {
		if (typeof window === 'undefined' || !createdBooking) {
			return ''
		}
		return `${window.location.origin}/booking/${createdBooking.id}`
	}, [createdBooking])

	const onSubmit: SubmitHandler<BookingCreateFormValues> = async (data) => {
		messageFeedback.clearFeedback()
		setCreatedBooking(null)
		setCalendarPopupOpen(false)

		const bookingDate = new Date(data.bookingDate)
		const bookingTimeIndex =
			BookingTime.indexOf(data.bookingTime) >= 0
				? BookingTime.indexOf(data.bookingTime)
				: defaultBookingTimeIndex

		const reservationData = {
			bookingDate: DateToDayISOstring(bookingDate),
			bookingTime: bookingTimeIndex,
			registName: data.registName,
			name: data.name,
			isDeleted: false,
		}

		try {
			const res = await createBookingAction({
				userId: session.user.id,
				booking: reservationData,
				password: data.password,
				toDay: today,
			})

			if (res.ok) {
				setCreatedBooking({
					id: res.data.id,
					bookingDate,
					bookingTimeIndex,
					registName: data.registName,
					name: data.name,
				})
				messageFeedback.showSuccess('予約が完了しました。')
				reset({
					...defaultValues,
					registName: '',
					name: '',
					password: '',
				})
				setShowPassword(false)
				setPopupOpen(true)
			} else {
				messageFeedback.showApiError(res)
			}
		} catch (error) {
			messageFeedback.showError(
				'予約の作成中にエラーが発生しました。時間をおいて再度お試しください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			console.error('Error creating booking:', error)
		}
	}

	const registNameValue = watch('registName')
	const nameValue = watch('name')

	return (
		<div className="justify-center max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
			<h2 className="text-2xl font-bold text-center mb-8">新規予約</h2>
			<div className="max-w-md mx-auto space-y-4">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
					<TextInputField
						label="日付"
						register={register('bookingDate')}
						type="date"
						disabled
						autocomplete="off"
					/>
					<TextInputField
						label="時間"
						register={register('bookingTime')}
						type="text"
						disabled
						autocomplete="off"
					/>
					<TextInputField
						type="text"
						label="バンド名"
						register={register('registName')}
						placeholder="バンド名"
						errorMessage={errors.registName?.message}
						autocomplete="off"
					/>
					<TextInputField
						type="text"
						label="責任者"
						register={register('name')}
						placeholder="責任者名"
						errorMessage={errors.name?.message}
						autocomplete="off"
					/>
					<PasswordInputField
						label="パスワード"
						register={register('password')}
						showPassword={showPassword}
						handleClickShowPassword={() => setShowPassword((prev) => !prev)}
						handleMouseDownPassword={(e) => e.preventDefault()}
						errorMessage={errors.password?.message}
					/>
					<div className="flex justify-center space-x-4">
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isSubmitting}
						>
							{isSubmitting ? '処理中...' : '予約する'}
						</button>
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => router.push('/booking')}
						>
							カレンダーに戻る
						</button>
					</div>
					{messageFeedback.feedback?.kind === 'error' && (
						<ErrorMessage message={messageFeedback.feedback} />
					)}
				</form>

				{createdBooking && (
					<Popup
						id={`booking-create-popup-${createdBooking.id}`}
						title="予約完了"
						open={popupOpen}
						onClose={() => setPopupOpen(false)}
					>
						<h3 className="text-lg font-semibold text-center">
							以下の内容で予約が完了しました
						</h3>
						<p className="text-center">
							日付:{' '}
							{format(createdBooking.bookingDate, 'yyyy/MM/dd(E)', {
								locale: ja,
							})}
						</p>
						<p className="text-center">
							時間: {BookingTime[createdBooking.bookingTimeIndex]}
						</p>
						<p className="text-center">バンド名: {createdBooking.registName}</p>
						<p className="text-center">責任者: {createdBooking.name}</p>
						<GachaResult
							version="version3"
							userId={session.user.id}
							currentPlayCount={gachaPlayCountToday}
							onGachaSuccess={() => onGachaPlayedSuccessfully()}
						/>
						<div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => setCalendarPopupOpen(true)}
							>
								スマホに予定追加
							</button>
							{shareUrl ? (
								<ShareButton
									url={shareUrl}
									title="LINEで共有"
									text={`予約日時: ${format(
										createdBooking.bookingDate,
										'yyyy/MM/dd(E)',
										{
											locale: ja,
										},
									)} ${BookingTime[createdBooking.bookingTimeIndex]}`}
									isFullButton
									isOnlyLine
									className="btn btn-outline"
								/>
							) : (
								<span className="text-sm text-center text-gray-500">
									シェアURLを取得できませんでした。
								</span>
							)}
							<button
								type="button"
								className="btn btn-outline"
								onClick={() => router.push('/booking')}
							>
								ホームに戻る
							</button>
						</div>
					</Popup>
				)}
			</div>

			<AddCalendarPopup
				bookingDetail={{
					id: createdBooking?.id ?? '',
					userId: session.user.id,
					createdAt: new Date(),
					updatedAt: new Date(),
					bookingDate: DateToDayISOstring(
						createdBooking?.bookingDate ?? defaultBookingDate,
					),
					bookingTime:
						createdBooking?.bookingTimeIndex ?? defaultBookingTimeIndex,
					registName: createdBooking?.registName ?? registNameValue,
					name: createdBooking?.name ?? nameValue,
					isDeleted: false,
				}}
				isPopupOpen={calendarPopupOpen}
				setIsPopupOpen={setCalendarPopupOpen}
			/>
		</div>
	)
}

export default CreatePage
