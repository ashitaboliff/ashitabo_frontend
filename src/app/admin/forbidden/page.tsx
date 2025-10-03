import { notFound } from 'next/navigation'
import BanBookingPage from '@/features/admin/components/BanBooking'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile={true} requireRole="ADMIN">
			{async (authResult) => {
				return <BanBookingPage />
			}}
		</AuthPage>
	)
}

export default Page
