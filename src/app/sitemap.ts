import type { MetadataRoute } from 'next'
import { getBookingIds } from '@/domains/booking/api/bookingActions'
import { getYoutubeIds } from '@/domains/video/api/videoActions'
import PublicEnv from '@/shared/lib/env/public'

const URL = PublicEnv.NEXT_PUBLIC_APP_URL

const getBookingsMap = async (): Promise<MetadataRoute.Sitemap> => {
	const bookingIds = await getBookingIds()
	return bookingIds.map((id) => ({
		url: `${URL}/booking/${id}`,
		priority: 0.5,
	}))
}

const getYoutubeMap = async (): Promise<MetadataRoute.Sitemap> => {
	const [videoIds, playlistIds] = await Promise.all([
		getYoutubeIds('video'),
		getYoutubeIds('playlist'),
	])

	const playlistEntries = playlistIds.map((id) => ({
		url: `${URL}/video/live/${id}`,
		priority: 0.5,
	}))

	const videoEntries = videoIds.map((id) => ({
		url: `${URL}/video/band/${id}`,
		priority: 0.5,
	}))

	return [...playlistEntries, ...videoEntries]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const bookingsMap = await getBookingsMap()
	const youtubeMap = await getYoutubeMap()

	return [
		{
			url: `${URL}/home`,
			lastModified: new Date(),
			priority: 1,
		},
		{
			url: `${URL}/home/activity`,
			lastModified: new Date(),
			priority: 1,
		},
		{
			url: `${URL}/home/live`,
			lastModified: new Date(),
			priority: 1,
		},
		{
			url: `${URL}/booking`,
			lastModified: new Date(),
			priority: 0.8,
		},
		{
			url: `${URL}/video`,
			lastModified: new Date(),
			priority: 0.8,
		},
		{
			url: `${URL}/blogs`,
			lastModified: new Date(),
			priority: 0.8,
		},
		...bookingsMap,
		...youtubeMap,
		{
			url: `${URL}/gacha`,
			lastModified: new Date(),
			priority: 0.7,
		},
		{
			url: `${URL}/terms`,
			lastModified: new Date(),
			priority: 0.3,
		},
		{
			url: `${URL}/privacy`,
			lastModified: new Date(),
			priority: 0.3,
		},
	]
}
