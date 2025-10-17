'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import { type CSSProperties, useId, useMemo, useRef, useState } from 'react'
import {
	type AnimationContext,
	rarityAnimations,
} from '@/features/gacha/components/animations/rarityAnimations'
import Sparkle from '@/features/gacha/components/effects/Sparkle'
import type { RarityType } from '@/features/gacha/types'

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
	const id = useId()

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
				timeline.to(cardElement, { opacity: 1, duration: 0.5 }, initialDelay)
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
		const positions: Array<{ style: CSSProperties; id: string }> = []
		const numStars =
			rarity === 'ULTRA_RARE' || rarity === 'SECRET_RARE'
				? 60
				: rarity === 'SS_RARE'
					? 50
					: 40
		for (let i = 0; i < numStars; i++) {
			const side = Math.floor(Math.random() * 4)
			let style: CSSProperties = {}
			const offset = `${Math.random() * 25}%`
			const mainPos = `${Math.random() * 100}%`

			if (side === 0) style = { top: offset, left: mainPos }
			else if (side === 1) style = { bottom: offset, left: mainPos }
			else if (side === 2) style = { left: offset, top: mainPos }
			else style = { right: offset, top: mainPos }
			positions.push({
				style,
				id: `${side}-${offset}-${mainPos}-${Math.random().toString(36).slice(2)}`,
			})
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
				<div className="absolute w-full h-full backface-hidden rounded-lg overflow-hidden relative">
					<Image
						src={frontImageSignedUrl}
						alt="Card Front"
						fill
						className="object-cover"
						onLoad={() => handleImageLoad()}
						sizes="(max-width: 768px) 300px, 400px"
					/>
				</div>
				<div className="absolute w-full h-full backface-hidden rotateY-180 rounded-lg overflow-hidden relative">
					<Image
						src="/backimage.webp"
						alt="Card Back"
						fill
						className="object-cover"
						onLoad={() => handleImageLoad()}
						sizes="(max-width: 768px) 300px, 400px"
					/>
				</div>
			</div>

			{['SUPER_RARE', 'SS_RARE', 'ULTRA_RARE', 'SECRET_RARE'].includes(
				rarity,
			) && (
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
					{rarity !== 'SECRET_RARE' && (
						<svg width="0" height="0" aria-hidden="true" focusable="false">
							<title>Rare card gradient definition</title>
							<defs>
								<linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
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
					{fixedStarPositions.map(
						({ style: positionStyle, id: starId }, index) => {
							const currentSize =
								starBaseSize + sizeVariations[index % sizeVariations.length]
							return (
								<Sparkle
									key={starId}
									size={currentSize}
									color={starColor}
									style={{
										position: 'absolute',
										...positionStyle,
										opacity: 0,
									}}
									className="sparkle-star"
									rarity={rarity}
								/>
							)
						},
					)}
				</div>
			)}
		</div>
	)
}

export default CardAnimation
