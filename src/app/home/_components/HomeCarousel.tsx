import Image from 'next/image'

const list = [
	{
		src: '/home/homepage_1.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
	},
	{
		src: '/home/homepage_2.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
	},
	{
		src: '/home/homepage_3.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
	},
	{
		src: '/home/homepage_4.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
	},
	{
		src: '/home/homepage_5.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
	},
	{
		src: '/home/homepage_6.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
	},
	{
		src: '/home/homepage_7.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
	},
	{
		src: '/home/homepage_8.jpg',
		alt: '信州大学工学部・教育学部・長野県立大学軽音サークルあしたぼ',
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
