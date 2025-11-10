import fs from 'node:fs'
import path from 'node:path'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { createMetaData } from '@/shared/hooks/useMetaData'
import { FieldAds } from '@/shared/ui/ads'
import { logError } from '@/shared/utils/logger'

const inter = Inter({ subsets: ['latin'] })

export const metadata = createMetaData({
	title: 'おしらせ | あしたぼホームページ',
	description: 'あしたぼホームページからのおしらせです。',
	url: '/blogs',
})

interface PostMeta {
	slug: string
	title: string
	createdAt?: string
}

async function getAllPostsMeta(): Promise<PostMeta[]> {
	const postsDirectory = path.join(process.cwd(), 'src/app/blogs/_posts')
	let filenames: string[] = []
	try {
		filenames = fs.readdirSync(postsDirectory)
	} catch (error) {
		logError('Error reading posts directory', error)
		return []
	}

	const postsMeta: PostMeta[] = []

	for (const filename of filenames) {
		if (filename.endsWith('.mdx')) {
			const filePath = path.join(postsDirectory, filename)
			try {
				const source = fs.readFileSync(filePath, 'utf8')
				const { frontmatter } = await compileMDX<{
					title: string
					createdAt?: string
				}>({
					source,
					options: { parseFrontmatter: true },
				})
				postsMeta.push({
					slug: filename.replace(/\.mdx$/, ''),
					title: frontmatter.title || '無題の記事',
					createdAt: frontmatter.createdAt,
				})
			} catch (error) {
				logError(`Error processing frontmatter for ${filename}`, error)
				postsMeta.push({
					slug: filename.replace(/\.mdx$/, ''),
					title: `Error: ${filename}`,
				})
			}
		}
	}

	postsMeta.sort((a, b) => {
		if (a.createdAt && b.createdAt) {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		}
		if (a.createdAt) return -1
		if (b.createdAt) return 1
		return 0
	})

	return postsMeta
}

const BlogsPage = async () => {
	const posts = await getAllPostsMeta()

	return (
		<>
			<div
				className={`container mx-auto flex flex-col items-center justify-center gap-y-3 p-4 ${inter.className}`}
			>
				<h1 className="mb-6 font-bold text-3xl">おしらせ一覧</h1>
				{posts.length > 0 ? (
					<ul className="space-y-3">
						{posts.map((post) => (
							<li key={post.slug}>
								<Link
									href={`/blogs/${post.slug}`}
									className="text-lg underline hover:text-secondary"
								>
									{post.title}
									{post.createdAt && (
										<span className="ml-2 text-gray-500 text-sm">
											({new Date(post.createdAt).toLocaleDateString('ja-JP')})
										</span>
									)}
								</Link>
							</li>
						))}
					</ul>
				) : (
					<p>まだお知らせはありません。</p>
				)}
				<Link className="btn btn-outline mt-8" href="/">
					戻る
				</Link>
			</div>
			<FieldAds />
		</>
	)
}

export default BlogsPage
