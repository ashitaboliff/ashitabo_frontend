'use client'

import { gsap } from 'gsap'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

interface Petal {
	id: string
	left: number
	top: number
	hue: number
}

export interface CornerImage {
	src: string
	alt: string
	width?: number
	height?: number
	style?: CSSProperties
}

export interface CenterImage {
	src: string
	alt: string
	width?: number
	height?: number
}

interface Props {
	readonly background: string
	readonly centerImage: CenterImage
	readonly message: string
	readonly cornerImages?: CornerImage[]
	readonly textColor?: string
	readonly textStrokeColor?: string
	readonly petalCount?: number
}

const createPetals = (count: number): Petal[] =>
	Array.from({ length: count }).map((_, index) => ({
		id: `petal-${index}-${Math.random().toString(36).slice(2, 8)}`,
		left: Math.random() * 100,
		top: Math.random() * 100,
		hue: Math.random() * 360,
	}))

const EasterEgg = ({
	background,
	centerImage,
	message,
	cornerImages = [],
	textColor = 'black',
	textStrokeColor = 'white',
	petalCount = 20,
}: Props) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const centerImgRef = useRef<HTMLImageElement>(null)
	const textRef = useRef<HTMLDivElement>(null)
	const [petals] = useState<Petal[]>(() => createPetals(petalCount))

	useEffect(() => {
		const container = containerRef.current
		const centerImg = centerImgRef.current
		const textElement = textRef.current

		if (container) {
			gsap.to(container, {
				backgroundPosition: '200% 0',
				duration: 10,
				repeat: -1,
				ease: 'linear',
			})
		}

		if (centerImg) {
			gsap.to(centerImg, {
				rotation: 360,
				duration: 5,
				repeat: -1,
				ease: 'linear',
			})
		}

		if (textElement) {
			gsap.to(textElement, {
				scale: 1.2,
				duration: 0.8,
				yoyo: true,
				repeat: -1,
				ease: 'power1.inOut',
			})
		}

		const cornerElements = container
			? Array.from(
					container.querySelectorAll<HTMLImageElement>('.corner-image'),
				)
			: []

		const cornerAnimations = cornerElements.map((element) =>
			gsap.to(element, {
				rotationX: 360,
				rotationY: 360,
				rotationZ: 360,
				duration: 10,
				repeat: -1,
				ease: 'linear',
			}),
		)

		const petalElements = container
			? Array.from(container.querySelectorAll<SVGSVGElement>('.petal'))
			: []

		const petalAnimations = petalElements.map((element) =>
			gsap.to(element, {
				y: '100vh',
				duration: Math.random() * 7 + 3,
				ease: 'linear',
				repeat: -1,
				delay: Math.random() * 2,
				onRepeat: () => {
					gsap.set(element, { y: -50 })
				},
			}),
		)

		return () => {
			if (container) gsap.killTweensOf(container)
			if (centerImg) gsap.killTweensOf(centerImg)
			if (textElement) gsap.killTweensOf(textElement)
			cornerAnimations.forEach((animation) => {
				animation.kill()
			})
			petalAnimations.forEach((animation) => {
				animation.kill()
			})
		}
	}, [])

	const {
		src: centerSrc,
		alt: centerAlt,
		width = 300,
		height = 300,
	} = centerImage

	return (
		<div
			ref={containerRef}
			style={{
				position: 'relative',
				width: '100vw',
				height: '100vh',
				overflow: 'hidden',
				background,
				backgroundSize: '400% 400%',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					pointerEvents: 'none',
				}}
			>
				{petals.map((petal) => (
					<svg
						key={petal.id}
						className="petal"
						width="20"
						height="20"
						style={{
							position: 'absolute',
							left: `${petal.left}%`,
							top: `${petal.top}%`,
						}}
						viewBox="0 0 100 100"
					>
						<title>{`Petal ${petal.id}`}</title>
						<circle
							cx="50"
							cy="50"
							r="20"
							fill={`hsl(${petal.hue}, 100%, 50%)`}
						/>
					</svg>
				))}
			</div>

			<Image
				ref={centerImgRef}
				src={centerSrc}
				alt={centerAlt}
				width={width}
				height={height}
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
				}}
			/>

			<div
				ref={textRef}
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					fontSize: '24px',
					fontWeight: 'bold',
					color: textColor,
					WebkitTextStroke: `1px ${textStrokeColor}`,
					textAlign: 'center',
				}}
			>
				{message}
			</div>

			{cornerImages.map(
				(
					{
						src,
						alt,
						width: cornerWidth = 100,
						height: cornerHeight = 100,
						style,
					},
					_,
				) => (
					<Image
						key={`${src}-corner`}
						className="corner-image"
						src={src}
						alt={alt}
						width={cornerWidth}
						height={cornerHeight}
						style={{
							position: 'absolute',
							...style,
						}}
					/>
				),
			)}
		</div>
	)
}

export default EasterEgg
