'use client'

import { useCallback, useId } from 'react'
import { BOOKING_TIME_LIST } from '@/domains/booking/constants/bookingConstants'
import type { Booking } from '@/domains/booking/model/bookingTypes'
import {
	useLocationNavigate,
	useWindowOpen,
} from '@/shared/hooks/useBrowserApis'
import { FaApple, FaYahoo, SiGooglecalendar } from '@/shared/ui/icons'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateTimeCompact } from '@/shared/utils/dateFormat'

const AddCalendarPopup = ({
	bookingDetail,
	isPopupOpen,
	setIsPopupOpen,
}: {
	bookingDetail: Booking
	isPopupOpen: boolean
	setIsPopupOpen: (arg: boolean) => void
}) => {
	const openWindow = useWindowOpen()
	const navigate = useLocationNavigate()
	const bookingDate = BOOKING_TIME_LIST[bookingDetail.bookingTime]
		.split('~')
		.map(
			(time) =>
				new Date(
					new Date(bookingDetail.bookingDate).setHours(
						...(time.split(':').map(Number) as [
							number,
							number,
							number,
							number,
						]),
					),
				),
		)

	const startCompact = formatDateTimeCompact(bookingDate[0])
	const endCompact = formatDateTimeCompact(bookingDate[1])
	const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookingDetail.registName)}&dates=${encodeURIComponent(startCompact)}/${encodeURIComponent(endCompact)}&details=${encodeURIComponent(bookingDetail.name)}による音楽室でのコマ予約&location=あしたぼ`
	const yahooCalendarUrl = `https://calendar.yahoo.co.jp/?v=60&title=${encodeURIComponent(bookingDetail.registName)}&st=${encodeURIComponent(startCompact)}&et=${encodeURIComponent(endCompact)}&desc=${encodeURIComponent(bookingDetail.name)}による音楽室でのコマ予約&in_loc=あしたぼ`
	const appleCalendarUrl = `/api/generate-ics?start=${encodeURIComponent(startCompact)}&end=${encodeURIComponent(endCompact)}&summary=${encodeURIComponent(bookingDetail.registName)}&description=${encodeURIComponent(bookingDetail.name)}による音楽室でのコマ予約&openExternalBrowser=1`

	const handleOpenGoogleCalendar = useCallback(() => {
		openWindow(googleCalendarUrl, '_blank', 'noopener')
	}, [googleCalendarUrl, openWindow])

	const handleOpenAppleCalendar = useCallback(() => {
		navigate(appleCalendarUrl)
	}, [appleCalendarUrl, navigate])

	const handleOpenYahooCalendar = useCallback(() => {
		openWindow(yahooCalendarUrl, '_blank', 'noopener')
	}, [openWindow, yahooCalendarUrl])
	const popupId = useId()

	return (
		<Popup
			id={popupId}
			open={isPopupOpen}
			onClose={() => setIsPopupOpen(false)}
			title="カレンダーに追加"
			maxWidth="sm"
		>
			<div className="text-center">
				<div>
					<p>予定を追加するカレンダーアプリを選択してください。</p>
					<div className="flex justify-center gap-1">
						<button
							type="button"
							className="btn btn-outline btn-sm"
							onClick={handleOpenGoogleCalendar}
						>
							<SiGooglecalendar color="#2180FC" />
							Android
						</button>
						<button
							type="button"
							className="btn btn-outline btn-sm"
							onClick={handleOpenAppleCalendar}
						>
							<FaApple color="#000" />
							iPhone
						</button>
						<button
							type="button"
							className="btn btn-outline btn-sm"
							onClick={handleOpenYahooCalendar}
						>
							<FaYahoo color="#720E9E" />
							Yahoo!
						</button>
					</div>
				</div>
				<div className="mt-4">
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => setIsPopupOpen(false)}
					>
						閉じる
					</button>
				</div>
			</div>
		</Popup>
	)
}

export default AddCalendarPopup
