import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import { getSignedUrlForGachaImageAction } from '@/features/gacha/actions'
import { gachaConfigs } from '@/features/gacha/config'
import {
	type CarouselPackDataItem,
	GachaDataProvider,
} from '@/features/gacha/context/GachaDataContext'
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

				const [profile, gachaCarouselDataForContext] = await Promise.all([
					(async (): Promise<Profile | null> => {
						if (!session.user.hasProfile) return null
						const profileRes = await apiGet<Profile>(
							`/users/${session.user.id}/profile`,
							{ cache: 'no-store' },
						)
						return profileRes.ok ? (profileRes.data ?? null) : null
					})(),
					(async (): Promise<CarouselPackDataItem[]> => {
						const entries = await Promise.all(
							Object.entries(gachaConfigs).map(async ([version, config]) => {
								if (!config.packKey) return null
								try {
									const res = await getSignedUrlForGachaImageAction({
										r2Key: config.packKey,
									})
									const signedPackImageUrl =
										res.ok && typeof res.data === 'string' ? res.data : ''
									return {
										version,
										r2Key: config.packKey,
										signedPackImageUrl,
									}
								} catch (error) {
									logError(
										`Failed to get signed URL for packKey ${config.packKey} in UserPageContent`,
										error,
									)
									return {
										version,
										r2Key: config.packKey,
										signedPackImageUrl: '',
									}
								}
							}),
						)
						return entries
							.filter((entry): entry is CarouselPackDataItem => entry !== null)
							.sort((a, b) => a.version.localeCompare(b.version))
					})(),
				])

				return (
					<GachaDataProvider gachaCarouselData={gachaCarouselDataForContext}>
						<UserPageLayout session={session} profile={profile}>
							<UserPageTabs session={session} />
						</UserPageLayout>
					</GachaDataProvider>
				)
			}}
		</AuthPage>
	)
}

export default UserPageServer
