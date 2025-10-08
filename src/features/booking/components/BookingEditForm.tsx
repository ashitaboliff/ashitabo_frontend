'use client'

import { useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { usePathname, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, subDays } from 'date-fns'
import { updateBookingAction } from './actions'
import { BookingDetailProps, BookingResponse } from '@/features/booking/types'
import type { Session } from '@/types/session'
import { ApiError } from '@/types/responseTypes'
import TextInputField from '@/components/ui/atoms/TextInputField'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import Popup from '@/components/ui/molecules/Popup'
import EditCalendar from '@/features/booking/components/EditCalendar'
import { DateToDayISOstring } from '@/utils'
import { MdOutlineEditCalendar } from 'react-icons/md'

const formSchema = zod.object({
	bookingDate: zod.string().min(1, '予約日を入力してください'),
	bookingTime: zod.string().min(1, '予約時間を入力してください'),
	registName: zod.string().min(1, 'バンド名を入力してください'),
	name: zod.string().min(1, '責任者名を入力してください'),
})

type EditBookingFormValues = zod.infer<typeof formSchema>

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
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const [bookingDate, setBookingDate] = useState<string>(
		new Date(bookingDetail.bookingDate).toISOString().split('T')[0],
	)
	const [bookingTime, setBookingTime] = useState<number>(
		bookingDetail.bookingTime,
	)
	const [calendarOpen, setCalendarOpen] = useState(false)
	const [successPopupOpen, setSuccessPopupOpen] = useState(false)
	const [error, setError] = useState<ApiError>()
	const [loading, setLoading] = useState(false)

	const yesterday = subDays(new Date(), 1)
	const [viewDay, setViewDay] = useState<Date>(initialViewDay)
	const viewDayRange = 7
	const ableViewDayMax = 27
	const ableViewDayMin = 1
	const bookingResponse = initialBookingResponse

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<EditBookingFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(formSchema),
		defaultValues: {
			bookingDate,
			bookingTime: timeList[bookingTime],
			registName: bookingDetail.registName,
			name: bookingDetail.name,
		},
	})

	const updateViewDayInUrl = (newViewDay: Date) => {
		const newViewStartDate = DateToDayISOstring(newViewDay).split('T')[0]
		const currentParams = new URLSearchParams(
			Array.from(searchParams.entries()),
		)
		currentParams.set('viewStartDate', newViewStartDate)
		router.push(`${pathname}?${currentParams.toString()}`, { scroll: false })
		setViewDay(newViewDay)
	}

	const disableNextNavigation =
		addDays(viewDay, viewDayRange) > addDays(yesterday, ableViewDayMax)
	const disablePrevNavigation =
		subDays(viewDay, viewDayRange) < subDays(yesterday, ableViewDayMin)

	const handleNextWeek = () => {
		if (disableNextNavigation) return
		updateViewDayInUrl(addDays(viewDay, viewDayRange))
	}

	const handlePrevWeek = () => {
		if (disablePrevNavigation) return
		updateViewDayInUrl(subDays(viewDay, viewDayRange))
	}

	const onSubmit = async (data: EditBookingFormValues) => {
		setSuccessPopupOpen(false)
		setLoading(true)

		try {
			const response = await updateBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
				booking: {
					bookingDate: DateToDayISOstring(new Date(data.bookingDate)),
					bookingTime,
					registName: data.registName,
					name: data.name,
					isDeleted: false,
				},
			})

			if (response.ok) {
				setSuccessPopupOpen(true)
			} else {
				setError(response)
			}
		} catch (err) {
			setError({
				ok: false,
				status: 500,
				message: 'このエラーが出た際はわたべに問い合わせてください。',
				details: err instanceof Error ? err.message : String(err),
			})
			console.error('Error updating booking:', err)
		}
		setLoading(false)
	}

	return (
		<div className="p-8">
			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold">予約編集</h2>
			</div>

			<div className="max-w-md mx-auto">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
					<div className="flex flex-row justify-between gap-2">
						<div className="flex flex-col space-y-2 grow">
							<TextInputField
								label="日付"
								register={register('bookingDate')}
								placeholder="日付"
								type="text"
								disabled
							/>
							<TextInputField
								label="時間"
								register={register('bookingTime')}
								placeholder="時間"
								type="text"
								disabled
							/>
						</div>
						<div className="flex flex-col items-center justify-center">
							<button
								type="button"
								className="btn btn-primary btn-circle btn-outline"
								onClick={() => setCalendarOpen(true)}
							>
								<MdOutlineEditCalendar size={25} />
							</button>
						</div>
					</div>
					<TextInputField
						label="バンド名"
						register={register('registName')}
						placeholder="バンド名"
						type="text"
						errorMessage={errors.registName?.message}
					/>
					<TextInputField
						label="責任者"
						register={register('name')}
						placeholder="責任者名"
						type="text"
						errorMessage={errors.name?.message}
					/>

					<div className="flex justify-center space-x-4">
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? '処理中...' : '予約を更新する'}
						</button>
						<button
							type="button"
							className="btn btn-outline"
							onClick={onCancel}
						>
							戻る
						</button>
					</div>
				</form>
				<ErrorMessage error={error} />
			</div>

			<Popup
				id="booking-edit-calendar-popup"
				title="カレンダー"
				maxWidth="lg"
				open={calendarOpen}
				onClose={() => setCalendarOpen(false)}
			>
				<div className="flex flex-col gap-y-2 items-center justify-center">
					<div className="flex flex-row justify-center space-x-2">
						<button
							className="btn btn-outline"
							onClick={handlePrevWeek}
							disabled={disablePrevNavigation}
						>
							{'<'}
						</button>
						<div className="text-lg font-bold mx-2 w-60 text-center">
							{viewDay.toLocaleDateString()}~
							{addDays(viewDay, viewDayRange - 1).toLocaleDateString()}
						</div>
						<button
							className="btn btn-outline"
							onClick={handleNextWeek}
							disabled={disableNextNavigation}
						>
							{'>'}
						</button>
					</div>
					{bookingResponse ? (
						<EditCalendar
							bookingResponse={bookingResponse}
							timeList={timeList}
							actualBookingDate={
								new Date(bookingDetail.bookingDate).toISOString().split('T')[0]
							}
							actualBookingTime={bookingDetail.bookingTime}
							bookingDate={bookingDate}
							setBookingDate={setBookingDate}
							bookingTime={bookingTime}
							setBookingTime={setBookingTime}
							setCalendarOpen={setCalendarOpen}
							setValue={setValue}
						/>
					) : (
						<div className="flex justify-center">
							<div className="skeleton h-96 w-96"></div>
						</div>
					)}
					<div className="flex justify-center space-x-2">
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setCalendarOpen(false)}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>

			<Popup
				id="booking-edit-success-popup"
				title={successPopupOpen ? '予約編集' : ''}
				maxWidth="sm"
				open={successPopupOpen}
				onClose={() => setSuccessPopupOpen(false)}
			>
				<div className="p-4 text-center">
					<p className="font-bold text-primary">予約の編集に成功しました。</p>
					<div className="flex justify-center gap-4 mt-4">
						<button
							className="btn btn-outline"
							onClick={() => {
								router.push('/booking')
								setSuccessPopupOpen(false)
							}}
						>
							ホームに戻る
						</button>
					</div>
				</div>
			</Popup>
		</div>
	)
}

export default BookingEditForm
