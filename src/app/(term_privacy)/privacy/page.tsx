import fs from 'node:fs/promises'
import path from 'node:path'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeRaw from 'rehype-raw'
import { LuCalendar, LuCalendarSync } from '@/components/ui/icons'
import { createMetaData } from '@/hooks/useMetaData'

export async function metadata() {
	return createMetaData({
		title: 'プライバシーポリシー | あしたぼホームページ',
		description: 'あしたぼホームページのプライバシーポリシーです。',
		url: '/privacy',
	})
}

const Page = async () => {
	const filePath = path.join(
		process.cwd(),
		'src',
		'app',
		'(term_privacy)',
		'privacy',
		'privacy.mdx',
	)
	const mdxSource = await fs.readFile(filePath, 'utf-8')

	const { content, frontmatter } = await compileMDX<{
		updatedAt: string
		createdAt: string
	}>({
		source: mdxSource,
		options: {
			parseFrontmatter: true,
			mdxOptions: {
				rehypePlugins: [rehypeRaw],
			},
		},
	})

	return (
		<div className="container mx-auto bg-white p-4 pb-8 rounded-lg">
			<h1 className="text-4xl font-bold text-center mt-4">
				プライバシーポリシー
			</h1>
			<div className="flex flex-col items-end">
				<div className="text-center mt-4 flex flex-row items-center gap-x-2">
					<LuCalendarSync />
					{frontmatter.updatedAt}
				</div>
				<p className="text-center flex flex-row items-center gap-x-2">
					<LuCalendar />
					{frontmatter.createdAt}
				</p>
			</div>
			<div className="mt-8 prose max-w-none">{content}</div>
		</div>
	)
}

export default Page
