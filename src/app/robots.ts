import type { MetadataRoute } from 'next'
import PublicEnv from '@/lib/env/public'

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
		sitemap: `${PublicEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
	}
}
