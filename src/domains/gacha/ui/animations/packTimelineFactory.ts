'use client'

import gsap from 'gsap'
import type {
	ConfettiSpec,
	LightBeamSpec,
	RibbonSpec,
} from '@/domains/gacha/ui/animations/particleSpecs'
import {
	computeConfettiFilter,
	getRibbonFilter,
} from '@/domains/gacha/ui/animations/particleSpecs'

const TOP_LAUNCH_DELAY = 0.05
const TOP_FLIGHT_DURATION = 0.7
const PARTICLE_DELAY_AFTER_TOP = 0.18

type ElementRect = {
	left: number
	top: number
	width: number
	height: number
}

type TimelineParams = {
	element: HTMLDivElement
	topSlice: HTMLDivElement
	cutLine: HTMLDivElement
	confettiElements: HTMLSpanElement[]
	ribbonElements: HTMLSpanElement[]
	lightElements: HTMLSpanElement[]
	confettiSpecs: ConfettiSpec[]
	ribbonSpecs: RibbonSpec[]
	lightBeamSpecs: LightBeamSpec[]
	initialRect: ElementRect
	onAnimationComplete: () => void
}

const confettiPhaseDuration = (spec: ConfettiSpec | undefined, ratio: number) =>
	Math.max((spec?.lifetime ?? 0.95) * ratio, 0.25)

