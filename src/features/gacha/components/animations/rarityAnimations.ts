import gsap from 'gsap'
import type { RarityType } from '@/features/gacha/types'

export interface AnimationContext {
	timeline: gsap.core.Timeline
	card: HTMLDivElement
	effectsContainer: HTMLDivElement
	initialDelay: number
}

type RarityAnimation = (context: AnimationContext) => void

const animateCommon: RarityAnimation = ({ timeline, card }) => {
	timeline.to(
		card,
		{
			scale: 1.05,
			duration: 0.3,
			yoyo: true,
			repeat: 1,
			ease: 'power1.inOut',
		},
		'>',
	)
	timeline.fromTo(
		card,
		{ boxShadow: '0 0 0px 0px rgba(200,200,200,0)' },
		{
			boxShadow: '0 0 15px 5px rgba(200,200,200,0.7)',
			duration: 0.2,
			yoyo: true,
			repeat: 1,
		},
		'<',
	)
}

const animateRare: RarityAnimation = ({ timeline, card }) => {
	timeline.to(
		card,
		{ rotationY: 360, duration: 1.5, ease: 'power2.inOut' },
		'>',
	)
	timeline.fromTo(
		card.querySelectorAll<HTMLDivElement>('.backface-hidden'),
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
}

const animateSuperRare: RarityAnimation = ({ timeline, card }) => {
	timeline
		.to(card, { x: '-=5', yoyo: true, repeat: 5, duration: 0.05 }, '>')
		.to(card, { x: '+=5', yoyo: true, repeat: 5, duration: 0.05 }, '<')
		.to(card, { rotationY: 360, duration: 1, ease: 'power3.inOut' }, '+=0.1')
		.fromTo(
			card.querySelectorAll<HTMLDivElement>('.backface-hidden'),
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
}

const animateSSR: RarityAnimation = ({ timeline, card, effectsContainer }) => {
	timeline
		.to(card, { scale: 1.1, duration: 0.2, ease: 'power1.in' }, '>')
		.to(card, { x: '-=8', yoyo: true, repeat: 7, duration: 0.04 }, '<0.1')
		.to(card, { x: '+=8', yoyo: true, repeat: 7, duration: 0.04 }, '<')
		.to(
			card,
			{
				rotationY: 720,
				rotationX: 360,
				duration: 1.5,
				ease: 'expo.inOut',
			},
			'+=0.1',
		)
		.to(card, { scale: 1.0, duration: 0.3, ease: 'power1.out' })

	const rays = Array.from({ length: 8 }, () => {
		const ray = document.createElement('div')
		ray.className = 'light-ray-effect'
		effectsContainer.appendChild(ray)
		return ray
	})

	timeline.fromTo(
		rays,
		{
			opacity: 0,
			scaleY: 0,
			rotation: () => gsap.utils.random(0, 360),
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
			onComplete: () =>
				rays.forEach((ray) => {
					ray.remove()
				}),
		},
		'-=1.0',
	)
}

const animateUltraRare: RarityAnimation = ({
	timeline,
	card,
	effectsContainer,
}) => {
	timeline.fromTo(
		card,
		{ scale: 0, opacity: 0 },
		{ scale: 0.9, duration: 2, opacity: 1, ease: 'elastic.out(1,0.2)' },
	)
	timeline
		.to(card, { rotationY: 1080, duration: 2, ease: 'expo.inOut' }, '-=1.2')
		.to(
			card,
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
			card,
			{
				scale: 1,
				duration: 0.5,
				ease: 'power1.inOut',
				repeat: 0,
			},
			'>',
		)

	const particles = Array.from({ length: 30 }, () => {
		const particle = document.createElement('div')
		particle.className = 'particle-effect ultra-particle'
		effectsContainer.appendChild(particle)
		return particle
	})

	timeline.fromTo(
		particles,
		{
			x: '50%',
			y: '50%',
			opacity: 1,
			scale: () => gsap.utils.random(0.5, 1.2),
		},
		{
			x: () => `random(-200, 200)%`,
			y: () => `random(-200, 200)%`,
			opacity: 0,
			scale: 0,
			duration: () => gsap.utils.random(0.8, 1.5),
			ease: 'power3.out',
			onComplete: () =>
				particles.forEach((particle) => {
					particle.remove()
				}),
		},
		'-=1.8',
	)
}

const animateSecretRare: RarityAnimation = ({
	timeline,
	card,
	effectsContainer,
	initialDelay,
}) => {
	timeline.set(card, { opacity: 0, scale: 0.5 })
	const parentElement = card.parentElement?.parentElement

	if (parentElement) {
		timeline.fromTo(
			parentElement,
			{ backgroundColor: 'rgba(255,255,255,0)' },
			{
				backgroundColor: 'rgba(255,255,255,1)',
				duration: 0.1,
				yoyo: true,
				repeat: 1,
				onStart: () => {
					parentElement.style.zIndex = '1000'
				},
				onComplete: () => {
					parentElement.style.zIndex = ''
				},
			},
			initialDelay,
		)
	}

	timeline.to(
		card,
		{
			duration: 1,
			opacity: 1,
			scale: 1,
			ease: 'power4.out',
		},
		parentElement ? '>' : initialDelay,
	)

	timeline
		.to(
			card,
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
			card,
			{
				rotationY: 360,
				duration: 4,
				ease: 'power1.inOut',
				repeat: -1,
			},
			'>',
		)
		.to(
			card,
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
	const particles = Array.from({ length: 50 }, () => {
		const particle = document.createElement('div')
		particle.className = 'particle-effect secret-particle'
		particle.style.backgroundColor =
			colors[Math.floor(Math.random() * colors.length)]
		effectsContainer.appendChild(particle)
		return particle
	})

	timeline.fromTo(
		particles,
		{
			x: '50%',
			y: '50%',
			opacity: 1,
			scale: () => gsap.utils.random(0.8, 1.5),
		},
		{
			x: () => `random(-250, 250)%`,
			y: () => `random(-250, 250)%`,
			rotation: () => `random(0, 360)`,
			opacity: 0,
			scale: 0,
			duration: () => gsap.utils.random(1.5, 2.5),
			ease: 'power2.out',
			onComplete: () =>
				particles.forEach((particle) => {
					particle.remove()
				}),
		},
		'-=3.5',
	)
}

export const rarityAnimations: Record<RarityType, RarityAnimation> = {
	COMMON: animateCommon,
	RARE: animateRare,
	SUPER_RARE: animateSuperRare,
	SS_RARE: animateSSR,
	ULTRA_RARE: animateUltraRare,
	SECRET_RARE: animateSecretRare,
}
