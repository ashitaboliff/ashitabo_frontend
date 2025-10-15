'use client'

import { useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { Booking } from '@/features/booking/types'
import { BOOKING_TIME_LIST } from '@/features/booking/constants'
import ShareButton from '@/components/ui/atoms/ShareButton'
import AddCalendarPopup from '@/components/ui/molecules/AddCalendarPopup'
import BookingDetailBox from '@/features/booking/components/BookingDetailBox'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'

const DetailPage = ({ bookingDetail }: { bookingDetail: Booking }) => {
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const router = useRouter()
	const pathname = usePathname()

	if (!bookingDetail) {
		return <DetailNotFoundPage />
	}

	return (
		<div className="container mx-auto flex flex-col items-center">
			<BookingDetailBox
				bookingDate={bookingDetail.bookingDate}
				bookingTime={bookingDetail.bookingTime}
				registName={bookingDetail.registName}
				name={bookingDetail.name}
			/>
			<div className="flex flex-col sm:flex-row justify-center items-center gap-2 w-full max-w-md">
				<button
					className="btn btn-primary w-full sm:w-1/3"
					onClick={() => router.push(`/booking/${bookingDetail?.id}/edit`)}
				>
					編集
				</button>
				<button
					className="btn btn-accent btn-outline w-full sm:w-1/3"
					onClick={() => setIsPopupOpen(true)}
				>
					スマホに追加
				</button>
				<ShareButton
					url={pathname}
					title="LINEで共有"
					text={`予約日時: ${format(
						new Date(bookingDetail.bookingDate),
						'yyyy/MM/dd(E)',
						{
							locale: ja,
						},
					)} ${BOOKING_TIME_LIST[Number(bookingDetail.bookingTime)]}`}
					isFullButton
					isOnlyLine
				/>
			</div>
			<div className="mt-4 flex justify-center w-full max-w-md">
				<button
					className="btn btn-ghost w-full sm:w-auto"
					onClick={() => router.push('/booking')}
				>
					コマ表に戻る
				</button>
			</div>
			<AddCalendarPopup
				bookingDetail={bookingDetail}
				isPopupOpen={isPopupOpen}
				setIsPopupOpen={setIsPopupOpen}
			/>
		</div>
	)
}

export default DetailPage // export名も変更
