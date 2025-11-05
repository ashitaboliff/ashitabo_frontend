import fs from 'node:fs/promises'
import path from 'node:path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { LuCalendar, LuCalendarSync } from '@/shared/ui/icons'

export const metadata = createMetaData({
	title: '利用規約 | あしたぼホームページ',
	description: 'あしたぼホームページのプライバシーポリシーです。',
	url: '/terms',
})

const Page = async () => {
	const filePath = path.join(
		process.cwd(),
		'src',
		'app',
		'(term_privacy)',
		'terms',
		'terms.mdx',
	)
	const mdxSource = await fs.readFile(filePath, 'utf-8')

	const { content, frontmatter } = await compileMDX<{
		updatedAt: string
		createdAt: string
	}>({
		source: mdxSource,
		options: {
			parseFrontmatter: true,
		},
	})

	return (
		<div className="container mx-auto rounded-lg bg-white p-4 pb-8">
			<h1 className="mt-4 text-center font-bold text-4xl">利用規約</h1>
			<div className="flex flex-col items-end">
				<div className="mt-4 flex flex-row items-center gap-x-2 text-center">
					<LuCalendarSync />
					{frontmatter.updatedAt}
				</div>
				<p className="flex flex-row items-center gap-x-2 text-center">
					<LuCalendar />
					{frontmatter.createdAt}
				</p>
			</div>
			<div className="prose mt-8 max-w-none">{content}</div>
		</div>
	)
}

export default Page
