import AdminUserPage from '@/features/admin/components/UserManage'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <AdminUserPage />}
		</AuthPage>
	)
}

export default Page
