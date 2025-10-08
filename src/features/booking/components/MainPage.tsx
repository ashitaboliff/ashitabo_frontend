'use client'

import { useMemo, useState, useEffect } from 'react'
import useSWR from 'swr'
import { addDays, subDays, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { getBookingByDateAction } from './actions'
import { BookingResponse, BookingTime } from '@/features/booking/types'
import Popup from '@/components/ui/molecules/Popup'
import BookingCalendar from '@/features/booking/components/BookingCalendar'
import { getCurrentJSTDateString } from '@/utils'
import { StatusCode, ApiError } from '@/types/responseTypes'

const fetchBookings = async ([startDate, endDate]: [
	string,
	string,
]): Promise<BookingResponse | null> => {
	const res = await getBookingByDateAction({ startDate, endDate })
	if (res.ok) {
		return res.data
	}
	throw res
}

const MainPage = () => {
	const [viewDay, setViewDay] = useState<string>(
		getCurrentJSTDateString({ yesterday: true }),
	)
	const [viewDayMax, setViewDayMax] = useState<number>(7) // カレンダーの表示日数
	const ableViewDayMax = 27 // yesterdayから27日後まで表示可能
	const ableViewDayMin = 7 // yesterdayから7日前まで表示可能
	const [errorPopupOpen, setErrorPopupOpen] = useState<boolean>(false)
	const [fetchError, setFetchError] = useState<ApiError | null>(null)
	const viewDate = new Date(viewDay)
	const yesterdayDate = new Date(getCurrentJSTDateString({ yesterday: true }))
	const endDateString = format(addDays(viewDate, viewDayMax - 1), 'yyyy-MM-dd')

	const {
		data: bookingData,
		isLoading,
		mutate,
	} = useSWR<BookingResponse | null>([viewDay, endDateString], fetchBookings, {
		revalidateOnFocus: false,
		onError: (err) => {
			setFetchError(err as ApiError)
			setErrorPopupOpen(true)
		},
	})

	useEffect(() => {
		const handleRefresh = () => {
			mutate()
		}

		window.addEventListener('refresh-booking-data', handleRefresh)

		return () => {
			window.removeEventListener('refresh-booking-data', handleRefresh)
		}
		// mutate is stable across renders per SWR, keeping it in deps for clarity.
	}, [mutate])

	const prevAble =
		subDays(viewDate, viewDayMax) < subDays(yesterdayDate, ableViewDayMin)

	const nextAble =
		addDays(viewDate, viewDayMax - 1) >= addDays(yesterdayDate, ableViewDayMax)

	const prevWeek = () => {
		if (prevAble) return
		const newDate = subDays(viewDate, viewDayMax)
		setViewDay(format(newDate, 'yyyy-MM-dd'))
	}
	const nextWeek = () => {
		if (nextAble) return
		const newDate = addDays(viewDate, viewDayMax)
		setViewDay(format(newDate, 'yyyy-MM-dd'))
	}

	const errorDetail = useMemo(() => {
		if (!fetchError?.details) {
			return null
		}
		if (typeof fetchError.details === 'string') {
			return fetchError.details
		}
		try {
			return JSON.stringify(fetchError.details, null, 2)
		} catch (error) {
			return String(fetchError.details)
		}
	}, [fetchError?.details])

	const handleRetry = async () => {
		setErrorPopupOpen(false)
		setFetchError(null)
		await mutate()
	}

	return (
		<>
			<div className="flex flex-col justify-center space-x-2">
				<div className="flex justify-between items-center mb-4 m-auto">
					<button
						className="btn btn-outline"
						onClick={prevWeek}
						disabled={prevAble}
					>
						{'<'}
					</button>
					<div className="text-md sm:text-lg font-bold w-64 sm:w-72 text-center">
						{format(viewDate, 'M/d(E)', { locale: ja })}~
						{format(addDays(viewDate, viewDayMax - 1), 'M/d(E)', {
							locale: ja,
						})}
						までのコマ表
					</div>
					<button
						className="btn btn-outline"
						onClick={nextWeek}
						disabled={nextAble}
					>
						{'>'}
					</button>
				</div>
				{isLoading || !bookingData ? (
					<div className="flex justify-center">
						<div className="skeleton w-[360px] h-[400px] sm:w-[520px] sm:h-[580px]"></div>
					</div>
				) : (
					<BookingCalendar bookingDate={bookingData} timeList={BookingTime} />
				)}
			</div>

			<Popup
				id="booking-error-popup"
				title="エラー"
				maxWidth="sm"
				open={errorPopupOpen}
				onClose={() => {
					setErrorPopupOpen(false)
					setFetchError(null)
				}}
			>
				<div className="flex flex-col items-center space-y-4">
					<div className="text-error text-lg font-bold">
						{fetchError?.status ?? StatusCode.INTERNAL_SERVER_ERROR}{' '}
						エラーが発生しました。このエラーが何度も発生する場合は、管理者にお問い合わせください。
					</div>
					<p className="text-sm text-center">
						{fetchError?.message ?? 'データの取得に失敗しました'}
					</p>
					{errorDetail && (
						<pre className="mt-2 w-full overflow-x-auto whitespace-pre-wrap rounded bg-base-200 p-3 text-xs">
							{errorDetail}
						</pre>
					)}
					<div className="flex justify-center space-x-2">
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => {
								setErrorPopupOpen(false)
								setFetchError(null)
							}}
						>
							閉じる
						</button>
						<button
							type="button"
							className="btn btn-primary"
							onClick={handleRetry}
						>
							再試行
						</button>
					</div>
				</div>
			</Popup>
		</>
	)
}

export default MainPage
