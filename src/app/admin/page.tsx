import AdminMain from '@/app/admin/_components/AdminMain'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile={true} requireRole="ADMIN">
			{() => <AdminMain />}
		</AuthPage>
	)
}

export default Page
