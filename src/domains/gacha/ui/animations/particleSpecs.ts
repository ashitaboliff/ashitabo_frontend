'use client'

const CONFETTI_COUNT = 32
const RIBBON_COUNT = 12
const LIGHT_BEAM_COUNT = 8
const CONFETTI_COLORS = ['#ffd166', '#ff4c29', '#7c4dff', '#23d5ab'] as const
const RIBBON_COLORS = ['#ff5e57', '#5c7cfa', '#22d3ee', '#ffa41b'] as const
const CONFETTI_ANCHOR_SPREAD = 80
const RIBBON_ANCHOR_SPREAD = 110
const LIGHT_ANCHOR_SPREAD = 45
const CONFETTI_CONE_SPREAD = 70
const RIBBON_CONE_SPREAD = 55
const LIGHT_CONE_SPREAD = 60

type ConfettiLayerName = 'back' | 'mid' | 'front'

type ConfettiLayerConfig = {
	name: ConfettiLayerName
	distance: [number, number]
	scale: [number, number]
	blur: [number, number]
	delay: [number, number]
	spin: [number, number]
	waveHeight: [number, number]
	lifetime: [number, number]
	zIndex: number
}

const CONFETTI_LAYERS: readonly ConfettiLayerConfig[] = [
	{
		name: 'back',
		distance: [45, 110],
		scale: [0.45, 0.7],
		blur: [2.2, 3.1],
		delay: [0.08, 0.2],
		spin: [80, 140],
		waveHeight: [10, 20],
		lifetime: [0.75, 0.95],
		zIndex: 2,
	},
	{
		name: 'mid',
		distance: [70, 150],
		scale: [0.6, 0.95],
		blur: [1.1, 1.9],
		delay: [0.04, 0.12],
		spin: [110, 190],
		waveHeight: [14, 28],
		lifetime: [0.85, 1.05],
		zIndex: 4,
	},
	{
		name: 'front',
		distance: [90, 190],
		scale: [0.85, 1.2],
		blur: [0.4, 1.1],
		delay: [0, 0.08],
		spin: [160, 240],
		waveHeight: [18, 32],
		lifetime: [0.95, 1.2],
		zIndex: 6,
	},
] as const

const computeAnchorOffset = (index: number, total: number, spread: number) => {
	if (total <= 1) return 0
	const ratio = index / (total - 1)
	return (ratio - 0.5) * spread * 2
}

const randomInRange = (min: number, max: number) =>
	min + Math.random() * (max - min)

const computeConeAngleOffset = (
	index: number,
	total: number,
	spread: number,
) => {
	if (total <= 1) return 0
	const ratio = index / (total - 1)
	return (ratio - 0.5) * spread
}

const degToRad = (deg: number) => (deg * Math.PI) / 180

const randomSign = () => (Math.random() < 0.5 ? -1 : 1)

const getConfettiLayerByIndex = (index: number): ConfettiLayerConfig => {
	if (!CONFETTI_LAYERS.length) {
		return {
			name: 'mid',
			distance: [60, 140],
			scale: [0.6, 1],
			blur: [1, 2],
			delay: [0, 0.1],
			spin: [120, 180],
			waveHeight: [12, 20],
			lifetime: [0.8, 1],
			zIndex: 4,
		}
	}
	const normalizedIndex = Math.min(
		CONFETTI_LAYERS.length - 1,
		Math.floor((index / CONFETTI_COUNT) * CONFETTI_LAYERS.length),
	)
	return CONFETTI_LAYERS[normalizedIndex]
}

export type ConfettiSpec = {
	color: string
	dx: number
	dy: number
	scale: number
	rotate: number
	delay: number
	anchorOffsetX: number
	layer: ConfettiLayerName
	blur: number
	zIndex: number
	spin: number
	lifetime: number
	waveHeight: number
}

export type RibbonSpec = {
	color: string
	dx: number
	dy: number
	rotation: number
	anchorOffsetX: number
	delay: number
	duration: number
	waveTilt: number
	flutter: number
}

export type LightBeamSpec = {
	rotation: number
	delay: number
	anchorOffsetX: number
	pulseScaleX: number
	pulseScaleY: number
	flickerDelay: number
}

const getConfettiGlowRadius = (layer: ConfettiLayerName) => {
	switch (layer) {
		case 'front':
			return 14
		case 'mid':
			return 10
		default:
			return 6
	}
}

