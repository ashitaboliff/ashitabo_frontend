import React from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export interface CalendarCellRenderProps {
	date: string
	dateIndex: number
	time: string
	timeIndex: number
}

export interface CalendarCell {
	key?: React.Key
	cellProps?: React.TdHTMLAttributes<HTMLTableCellElement>
	children?: React.ReactNode
}

type CalendarCellRendererResult =
	| CalendarCell
	| React.ReactNode
	| null
	| undefined

export interface CalendarFrameProps {
	dates: string[]
	times: string[]
	renderCell: (props: CalendarCellRenderProps) => CalendarCellRendererResult
	containerClassName?: string
	tableClassName?: string
	cornerCellClassName?: string
	headerCellClassName?: string
	timeCellClassName?: string
	bodyRowClassName?: string
	renderHeaderContent?: (date: string, index: number) => React.ReactNode
	renderTimeCellContent?: (time: string, index: number) => React.ReactNode
}

interface NormalizedCalendarCell {
	key: React.Key
	props: React.TdHTMLAttributes<HTMLTableCellElement>
	content: React.ReactNode
}

const DEFAULT_CELL_CLASS = 'border border-base-200 p-0'
const defaultContainerClass = 'flex justify-center'
const defaultTableClass =
	'w-auto border border-base-200 table-pin-rows table-pin-cols bg-white'
const defaultCornerCellClass = 'border border-base-200 w-11 sm:w-16'
const defaultHeaderCellClass =
	'border border-base-200 p-1 sm:p-2 w-11 h-9 sm:w-16 sm:h-14'
const defaultTimeCellClass =
	'border border-base-200 p-1 sm:p-2 w-11 h-13 sm:w-16 sm:h-16 break-words'

const defaultHeaderContent = (date: string) => (
	<p className="text-xs-custom sm:text-sm text-base-content">
		{format(new Date(date), 'MM/dd', { locale: ja })} <br />{' '}
		{format(new Date(date), '(E)', { locale: ja })}
	</p>
)

const defaultTimeContent = (time: string) => {
	const [start = '', end = ''] = time.split('~')
	return (
		<p className="text-xs-custom sm:text-sm text-base-content break-words">
			{start}~ <br /> {end}
		</p>
	)
}

const isCalendarCellDescriptor = (value: unknown): value is CalendarCell =>
	Boolean(
		value &&
			typeof value === 'object' &&
			('key' in value || 'cellProps' in value || 'children' in value),
	)

const mergeClassName = (className?: string) =>
	className ? `${DEFAULT_CELL_CLASS} ${className}`.trim() : DEFAULT_CELL_CLASS

const normalizeCalendarCell = (
	raw: Exclude<CalendarCellRendererResult, React.ReactElement>,
	fallbackKey: React.Key,
): NormalizedCalendarCell => {
	if (isCalendarCellDescriptor(raw)) {
		const cellProps = raw.cellProps ?? {}
		return {
			key: raw.key ?? fallbackKey,
			props: {
				...cellProps,
				className: mergeClassName(cellProps.className),
			},
			content: raw.children ?? null,
		}
	}

	return {
		key: fallbackKey,
		props: { className: DEFAULT_CELL_CLASS },
		content: raw as React.ReactNode,
	}
}

const CalendarFrameComponent = ({
	dates,
	times,
	renderCell,
	containerClassName = defaultContainerClass,
	tableClassName = defaultTableClass,
	cornerCellClassName = defaultCornerCellClass,
	headerCellClassName = defaultHeaderCellClass,
	timeCellClassName = defaultTimeCellClass,
	bodyRowClassName = '',
	renderHeaderContent = defaultHeaderContent,
	renderTimeCellContent = defaultTimeContent,
}: CalendarFrameProps) => {
	return (
		<div className={containerClassName}>
			<table className={tableClassName}>
				<thead>
					<tr>
						<th className={cornerCellClassName}></th>
						{dates.map((date, dateIndex) => (
							<th
								key={`calendar-header-${date}-${dateIndex}`}
								className={headerCellClassName}
							>
								{renderHeaderContent(date, dateIndex)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{times.map((time, timeIndex) => (
						<tr
							key={`calendar-row-${time}-${timeIndex}`}
							className={bodyRowClassName}
						>
							<td className={timeCellClassName}>
								{renderTimeCellContent(time, timeIndex)}
							</td>
							{dates.map((date, dateIndex) => {
								const rawCell = renderCell({ date, dateIndex, time, timeIndex })
								if (rawCell === null || rawCell === undefined) {
									return null
								}

								const fallbackKey = `calendar-cell-${date}-${timeIndex}`

								// 基本React要素が返ってきた場合はそのまま描画する
								if (React.isValidElement(rawCell)) {
									return rawCell
								}

								const descriptor = normalizeCalendarCell(rawCell, fallbackKey)
								return (
									<td key={descriptor.key} {...descriptor.props}>
										{descriptor.content}
									</td>
								)
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

CalendarFrameComponent.displayName = 'CalendarFrame'

const CalendarFrame = React.memo(CalendarFrameComponent)

export default CalendarFrame
