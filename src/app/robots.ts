import { MetadataRoute } from 'next'
import { FRONTEND_ORIGIN } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: [
					'Googlebot',
					'Googlebot-image',
					'	Googlebot-Video',
					'AdsBot-Google-mobile',
					'AdsBot-Google',
					'Mediapartners-Google',
				],
				disallow: ['/api', '/auth', '/admin'],
				allow: '/',
			},
			{
				userAgent: '*',
				disallow: '/',
			},
		],
		sitemap: `${FRONTEND_ORIGIN}/sitemap.xml`,
	}
}
