import EasterEgg from '@/app/(easter-egg)/_EasterEgg'
import { getImageUrl } from '@/shared/lib/r2'

const Page = async () => (
	<EasterEgg
		background="linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)"
		centerImage={{
			src: getImageUrl('/shikishi/sawa1.png'),
			alt: 'center',
		}}
		message="なつさん卒業おめでとう！"
		cornerImages={[
			{
				src: getImageUrl('/shikishi/sawa1.png'),
				alt: 'corner',
				style: { top: 0, right: 0 },
			},
			{
				src: getImageUrl('/shikishi/sawa2.png'),
				alt: 'corner',
				style: { bottom: 0, left: 0 },
			},
		]}
	/>
)

export default Page
