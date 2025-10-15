import { memo, type Key, type ReactNode } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export interface CalendarCellRenderProps {
	date: string
	dateIndex: number
	time: string
	timeIndex: number
}

export interface CalendarCellConfig {
	key?: Key
	className?: string
	onClick?: () => void
	content: ReactNode
}

export interface CalendarFrameProps {
	dates: string[]
	times: string[]
	renderCell: (props: CalendarCellRenderProps) => CalendarCellConfig | null
	containerClassName?: string
	tableClassName?: string
	cornerCellClassName?: string
	headerCellClassName?: string
	timeCellClassName?: string
	bodyRowClassName?: string
	renderHeader?: (date: string, index: number) => ReactNode
	renderTime?: (time: string, index: number) => ReactNode
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

const defaultHeader = (date: string) => (
	<p className="text-xs-custom sm:text-sm text-base-content">
		{format(new Date(date), 'MM/dd', { locale: ja })}
		<br />
		{format(new Date(date), '(E)', { locale: ja })}
	</p>
)

const defaultTime = (time: string) => {
	const [start = '', end = ''] = time.split('~')
	return (
		<p className="text-xs-custom sm:text-sm text-base-content break-words">
			{start}~
			<br />
			{end}
		</p>
	)
}

const mergeClassName = (base: string, custom?: string) =>
	custom ? `${base} ${custom}`.trim() : base

/**
 * セルの内容をレンダリングするカレンダーフレームコンポーネント
 * @param dates - 日付の配列 (ISO 8601形式の文字列)
 * @param times - 時間帯の配列 (例: "10:00~11:00")
 * @param renderCell - 各セルの内容をレンダリングする関数
 * @param other - その他のオプションプロパティ(ClassNameやレンダリング関数など)
 * @returns カレンダーフレームコンポーネント
 */
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
	renderHeader = defaultHeader,
	renderTime = defaultTime,
}: CalendarFrameProps) => (
	<div className={containerClassName}>
		<table className={tableClassName}>
			<thead>
				<tr>
					<th className={cornerCellClassName}></th>
					{dates.map((date, index) => (
						<th key={`header-${date}-${index}`} className={headerCellClassName}>
							{renderHeader(date, index)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{times.map((time, timeIndex) => (
					<tr key={`row-${time}-${timeIndex}`} className={bodyRowClassName}>
						<td className={timeCellClassName}>{renderTime(time, timeIndex)}</td>
						{dates.map((date, dateIndex) => {
							const result = renderCell({ date, dateIndex, time, timeIndex })
							if (!result) {
								return (
									<td
										key={`empty-${date}-${timeIndex}`}
										className={DEFAULT_CELL_CLASS}
									/>
								)
							}

							const { key, className, content, onClick } = result
							const cellClass = mergeClassName(DEFAULT_CELL_CLASS, className)

							return (
								<td
									key={key ?? `cell-${date}-${timeIndex}`}
									className={cellClass}
									onClick={onClick}
								>
									{content}
								</td>
							)
						})}
					</tr>
				))}
			</tbody>
		</table>
	</div>
)

export default memo(CalendarFrame)