export const computeConfettiFilter = (
	spec: ConfettiSpec | undefined,
	blurOffset = 0,
) => {
	if (!spec) return 'blur(1.4px) drop-shadow(0 0 6px rgba(255,255,255,0.35))'
	const blurValue = Math.max(spec.blur + blurOffset, 0.2)
	const glowRadius = getConfettiGlowRadius(spec.layer)
	return `blur(${blurValue}px) drop-shadow(0 0 ${glowRadius}px rgba(255,255,255,0.35))`
}

export const getRibbonFilter = (pinSharp: boolean) =>
	pinSharp
		? 'blur(0.3px) drop-shadow(0 10px 16px rgba(0,0,0,0.25))'
		: 'blur(1px) drop-shadow(0 6px 12px rgba(0,0,0,0.22))'

export const createConfettiSpecs = (): ConfettiSpec[] =>
	Array.from({ length: CONFETTI_COUNT }, (_, index) => {
		const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
		const layer = getConfettiLayerByIndex(index)
		const coneOffset = computeConeAngleOffset(
			index,
			CONFETTI_COUNT,
			CONFETTI_CONE_SPREAD,
		)
		const angleDeg = -90 + coneOffset + randomInRange(-6, 6)
		const distance = randomInRange(layer.distance[0], layer.distance[1])
		const rad = degToRad(angleDeg)
		const dx = Math.cos(rad) * distance
		const dy = Math.sin(rad) * distance
		return {
			color,
			dx,
			dy,
			scale: randomInRange(layer.scale[0], layer.scale[1]),
			rotate: angleDeg * 0.85 + randomInRange(-18, 18),
			delay: randomInRange(layer.delay[0], layer.delay[1]),
			anchorOffsetX:
				computeAnchorOffset(index, CONFETTI_COUNT, CONFETTI_ANCHOR_SPREAD) +
				randomInRange(-12, 12),
			layer: layer.name,
			blur: randomInRange(layer.blur[0], layer.blur[1]),
			zIndex: layer.zIndex,
			spin: randomInRange(layer.spin[0], layer.spin[1]) * randomSign(),
			lifetime: randomInRange(layer.lifetime[0], layer.lifetime[1]),
			waveHeight:
				randomInRange(layer.waveHeight[0], layer.waveHeight[1]) * randomSign(),
		}
	})

export const createRibbonSpecs = (): RibbonSpec[] =>
	Array.from({ length: RIBBON_COUNT }, (_, index) => {
		const color = RIBBON_COLORS[index % RIBBON_COLORS.length]
		const coneOffset = computeConeAngleOffset(
			index,
			RIBBON_COUNT,
			RIBBON_CONE_SPREAD,
		)
		const angleDeg = -90 + coneOffset + randomInRange(-4, 4)
		const distance = randomInRange(140, 240)
		const rad = degToRad(angleDeg)
		const dx = Math.cos(rad) * distance
		const dy = Math.sin(rad) * distance - 160
		return {
			color,
			dx,
			dy,
			rotation:
				(index % 2 === 0 ? -0.5 : 0.5) * angleDeg * 0.35 +
				randomInRange(-12, 12),
			anchorOffsetX:
				computeAnchorOffset(index, RIBBON_COUNT, RIBBON_ANCHOR_SPREAD) +
				randomInRange(-14, 14),
			delay: index * 0.012 + randomInRange(0, 0.08),
			duration: randomInRange(1.05, 1.4),
			waveTilt: randomInRange(-18, 18),
			flutter: randomInRange(28, 46) * randomSign(),
		}
	})

export const createLightBeamSpecs = (): LightBeamSpec[] =>
	Array.from({ length: LIGHT_BEAM_COUNT }, (_, index) => {
		const _coneOffset = computeConeAngleOffset(
			index,
			LIGHT_BEAM_COUNT,
			LIGHT_CONE_SPREAD,
		)
		return {
			rotation:
				-5 +
				computeConeAngleOffset(index, LIGHT_BEAM_COUNT, LIGHT_CONE_SPREAD) +
				randomInRange(-5, 5),
			delay: index * 0.05 + randomInRange(-0.02, 0.04),
			anchorOffsetX:
				computeAnchorOffset(index, LIGHT_BEAM_COUNT, LIGHT_ANCHOR_SPREAD) +
				randomInRange(-6, 6),
			pulseScaleX: randomInRange(0.85, 1.25),
			pulseScaleY: randomInRange(1.1, 1.8),
			flickerDelay: randomInRange(0.05, 0.12),
		}
	})
