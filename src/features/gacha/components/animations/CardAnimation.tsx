'use client'

import { useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { RarityType } from '@/features/gacha/types'
import { getImageUrl } from '@/lib/r2'
import Sparkle from '@/features/gacha/components/effects/Sparkle'
import {
	AnimationContext,
	rarityAnimations,
} from '@/features/gacha/components/animations/rarityAnimations'

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
			const cardElement = cardRef.current
			const effectsContainer = effectContainerRef.current
			if (!cardElement || !effectsContainer || imagesLoaded < 2) {
				return
			}

			const initialDelay = delay ?? 0
			cleanupEffects()

			const timeline = gsap.timeline()

			if (rarity !== 'SECRET_RARE') {
				timeline.to(
					cardElement,
					{ opacity: 1, duration: 0.5 },
					initialDelay,
				)
			}

			const animationContext: AnimationContext = {
				timeline,
				card: cardElement,
				effectsContainer,
				initialDelay,
			}

			rarityAnimations[rarity](animationContext)

			return () => {
				timeline.kill()
				cleanupEffects()
			}
		},
		{ dependencies: [rarity, imagesLoaded, delay], scope: cardRef },
	)

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
