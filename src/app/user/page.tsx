import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { gachaConfigs } from '@/features/gacha/config'
import type { CarouselPackDataItem } from '@/features/gacha/types'
import { ensureSignedResourceUrls } from '@/features/gacha/services/signedGachaResourceCache'
import UserPageLayout from '@/features/user/components/UserPageLayout'
import UserPageTabs from '@/features/user/components/UserPageTabs'
import type { Profile } from '@/features/user/types'
import { createMetaData } from '@/hooks/useMetaData'
import { apiGet } from '@/lib/api/crud'
import { logError } from '@/utils/logger'

export async function metadata() {
	return createMetaData({
		title: 'ユーザーページ',
		description: '自分のした予約などを確認できます',
		url: '/user',
	})
}

const UserPageServer = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session
				if (!session) {
					return null
				}

				const [profile, gachaCarouselData] = await Promise.all([
					(async (): Promise<Profile | null> => {
						if (!session.user.hasProfile) return null
						const profileRes = await apiGet<Profile>(
							`/users/${session.user.id}/profile`,
							{ cache: 'no-store' },
						)
						return profileRes.ok ? (profileRes.data ?? null) : null
					})(),
					(async (): Promise<CarouselPackDataItem[]> => {
						const entries = Object.entries(gachaConfigs).filter(([, config]) =>
							Boolean(config.packKey),
						)
						if (entries.length === 0) {
							return []
						}
						const packKeys = entries.map(([, config]) => config.packKey)
						try {
							const signedUrls = await ensureSignedResourceUrls(packKeys)
							return entries
								.map(([version, config]) => ({
									version,
									r2Key: config.packKey,
									signedPackImageUrl: signedUrls[config.packKey] ?? '',
								}))
								.sort((a, b) => a.version.localeCompare(b.version))
						} catch (error) {
							logError(
								'Failed to resolve signed URLs for gacha pack images',
								error,
							)
							return entries
								.map(([version, config]) => ({
									version,
									r2Key: config.packKey,
									signedPackImageUrl: '',
								}))
								.sort((a, b) => a.version.localeCompare(b.version))
						}
					})(),
				])

				return (
					<UserPageLayout session={session} profile={profile}>
						<UserPageTabs
							session={session}
							gachaCarouselData={gachaCarouselData}
						/>
					</UserPageLayout>
				)
			}}
		</AuthPage>
	)
}

export default UserPageServer
