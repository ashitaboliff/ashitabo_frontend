import BookingMainPage from '@/app/booking/_components'
import BookingMainPageLayout from '@/app/booking/_components/BookingMainPageLayout'
import useFlashMessage from '@/shared/hooks/useFlashMessage'
import { FieldAds } from '@/shared/ui/ads'
import { getCurrentJSTDateString } from '@/shared/utils'

const Page = async () => {
	const { type, message } = await useFlashMessage({ key: 'booking:flash' })

	const initialViewDate = new Date(getCurrentJSTDateString({ offsetDays: -1 }))

	return (
		<>
			<BookingMainPageLayout />
			<BookingMainPage
				initialViewDate={initialViewDate.toISOString()}
				type={type}
				message={message}
			/>
			<FieldAds />
		</>
	)
}

export default Page
