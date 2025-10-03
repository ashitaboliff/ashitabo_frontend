/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ['next-mdx-remote'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'profile.line-scdn.net',
			},
			{
				protocol: 'https',
				hostname: 'image-filter.ashitabodev.workers.dev',
			},
			{
				protocol: 'https',
				hostname:
					'ashitabo-secure.e90625a44ff2132c3df15dab72fc5bd2.r2.cloudflarestorage.com',
			},
		],
	},
}

export default nextConfig
