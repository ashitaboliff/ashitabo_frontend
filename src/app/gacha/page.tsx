import GachaAdPage from '@/app/gacha/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { resolveCarouselPackData } from '@/domains/gacha/services/resolveCarouselPackData'
import { createMetaData } from '@/shared/hooks/useMetaData'

export const metadata = createMetaData({
	title: 'ガチャページ',
	description: 'お気に入りのガチャパックを引いてみよう',
	url: '/gacha',
})

const GachaPage = async () => {
	return (
		<AuthPage requireProfile={true}>
			{async (authResult) => {
				const session = authResult.session
				if (!session) {
					return null
				}

				const carouselPackData = await resolveCarouselPackData()

				return (
					<GachaAdPage session={session} carouselPackData={carouselPackData} />
				)
			}}
		</AuthPage>
	)
}

export default GachaPage
