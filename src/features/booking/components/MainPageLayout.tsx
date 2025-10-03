'use server'

import { ReactNode } from 'react'
import fs from 'fs/promises'
import path from 'path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Modal from '@/components/ui/atoms/Modal'
import RefreshButton from './RefreshButton'

const MainPageLayout = async ({ children }: { children: ReactNode }) => {
	const readmePath = path.join(
		process.cwd(),
		'src',
		'features',
		'booking',
		'content',
		'booking-rule.mdx',
	)
	const markdownContent = await fs.readFile(readmePath, 'utf-8')

	return (
		<>
			<div className="flex justify-center space-x-2 mx-2">
				<RefreshButton />
				<Modal
					id="booking-rule-modal"
					btnText="使い方の表示"
					btnClass="btn btn-outline btn-md"
					modalClass="prose prose-h3:text-center max-w-none text-base-content"
				>
					<MDXRemote source={markdownContent} />
				</Modal>
			</div>
			{children}
		</>
	)
}

export default MainPageLayout
