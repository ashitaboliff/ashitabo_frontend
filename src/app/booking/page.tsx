'use server'

import MainPage from '@/features/booking/components/MainPage'
import MainPageLayout from '@/features/booking/components/MainPageLayout'

const Page = async () => {
	return (
		<MainPageLayout>
			<MainPage />
		</MainPageLayout>
	)
}

export default Page
