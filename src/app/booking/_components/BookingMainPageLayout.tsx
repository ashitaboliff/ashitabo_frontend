import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import BookingRefreshButton from '@/app/booking/_components/BookingRefreshButton'
import Modal from '@/shared/ui/molecules/Modal'

const MainPageLayout = async () => {
	const readmePath = path.join(
		process.cwd(),
		'src',
		'domains',
		'booking',
		'content',
		'booking-rule.mdx',
	)
	const markdownContent = await fs.readFile(readmePath, 'utf-8')
	const modalId = `booking-rule-modal-${randomUUID()}`

	return (
		<div className="flex justify-center space-x-2 mx-2">
			<BookingRefreshButton />
			<Modal
				id={modalId}
				btnText="使い方の表示"
				btnClass="btn btn-outline btn-md"
				title="使い方の表示"
				modalClass="prose prose-h3:text-center max-w-none text-base-content"
			>
				<MDXRemote source={markdownContent} />
			</Modal>
		</div>
	)
}

export default MainPageLayout
