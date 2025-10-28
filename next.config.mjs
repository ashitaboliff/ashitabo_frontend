const imageRemotePatterns = [
	{
		protocol: 'https',
		hostname: 'profile.line-scdn.net',
	},
	{
		protocol: 'https',
		hostname: 'cdn.ashitabo.net',
	},
]

const appUrl = process.env.NEXT_PUBLIC_API_URL

if (appUrl) {
	try {
		const { protocol, hostname, port } = new URL(appUrl)
		const pattern = {
			protocol: protocol.replace(':', ''),
			hostname,
			pathname: '/gacha/images/object/**',
		}
		if (port) {
			pattern.port = port
		}
		imageRemotePatterns.push(pattern)
	} catch (error) {
		console.warn('Invalid NEXT_PUBLIC_APP_URL for image patterns', error)
	}
} else {
	imageRemotePatterns.push({
		protocol: 'http',
		hostname: 'localhost',
		pathname: '/gacha/images/object/**',
	})
}

const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
	enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
	trailingSlash: false,
	transpilePackages: ['next-mdx-remote'],
	images: {
		remotePatterns: imageRemotePatterns,
	},
	turbopack: {},
	reactCompiler: true,
}

export default withBundleAnalyzer(nextConfig)
