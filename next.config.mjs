const imageRemotePatterns = [
	{
		protocol: 'https',
		hostname: 'profile.line-scdn.net',
	},
	{
		protocol: 'https',
		hostname: 'image-filter.ashitabodev.workers.dev',
	},
]

if (process.env.NEXT_PUBLIC_APP_URL) {
	imageRemotePatterns.push({
		protocol: 'https',
		hostname: process.env.NEXT_PUBLIC_APP_URL,
		pathname: '/api/image/**',
	})
} else {
	imageRemotePatterns.push({
		protocol: 'http',
		hostname: 'localhost',
		pathname: '/api/image/**',
	})
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ['next-mdx-remote'],
	images: {
		remotePatterns: imageRemotePatterns,
	},
}

export default nextConfig
