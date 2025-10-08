type IconProps = {
	color?: string
	type: 'info' | 'success' | 'warning' | 'error'
	size?: number
}

const COLOR_CLASS_MAP: Record<string, string> = {
	info: 'text-info',
	success: 'text-success',
	warning: 'text-warning',
	error: 'text-error',
	primary: 'text-primary',
	secondary: 'text-secondary',
	accent: 'text-accent',
	neutral: 'text-neutral',
	white: 'text-white',
	'bg-white': 'text-white',
	black: 'text-black',
	inherit: 'text-inherit',
}

/**
 * アイコンを生成するクラス
 * @param color アイコンの色
 * @param type アイコンの種類
 */
class IconFactory {
	private static paths = {
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
		success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		warning:
			'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
		error:
			'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
	}

	private static resolveColorClass(color?: string) {
		if (!color) return COLOR_CLASS_MAP.primary
		if (color in COLOR_CLASS_MAP) {
			return COLOR_CLASS_MAP[color]
		}
		if (color.startsWith('text-')) {
			return color
		}
		return ''
	}

	private static resolveInlineColor(color?: string) {
		if (!color) return undefined
		if (color in COLOR_CLASS_MAP) {
			return undefined
		}
		if (color.startsWith('text-')) {
			return undefined
		}
		return color
	}

	public static getIcon({ color, type, size = 24 }: IconProps) {
		const colorClass = this.resolveColorClass(color)
		const inlineColor = this.resolveInlineColor(color)

		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				height={size}
				width={size}
				className={`shrink-0 stroke-current ${colorClass}`.trim()}
				style={inlineColor ? { color: inlineColor } : undefined}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d={this.paths[type]}
				></path>
			</svg>
		)
	}
}

export default IconFactory
