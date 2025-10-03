import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import UserPageLayout from '@/features/user/components/UserPageLayout'
import BookingLogs from '@/features/user/components/BookingLogs'
import GachaLogs from '@/features/user/components/GachaLogs'
import { createMetaData } from '@/utils/metaData'
import { gachaConfigs } from '@/features/gacha/components/config/gachaConfig'
import { getSignedUrlForGachaImageAction } from '@/features/gacha/components/actions'
import {
	GachaDataProvider,
	CarouselPackDataItem,
} from '@/features/gacha/context/GachaDataContext'

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
				// セッション情報が確保されているので、authResult.sessionを使用
				const session = authResult.session!

				const packImageSignedUrls: Record<string, string> = {}
				for (const version in gachaConfigs) {
					const config = gachaConfigs[version]
					if (config.packKey) {
						try {
							const res = await getSignedUrlForGachaImageAction({
								userId: session.user.id,
								r2Key: config.packKey,
							})
							if (res.status === 200 && typeof res.response === 'string') {
								packImageSignedUrls[config.packKey] = res.response
							} else {
								console.error(
									`Failed to get signed URL for packKey ${config.packKey} in UserPageContent:`,
									res.response,
								)
								packImageSignedUrls[config.packKey] = ''
							}
						} catch (error) {
							console.error(
								`Failed to get signed URL for packKey ${config.packKey} in UserPageContent:`,
								error,
							)
							packImageSignedUrls[config.packKey] = ''
						}
					}
				}

				const gachaCarouselDataForContext: CarouselPackDataItem[] =
					Object.entries(gachaConfigs)
						.filter(([, config]) => config.packKey)
						.map(([version, config]) => ({
							version,
							r2Key: config.packKey!,
							signedPackImageUrl: packImageSignedUrls[config.packKey!] || '',
						}))

				return (
					<GachaDataProvider gachaCarouselData={gachaCarouselDataForContext}>
						<UserPageLayout session={session}>
							<BookingLogs session={session} />
							<GachaLogs session={session} />
						</UserPageLayout>
					</GachaDataProvider>
				)
			}}
		</AuthPage>
	)
}

export default UserPageServer
