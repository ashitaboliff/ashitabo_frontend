'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next-nprogress-bar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { DateToDayISOstring, getCurrentJSTDateString } from '@/utils'
import { createBookingAction } from './actions'
import ShareButton from '@/components/ui/atoms/ShareButton'
import TextInputField from '@/components/ui/atoms/TextInputField'
import Popup from '@/components/ui/molecules/Popup'
import AddCalendarPopup from '@/components/ui/molecules/AddCalendarPopup'
import PasswordInputField from '@/components/ui/molecules/PasswordInputField'
import { ApiError } from '@/types/responseTypes'
import { BookingTime } from '@/features/booking/types'
import { useGachaPlayManager } from '@/features/gacha/hooks/useGachaPlayManager'
import GachaResult from '@/features/gacha/components/GachaResult'
import type { Session } from '@/types/session'

const today = getCurrentJSTDateString({})

const generateBookingId = () => {
	if (
		typeof crypto !== 'undefined' &&
		typeof crypto.randomUUID === 'function'
	) {
		return crypto.randomUUID()
	}
	return Math.random().toString(36).slice(2)
}

const schema = yup.object().shape({
	bookingDate: yup.string().required('日付を入力してください'),
	bookingTime: yup.string().required('時間を入力してください'),
	registName: yup.string().required('バンド名を入力してください'),
	name: yup.string().required('責任者名を入力してください'),
	password: yup.string().required('パスワードを入力してください'),
})

interface CreatePageProps {
	session: Session
	initialDateParam?: string
	initialTimeParam?: string
}

export default function CreatePage({
	session,
	initialDateParam,
	initialTimeParam,
}: CreatePageProps) {
	const router = useRouter()
	const [loading, setLoading] = useState<boolean>(false)
	const [noticePopupOpen, setNoticePopupOpen] = useState(false)
	const [addCalendarPopupOpen, setAddCalendarPopupOpen] = useState(false)
	const [error, setError] = useState<ApiError | null>(null)
	const [showPassword, setShowPassword] = useState(false)

	const bookingDate = initialDateParam ? new Date(initialDateParam) : new Date()
	const bookingTime = initialTimeParam || '0'

	const [bookingId] = useState<string>(generateBookingId())

	const { onGachaPlayedSuccessfully, gachaPlayCountToday } =
		useGachaPlayManager()

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		mode: 'onBlur',
		resolver: yupResolver(schema),
		defaultValues: {
			bookingDate: bookingDate.toISOString().split('T')[0],
			bookingTime: BookingTime[Number(bookingTime)],
		},
	})

	const onSubmit = async (data: any) => {
		setNoticePopupOpen(false)
		setAddCalendarPopupOpen(false)
		setLoading(true)
		const reservationData = {
			bookingDate: DateToDayISOstring(bookingDate),
			bookingTime: Number(bookingTime),
			registName: data.registName,
			name: data.name,
			isDeleted: false,
		}
		try {
			const res = await createBookingAction({
				bookingId: bookingId,
				userId: session.user.id,
				booking: reservationData,
				password: data.password,
				toDay: today,
			})
			if (res.ok) {
				setNoticePopupOpen(true)
			} else {
				setError(res)
			}
		} catch (err) {
			setError({
				ok: false,
				status: 500,
				message: 'このエラーが出た際はわたべに問い合わせてください。',
				details: err instanceof Error ? err.message : String(err),
			})
			console.error('Error creating booking:', err)
		}
		setLoading(false)
	}

	return (
		<div className="justify-center max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
			<h2 className="text-2xl font-bold text-center mb-8">新規予約</h2>
			<div className="max-w-md mx-auto">
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
						handleClickShowPassword={() => setShowPassword(!showPassword)}
						handleMouseDownPassword={(e) => e.preventDefault()}
						errorMessage={errors.password?.message}
					/>
					<div className="flex justify-center space-x-4">
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? '処理中...' : '予約する'}
						</button>
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => router.push('/booking')}
						>
							カレンダーに戻る
						</button>
					</div>
					{error && (
						<p className="text-sm text-error text-center">
							エラーコード{error.status}:{error.message}
						</p>
					)}
				</form>
			</div>
			{noticePopupOpen && (
				<Popup
					id={`booking-create-popup-${bookingId}`}
					title="予約完了"
					open={noticePopupOpen}
					onClose={() => setNoticePopupOpen(false)}
				>
					<div className="text-center">
						<p>以下の内容で予約が完了しました。</p>
						<p>日付: {format(bookingDate, 'yyyy/MM/dd(E)', { locale: ja })}</p>
						<p>時間: {BookingTime[Number(bookingTime)]}</p>
						<p>バンド名: {watch('registName')}</p>
						<p>責任者: {watch('name')}</p>
						{noticePopupOpen && (
							<GachaResult
								version="version3"
								userId={session.user.id}
								currentPlayCount={gachaPlayCountToday}
								onGachaSuccess={() => onGachaPlayedSuccessfully()}
							/>
						)}
						<div className="flex flex-col justify-center gap-y-2 mt-4">
							<div className="flex flex-row justify-center space-x-2">
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										setNoticePopupOpen(false)
										setAddCalendarPopupOpen(true)
									}}
								>
									スマホに予定追加
								</button>
								<ShareButton
									url={`${window.location.origin}/booking/${bookingId}`}
									title="LINEで共有"
									text={`予約日時: ${format(bookingDate, 'yyyy/MM/dd(E)', {
										locale: ja,
									})} ${BookingTime[Number(bookingTime)]}`}
									isFullButton
									isOnlyLine
									className="btn btn-outline"
								/>
							</div>
							<button
								type="button"
								className="btn btn-outline"
								onClick={() => router.push('/booking')}
							>
								ホームに戻る
							</button>
						</div>
					</div>
				</Popup>
			)}
			<AddCalendarPopup
				bookingDetail={{
					id: '',
					userId: '',
					createdAt: new Date(),
					updatedAt: new Date(),
					bookingDate: DateToDayISOstring(bookingDate),
					bookingTime: Number(bookingTime),
					registName: watch('registName'),
					name: watch('name'),
					isDeleted: false,
				}}
				isPopupOpen={addCalendarPopupOpen}
				setIsPopupOpen={setAddCalendarPopupOpen}
			/>
		</div>
	)
}
