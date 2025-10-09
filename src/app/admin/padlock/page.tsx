import { notFound } from 'next/navigation'
import PadLockEdit from '@/features/admin/components/PadLockEdit'
import { getAllPadLocksAction } from '@/features/admin/components/action'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{async (authResult) => {
				const padLocks = await getAllPadLocksAction()
				if (!padLocks.ok) {
					return notFound()
				}

				return (
					<PadLockEdit padLocks={padLocks.data} session={authResult.session!} />
				)
			}}
		</AuthPage>
	)
}

export default Page
