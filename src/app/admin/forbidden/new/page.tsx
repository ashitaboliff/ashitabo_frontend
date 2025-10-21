import BanBookingCreate from '@/app/admin/forbidden/new/_components/BanBookingCreate'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <BanBookingCreate />}
		</AuthPage>
	)
}

export default Page
