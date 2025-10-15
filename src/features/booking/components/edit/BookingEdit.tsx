'use client'

import { useState } from 'react'
import { BookingDetailProps, BookingResponse } from '@/features/booking/types' // Added BookingResponse
import BookingEditAuthPage from '@/features/booking/components/edit/BookingEditAuth'
import BookingEditPage from '@/features/booking/components/edit/BookingEditPage'
import type { Session } from '@/types/session'

interface Props {
	bookingDetail: BookingDetailProps
	session: Session
	initialBookingResponse: BookingResponse | null
	initialViewDay: Date
}

const BookingEditMainPage = ({
	bookingDetail,
	session,
	initialBookingResponse,
	initialViewDay,
}: Props) => {
	const [isAuth, setIsAuth] = useState<boolean>(
		bookingDetail.userId === session?.user.id,
	)

	return (
		<>
			{isAuth ? (
				<BookingEditPage
					bookingDetail={bookingDetail}
					session={session}
					initialBookingResponse={initialBookingResponse}
					initialViewDay={initialViewDay}
				/>
			) : (
				<BookingEditAuthPage
					session={session}
					handleSetAuth={setIsAuth}
					bookingDetail={bookingDetail}
				/>
			)}
		</>
	)
}

export default BookingEditMainPage
