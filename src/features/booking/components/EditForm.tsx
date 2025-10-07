'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter as useNProgressRouter } from 'next-nprogress-bar' // Alias for clarity
import { usePathname, useSearchParams } from 'next/navigation' // Import for path and search params
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { addDays, subDays } from 'date-fns'
import { updateBookingAction, deleteBookingAction } from './actions'
import {
	BookingDetailProps,
	BookingResponse,
	BookingTime,
} from '@/features/booking/types'
import { ApiError, StatusCode } from '@/types/responseTypes'
import TextInputField from '@/components/ui/atoms/TextInputField'
import BookingDetailBox from '@/components/ui/molecules/BookingDetailBox'
import Popup from '@/components/ui/molecules/Popup'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import EditCalendar from '@/features/booking/components/EditCalendar'
import { DateToDayISOstring } from '@/utils'
import { MdOutlineEditCalendar } from 'react-icons/md'
import type { Session } from '@/types/session'

const schema = yup.object().shape({
	bookingDate: yup.string().required('予約日を入力してください'),
	bookingTime: yup.string().required('予約時間を入力してください'),
	registName: yup.string().required('バンド名を入力してください'),
	name: yup.string().required('責任者名を入力してください'),
})

interface EditFormPageProps {
	bookingDetail: BookingDetailProps
	session: Session
	initialBookingResponse: BookingResponse | null // Add prop for calendar data
	initialViewDay: Date // Add prop for initial calendar view day
}

const EditFormPage = ({
	bookingDetail,
	session,
	initialBookingResponse,
	initialViewDay,
}: EditFormPageProps) => {
	const router = useNProgressRouter()
	const [editState, setEditState] = useState<'edit' | 'select'>('select')
	const [deletePopupOpen, setDeletePopupOpen] = useState(false)
	const [successPopupOpen, setSuccessPopupOpen] = useState(false)
	const [error, setError] = useState<ApiError>()

	const onDeleteSubmit = async () => {
		try {
			const res = await deleteBookingAction({
				bookingId: bookingDetail.id,
				userId: session.user.id,
			})
			if (res.ok) {
				setSuccessPopupOpen(true)
				setDeletePopupOpen(false)
			} else {
				setError(res)
			}
		} catch (e) {
			setError({
				ok: false,
				status: 500,
				message: 'このエラーが出た際はわたべに問い合わせてください。',
				details: e instanceof Error ? e.message : String(e),
			})
			console.error('Error deleting booking:', e)
		}
	}

	if (!bookingDetail) {
		return <DetailNotFoundPage />
	}

	return (
		<>
			{editState === 'select' && (
				<div className="flex flex-col items-center justify-center">
					<BookingDetailBox
						props={{
							bookingDate: bookingDetail.bookingDate,
							bookingTime: bookingDetail.bookingTime,
							registName: bookingDetail.registName,
							name: bookingDetail.name,
						}}
					/>
					<div className="flex flex-col sm:flex-row justify-center gap-2 w-full max-w-md">
						<button
							className="btn btn-primary w-full sm:w-1/2"
							onClick={() => setEditState('edit')}
						>
							予約を編集
						</button>
						<button
							className="btn btn-secondary btn-outline w-full sm:w-1/2"
							onClick={() => {
								setDeletePopupOpen(true)
							}}
						>
							予約を削除
						</button>
					</div>
					<div className="mt-4 flex justify-center w-full max-w-md">
						<button
							className="btn btn-ghost w-full sm:w-auto"
							onClick={() => router.back()}
						>
							戻る
						</button>
					</div>
				</div>
			)}
			{editState === 'edit' && (
				<MemoBookingEditForm
					BookingTime={BookingTime}
					bookingDetail={bookingDetail}
					session={session}
					setEditState={setEditState}
					initialBookingResponse={initialBookingResponse} // Pass down the prop
					initialViewDay={initialViewDay} // Pass down the prop
				/>
			)}

			<Popup
				id="booking-delete-popup"
				title="予約削除"
				maxWidth="sm"
				open={deletePopupOpen}
				onClose={() => setDeletePopupOpen(false)}
			>
				<div className="p-4">
					<p className="text-center">予約を削除しますか？</p>
					<div className="flex justify-center gap-4 mt-4">
						<button className="btn btn-secondary" onClick={onDeleteSubmit}>
							削除
						</button>
						<button
							className="btn btn-outline"
							onClick={() => {
								setDeletePopupOpen(false)
							}}
						>
							キャンセル
						</button>
					</div>
					{error && (
						<p className="text-sm text-error text-center">
							エラーコード{error.status}:{error.message}
						</p>
					)}
				</div>
			</Popup>

			<Popup
				id="booking-delete-success-popup"
				title="予約削除"
				maxWidth="sm"
				open={successPopupOpen}
				onClose={() => setSuccessPopupOpen(false)}
			>
				<div className="p-4 text-center">
					<p className="font-bold text-primary">予約の削除に成功しました。</p>
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
		</>
	)
}

