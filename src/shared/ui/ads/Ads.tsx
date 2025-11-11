import type { CSSProperties } from 'react'
import type { AdFormat, AdLayout } from '@/shared/lib/ads'
import AdSense from './AdSense'

type AdsConfig = {
	readonly slot: string
	readonly format?: AdFormat
	readonly layout?: AdLayout
	readonly layoutKey?: string
	readonly wrapperClassName?: string
	readonly adStyle?: CSSProperties
	readonly enableClickDetection?: boolean
	readonly clickThreshold?: number
}

const ADS_CONFIG = {
	Field: {
		slot: '2297104274',
		format: 'fluid',
		layoutKey: '-fb+5w+4e-db+86',
		wrapperClassName: 'my-4 flex justify-center',
	} satisfies AdsConfig,
	Menu: {
		slot: '1843902033',
		format: 'fluid',
		layoutKey: '-hl+a-w-1e+66',
		wrapperClassName: 'flex justify-center',
	} satisfies AdsConfig,
	MenuDisplay: {
		slot: '1282872676',
		format: 'auto',
		wrapperClassName: 'flex justify-center',
	},
} as const

export type AdPlacement = keyof typeof ADS_CONFIG

interface AdsProps {
	readonly placement: AdPlacement
	readonly clientId?: string
	readonly className?: string
	readonly adStyle?: CSSProperties
	readonly enableClickDetection?: boolean
	readonly clickThreshold?: number
}

const Ads = ({
	placement,
	clientId,
	className,
	adStyle,
	enableClickDetection,
	clickThreshold,
}: AdsProps) => {
	const config = ADS_CONFIG[placement] as AdsConfig | undefined

	if (!config) {
		console.warn(`Ads: Unknown placement "${placement}" requested.`)
		return null
	}

	const {
		slot,
		format = 'auto',
		layout,
		layoutKey,
		wrapperClassName,
		adStyle: configStyle,
		enableClickDetection: configClickDetection,
		clickThreshold: configClickThreshold,
	} = config

	const mergedClassName = [wrapperClassName, className]
		.filter(Boolean)
		.join(' ')
		.trim()
	const mergedStyle = { ...(configStyle ?? {}), ...(adStyle ?? {}) }
	const shouldEnableClickDetection =
		enableClickDetection ?? configClickDetection ?? false
	const effectiveClickThreshold = clickThreshold ?? configClickThreshold ?? 3000

	return (
		<div className={mergedClassName || undefined}>
			<AdSense
				clientId={clientId}
				adSlot={slot}
				adFormat={format}
				adLayout={layout}
				adLayoutKey={layoutKey}
				adStyle={Object.keys(mergedStyle).length ? mergedStyle : undefined}
				placement={placement}
				enableClickDetection={shouldEnableClickDetection}
				clickThreshold={effectiveClickThreshold}
			/>
		</div>
	)
}

export default Ads
