import { MetadataRoute } from 'next'
const URL = process.env.AUTH_URL

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: ['Googlebot', 'Googlebot-image', '	Googlebot-Video', 'AdsBot-Google-mobile', 'AdsBot-Google', 'Mediapartners-Google'],
				disallow: ['/api', '/auth', '/admin'],
				allow: '/',
			},
			{
				userAgent: '*',
				disallow: '/',
			}
		],
		sitemap: `${URL}/sitemap.xml`,
	}
}
