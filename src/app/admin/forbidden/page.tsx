import BanBookingPage from '@/features/admin/components/BanBooking'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <BanBookingPage />}
		</AuthPage>
	)
}

export default Page
