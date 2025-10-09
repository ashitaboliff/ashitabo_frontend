import BanBookingCreate from '@/features/admin/components/BanBookingCreate'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <BanBookingCreate />}
		</AuthPage>
	)
}

export default Page
