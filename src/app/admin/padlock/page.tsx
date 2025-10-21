import { notFound } from 'next/navigation'
import { getAllPadLocksAction } from '@/domains/admin/api/adminActions'
import PadLockEdit from '@/app/admin/padlock/_components/PadLockEdit'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'

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
