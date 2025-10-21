import BookingMainPage from '@/app/booking/_components'
import BookingMainPageLayout from '@/app/booking/_components/BookingMainPageLayout'
import useFlashMessage from '@/shared/hooks/useFlashMessage'
import { getCurrentJSTDateString } from '@/shared/utils'

const Page = async () => {
	const { type, message } = await useFlashMessage({ key: 'bookingFlash' })

	const initialViewDate = new Date(getCurrentJSTDateString({ yesterday: true }))

	return (
		<>
			<BookingMainPageLayout />
			<BookingMainPage
				initialViewDate={initialViewDate.toISOString()}
				type={type}
				message={message}
			/>
		</>
	)
}

export default Page
