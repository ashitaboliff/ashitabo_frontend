import Link from 'next/link'

const lightBlue = '#3C87E0'
const lightyellow = '#F0CB51'
const lightred = '#E3646B'

const colorList = [
	{ name: 'lightyellow', color: lightyellow },
	{ name: 'lightred', color: lightred },
	{ name: 'lightBlue', color: lightBlue },
] as const

type ColorName = (typeof colorList)[number]['name']

const HomePageButton = ({
	color,
	link,
	text,
	patting,
}: {
	color: ColorName
	link: string
	text: string
	patting?: string
}) => {
	const maxCharsPerLine = 6 // 1行に収まる文字数
	const lines = text.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || [text]
	const lineSegments = lines.map((line, index) => ({
		content: line,
		startIndex: index * maxCharsPerLine,
	}))
	const colorValue =
		colorList.find((c) => c.name === color)?.color ?? colorList[0].color

	return (
		<Link href={link} className={`cursor-pointer ${patting} z-20`}>
			<svg
				width="110"
				height="110"
				viewBox="0 0 110 110"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="cursor-pointer"
				role="img"
			>
				<title>{`${text} リンクボタン`}</title>
				<circle
					cx="55"
					cy="55"
					r="55"
					transform="rotate(180 55 55)"
					fill={colorValue}
				/>
				<text
					x="50%"
					y="50%"
					textAnchor="middle"
					dominantBaseline="middle"
					fill="black"
					fontSize="22"
				>
					{lineSegments.map((segment) => (
						<tspan
							key={`${text}-${segment.startIndex}`}
							x="50%"
							dy={`${
								lineSegments.length !== 1
									? segment.startIndex === 0
										? '-0.6em'
										: '1.2em'
									: '0'
							}`}
						>
							{segment.content}
						</tspan>
					))}
				</text>
			</svg>
		</Link>
	)
}

export default HomePageButton
