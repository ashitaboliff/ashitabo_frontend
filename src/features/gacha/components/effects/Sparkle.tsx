'use client'

import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import type { RarityType } from '@/features/gacha/types'

interface SparkleProps {
	size: number
	color: string
	style?: React.CSSProperties
	className?: string
	rarity: RarityType
}

const Sparkle = ({
	size,
	color,
	style = {},
	className,
	rarity,
}: SparkleProps) => {
	const sparkleRef = useRef<SVGSVGElement>(null)

	useEffect(() => {
		if (!sparkleRef.current) return
		let sparkleAnimSpeed = 0.8
		let sparkleScale = 1.5
		if (rarity === 'ULTRA_RARE' || rarity === 'SECRET_RARE') {
			sparkleAnimSpeed = 0.5
			sparkleScale = 2.0
		} else if (rarity === 'SS_RARE') {
			sparkleAnimSpeed = 0.6
			sparkleScale = 1.8
		}

		const tween = gsap.to(sparkleRef.current, {
			opacity: gsap.utils.random(0.3, 0.8),
			scale: gsap.utils.random(sparkleScale * 0.8, sparkleScale * 1.2),
			rotation: gsap.utils.random(-30, 30),
			duration: sparkleAnimSpeed,
			yoyo: true,
			repeat: -1,
			ease: 'power1.inOut',
			delay: gsap.utils.random(0, 0.5),
		})
		return () => {
			tween.kill()
		}
	}, [rarity])

	return (
		<svg
			ref={sparkleRef}
			width={size}
			height={size}
			style={style}
			className={className}
			viewBox="0 0 100 100"
			aria-hidden="true"
			focusable="false"
		>
			<title>Card sparkle effect</title>
			{color === '#000' ? (
				<polygon
					points="50,0 65,40 100,50 65,60 50,100 35,60 0,50 35,40"
					fill={color}
				/>
			) : (
				<polygon
					points="50,0 65,40 100,50 65,60 50,100 35,60 0,50 35,40"
					fill="url(#goldGradient)"
				/>
			)}
		</svg>
	)
}

export default Sparkle
