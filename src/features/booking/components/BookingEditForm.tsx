'use client'

import { useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { usePathname, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, subDays } from 'date-fns'
import { MdOutlineEditCalendar } from 'react-icons/md'
import { updateBookingAction } from '../actions'
import { BookingDetailProps, BookingResponse } from '@/features/booking/types'
import type { Session } from '@/types/session'
import TextInputField from '@/components/ui/atoms/TextInputField'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import Popup from '@/components/ui/molecules/Popup'
import EditCalendar from '@/features/booking/components/EditCalendar'
import { DateToDayISOstring } from '@/utils'
import { useFeedback } from '@/hooks/useFeedback'
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
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const [bookingDate, setBookingDate] = useState(
		new Date(bookingDetail.bookingDate).toISOString().split('T')[0],
	)
	const [bookingTime, setBookingTime] = useState(bookingDetail.bookingTime)
	const [calendarOpen, setCalendarOpen] = useState(false)
	const [hasSuccess, setHasSuccess] = useState(false)

	const messageFeedback = useFeedback()

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

	const yesterday = subDays(new Date(), 1)
	const [viewDay, setViewDay] = useState(initialViewDay)
	const viewRange = 7
	const maxOffset = 27
	const minOffset = 1
	const bookingResponse = initialBookingResponse

	const disableNextNavigation =
		addDays(viewDay, viewRange) > addDays(yesterday, maxOffset)
	const disablePrevNavigation =
		subDays(viewDay, viewRange) < subDays(yesterday, minOffset)

	const updateViewDayInUrl = (newViewDay: Date) => {
		const newViewStartDate = DateToDayISOstring(newViewDay).split('T')[0]
		const currentParams = new URLSearchParams(
			Array.from(searchParams.entries()),
		)
		currentParams.set('viewStartDate', newViewStartDate)
		router.push(`${pathname}?${currentParams.toString()}`, { scroll: false })
		setViewDay(newViewDay)
	}

	const handleNextWeek = () => {
		if (!disableNextNavigation) {
			updateViewDayInUrl(addDays(viewDay, viewRange))
		}
	}

	const handlePrevWeek = () => {
		if (!disablePrevNavigation) {
			updateViewDayInUrl(subDays(viewDay, viewRange))
		}
	}

	const onSubmit = async (data: BookingEditFormValues) => {
		setHasSuccess(false)
		messageFeedback.clearFeedback()

		try {
			const response = await updateBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
				booking: {
					bookingDate: DateToDayISOstring(new Date(data.bookingDate)).split(
						'T',
					)[0],
					bookingTime,
					registName: data.registName,
					name: data.name,
					isDeleted: false,
				},
			})

			if (response.ok) {
				setHasSuccess(true)
				messageFeedback.showSuccess('予約を更新しました。')
			} else {
				messageFeedback.showApiError(response)
			}
		} catch (error) {
			messageFeedback.showError(
				'エラーが発生しました。このエラーが続く場合は管理者にお問い合わせください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			console.error('Error updating booking:', error)
		}
	}

	return (
		<div className="p-8 space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold">予約編集</h2>
			</div>

			<div className="max-w-md mx-auto space-y-4">
				<ErrorMessage message={messageFeedback.feedback} />
				{hasSuccess && (
					<div className="flex justify-center">
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => router.push('/booking')}
						>
							予約一覧に戻る
						</button>
					</div>
				)}

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
							disabled={isSubmitting}
						>
							{isSubmitting ? '処理中...' : '予約を更新する'}
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
							{addDays(viewDay, viewRange - 1).toLocaleDateString()}
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
		</div>
	)
}

export default BookingEditForm
