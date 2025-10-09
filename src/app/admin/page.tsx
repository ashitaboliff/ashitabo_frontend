import AdminMain from '@/features/admin/components/AdminMain'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile={true} requireRole="ADMIN">
			{() => <AdminMain />}
		</AuthPage>
	)
}

export default Page
