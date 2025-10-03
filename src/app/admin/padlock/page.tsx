import { notFound } from 'next/navigation'
import PadLockEdit from '@/features/admin/components/PadLockEdit'
import { getAllPadLocksAction } from '@/features/admin/components/action'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

const Page = async () => {
	return (
		<AuthPage requireProfile={true} requireRole="ADMIN">
			{async (authResult) => {
				const padLocks = await getAllPadLocksAction()
				if (padLocks.status !== 200) {
					return notFound()
				}

				return (
					<PadLockEdit
						padLocks={padLocks.response}
						session={authResult.session!}
					/>
				)
			}}
		</AuthPage>
	)
}

export default Page
