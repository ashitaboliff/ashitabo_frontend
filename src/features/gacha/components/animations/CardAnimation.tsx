'use client'

import { useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { RarityType } from '@/features/gacha/types'
import { getImageUrl } from '@/lib/r2'
import Sparkle from '@/features/gacha/components/effects/Sparkle'

gsap.registerPlugin(useGSAP)

interface CardProps {
	frontImageSignedUrl: string
	rarity: RarityType
	delay?: number
}

export const CardAnimation = ({
	frontImageSignedUrl,
	rarity,
	delay,
}: CardProps) => {
	const cardRef = useRef<HTMLDivElement>(null)
	const effectContainerRef = useRef<HTMLDivElement>(null)
	const [imagesLoaded, setImagesLoaded] = useState<number>(0)
	const backImage = getImageUrl('/gacha/backimage.png')

	const handleImageLoad = () => {
		setImagesLoaded((prev) => prev + 1)
	}

	// Define cleanupEffects here so it can be used by useGSAP's cleanup
	const cleanupEffects = () => {
		if (cardRef.current) {
			gsap.killTweensOf(cardRef.current)
		}
		if (effectContainerRef.current) {
			gsap.killTweensOf(
				effectContainerRef.current.querySelectorAll('.sparkle-star'),
			)
			gsap.killTweensOf(
				effectContainerRef.current.querySelectorAll('.light-ray-effect'),
			)
			gsap.killTweensOf(
				effectContainerRef.current.querySelectorAll('.particle-effect'),
			)
			effectContainerRef.current.innerHTML = '' // Clear dynamically added effect elements
		}
	}

	useGSAP(
		() => {
			if (!cardRef.current || imagesLoaded < 2 || !effectContainerRef.current) {
				return
			}

			const cardElement = cardRef.current
			const effectsContainer = effectContainerRef.current
			const initialDelay = delay || 0

			cleanupEffects()

			const masterTimeline = gsap.timeline()

			if (rarity !== 'SECRET_RARE') {
				masterTimeline.to(
					cardElement,
					{ opacity: 1, duration: 0.5 },
					initialDelay,
				)
			}

			if (rarity === 'COMMON') {
				masterTimeline.to(
					cardElement,
					{
						scale: 1.05,
						duration: 0.3,
						yoyo: true,
						repeat: 1,
						ease: 'power1.inOut',
					},
					'>',
				)
				masterTimeline.fromTo(
					cardElement,
					{ boxShadow: '0 0 0px 0px rgba(200,200,200,0)' },
					{
						boxShadow: '0 0 15px 5px rgba(200,200,200,0.7)',
						duration: 0.2,
						yoyo: true,
						repeat: 1,
					},
					'<',
				)
			} else if (rarity === 'RARE') {
				masterTimeline.to(
					cardElement,
					{ rotationY: 360, duration: 1.5, ease: 'power2.inOut' },
					'>',
				)
				masterTimeline.fromTo(
					cardElement.querySelectorAll<HTMLDivElement>('.backface-hidden'),
					{
						boxShadow: '0 0 0px 0px rgba(100,100,255,0)',
						borderRadius: '1.7rem',
					},
					{
						boxShadow: '0 0 20px 8px rgba(100,100,255,0.7)',
						duration: 0.4,
						yoyo: true,
						repeat: 3,
						delay: 0.5,
						borderRadius: '1.7rem',
					},
					'<0.5',
				)
			} else if (rarity === 'SUPER_RARE') {
				masterTimeline
					.to(
						cardElement,
						{ x: '-=5', yoyo: true, repeat: 5, duration: 0.05 },
						'>',
					)
					.to(
						cardElement,
						{ x: '+=5', yoyo: true, repeat: 5, duration: 0.05 },
						'<',
					)
					.to(
						cardElement,
						{ rotationY: 360, duration: 1, ease: 'power3.inOut' },
						'+=0.1',
					)
					.fromTo(
						cardElement.querySelectorAll<HTMLDivElement>('.backface-hidden'),
						{
							boxShadow: '0 0 0px 0px rgba(255,215,0,0)',
							borderRadius: '1.7rem',
						},
						{
							boxShadow: '0 0 30px 12px rgba(255,215,0,0.8)',
							duration: 0.5,
							yoyo: true,
							repeat: 3,
							borderRadius: '1.7rem',
						},
						'-=0.5',
					)
			} else if (rarity === 'SS_RARE') {
				masterTimeline
					.to(
						cardElement,
						{ scale: 1.1, duration: 0.2, ease: 'power1.in' },
						'>',
					)
					.to(
						cardElement,
						{ x: '-=8', yoyo: true, repeat: 7, duration: 0.04 },
						'<0.1',
					)
					.to(
						cardElement,
						{ x: '+=8', yoyo: true, repeat: 7, duration: 0.04 },
						'<',
					)
					.to(
						cardElement,
						{
							rotationY: 720,
							rotationX: 360,
							duration: 1.5,
							ease: 'expo.inOut',
						},
						'+=0.1',
					)
					.to(cardElement, { scale: 1.0, duration: 0.3, ease: 'power1.out' })

				for (let i = 0; i < 8; i++) {
					const ray = document.createElement('div')
					ray.className = 'light-ray-effect'
					effectsContainer.appendChild(ray)
					masterTimeline.fromTo(
						ray,
						{
							opacity: 0,
							scaleY: 0,
							rotation: gsap.utils.random(0, 360),
							x: '50%',
							y: '50%',
							transformOrigin: '0% 0%',
						},
						{
							opacity: 1,
							scaleY: 1,
							duration: 0.5,
							ease: 'power2.out',
							stagger: 0.1,
							onComplete: () => ray.remove(),
						},
						'-=1.0',
					)
				}
			} else if (rarity === 'ULTRA_RARE') {
				masterTimeline.fromTo(
					cardElement,
					{ scale: 0, opacity: 0 },
					{ scale: 0.9, duration: 2, opacity: 1, ease: 'elastic.out(1,0.2)' },
				)
				masterTimeline
					.to(
						cardElement,
						{ rotationY: 1080, duration: 2, ease: 'expo.inOut' },
						'-=1.2',
					)
					.to(
						cardElement,
						{
							boxShadow: '0 0 60px 30px rgba(255,255,150,1)',
							yoyo: true,
							repeat: 3,
							duration: 0.3,
							borderRadius: '2rem',
						},
						'-=1.5',
					)
					.to(
						cardElement,
						{
							scale: 1,
							duration: 0.5,
							ease: 'power1.inOut',
							repeat: 0,
						},
						'>',
					)

				for (let i = 0; i < 30; i++) {
					const particle = document.createElement('div')
					particle.className = 'particle-effect ultra-particle'
					effectsContainer.appendChild(particle)
					masterTimeline.fromTo(
						particle,
						{
							x: '50%',
							y: '50%',
							opacity: 1,
							scale: gsap.utils.random(0.5, 1.2),
						},
						{
							x: `random(-200, 200)%`,
							y: `random(-200, 200)%`,
							opacity: 0,
							scale: 0,
							duration: gsap.utils.random(0.8, 1.5),
							ease: 'power3.out',
							onComplete: () => particle.remove(),
						},
						'-=1.8',
					)
				}
			} else if (rarity === 'SECRET_RARE') {
				masterTimeline.set(cardElement, { opacity: 0, scale: 0.5 })
				const parentElement = cardElement.parentElement?.parentElement

				if (parentElement) {
					masterTimeline.fromTo(
						parentElement,
						{ backgroundColor: 'rgba(255,255,255,0)' },
						{
							backgroundColor: 'rgba(255,255,255,1)',
							duration: 0.1,
							yoyo: true,
							repeat: 1,
							onStart: () => {
								if (parentElement) parentElement.style.zIndex = '1000'
							},
							onComplete: () => {
								if (parentElement) parentElement.style.zIndex = ''
							},
						},
						initialDelay,
					)
				}

				masterTimeline.to(
					cardElement,
					{
						duration: 1,
						opacity: 1,
						scale: 1,
						ease: 'power4.out',
					},
					parentElement ? '>' : initialDelay,
				)

				masterTimeline
					.to(
						cardElement,
						{
							scale: 1.2,
							duration: 0.5,
							ease: 'power1.inOut',
							yoyo: true,
							repeat: 1,
						},
						'>',
					)
					.to(
						cardElement,
						{
							rotationY: 360,
							duration: 4,
							ease: 'power1.inOut',
							repeat: -1,
						},
						'>',
					)
					.to(
						cardElement,
						{
							boxShadow: '0 0 60px 30px rgba(0,0,0,0.8)',
							yoyo: true,
							repeat: -1,
							duration: 1.5,
							ease: 'sine.inOut',
							borderRadius: '2rem',
						},
						'<',
					)

				const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff8800', '#00ff88']
				for (let i = 0; i < 50; i++) {
					const particle = document.createElement('div')
					particle.className = 'particle-effect secret-particle'
					particle.style.backgroundColor =
						colors[Math.floor(Math.random() * colors.length)]
					effectsContainer.appendChild(particle)
					masterTimeline.fromTo(
						particle,
						{
							x: '50%',
							y: '50%',
							opacity: 1,
							scale: gsap.utils.random(0.8, 1.5),
						},
						{
							x: `random(-250, 250)%`,
							y: `random(-250, 250)%`,
							rotation: 'random(0, 360)',
							opacity: 0,
							scale: 0,
							duration: gsap.utils.random(1.5, 2.5),
							ease: 'power2.out',
							onComplete: () => particle.remove(),
						},
						'-=3.5',
					)
				}
			}
			// Removed the old setTimeout logic for masterTimeline.play() as it's not needed.

			return () => {
				// Cleanup function provided by useGSAP
				masterTimeline.kill()
				cleanupEffects() // Also call our defined cleanup
			}
		},
		{ dependencies: [rarity, imagesLoaded, delay], scope: cardRef },
	) // Pass dependencies and scope

	const starBaseSize = rarity === 'SUPER_RARE' ? 15 : 20
	const starColor = rarity === 'SECRET_RARE' ? '#000' : '#FFD700'

	const fixedStarPositions = useMemo(() => {
		const positions = []
		const numStars =
			rarity === 'ULTRA_RARE' || rarity === 'SECRET_RARE'
				? 60
				: rarity === 'SS_RARE'
					? 50
					: 40
		for (let i = 0; i < numStars; i++) {
			const side = Math.floor(Math.random() * 4)
			let pos: React.CSSProperties = {}
			const offset = `${Math.random() * 25}%`
			const mainPos = `${Math.random() * 100}%`

			if (side === 0) pos = { top: offset, left: mainPos }
			else if (side === 1) pos = { bottom: offset, left: mainPos }
			else if (side === 2) pos = { left: offset, top: mainPos }
			else pos = { right: offset, top: mainPos }
			positions.push(pos)
		}
		return positions
	}, [rarity])

	const sizeVariations = [-10, 0, 10, 0]

	return (
		<div
			className="relative w-[18.75rem] h-[25rem]"
			style={{ perspective: '1000px' }}
		>
			<div
				ref={effectContainerRef}
				className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
			/>
			<div ref={cardRef} className="w-full h-full transform-style-3d relative">
				<div className="absolute w-full h-full backface-hidden rounded-lg overflow-hidden">
					<img
						src={frontImageSignedUrl}
						alt="Card Front"
						className="w-full h-full object-cover"
						onLoad={handleImageLoad}
						decoding="auto"
					/>
				</div>
				<div className="absolute w-full h-full backface-hidden rotateY-180 rounded-lg overflow-hidden">
					<img
						src={backImage}
						alt="Card Back"
						className="w-full h-full object-cover"
						onLoad={handleImageLoad}
						decoding="auto"
					/>
				</div>
			</div>

			{['SUPER_RARE', 'SS_RARE', 'ULTRA_RARE', 'SECRET_RARE'].includes(
				rarity,
			) && (
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
					{rarity !== 'SECRET_RARE' && (
						<svg width="0" height="0">
							<defs>
								<linearGradient
									id="goldGradient"
									x1="0%"
									y1="0%"
									x2="100%"
									y2="0%"
								>
									<stop
										offset="0%"
										style={{ stopColor: '#FFD700', stopOpacity: 1 }}
									/>
									<stop
										offset="100%"
										style={{ stopColor: '#FFB14E', stopOpacity: 1 }}
									/>
								</linearGradient>
							</defs>
						</svg>
					)}
					{fixedStarPositions.map((pos, index) => {
						const currentSize =
							starBaseSize + sizeVariations[index % sizeVariations.length]
						return (
							<Sparkle
								key={index}
								size={currentSize}
								color={starColor}
								style={{ position: 'absolute', ...pos, opacity: 0 }}
								className="sparkle-star"
								rarity={rarity}
							/>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default CardAnimation
