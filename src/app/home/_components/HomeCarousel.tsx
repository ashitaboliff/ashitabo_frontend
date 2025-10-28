import Image from 'next/image'
import { getImageUrl } from '@/shared/lib/r2'

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

const Carousel = () => {
	return (
		<div className="carousel w-full">
			{list.map((image, index) => {
				const currentSlideId = `slide${index + 1}`
				const previousSlideId =
					index === 0 ? `slide${list.length}` : `slide${index}`
				const nextSlideId =
					index + 1 === list.length ? 'slide1' : `slide${index + 2}`
				return (
					<div
						id={currentSlideId}
						className="carousel-item relative w-full"
						key={image.src}
					>
						<Image
							src={image.src}
							alt={image.alt}
							width={900}
							height={675}
							className="object-cover w-full h-auto"
							priority={index === 0}
							unoptimized
						/>
						<div className="absolute left-2 right-2 top-1/2 flex -translate-y-1/2 transform justify-between">
							<a href={`#${previousSlideId}`} className="btn btn-offwhite">
								❮
							</a>
							<a href={`#${nextSlideId}`} className="btn btn-offwhite">
								❯
							</a>
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default Carousel
