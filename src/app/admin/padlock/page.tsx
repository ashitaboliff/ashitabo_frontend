import { notFound } from 'next/navigation'
import PadLockEdit from '@/app/admin/padlock/_components'
import { getAllPadLocksAction } from '@/domains/admin/api/adminActions'

const Page = async () => {
	const padLocks = await getAllPadLocksAction()
	if (!padLocks.ok) {
		return notFound()
	}

	return <PadLockEdit padLocks={padLocks.data} />
}

export default Page
