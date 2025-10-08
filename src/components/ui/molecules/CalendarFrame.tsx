import React, { ReactElement } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export interface CalendarCellRenderProps {
	date: string
	dateIndex: number
	time: string
	timeIndex: number
}

export interface CalendarFrameProps {
	dates: string[]
	times: string[]
	renderCell: (props: CalendarCellRenderProps) => React.ReactNode
	containerClassName?: string
	tableClassName?: string
	cornerCellClassName?: string
	headerCellClassName?: string
	timeCellClassName?: string
	bodyRowClassName?: string
	renderHeaderContent?: (date: string, index: number) => React.ReactNode
	renderTimeCellContent?: (time: string, index: number) => React.ReactNode
}

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

const CalendarFrame = ({
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

								const element: ReactElement =
									React.isValidElement(rawCell) &&
									rawCell.type !== React.Fragment
										? (rawCell as ReactElement)
										: React.createElement(
												'td',
												{
													className: 'border border-base-200 p-0',
												},
												rawCell,
											)

								const key =
									element.key && element.key !== null
										? element.key
										: `calendar-cell-${date}-${timeIndex}`

								return React.cloneElement(element, { key })
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default CalendarFrame
