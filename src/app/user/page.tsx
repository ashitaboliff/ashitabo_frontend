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

				const packImagesEntries = await Promise.all(
					Object.entries(gachaConfigs).map(async ([version, config]) => {
						if (!config.packKey) {
							return null
						}
						try {
							const res = await getSignedUrlForGachaImageAction({
								userId: session.user.id,
								r2Key: config.packKey,
							})
							return {
								version,
								r2Key: config.packKey,
								signedPackImageUrl:
									res.ok && typeof res.data === 'string' ? res.data : '',
							}
						} catch (error) {
							console.error(
								`Failed to get signed URL for packKey ${config.packKey} in UserPageContent:`,
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

				const gachaCarouselDataForContext: CarouselPackDataItem[] =
					packImagesEntries
						.filter((entry): entry is CarouselPackDataItem => entry !== null)
						.sort((a, b) => a.version.localeCompare(b.version))

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
