import fs from 'node:fs/promises'
import path from 'node:path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { LuCalendar, LuCalendarSync } from 'react-icons/lu'
import rehypeRaw from 'rehype-raw'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'

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
			mdxOptions: {
				rehypePlugins: [rehypeRaw],
			},
		},
	})

	return (
		<div className="container mx-auto bg-white p-4 pb-8 rounded-lg">
			<h1 className="text-4xl font-bold text-center mt-4">
				管理者ページの使い方
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
			<div className="flex flex-row justify-center mt-5 gap-5">
				<a className="btn btn-outline" href="/admin">
					ホームに戻る
				</a>
			</div>
		</div>
	)
}

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <UsagePage />}
		</AuthPage>
	)
}

export default Page
