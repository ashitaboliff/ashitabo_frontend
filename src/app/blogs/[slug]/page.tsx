import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { LuCalendar, LuCalendarSync } from '@/shared/ui/icons'
import { logError } from '@/shared/utils/logger'

interface Frontmatter {
	title: string
	description: string
	createdAt: string
	updatedAt: string
	// Add other frontmatter fields if needed
}

async function getPost(slug: string) {
	const postsDirectory = path.join(process.cwd(), 'src/app/blogs/_posts')
	const filePath = path.join(postsDirectory, `${slug}.mdx`)

	try {
		const source = fs.readFileSync(filePath, 'utf8')
		const { content, frontmatter } = await compileMDX<Frontmatter>({
			source,
			options: { parseFrontmatter: true },
			// You can pass components here if needed, e.g.,
			// components: { MyCustomComponent },
		})
		return { content, frontmatter, slug }
	} catch (error) {
		logError(`Error reading or compiling MDX for slug ${slug}`, error)
		return null
	}
}

export async function generateStaticParams() {
	const postsDirectory = path.join(process.cwd(), 'src/app/blogs/_posts')
	try {
		const filenames = fs.readdirSync(postsDirectory)
		return filenames
			.filter((filename) => filename.endsWith('.mdx'))
			.map((filename) => ({
				slug: filename.replace(/\.mdx$/, ''),
			}))
	} catch (error) {
		logError('Error reading posts directory for generateStaticParams', error)
		return []
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const slug = (await params).slug
	const post = await getPost(slug)
	if (!post) {
		return createMetaData({
			title: '記事が見つかりません',
			description: '指定されたブログ記事は見つかりませんでした。',
			url: `/blogs/${slug}`,
		})
	}
	return createMetaData({
		title: post.frontmatter.title,
		description: post.frontmatter.description,
		url: `/blogs/${slug}`,
	})
}

const BlogPostPage = async ({
	params,
}: {
	params: Promise<{ slug: string }>
}) => {
	const slug = (await params).slug
	const post = await getPost(slug)

	if (!post) {
		return (
			<div className="container mx-auto rounded-lg bg-white p-4 pb-8 text-center">
				<h1 className="mt-8 font-bold text-3xl">記事が見つかりません</h1>
				<p className="mt-4">指定されたブログ記事は見つかりませんでした。</p>
				<Link className="btn btn-outline mt-8" href="/blogs">
					ブログ一覧に戻る
				</Link>
			</div>
		)
	}

	return (
		<div className="container mx-auto rounded-lg bg-white p-4 pb-8">
			<article className="prose lg:prose-xl max-w-none">
				{' '}
				<h1 className="mt-4 text-center font-bold text-3xl">
					{post.frontmatter.title}
				</h1>
				<div className="mb-4 flex flex-col items-end">
					{post.frontmatter.updatedAt && (
						<div className="mt-2 flex flex-row items-center gap-x-1 text-gray-600 text-sm">
							<LuCalendarSync />
							更新日: {post.frontmatter.updatedAt}
						</div>
					)}
					{post.frontmatter.createdAt && (
						<div className="flex flex-row items-center gap-x-1 text-gray-600 text-sm">
							<LuCalendar />
							作成日: {post.frontmatter.createdAt}
						</div>
					)}
				</div>
				<div className="mt-8">{post.content}</div>
			</article>
			<div className="mt-8 flex flex-row justify-center gap-5">
				<Link className="btn btn-outline" href="/blogs">
					ブログ一覧に戻る
				</Link>
			</div>
		</div>
	)
}

export default BlogPostPage
