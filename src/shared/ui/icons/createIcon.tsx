import {
	type CSSProperties,
	createElement,
	forwardRef,
	type ReactElement,
	type ReactNode,
	type SVGProps,
} from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
	size?: number | string
	title?: string
}

type IconTree = {
	tag: string
	attr?: Record<string, unknown>
	child?: IconTree[]
}

const renderTree = (tree?: IconTree[]): ReactNode =>
	tree?.map((node, index) =>
		createElement(
			node.tag,
			{ key: index, ...node.attr },
			renderTree(node.child),
		),
	)

const defaultSvgAttr = {
	stroke: 'currentColor',
	fill: 'currentColor',
	strokeWidth: '0',
}

export const createIcon = (icon: IconTree) =>
	forwardRef<SVGSVGElement, IconProps>(function Icon(
		{ size = '1em', color, title, style, className, ...rest },
		ref,
	): ReactElement {
		const { attr = {}, child } = icon
		const rawAttr = { ...attr } as Record<string, unknown>
		const attrClassName =
			typeof rawAttr.className === 'string'
				? (rawAttr.className as string)
				: undefined
		const attrStyle = rawAttr.style as CSSProperties | undefined
		delete rawAttr.className
		delete rawAttr.style

		const restProps = { ...rest } as Record<string, unknown>
		delete restProps.width
		delete restProps.height
		const mergedClassName =
			[attrClassName, className].filter(Boolean).join(' ') || undefined

		const mergedStyle: CSSProperties | undefined = (() => {
			const styles: CSSProperties = {
				...(attrStyle ?? {}),
				...((style as CSSProperties | undefined) ?? {}),
			}
			if (color !== undefined) {
				styles.color = color as string
			}
			return Object.keys(styles).length > 0 ? styles : undefined
		})()

		const mergedProps = {
			...defaultSvgAttr,
			...(rawAttr as Record<string, unknown>),
			...restProps,
			ref,
			width: size,
			height: size,
			style: mergedStyle,
			className: mergedClassName,
			xmlns: 'http://www.w3.org/2000/svg',
		}

		return createElement(
			'svg',
			mergedProps,
			title ? createElement('title', null, title) : null,
			renderTree(child),
		)
	})

export type { IconTree }