const MemoBookingEditForm = memo(
	({
		BookingTime,
		bookingDetail,
		session,
		setEditState,
		initialBookingResponse, // Add new prop for initial booking data for the calendar view
		initialViewDay, // Add new prop for the initial view day
	}: {
		BookingTime: string[]
		bookingDetail: BookingDetailProps
		session: Session
		setEditState: (state: 'edit' | 'select') => void
		initialBookingResponse: BookingResponse | null
		initialViewDay: Date
	}) => {
		const router = useNProgressRouter() // Use aliased router for navigation
		const pathname = usePathname() // Get current pathname
		const searchParams = useSearchParams() // Get current search params

		const [bookingDate, setBookingDate] = useState<string>(
			new Date(bookingDetail.bookingDate).toISOString().split('T')[0],
		)
		const [bookingTime, setBookingTime] = useState<number>(
			bookingDetail.bookingTime,
		)
		const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
		const [successPopupOpen, setSuccessPopupOpen] = useState(false)
		const [error, setError] = useState<ApiError>()

		const yesterDate = subDays(new Date(), 1)
		const [viewDay, setViewDay] = useState<Date>(initialViewDay)
		const [viewDayMax, setViewDayMax] = useState<number>(7)
		const ableViewDayMax = 27
		const ableViewDayMin = 1
		const bookingResponse = initialBookingResponse

		const [loading, setLoading] = useState<boolean>(false)

		const updateViewDayInUrl = (newViewDay: Date) => {
			const newViewStartDate = DateToDayISOstring(newViewDay).split('T')[0]
			const currentParams = new URLSearchParams(
				Array.from(searchParams.entries()),
			)
			currentParams.set('viewStartDate', newViewStartDate)
			router.push(`${pathname}?${currentParams.toString()}`, { scroll: false })
			setViewDay(newViewDay)
		}

		let nextAble =
			addDays(viewDay, viewDayMax) <= addDays(yesterDate, ableViewDayMax)
				? false
				: true
		let prevAble =
			subDays(viewDay, viewDayMax) >= subDays(yesterDate, ableViewDayMin)
				? false
				: true

		const nextWeek = () => {
			const newViewDay = addDays(viewDay, viewDayMax)
			updateViewDayInUrl(newViewDay)
		}

		const prevWeek = () => {
			const newViewDay = subDays(viewDay, viewDayMax)
			updateViewDayInUrl(newViewDay)
		}

		const {
			register,
			handleSubmit,
			formState: { errors },
			setValue,
		} = useForm({
			mode: 'onBlur',
			resolver: yupResolver(schema),
			defaultValues: {
				bookingDate: bookingDate,
				bookingTime: BookingTime[bookingTime],
				registName: bookingDetail.registName,
				name: bookingDetail.name,
			},
		})

		const onPutSubmit = async (data: any) => {
			setSuccessPopupOpen(false)
			setLoading(true)

			try {
				const res = await updateBookingAction({
					bookingId: bookingDetail.id,
					userId: session.user.id,
					booking: {
						bookingDate: DateToDayISOstring(new Date(data.bookingDate)),
						bookingTime: bookingTime,
						registName: data.registName,
						name: data.name,
						isDeleted: false,
					},
				})

				if (res.ok) {
					setSuccessPopupOpen(true)
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
					<form onSubmit={handleSubmit(onPutSubmit)} className="space-y-2">
						<div className="flex flex-row justify-between gap-2">
							<div className="flex flex-col space-y-2 grow">
								<TextInputField
									label="日付"
									register={register('bookingDate')}
									placeholder="日付"
									type="text"
									disabled={true}
								/>
								<TextInputField
									label="時間"
									register={register('bookingTime')}
									placeholder="時間"
									type="text"
									disabled={true}
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
							<button type="submit" className="btn btn-primary">
								{loading ? '処理中...' : '予約を更新する'}
							</button>
							<button
								type="button"
								className="btn btn-outline"
								onClick={() => setEditState('select')}
							>
								戻る
							</button>
						</div>
					</form>
					{error && (
						<p className="text-sm text-error text-center">
							エラーコード{error.status}:{error.message}
						</p>
					)}
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
								onClick={prevWeek}
								disabled={prevAble}
							>
								{'<'}
							</button>
							<div className="text-lg font-bold mx-2 w-60 text-center">
								{viewDay.toLocaleDateString()}~
								{addDays(viewDay, viewDayMax - 1).toLocaleDateString()}
							</div>
							<button
								className="btn btn-outline"
								onClick={nextWeek}
								disabled={nextAble}
							>
								{'>'}
							</button>
						</div>
						{bookingResponse ? (
							<EditCalendar
								bookingResponse={bookingResponse}
								timeList={BookingTime}
								actualBookingDate={
									new Date(bookingDetail.bookingDate)
										.toISOString()
										.split('T')[0]
								}
								actualBookingTime={bookingDetail.bookingTime}
								bookingDate={bookingDate}
								setBookingDate={setBookingDate}
								bookingTime={bookingTime}
								setBookingTime={setBookingTime}
								setCalendarOpen={setCalendarOpen}
								setValue={setValue} // Pass setValue to EditCalendar
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
	},
)

MemoBookingEditForm.displayName = 'MemoBookingEditForm'

export default EditFormPage
