import AdminUserPage from '@/app/admin/user/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <AdminUserPage />}
		</AuthPage>
	)
}

export default Page
