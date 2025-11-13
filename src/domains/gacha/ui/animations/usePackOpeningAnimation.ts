'use client'

import gsap from 'gsap'
import type { RefObject } from 'react'
import { useLayoutEffect, useMemo } from 'react'
import { createPackOpeningTimeline } from '@/domains/gacha/ui/animations/packTimelineFactory'
import {
	type ConfettiSpec,
	createConfettiSpecs,
	createLightBeamSpecs,
	createRibbonSpecs,
	type LightBeamSpec,
	type RibbonSpec,
} from '@/domains/gacha/ui/animations/particleSpecs'
import type { PackSelectionPayload } from '@/domains/gacha/ui/GachaSelectPopup'

const PENDING_ANIMATION_DURATION = 1.1

interface PackOpeningAnimationParams {
	containerRef: RefObject<HTMLDivElement | null>
	topSliceRef: RefObject<HTMLDivElement | null>
	cutLineRef: RefObject<HTMLDivElement | null>
	confettiRefs: RefObject<(HTMLSpanElement | null)[]>
	ribbonRefs: RefObject<(HTMLSpanElement | null)[]>
	lightRefs: RefObject<(HTMLSpanElement | null)[]>
	finalSize: { width: number; height: number }
	packRect: PackSelectionPayload['rect']
	onAnimationComplete: () => void
}

const useParticleSpecs = () => {
	const confettiSpecs = useMemo<ConfettiSpec[]>(createConfettiSpecs, [])
	const ribbonSpecs = useMemo<RibbonSpec[]>(createRibbonSpecs, [])
	const lightBeamSpecs = useMemo<LightBeamSpec[]>(createLightBeamSpecs, [])
	return { confettiSpecs, ribbonSpecs, lightBeamSpecs }
}

const collectElements = <T extends HTMLElement>(
	refs: RefObject<(T | null)[]>,
) => refs.current.filter((el): el is T => Boolean(el))

export const usePackOpeningAnimation = ({
	containerRef,
	topSliceRef,
	cutLineRef,
	confettiRefs,
	ribbonRefs,
	lightRefs,
	finalSize,
	packRect,
	onAnimationComplete,
}: PackOpeningAnimationParams) => {
	const { confettiSpecs, ribbonSpecs, lightBeamSpecs } = useParticleSpecs()

	useLayoutEffect(() => {
		const element = containerRef.current
		if (!element) {
			const timer = window.setTimeout(
				onAnimationComplete,
				PENDING_ANIMATION_DURATION * 1000,
			)
			return () => window.clearTimeout(timer)
		}
		const topSlice = topSliceRef.current
		const cutLine = cutLineRef.current
		if (!topSlice || !cutLine) {
			return
		}
		const confettiElements = collectElements(confettiRefs)
		const ribbonElements = collectElements(ribbonRefs)
		const lightElements = collectElements(lightRefs)

		const finalLeft = window.innerWidth / 2 - finalSize.width / 2
		const finalTop = window.innerHeight / 2 - finalSize.height * 0.7
		const initialRect = packRect ?? {
			left: finalLeft,
			top: finalTop,
			width: finalSize.width,
			height: finalSize.height,
		}

		const ctx = gsap.context(() => {
			createPackOpeningTimeline({
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
			})
		})

		return () => ctx.revert()
	}, [
		confettiSpecs,
		containerRef,
		cutLineRef,
		confettiRefs,
		finalSize.height,
		finalSize.width,
		lightBeamSpecs,
		lightRefs,
		onAnimationComplete,
		packRect,
		ribbonRefs,
		ribbonSpecs,
		topSliceRef,
	])

	return { confettiSpecs, ribbonSpecs, lightBeamSpecs }
}