export const createPackOpeningTimeline = ({
	element,
	topSlice,
	cutLine,
	confettiElements,
	ribbonElements,
	lightElements,
	confettiSpecs,
	ribbonSpecs,
	lightBeamSpecs,
	initialRect,
	onAnimationComplete,
}: TimelineParams) => {
	gsap.set(element, {
		position: 'fixed',
		zIndex: 30,
		x: initialRect.left,
		y: initialRect.top,
		width: initialRect.width,
		height: initialRect.height,
		transformStyle: 'preserve-3d',
		transformPerspective: 900,
	})

	const timeline = gsap.timeline({ repeat: 0 })

	timeline.set(topSlice, {
		y: 0,
		x: 0,
		skewX: 0,
		rotation: 0,
		opacity: 1,
		transformOrigin: 'right bottom',
	})
	timeline.set(cutLine, {
		scaleX: 0,
		opacity: 0.15,
		transformOrigin: 'left center',
	})
	timeline.set(confettiElements, {
		opacity: 0,
		x: (index) => confettiSpecs[index]?.anchorOffsetX ?? 0,
		y: -10,
		scale: (index) => (confettiSpecs[index]?.scale ?? 1) * 0.6,
		zIndex: (index) => confettiSpecs[index]?.zIndex ?? 3,
		filter: (index) => computeConfettiFilter(confettiSpecs[index], 0.8),
		transformOrigin: 'center',
		mixBlendMode: 'screen',
	})
	timeline.set(ribbonElements, {
		opacity: 0,
		x: (index) => ribbonSpecs[index]?.anchorOffsetX ?? 0,
		y: -12,
		skewX: 0,
		scale: 0.85,
		zIndex: 1,
		filter: getRibbonFilter(false),
		transformOrigin: '50% 10%',
	})
	timeline.set(lightElements, {
		opacity: 0,
		scaleY: 0.2,
		scaleX: 0.6,
		x: (index) => lightBeamSpecs[index]?.anchorOffsetX ?? 0,
		y: -120,
		zIndex: 0,
		filter: 'blur(4px) drop-shadow(0 0 16px rgba(255,255,150,0.45))',
		transformOrigin: 'center top',
		mixBlendMode: 'screen',
		rotation: (index) => lightBeamSpecs[index]?.rotation ?? 0,
	})

	const particleBurstOffset =
		TOP_LAUNCH_DELAY + TOP_FLIGHT_DURATION + PARTICLE_DELAY_AFTER_TOP

	timeline
		.to(cutLine, {
			duration: 0.45,
			scaleX: 1,
			opacity: 0.7,
			background: '#27e689',
			ease: 'power2.out',
		})
		.addLabel('cutComplete')
		.addLabel('topLaunch', `cutComplete+=${TOP_LAUNCH_DELAY}`)
		.to(
			topSlice,
			{
				duration: TOP_FLIGHT_DURATION,
				y: '-130%',
				x: '-18%',
				rotation: 18,
				skewX: 10,
				ease: 'power2.out',
			},
			'topLaunch',
		)
		.addLabel('particleBurst', `cutComplete+=${particleBurstOffset}`)
		.to(
			confettiElements,
			{
				keyframes: [
					{
						opacity: 1,
						x: (index) =>
							(confettiSpecs[index]?.anchorOffsetX ?? 0) +
							(confettiSpecs[index]?.dx ?? 0) * 0.55,
						y: (index) => (confettiSpecs[index]?.dy ?? -90) * 0.65,
						rotation: (index) => confettiSpecs[index]?.rotate ?? 0,
						scale: (index) => (confettiSpecs[index]?.scale ?? 1) * 0.9,
						filter: (index) =>
							computeConfettiFilter(confettiSpecs[index], -0.3),
						duration: (index) =>
							confettiPhaseDuration(confettiSpecs[index], 0.5),
						ease: 'power3.out',
					},
					{
						x: (index) =>
							(confettiSpecs[index]?.anchorOffsetX ?? 0) +
							(confettiSpecs[index]?.dx ?? 0),
						y: (index) =>
							(confettiSpecs[index]?.dy ?? -90) +
							(confettiSpecs[index]?.waveHeight ?? 0),
						scale: (index) => confettiSpecs[index]?.scale ?? 1,
						rotation: (index) =>
							(confettiSpecs[index]?.rotate ?? 0) +
							(confettiSpecs[index]?.spin ?? 0),
						filter: (index) =>
							computeConfettiFilter(confettiSpecs[index], -0.6),
						duration: (index) =>
							confettiPhaseDuration(confettiSpecs[index], 0.55),
						ease: 'sine.inOut',
					},
				],
				delay: (index) => confettiSpecs[index]?.delay ?? 0,
				zIndex: (index) => confettiSpecs[index]?.zIndex ?? 4,
				stagger: { amount: 0.32, from: 'center' },
			},
			'particleBurst',
		)
		.to(
			confettiElements,
			{
				duration: 0.85,
				opacity: 0,
				y: (index) =>
					(confettiSpecs[index]?.dy ?? -90) +
					(confettiSpecs[index]?.waveHeight ?? 0) +
					60,
				filter: (index) => computeConfettiFilter(confettiSpecs[index], 0.4),
				ease: 'power1.in',
			},
			'particleBurst+=0.55',
		)
		.to(
			ribbonElements,
			{
				keyframes: [
					{
						opacity: 1,
						x: (index) =>
							(ribbonSpecs[index]?.anchorOffsetX ?? 0) +
							(ribbonSpecs[index]?.dx ?? 0) * 0.35,
						y: (index) => (ribbonSpecs[index]?.dy ?? -140) * 0.4,
						rotation: (index) => ribbonSpecs[index]?.waveTilt ?? 0,
						skewX: (index) => ribbonSpecs[index]?.waveTilt ?? 0,
						filter: getRibbonFilter(false),
						duration: 0.45,
						ease: 'power2.out',
					},
					{
						x: (index) =>
							(ribbonSpecs[index]?.anchorOffsetX ?? 0) +
							(ribbonSpecs[index]?.dx ?? 0),
						y: (index) => ribbonSpecs[index]?.dy ?? -100,
						rotation: (index) =>
							(ribbonSpecs[index]?.rotation ?? 0) +
							(ribbonSpecs[index]?.flutter ?? 0),
						skewX: (index) => -(ribbonSpecs[index]?.waveTilt ?? 0) * 0.4,
						filter: getRibbonFilter(true),
						duration: (index) =>
							Math.max((ribbonSpecs[index]?.duration ?? 1.2) - 0.4, 0.45),
						ease: 'sine.inOut',
					},
				],
				delay: (index) => ribbonSpecs[index]?.delay ?? 0,
				zIndex: 2,
				stagger: { amount: 0.35, from: 'edges' },
			},
			'particleBurst+=0.06',
		)
		.to(
			ribbonElements,
			{
				duration: 0.95,
				opacity: 0,
				y: (index) => (ribbonSpecs[index]?.dy ?? -100) + 140,
				rotation: (index) =>
					(ribbonSpecs[index]?.rotation ?? 0) +
					(ribbonSpecs[index]?.flutter ?? 0) * 1.2,
				filter: 'blur(1.2px) drop-shadow(0 12px 18px rgba(0,0,0,0.35))',
				ease: 'power1.in',
			},
			'particleBurst+=0.7',
		)
		.to(
			lightElements,
			{
				keyframes: [
					{
						opacity: 0.9,
						scaleY: (index) => lightBeamSpecs[index]?.pulseScaleY ?? 1.4,
						scaleX: (index) => lightBeamSpecs[index]?.pulseScaleX ?? 1.05,
						filter: 'blur(8px) drop-shadow(0 0 24px rgba(255,255,160,0.62))',
						duration: 0.22,
						ease: 'power1.out',
					},
					{
						opacity: 0.55,
						scaleY: (index) =>
							(lightBeamSpecs[index]?.pulseScaleY ?? 1.4) * 0.85,
						scaleX: (index) =>
							(lightBeamSpecs[index]?.pulseScaleX ?? 1.05) * 0.95,
						filter: 'blur(10px) drop-shadow(0 0 28px rgba(255,255,200,0.5))',
						duration: 0.18,
						delay: (index) => lightBeamSpecs[index]?.flickerDelay ?? 0.08,
						ease: 'sine.inOut',
					},
					{
						opacity: 0,
						scaleY: 0.35,
						filter: 'blur(5px) drop-shadow(0 0 12px rgba(255,255,140,0.35))',
						duration: 0.32,
						ease: 'power1.in',
					},
				],
				delay: (index) => Math.max(lightBeamSpecs[index]?.delay ?? 0, 0),
				stagger: 0.05,
			},
			'particleBurst-=0.05',
		)
		.to(
			cutLine,
			{
				duration: 0.2,
				opacity: 0,
			},
			'particleBurst+=0.4',
		)
		.add(() => {
			onAnimationComplete()
		}, '+=0.05')
}
