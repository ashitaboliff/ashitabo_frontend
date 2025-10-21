'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next-nprogress-bar'
import { useState } from 'react'
import BookingDetailBox from '@/app/booking/_components/BookingDetailBox'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import ShareButton from '@/shared/ui/atoms/ShareButton'
import AddCalendarPopup from '@/shared/ui/molecules/AddCalendarPopup'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'
import DetailNotFoundPage from './DetailNotFound'

interface Props {
	readonly bookingDetail: Booking
}

const DetailPage = ({ bookingDetail }: Props) => {
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
					type="button"
					className="btn btn-primary w-full sm:w-1/3"
					onClick={() => router.push(`/booking/${bookingDetail?.id}/edit`)}
				>
					編集
				</button>
				<button
					type="button"
					className="btn btn-accent btn-outline w-full sm:w-1/3"
					onClick={() => setIsPopupOpen(true)}
				>
					スマホに追加
				</button>
				<ShareButton
					url={pathname}
					title="LINEで共有"
					text={`予約日時: ${formatDateSlashWithWeekday(
						bookingDetail.bookingDate,
						{ space: false },
					)} ${BOOKING_TIME_LIST[Number(bookingDetail.bookingTime)]}`}
					isFullButton
					isOnlyLine
				/>
			</div>
			<div className="mt-4 flex justify-center w-full max-w-md">
				<button
					type="button"
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

export default DetailPage
