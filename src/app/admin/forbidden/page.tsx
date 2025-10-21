import BanBookingPage from '@/app/admin/forbidden/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <BanBookingPage />}
		</AuthPage>
	)
}

export default Page
