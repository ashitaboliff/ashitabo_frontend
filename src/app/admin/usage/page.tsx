import fs from 'node:fs/promises'
import path from 'node:path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { LuCalendar, LuCalendarSync } from '@/shared/ui/icons'

const UsagePage = async () => {
	const filePath = path.join(
		process.cwd(),
		'src',
		'app',
		'admin',
		'usage',
		'usage.mdx',
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
			<h1 className="mt-4 text-center font-bold text-4xl">
				管理者ページの使い方
			</h1>
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
			<div className="mt-5 flex flex-row justify-center gap-5">
				<a className="btn btn-outline" href="/admin">
					ホームに戻る
				</a>
			</div>
		</div>
	)
}

const Page = async () => {
	return <UsagePage />
}

export default Page
