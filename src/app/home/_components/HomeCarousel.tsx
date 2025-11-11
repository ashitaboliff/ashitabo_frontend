import Image from 'next/image'
import { getImageUrl } from '@/shared/lib/r2'
import type { CarouselSlide } from '@/shared/ui/atoms/Carousel'
import Carousel from '@/shared/ui/atoms/Carousel'

const list = [
	{
		src: getImageUrl('/home/page/1.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像1枚目',
	},
	{
		src: getImageUrl('/home/page/2.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像2枚目',
	},
	{
		src: getImageUrl('/home/page/3.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像3枚目',
	},
	{
		src: getImageUrl('/home/page/4.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像4枚目',
	},
	{
		src: getImageUrl('/home/page/5.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像5枚目',
	},
	{
		src: getImageUrl('/home/page/6.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像6枚目',
	},
	{
		src: getImageUrl('/home/page/7.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像7枚目',
	},
	{
		src: getImageUrl('/home/page/8.webp'),
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼの公式ホームページトップ画像8枚目',
	},
]

const slides: CarouselSlide[] = list.map((image, index) => ({
	id: `home-hero-${index}`,
	node: (
		<figure className="relative w-full overflow-hidden bg-neutral-100">
			<Image
				src={image.src}
				alt={image.alt}
				width={600}
				height={400}
				className="h-full w-full object-cover"
				sizes="(min-width: 1024px) 1024px, 100vw"
				priority={index === 0}
				unoptimized
			/>
		</figure>
	),
}))

const HomeCarousel = () => {
	return (
		<Carousel
			slides={slides}
			className="rounded-lg bg-black/5 shadow-lg"
			interval={4500}
			pauseOnHover
		/>
	)
}

export default HomeCarousel
