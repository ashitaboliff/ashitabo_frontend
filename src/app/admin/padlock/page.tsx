import { notFound } from 'next/navigation'
import { getAllPadLocksAction } from '@/features/admin/action'
import PadLockEdit from '@/features/admin/components/PadLockEdit'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{async () => {
				const padLocks = await getAllPadLocksAction()
				if (!padLocks.ok) {
					return notFound()
				}

				return <PadLockEdit padLocks={padLocks.data} />
			}}
		</AuthPage>
	)
}

export default Page
