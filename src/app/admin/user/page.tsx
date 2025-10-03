import AdminUserPage from '@/features/admin/components/UserManage'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile={true} requireRole="ADMIN">
			{async (authResult) => {
				return <AdminUserPage />
			}}
		</AuthPage>
	)
}

export default Page
